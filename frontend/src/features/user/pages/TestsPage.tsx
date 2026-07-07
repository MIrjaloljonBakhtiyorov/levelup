import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import type { Tone } from "../components/UserUI";

type TestModule = {
  title: string;
  count: string;
  duration: string;
  lastResult: string;
  focus: string;
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

const tests: ExamTest[] = [
  {
    id: "ielts",
    title: "IELTS",
    shortLabel: "IE",
    skills: ["Listening", "Reading", "Writing", "Speaking"],
    count: "48 test",
    duration: "2 soat 45 daqiqa",
    result: "Oxirgi: 6.0",
    tone: "blue",
    modules: [
      { title: "Listening", count: "12 test", duration: "30 daqiqa", lastResult: "Oxirgi: 6.5", focus: "Section 1-4, note completion, map labelling" },
      { title: "Reading", count: "14 test", duration: "60 daqiqa", lastResult: "Oxirgi: 6.0", focus: "True/False/Not Given, matching headings" },
      { title: "Writing", count: "10 task", duration: "60 daqiqa", lastResult: "Oxirgi: 6.0", focus: "Task 1 report, Task 2 essay feedback" },
      { title: "Speaking", count: "12 practice", duration: "15 daqiqa", lastResult: "Oxirgi: 6.5", focus: "Part 1, cue card, follow-up questions" },
    ],
  },
  {
    id: "cefr",
    title: "CEFR",
    shortLabel: "CE",
    skills: ["Listening", "Reading", "Writing", "Speaking"],
    count: "36 test",
    duration: "2 soat",
    result: "Oxirgi: B2",
    tone: "green",
    modules: [
      { title: "Listening", count: "9 test", duration: "25 daqiqa", lastResult: "Oxirgi: B2", focus: "Dialog, monolog va asosiy fikrni topish" },
      { title: "Reading", count: "10 test", duration: "45 daqiqa", lastResult: "Oxirgi: B2", focus: "Matn tahlili, gap joylashtirish, inference" },
      { title: "Writing", count: "8 task", duration: "35 daqiqa", lastResult: "Oxirgi: B2", focus: "Email, essay va grammar accuracy" },
      { title: "Speaking", count: "9 practice", duration: "15 daqiqa", lastResult: "Oxirgi: B2+", focus: "Interview, picture description, discussion" },
    ],
  },
  {
    id: "toefl",
    title: "TOEFL",
    shortLabel: "TO",
    skills: ["Reading", "Listening", "Speaking", "Writing"],
    count: "24 test",
    duration: "3 soat",
    result: "Oxirgi: 86",
    tone: "purple",
    modules: [
      { title: "Reading", count: "6 test", duration: "54 daqiqa", lastResult: "Oxirgi: 22", focus: "Academic passage, vocabulary, inference" },
      { title: "Listening", count: "6 test", duration: "41 daqiqa", lastResult: "Oxirgi: 21", focus: "Lecture, conversation, detail questions" },
      { title: "Speaking", count: "6 practice", duration: "17 daqiqa", lastResult: "Oxirgi: 20", focus: "Independent and integrated responses" },
      { title: "Writing", count: "6 task", duration: "50 daqiqa", lastResult: "Oxirgi: 23", focus: "Integrated writing and academic discussion" },
    ],
  },
  {
    id: "sat",
    title: "SAT",
    shortLabel: "SA",
    skills: ["Reading and Writing", "Math"],
    count: "30 test",
    duration: "2 soat 14 daqiqa",
    result: "Oxirgi: 1240",
    tone: "orange",
    modules: [
      { title: "Reading", count: "10 set", duration: "32 daqiqa", lastResult: "Oxirgi: 610", focus: "Evidence, main idea, vocabulary in context" },
      { title: "Writing", count: "8 set", duration: "32 daqiqa", lastResult: "Oxirgi: 630", focus: "Grammar, transitions, rhetorical synthesis" },
      { title: "Math", count: "12 set", duration: "70 daqiqa", lastResult: "Oxirgi: 610", focus: "Algebra, problem solving, advanced math" },
    ],
  },
  {
    id: "mock",
    title: "Mock testlar",
    shortLabel: "Mo",
    skills: ["Full exam", "AI feedback"],
    count: "12 mock",
    duration: "Real format",
    result: "Oxirgi: +0.4",
    tone: "pink",
    modules: [
      { title: "Full mock", count: "5 mock", duration: "To‘liq imtihon", lastResult: "Oxirgi: +0.4", focus: "Real vaqt, barcha bo‘limlar, yakuniy tahlil" },
      { title: "Listening", count: "2 mock", duration: "30-40 daqiqa", lastResult: "Oxirgi: yaxshi", focus: "Audio format va javob varaqasi bilan" },
      { title: "Reading", count: "2 mock", duration: "60 daqiqa", lastResult: "Oxirgi: barqaror", focus: "Matn tezligi va savol turlari tahlili" },
      { title: "Writing", count: "3 mock", duration: "60 daqiqa", lastResult: "AI feedback", focus: "Band descriptor bo‘yicha avtomatik izoh" },
    ],
  },
];

function TestsPage() {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId?: string }>();
  const selectedTest = useMemo(
    () => tests.find((test) => test.id === testId) ?? null,
    [testId],
  );

  if (testId && !selectedTest) {
    return <Navigate replace to="/user/tests" />;
  }

  return (
    <section className="user-page tests-page">
      <div className="user-page-header">
        <span>Testlar</span>
        <h1>Imtihon modeli asosidagi test markazi</h1>
        <p>IELTS, CEFR, TOEFL, SAT va full mock testlarni real formatga yaqin muhitda ishlang.</p>
      </div>

      {selectedTest ? (
        <article className="test-detail-panel test-detail-panel--standalone">
          <div className="test-detail-panel__header">
            <div>
              <span>Tanlangan yo‘nalish</span>
              <h2>{selectedTest.title} bo‘limlari</h2>
              <p>{selectedTest.skills.join(" · ")} bo‘yicha alohida practice va natija tahlili.</p>
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
                  <div><dt>Testlar</dt><dd>{module.count}</dd></div>
                  <div><dt>Vaqt</dt><dd>{module.duration}</dd></div>
                  <div><dt>Natija</dt><dd>{module.lastResult}</dd></div>
                </dl>
                <button type="button">Bo‘limni boshlash</button>
              </div>
            ))}
          </div>
        </article>
      ) : (
        <div className="test-select-grid">
          {tests.map((test) => (
            <article className="test-select-card" key={test.id}>
              <div className={`test-select-card__icon test-select-card__icon--${test.tone}`}>{test.shortLabel}</div>
              <h3>{test.title}</h3>
              <p>{test.skills.join(" · ")}</p>
              <div className="test-select-card__stats">
                <span>{test.count}</span>
                <span>{test.duration}</span>
                <span>{test.result}</span>
              </div>
              <button type="button" onClick={() => navigate(`/user/tests/${test.id}`)}>
                Tanlash
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default TestsPage;
