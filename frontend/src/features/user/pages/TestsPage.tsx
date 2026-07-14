import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import type { Tone } from "../components/UserUI";
import { getUserTests, type UserTestSummary } from "../services/testsApi";
import { loadTestResults, resultColor } from "../services/testResultsStorage";

type TestModule = {
  title: string;
  count: string;
  duration: string;
  lastResult: string;
  focus: string;
  tests: UserTestSummary[];
};

type ExamTest = {
  id: string;
  title: string;
  shortLabel: string;
  skills: string[];
  count: string;
  duration: string;
  result: string;
  tone: Tone;
  modules: TestModule[];
};

const groupTone: Record<string, Tone> = {
  ielts: "blue",
  cefr: "green",
  toefl: "purple",
  sat: "orange",
  general: "pink",
};

const groupTitles: Record<string, string> = {
  ielts: "IELTS",
  cefr: "CEFR",
  toefl: "TOEFL",
  sat: "SAT",
  general: "Umumiy testlar",
};

const skillFocus: Record<string, string> = {
  Listening: "Audio-based listening practice and comprehension tests.",
  Reading: "Text analysis, matching, gap-fill, and reading practice tests.",
  Writing: "Writing tasks, essays, and guided writing practice.",
  Speaking: "Speaking prompts, image/table practice, and interview exercises.",
  Vocabulary: "Vocabulary, collocation, and academic-word quizzes.",
  Grammar: "Grammar, tense, sentence-structure, and accuracy quizzes.",
  Game: "Gamified quizzes, speed challenges, and interactive practice.",
};

const EXAM_SKILLS = ["Listening", "Reading", "Writing", "Speaking"];

function buildGroups(tests: UserTestSummary[]): ExamTest[] {
  const grouped = new Map<string, UserTestSummary[]>();

  tests.forEach((test) => {
    const key = (test.examType || "General").toLowerCase();
    grouped.set(key, [...(grouped.get(key) ?? []), test]);
  });

  return Array.from(grouped.entries()).map(([id, items]) => {
    const bySkill = new Map<string, UserTestSummary[]>();
    items.forEach((test) => {
      bySkill.set(test.skill, [...(bySkill.get(test.skill) ?? []), test]);
    });

    const moduleSkills = ["cefr", "ielts"].includes(id)
      ? EXAM_SKILLS
      : Array.from(bySkill.keys());

    const modules = moduleSkills.map((skill) => {
      const skillTests = bySkill.get(skill) ?? [];
      const questionCount = skillTests.reduce((sum, test) => sum + (test.questionCount || 0), 0);
      return {
        title: skill,
        count: `${skillTests.length} ${skillTests.length === 1 ? "test" : "tests"}`,
        duration: questionCount > 0 ? `${questionCount} questions` : "Practice",
        lastResult: "Yangi",
        focus: skillFocus[skill] ?? "Admin panelda yaratilgan real testlar.",
        tests: skillTests,
      };
    });

    const skills = modules.map((module) => module.title);

    return {
      id,
      title: groupTitles[id] ?? items[0]?.examType ?? "Tests",
      shortLabel: (groupTitles[id] ?? id).slice(0, 2).toUpperCase(),
      skills,
      count: `${items.length} test`,
      duration: `${modules.length} sections`,
      result: "Test library",
      tone: groupTone[id] ?? "blue",
      modules,
    };
  });
}

function TestsPage() {
  const navigate = useNavigate();
  const { testId, skill } = useParams<{ testId?: string; skill?: string }>();
  const [tests, setTests] = useState<UserTestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [comingSoonSkill, setComingSoonSkill] = useState("");
  const results = useMemo(() => loadTestResults(), []);

  useEffect(() => {
    let alive = true;

    const loadTests = (showLoader = false) => {
      if (showLoader) setLoading(true);
      setMessage("");

      getUserTests()
        .then((result) => {
          if (alive) setTests(result.tests);
        })
        .catch((error) => {
          if (alive) setMessage(error instanceof Error ? error.message : "Testlarni yuklab bo'lmadi");
        })
        .finally(() => {
          if (alive && showLoader) setLoading(false);
        });
    };

    const reloadWhenVisible = () => {
      if (document.visibilityState === "visible") loadTests();
    };

    loadTests(true);
    window.addEventListener("focus", reloadWhenVisible);
    document.addEventListener("visibilitychange", reloadWhenVisible);
    const refreshInterval = window.setInterval(loadTests, 30_000);

    return () => {
      alive = false;
      window.removeEventListener("focus", reloadWhenVisible);
      document.removeEventListener("visibilitychange", reloadWhenVisible);
      window.clearInterval(refreshInterval);
    };
  }, []);

  const testGroups = useMemo(() => buildGroups(tests), [tests]);
  const selectedTest = useMemo(
    () => testGroups.find((test) => test.id === testId) ?? null,
    [testGroups, testId],
  );
  const selectedModule = useMemo(
    () => selectedTest?.modules.find((module) => module.title.toLowerCase() === skill?.toLowerCase()) ?? null,
    [selectedTest, skill],
  );
  const isMultilevelRoute = testId === "cefr";
  const isMultilevelTrack = selectedTest?.id === "cefr";

  if (!loading && testId && (!selectedTest || (skill && !selectedModule))) {
    return <Navigate replace to="/user/tests" />;
  }

  return (
    <section className="user-page tests-page">
      {!isMultilevelRoute && (
        <div className="user-page-header">
          <span>Testlar</span>
          <h1>Real bazadagi test markazi</h1>
          <p>Admin panelda yaratilgan testlar shu yerda exam va skill bo‘yicha avtomatik ko‘rinadi.</p>
        </div>
      )}

      {loading && (
        <div className="user-empty-state">
          <strong>Testlar yuklanmoqda...</strong>
          <span>Backend bazadan real testlar olinmoqda.</span>
        </div>
      )}

      {!loading && message && (
        <div className="user-empty-state">
          <strong>Testlar yuklanmadi</strong>
          <span>{message}</span>
        </div>
      )}

      {!loading && !message && selectedTest ? (
        skill && selectedModule ? (
          <article className="test-detail-panel test-detail-panel--standalone test-detail-panel--compact">
            <div className="test-detail-panel__header">
              <div>
                <span>Test selection</span>
                <h2>{selectedTest.title} · {selectedModule.title}</h2>
                <p>{selectedModule.duration} across {selectedModule.count}.</p>
              </div>
              <button type="button" onClick={() => navigate(`/user/tests/${selectedTest.id}`)}>Back to skills</button>
            </div>
            {selectedModule.tests.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {selectedModule.tests.map((test, index) => {
                  const result = results.find((item) => item.testId === test.id);
                  const colors = result ? resultColor(result.wrong) : { background: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
                  return (
                    <article key={test.id} style={{ display: "grid", gap: "9px", padding: "15px", border: `1px solid ${colors.border}`, borderRadius: "14px", background: colors.background }}>
                      <strong style={{ color: colors.color, fontSize: "16px" }}>Test {index + 1}</strong>
                      <span style={{ color: "#475569", fontSize: "13px" }}>{test.questionCount} questions · {test.level || "All levels"}</span>
                      {result && <small style={{ color: colors.color, fontWeight: 900 }}>{result.correct}/{result.total} correct · {result.wrong} mistakes</small>}
                      <button type="button" onClick={() => navigate(`/user/tests/take/${test.id}`)} style={{ minHeight: "36px", border: 0, borderRadius: "9px", background: "#2563eb", color: "#fff", cursor: "pointer", font: "inherit", fontWeight: 900 }}>
                        {result ? "View result" : "Start test"}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : <div className="user-empty-state"><strong>No tests available</strong><span>This skill has no tests yet.</span></div>}
          </article>
        ) : isMultilevelTrack ? (
          <article className="test-detail-panel test-detail-panel--multilevel">
            <div className="test-detail-panel__header test-detail-panel__header--multilevel">
              <div>
                <span>CEFR TESTS</span>
                <h2>Multilevel</h2>
              </div>
              <button type="button" onClick={() => navigate("/user/tests")}>
                Barcha testlar
              </button>
            </div>

            <div className="multilevel-skill-grid">
              {selectedTest.modules.map((module) => {
                const hasTests = module.tests.length > 0;

                return (
                  <article className="multilevel-skill-card" key={module.title}>
                    <div className="multilevel-skill-card__topline">
                      <span>{module.title.slice(0, 2)}</span>
                      <strong>{module.title}</strong>
                    </div>
                    <div className="multilevel-skill-card__meta">
                      <span>{module.count}</span>
                      <span>{module.duration}</span>
                    </div>
                    <button
                      type="button"
                      disabled={!hasTests}
                      onClick={() => hasTests && navigate(`/user/tests/${selectedTest.id}/skill/${module.title.toLowerCase()}`)}
                    >
                      {hasTests ? "Testni boshlash" : "Tez kunda"}
                    </button>
                  </article>
                );
              })}
            </div>
          </article>
        ) : (
        <article className="test-detail-panel test-detail-panel--standalone test-detail-panel--compact">
          <div className="test-detail-panel__header">
            <div>
              <span>Tanlangan yo‘nalish</span>
              <h2>{selectedTest.title} sections</h2>
              <p>Choose a skill to access its available tests.</p>
            </div>
            <button type="button" onClick={() => navigate("/user/tests")}>
              Test tanlashga qaytish
            </button>
          </div>

          <div className="test-module-grid">
            {selectedTest.modules.map((module) => (
              <div className="test-module-card" key={module.title}>
                <div>
                  <span>{module.title.slice(0, 2)}</span>
                  <strong>{module.title}</strong>
                </div>
                <p>{module.focus}</p>
                <dl>
                  <div><dt>Tests</dt><dd>{module.count}</dd></div>
                  <div><dt>Questions</dt><dd>{module.duration}</dd></div>
                  <div><dt>Status</dt><dd>{module.lastResult}</dd></div>
                </dl>
                {module.tests.length === 0 && (
                  <p style={{ minHeight: "auto", margin: 0, fontSize: "13px" }}>No tests have been added yet.</p>
                )}
                {(module.tests.length > 0 || ["Writing", "Speaking"].includes(module.title)) && (
                  <button type="button" onClick={() => {
                    if (["Writing", "Speaking"].includes(module.title)) {
                      setComingSoonSkill(module.title);
                      return;
                    }
                    navigate(`/user/tests/${selectedTest.id}/skill/${module.title.toLowerCase()}`);
                  }} style={{ minHeight: "36px", border: "1px solid #bfdbfe", borderRadius: "9px", background: "#eff6ff", color: "#1d4ed8", cursor: "pointer", font: "inherit", fontWeight: 900 }}>
                    {module.tests.length > 0 ? "Start" : "Coming soon"}
                  </button>
                )}
                {comingSoonSkill === module.title && (
                  <p style={{ minHeight: "auto", margin: 0, padding: "9px", borderRadius: "9px", background: "#fef3c7", color: "#92400e", fontSize: "12px", fontWeight: 800 }}>
                    This section will be added by our developers in the coming days.
                  </p>
                )}
              </div>
            ))}
          </div>
        </article>
        )
      ) : null}

      {!loading && !message && !selectedTest && testGroups.length > 0 && (
        <div className="test-select-grid">
          {testGroups.map((test) => (
            <article
              className="test-select-card"
              key={test.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/user/tests/${test.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") navigate(`/user/tests/${test.id}`);
              }}
              style={{ cursor: "pointer" }}
            >
              <div className={`test-select-card__icon test-select-card__icon--${test.tone}`}>{test.shortLabel}</div>
              <h3>{test.title}</h3>
              <p>{test.skills.join(" · ")}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "10px", margin: "18px 0 14px" }}>
                {Array.from({ length: 7 }, (_, index) => {
                  const item = test.modules.flatMap((module) => module.tests)[index];
                  const result = item ? results.find((saved) => saved.testId === item.id) : undefined;
                  const colors = result
                    ? resultColor(result.wrong)
                    : item
                      ? { background: index === 0 ? "#eff6ff" : "#f8fbff", color: "#1d4ed8", border: index === 0 ? "#93c5fd" : "#dbeafe" }
                      : { background: "#f1f5f9", color: "#94a3b8", border: "#e2e8f0" };
                  return (
                    <button
                      key={item?.id ?? `empty-${index}`}
                      type="button"
                      disabled={!item}
                      title={item ? (result ? `${result.correct}/${result.total} correct · ${result.wrong} mistakes` : item.testName) : "Test is not available yet"}
                      onClick={(event) => { event.stopPropagation(); if (item) navigate(`/user/tests/take/${item.id}`); }}
                      style={{
                        width: "100%",
                        minHeight: "42px",
                        padding: "0 6px",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "10px",
                        background: colors.background,
                        color: colors.color,
                        cursor: item ? "pointer" : "not-allowed",
                        fontWeight: 900,
                        opacity: item ? 1 : 0.72,
                      }}
                    >
                      Test {index + 1}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !message && testGroups.length === 0 && (
        <div className="user-empty-state">
          <strong>Hozircha test yo'q</strong>
          <span>Admin panelda test yaratilgandan keyin ular shu yerda ko‘rinadi.</span>
        </div>
      )}
    </section>
  );
}

export default TestsPage;
