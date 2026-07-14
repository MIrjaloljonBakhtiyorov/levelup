import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import { getAdminToken } from "../../auth/services/adminSession";
import AdminSectionTitle from "../components/AdminSectionTitle";
import { formatDate } from "../utils/adminFormatters";
import { createAdminTest, deleteAdminTest, getAdminTests } from "../services/adminTestsApi";
import type { ExamType, ExtraTest, ExtraTestDifficulty, ExtraTestSkill } from "../types/adminTypes";

const EXAM_LABELS: Record<string, ExamType> = {
  cefr: "CEFR",
  ielts: "IELTS",
  toefl: "TOEFL",
  sat: "SAT",
};

const SKILL_LABELS: Record<string, ExtraTestSkill> = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  game: "Game",
};

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DIFFICULTIES: ExtraTestDifficulty[] = ["Easy", "Medium", "Hard"];

const skillMeta: Record<ExtraTestSkill, { title: string; description: string; color: string; icon: string }> = {
  Vocabulary: {
    title: "Vocabulary testlari",
    description: "So'z boyligi, collocation va academic vocabulary mashqlarini boshqaring.",
    color: "#2563eb",
    icon: "V",
  },
  Grammar: {
    title: "Grammar quiz",
    description: "Tense, sentence structure, article, preposition va grammar practice testlari.",
    color: "#10b981",
    icon: "G",
  },
  Game: {
    title: "Game testlari",
    description: "Gamified quiz, speed challenge va interactive testlarni boshqaring.",
    color: "#8b5cf6",
    icon: "🎮",
  },
};

function useExtraTestRoute() {
  const { examType, testKind } = useParams<{ examType?: string; testKind?: string }>();
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  const inferredKind = testKind ?? (parts.at(-1) === "add" ? parts.at(-2) : parts.at(-1)) ?? "vocabulary";
  const hasExamScope = Boolean(examType && EXAM_LABELS[examType.toLowerCase()]);
  const exam: ExamType | "General" = hasExamScope && examType ? EXAM_LABELS[examType.toLowerCase()] : "General";
  const skill = SKILL_LABELS[inferredKind.toLowerCase()] ?? "Vocabulary";
  const basePath = hasExamScope && examType
    ? `/admin/tests/${examType}/${inferredKind}`
    : `/admin/tests/${inferredKind}`;
  const scopeTitle = hasExamScope ? `${exam} — ` : "";

  return { basePath, exam, skill, scopeTitle };
}

function Empty({ onAdd, skill }: { onAdd: () => void; skill: ExtraTestSkill }) {
  return (
    <div className="admin-dashboard-empty" style={{ margin: "0 20px 24px" }}>
      <strong>{skill} testi hali yo'q</strong>
      <span>
        <button
          type="button"
          onClick={onAdd}
          style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 900, fontSize: "inherit" }}
        >
          Birinchi testni qo'shish
        </button>
      </span>
    </div>
  );
}

export function ExtraTestsPage() {
  const navigate = useNavigate();
  const { basePath, exam, skill, scopeTitle } = useExtraTestRoute();
  const [tests, setTests] = useState<ExtraTest[]>([]);
  const [deleting, setDeleting] = useState<ExtraTest | null>(null);
  const [message, setMessage] = useState("");
  const meta = skillMeta[skill];

  const totalQuestions = useMemo(
    () => tests.reduce((sum, test) => sum + test.questionCount, 0),
    [tests],
  );

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setMessage("Admin token topilmadi. Qayta login qiling.");
      return;
    }

    getAdminTests<ExtraTest>(token, { kind: "extra", examType: exam, skill })
      .then((result) => setTests(result.tests))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Testlar yuklanmadi"));
  }, [exam, skill]);

  async function handleDelete(test: ExtraTest) {
    const token = getAdminToken();
    if (!token) {
      setMessage("Admin token topilmadi. Qayta login qiling.");
      return;
    }

    await deleteAdminTest(token, "extra", test.id);
    setTests((current) => current.filter((item) => item.id !== test.id));
    setDeleting(null);
  }

  return (
    <>
      <section className="admin-table-section admin-extra-tests">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <AdminSectionTitle
            title={`${scopeTitle}${meta.title}`}
            description={meta.description}
            meta={`${tests.length} ta test · ${totalQuestions} savol`}
          />
          <div style={{ padding: "18px 20px 0 0" }}>
            <button
              type="button"
              onClick={() => navigate(`${basePath}/add`)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 22px", border: "none", borderRadius: "10px", background: meta.color, color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}
            >
              + Test qo'shish
            </button>
          </div>
        </div>

        {message && <p className="admin-message" style={{ margin: "0 20px 16px" }}>{message}</p>}

        {tests.length > 0 ? (
          <div style={{ padding: "0 20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "18px" }}>
            {tests.map((test) => (
              <article
                className="admin-extra-test-card"
                key={test.id}
                style={{ "--extra-color": meta.color } as CSSProperties}
              >
                <div className="admin-extra-test-card__top">
                  <span>{meta.icon}</span>
                  <small>{test.difficulty}</small>
                </div>
                <h3>{test.testName}</h3>
                <p>{test.description || `${test.skill} uchun tezkor test.`}</p>
                <div className="admin-extra-test-card__meta">
                  <span>{test.level}</span>
                  <span>{test.questionCount} savol</span>
                  <span>{formatDate(test.createdAt)}</span>
                </div>
                <button type="button" onClick={() => setDeleting(test)}>
                  O'chirish
                </button>
              </article>
            ))}
          </div>
        ) : (
          <Empty skill={skill} onAdd={() => navigate(`${basePath}/add`)} />
        )}
      </section>

      {deleting && (
        <div className="admin-profile-modal" role="dialog" aria-modal="true">
          <article className="admin-profile-modal__card" style={{ maxWidth: "420px" }}>
            <div className="admin-profile-modal__header">
              <strong style={{ fontSize: "var(--adm-fs-sub)", color: "#be123c" }}>Testni o'chirish</strong>
              <button type="button" onClick={() => setDeleting(null)} aria-label="Close">✕</button>
            </div>
            <p style={{ margin: "18px 0 24px", color: "#334155", lineHeight: 1.6 }}>
              <strong>{deleting.testName}</strong> testini o'chirasizmi?
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setDeleting(null)}>Bekor qilish</button>
              <button type="button" onClick={() => handleDelete(deleting)} style={{ background: "#be123c", color: "#fff" }}>O'chirish</button>
            </div>
          </article>
        </div>
      )}
    </>
  );
}

export function AddExtraTestPage() {
  const navigate = useNavigate();
  const { basePath, exam, skill, scopeTitle } = useExtraTestRoute();
  const meta = skillMeta[skill];
  const [testName, setTestName] = useState("");
  const [level, setLevel] = useState("B1");
  const [difficulty, setDifficulty] = useState<ExtraTestDifficulty>("Medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  function handleSave() {
    const count = Number(questionCount);
    if (!testName.trim()) {
      setMessage("Test nomini kiriting");
      return;
    }
    if (!Number.isFinite(count) || count <= 0) {
      setMessage("Savollar sonini to'g'ri kiriting");
      return;
    }

    const token = getAdminToken();
    if (!token) {
      setMessage("Admin token topilmadi. Qayta login qiling.");
      return;
    }

    const newTest = {
      examType: exam,
      skill,
      testName: testName.trim(),
      level,
      difficulty,
      questionCount: count,
      description: description.trim(),
    };

    createAdminTest(token, "extra", newTest)
      .then(() => navigate(basePath))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Test saqlanmadi"));
  }

  return (
    <section className="admin-table-section admin-test-editor admin-extra-test-form">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <AdminSectionTitle
          title={`Yangi ${scopeTitle}${skill} testi`}
          description={meta.description}
          meta={skill}
        />
        <div style={{ padding: "18px 20px 0 0" }}>
          <button type="button" onClick={() => navigate(basePath)}>
            ← Orqaga
          </button>
        </div>
      </div>

      {message && <p className="admin-message" style={{ margin: "0 20px 16px" }}>{message}</p>}

      <div style={{ padding: "24px 20px", display: "grid", gap: "22px" }}>
        <fieldset>
          <legend>{skill} test ma'lumotlari</legend>
          <div className="admin-form-grid" style={{ marginTop: "12px" }}>
            <div>
              <label>Test nomi *</label>
              <input value={testName} placeholder={`${skill} practice test #1`} onChange={(event) => setTestName(event.target.value)} />
            </div>
            <div>
              <label>Daraja *</label>
              <select value={level} onChange={(event) => setLevel(event.target.value)}>
                {LEVELS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label>Qiyinlik *</label>
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as ExtraTestDifficulty)}>
                {DIFFICULTIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label>Savollar soni *</label>
              <input value={questionCount} inputMode="numeric" onChange={(event) => setQuestionCount(event.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <label>Tavsif</label>
            <textarea rows={4} value={description} placeholder="Test haqida qisqacha izoh..." onChange={(event) => setDescription(event.target.value)} />
          </div>
        </fieldset>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
          <button type="button" onClick={() => navigate(basePath)}>Bekor qilish</button>
          <button type="button" onClick={handleSave}>Testni saqlash</button>
        </div>
      </div>
    </section>
  );
}
