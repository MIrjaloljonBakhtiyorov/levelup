import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Badge, ProgressBar } from "../components/UserUI";
import { getUserToken } from "../../auth/services/userSession";
import {
  createStudyPlan,
  deleteStudyPlan,
  getStudyPlans,
  toggleStudyPlanItem,
  updateStudyPlan,
  type StudyPlan,
  type StudyPlanPayload,
  type StudyPlanStatus,
  type StudyPlanType,
} from "../services/studyPlansApi";

type WeekDay = {
  id: string;
  label: string;
  shortLabel: string;
};

type DailyPlanTask = {
  id: string;
  category: string;
  title: string;
  amount: string;
  time: string;
};

const weekDays: WeekDay[] = [
  { id: "monday", label: "Dushanba", shortLabel: "Du" },
  { id: "tuesday", label: "Seshanba", shortLabel: "Se" },
  { id: "wednesday", label: "Chorshanba", shortLabel: "Ch" },
  { id: "thursday", label: "Payshanba", shortLabel: "Pa" },
  { id: "friday", label: "Juma", shortLabel: "Ju" },
  { id: "saturday", label: "Shanba", shortLabel: "Sh" },
  { id: "sunday", label: "Yakshanba", shortLabel: "Ya" },
];

const defaultPlanDraft: Record<string, string> = {
  monday: "Writing Task 2 outline yozish",
  tuesday: "Reading matching headings mashqi",
  wednesday: "Listening Section 3 shadowing",
  thursday: "Speaking cue card yozib olish",
  friday: "Grammar: complex sentence review",
  saturday: "Full mini mock test",
  sunday: "Xatolarni tahlil qilish va dam olish",
};

const dailyPlanTasks: DailyPlanTask[] = [
  {
    id: "grammar",
    category: "Grammar",
    title: "Grammatikadan 3 ta mavzu takrorlash",
    amount: "3 ta",
    time: "35 daqiqa",
  },
  {
    id: "ielts",
    category: "IELTS",
    title: "IELTS bo‘yicha 2 ta video dars ko‘rish",
    amount: "2 ta",
    time: "45 daqiqa",
  },
  {
    id: "free-lessons",
    category: "Bepul darslar",
    title: "Bugungi bepul darslarni ko‘rib chiqish",
    amount: "2 dars",
    time: "30 daqiqa",
  },
  {
    id: "reading",
    category: "Reading",
    title: "Reading passage yechish va xatolarni tahlil qilish",
    amount: "1 passage",
    time: "40 daqiqa",
  },
  {
    id: "listening",
    category: "Listening",
    title: "Listening section yechish va transcript bilan tekshirish",
    amount: "1 section",
    time: "30 daqiqa",
  },
  {
    id: "mock",
    category: "Mock test",
    title: "Full mock test yechish",
    amount: "1 test",
    time: "2 soat",
  },
];

export function TodayStudyPlanPage() {
  const [completedDailyTasks, setCompletedDailyTasks] = useState<string[]>([]);
  const dailyProgressPercent = Math.round((completedDailyTasks.length / dailyPlanTasks.length) * 100);

  function toggleDailyTask(taskId: string) {
    setCompletedDailyTasks((currentTasks) =>
      currentTasks.includes(taskId)
        ? currentTasks.filter((currentTaskId) => currentTaskId !== taskId)
        : [...currentTasks, taskId],
    );
  }

  return (
    <section className="user-page">
      <div className="study-plan-hero">
        <div>
          <span>Bugungi reja</span>
          <h1>Kundalik to-do ro‘yxati</h1>
          <p>
            Bugun bajariladigan ishlarni belgilang. Har bir vazifa bajarilganda
            checkbox orqali completed qiling.
          </p>
        </div>

        <div className="study-plan-hero__progress">
          <strong>{dailyProgressPercent}%</strong>
          <span>{completedDailyTasks.length}/{dailyPlanTasks.length} to-do completed</span>
          <ProgressBar value={dailyProgressPercent} tone="green" />
        </div>
      </div>

      <article className="user-card daily-plan-card">
        <div className="user-section-title user-section-title--split">
          <div>
            <span>Bugungi reja</span>
            <h2>Kundalik qilinishi mumkin bo‘lgan ishlar</h2>
          </div>
          <strong>{completedDailyTasks.length}/{dailyPlanTasks.length}</strong>
        </div>

        <div className="daily-plan-list">
          {dailyPlanTasks.map((task) => {
            const isCompleted = completedDailyTasks.includes(task.id);

            return (
              <label
                className={`daily-plan-item ${isCompleted ? "daily-plan-item--completed" : ""}`}
                key={task.id}
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => toggleDailyTask(task.id)}
                />
                <span>{task.category}</span>
                <strong>{task.title}</strong>
                <small>{task.amount} · {task.time}</small>
              </label>
            );
          })}
        </div>
      </article>
    </section>
  );
}

export function WeeklyStudyPlanPage() {
  const navigate = useNavigate();
  const [planDraft, setPlanDraft] = useState(defaultPlanDraft);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [title, setTitle] = useState("7 kunlik o'quv reja");
  const [description, setDescription] = useState("Haftalik dars, test va takrorlash vazifalari.");
  const [type, setType] = useState<StudyPlanType>("weekly");
  const [status, setStatus] = useState<StudyPlanStatus>("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const activePlan = plans[0] ?? null;
  const totalCount = activePlan?.items.length ?? 0;
  const completedCount = activePlan?.items.filter((item) => item.completed).length ?? 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => {
    const token = getUserToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    getStudyPlans(token)
      .then((result) => {
        setPlans(result.plans ?? []);
        setMessage("");
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "O'quv rejalarni yuklab bo'lmadi");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const summary = useMemo(
    () => ({
      active: plans.filter((plan) => plan.status === "active").length,
      completed: plans.filter((plan) => plan.status === "completed").length,
      totalTasks: plans.reduce((sum, plan) => sum + plan.items.length, 0),
    }),
    [plans],
  );

  function updateDraft(dayId: string, value: string) {
    setPlanDraft((currentDraft) => ({
      ...currentDraft,
      [dayId]: value,
    }));
  }

  function buildPayload(): StudyPlanPayload {
    return {
      title: title.trim(),
      description: description.trim(),
      type,
      status,
      items: weekDays
      .map((day) => ({
        day: day.label,
        title: planDraft[day.id].trim(),
        details: "",
        completed: editingPlan?.items.find((item) => item.day === day.label)?.completed ?? false,
      }))
      .filter((task) => task.title),
    };
  }

  function resetForm() {
    setEditingPlan(null);
    setTitle("7 kunlik o'quv reja");
    setDescription("Haftalik dars, test va takrorlash vazifalari.");
    setType("weekly");
    setStatus("active");
    setPlanDraft(defaultPlanDraft);
  }

  function startEdit(plan: StudyPlan) {
    setEditingPlan(plan);
    setTitle(plan.title);
    setDescription(plan.description);
    setType(plan.type);
    setStatus(plan.status);
    setPlanDraft(
      Object.fromEntries(
        weekDays.map((day) => [
          day.id,
          plan.items.find((item) => item.day === day.label)?.title ?? "",
        ]),
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getUserToken();

    if (!token) {
      navigate("/login");
      return;
    }

    const payload = buildPayload();

    if (!payload.title || payload.items.length === 0) {
      setMessage("Reja nomi va kamida bitta kun uchun vazifa kiriting");
      return;
    }

    setSaving(true);
    try {
      const result = editingPlan
        ? await updateStudyPlan(token, editingPlan.id, payload)
        : await createStudyPlan(token, payload);

      setPlans((current) => editingPlan
        ? current.map((plan) => (plan.id === result.plan.id ? result.plan : plan))
        : [result.plan, ...current]);
      setMessage(editingPlan ? "O'quv reja yangilandi" : "Yangi o'quv reja qo'shildi");
      resetForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "O'quv rejani saqlab bo'lmadi");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(planId: string) {
    const token = getUserToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await deleteStudyPlan(token, planId);
      setPlans((current) => current.filter((plan) => plan.id !== planId));
      if (editingPlan?.id === planId) {
        resetForm();
      }
      setMessage("O'quv reja o'chirildi");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "O'quv rejani o'chirib bo'lmadi");
    }
  }

  async function handleToggle(planId: string, itemId: string) {
    const token = getUserToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const result = await toggleStudyPlanItem(token, planId, itemId);
      setPlans((current) => current.map((plan) => (plan.id === result.plan.id ? result.plan : plan)));
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Vazifa statusi yangilanmadi");
    }
  }

  return (
    <section className="user-page">
      <div className="study-plan-hero">
        <div>
          <span>O'quv rejam</span>
          <h1>Shaxsiy o'quv rejalar</h1>
          <p>
            Yangi o'quv reja qo'shing, tahrirlang yoki o'chiring. Barcha
            rejalar backend bazada saqlanadi.
          </p>
        </div>

        <div className="study-plan-hero__progress">
          <strong>{progress}%</strong>
          <span>{completedCount}/{totalCount} completed · {plans.length} reja</span>
          <ProgressBar value={progress} tone="blue" />
        </div>
      </div>

      {message && <p className="user-alert">{message}</p>}

      <div className="study-plan-layout">
        <article className="user-card study-plan-builder">
          <div className="user-section-title user-section-title--split">
            <div>
              <span>{editingPlan ? "Tahrirlash" : "Yangi reja"}</span>
              <h2>{editingPlan ? "O'quv rejani tahrirlash" : "Yangi o'quv reja qo'shish"}</h2>
            </div>

            <Badge tone={editingPlan ? "orange" : "blue"}>{editingPlan ? "Edit" : "Create"}</Badge>
          </div>

          <form className="weekly-plan-form" onSubmit={handleSubmit}>
            <label className="weekly-plan-field">
              <span>Reja nomi</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Masalan: IELTS 30 kunlik reja"
              />
            </label>

            <label className="weekly-plan-field">
              <span>Izoh</span>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Reja haqida qisqa izoh"
              />
            </label>

            <div className="weekly-plan-owner" aria-label="Reja turi">
              {(["weekly", "daily", "custom"] as StudyPlanType[]).map((planType) => (
                  <button
                    className={type === planType ? "is-active" : ""}
                    key={planType}
                    type="button"
                    onClick={() => setType(planType)}
                  >
                    {planType}
                  </button>
                ))}
            </div>

            <div className="weekly-plan-owner" aria-label="Reja statusi">
              {(["active", "paused", "completed"] as StudyPlanStatus[]).map((planStatus) => (
                <button
                  className={status === planStatus ? "is-active" : ""}
                  key={planStatus}
                  type="button"
                  onClick={() => setStatus(planStatus)}
                >
                  {planStatus}
                </button>
              ))}
            </div>

            {weekDays.map((day) => (
              <label className="weekly-plan-field" key={day.id}>
                <span>{day.label}</span>
                <input
                  type="text"
                  value={planDraft[day.id]}
                  onChange={(event) => updateDraft(day.id, event.target.value)}
                  placeholder={`${day.label} uchun reja`}
                />
              </label>
            ))}

            <div className="study-plan-actions">
              <button className="user-btn user-btn--primary" type="submit">
                {saving ? "Saqlanmoqda..." : editingPlan ? "Rejani yangilash" : "Yangi reja qo'shish"}
              </button>
              <button className="user-btn user-btn--secondary" type="button" onClick={resetForm}>
                Tozalash
              </button>
            </div>
          </form>
        </article>

        <article className="user-card weekly-todo-card">
          <div className="user-section-title user-section-title--split">
            <div>
              <span>Rejalar ro'yxati</span>
              <h2>Saqlangan o'quv rejalar</h2>
            </div>
            <strong>{plans.length}</strong>
          </div>

          {loading ? (
            <div className="weekly-todo-empty">O'quv rejalar yuklanmoqda...</div>
          ) : plans.length > 0 ? (
            <div className="study-plan-crud-list">
              {plans.map((plan) => (
                <div className="study-plan-crud-card" key={plan.id}>
                  <div className="study-plan-crud-card__top">
                    <div>
                      <span>{plan.type} · {plan.status}</span>
                      <strong>{plan.title}</strong>
                      <small>{plan.description || "Izoh kiritilmagan"}</small>
                    </div>
                    <Badge tone={plan.status === "completed" ? "green" : plan.status === "paused" ? "orange" : "blue"}>
                      {plan.items.filter((item) => item.completed).length}/{plan.items.length}
                    </Badge>
                  </div>

                  <div className="weekly-todo-list">
                    {plan.items.map((task) => (
                      <label
                        className={`weekly-todo-item ${task.completed ? "weekly-todo-item--completed" : ""}`}
                        key={task.id}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggle(plan.id, task.id)}
                        />
                        <span>{task.day}</span>
                        <strong>{task.title}</strong>
                        <small>{task.completed ? "Done" : "Todo"}</small>
                      </label>
                    ))}
                  </div>

                  <div className="study-plan-actions">
                    <button className="user-btn user-btn--secondary" type="button" onClick={() => startEdit(plan)}>
                      Tahrirlash
                    </button>
                    <button className="user-btn user-btn--ghost" type="button" onClick={() => handleDelete(plan.id)}>
                      O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="weekly-todo-empty">
              Hozircha o'quv reja yo'q. Chap tomondan yangi reja qo'shing.
            </div>
          )}
        </article>

        <article className="user-card study-week-strip">
          {weekDays.map((day) => {
            const task = activePlan?.items.find((item) => item.day === day.label);

            return (
              <div className={task?.completed ? "is-completed" : ""} key={day.id}>
                <strong>{day.shortLabel}</strong>
                <span>{task ? (task.completed ? "Done" : "Todo") : "Plan"}</span>
              </div>
            );
          })}
        </article>

        <article className="user-card study-plan-summary-strip">
          <div><span>Active</span><strong>{summary.active}</strong></div>
          <div><span>Completed</span><strong>{summary.completed}</strong></div>
          <div><span>Tasks</span><strong>{summary.totalTasks}</strong></div>
        </article>
      </div>
    </section>
  );
}
