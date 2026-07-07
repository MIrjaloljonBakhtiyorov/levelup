import { type FormEvent, useState } from "react";

import { Badge, ProgressBar } from "../components/UserUI";

const WEEKLY_PLAN_KEY = "levelup_weekly_study_plan";

type WeekDay = {
  id: string;
  label: string;
  shortLabel: string;
};

type WeeklyPlanItem = {
  id: string;
  day: string;
  title: string;
};

type PlanOwner = "Admin" | "User";

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

function loadStoredPlan() {
  const storedPlan = localStorage.getItem(WEEKLY_PLAN_KEY);

  if (!storedPlan) {
    return null;
  }

  try {
    return JSON.parse(storedPlan) as WeeklyPlanItem[];
  } catch {
    localStorage.removeItem(WEEKLY_PLAN_KEY);
    return null;
  }
}

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
  const [planDraft, setPlanDraft] = useState(defaultPlanDraft);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanItem[] | null>(() => loadStoredPlan());
  const [planOwner, setPlanOwner] = useState<PlanOwner>("User");
  const totalCount = weeklyPlan?.length ?? 0;

  function updateDraft(dayId: string, value: string) {
    setPlanDraft((currentDraft) => ({
      ...currentDraft,
      [dayId]: value,
    }));
  }

  function confirmWeeklyPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextPlan = weekDays
      .map((day) => ({
        id: day.id,
        day: day.label,
        title: planDraft[day.id].trim(),
      }))
      .filter((task) => task.title);

    setWeeklyPlan(nextPlan);
    localStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(nextPlan));
  }

  function resetPlan() {
    setWeeklyPlan(null);
    localStorage.removeItem(WEEKLY_PLAN_KEY);
  }

  return (
    <section className="user-page">
      <div className="study-plan-hero">
        <div>
          <span>Haftalik reja</span>
          <h1>7 kunlik o‘quv reja</h1>
          <p>
            Haftalik reja admin yoki user tomonidan tuziladi. Completed qilish
            faqat bugungi reja to-do listida ishlaydi.
          </p>
        </div>

        <div className="study-plan-hero__progress">
          <strong>{totalCount}/7</strong>
          <span>{weeklyPlan ? `${planOwner} tomonidan tuzildi` : "Hali tasdiqlanmagan"}</span>
          <ProgressBar value={Math.round((totalCount / 7) * 100)} tone="blue" />
        </div>
      </div>

      <div className="study-plan-layout">
        <article className="user-card study-plan-builder">
          <div className="user-section-title user-section-title--split">
            <div>
              <span>Haftalik reja</span>
              <h2>Admin yoki user tomonidan tuziladi</h2>
            </div>

            {weeklyPlan ? (
              <Badge tone="green">{planOwner}</Badge>
            ) : (
              <Badge tone="blue">Draft</Badge>
            )}
          </div>

          {!weeklyPlan ? (
            <form className="weekly-plan-form" onSubmit={confirmWeeklyPlan}>
              <div className="weekly-plan-owner" aria-label="Rejani kim tuzadi">
                {(["User", "Admin"] as PlanOwner[]).map((owner) => (
                  <button
                    className={planOwner === owner ? "is-active" : ""}
                    key={owner}
                    type="button"
                    onClick={() => setPlanOwner(owner)}
                  >
                    {owner}
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

              <button className="user-btn user-btn--primary" type="submit">
                Haftalik rejani tasdiqlash
              </button>
            </form>
          ) : (
            <div className="weekly-plan-summary">
              <p>
                Haftalik reja {planOwner.toLowerCase()} tomonidan tuzildi.
                Bugungi bajariladigan ishlar alohida sahifada completed qilinadi.
              </p>
              <button className="user-btn user-btn--secondary" type="button" onClick={resetPlan}>
                Rejani qayta kiritish
              </button>
            </div>
          )}
        </article>

        <article className="user-card weekly-todo-card">
          <div className="user-section-title user-section-title--split">
            <div>
              <span>Haftalik reja</span>
              <h2>7 kunlik reja ko‘rinishi</h2>
            </div>
            <strong>{totalCount}/7</strong>
          </div>

          {weeklyPlan ? (
            <div className="weekly-todo-list">
              {weeklyPlan.map((task) => (
                <div className="weekly-plan-item" key={task.id}>
                  <span>{task.day}</span>
                  <strong>{task.title}</strong>
                  <small>{planOwner}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="weekly-todo-empty">
              Avval haftalik rejani kiriting va tasdiqlang.
            </div>
          )}
        </article>

        <article className="user-card study-week-strip">
          {weekDays.map((day) => {
            const task = weeklyPlan?.find((item) => item.id === day.id);

            return (
              <div className={task ? "is-completed" : ""} key={day.id}>
                <strong>{day.shortLabel}</strong>
                <span>{task ? planOwner : "Plan"}</span>
              </div>
            );
          })}
        </article>
      </div>
    </section>
  );
}
