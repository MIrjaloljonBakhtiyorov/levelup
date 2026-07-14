import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getUserTest, type UserTestDetail } from "../services/testsApi";
import { deleteTestResult, loadTestResults, saveTestResult, type SavedTestResult } from "../services/testResultsStorage";

type RunnerQuestion = {
  id: string;
  text: string;
  options?: Array<{ key: string; text: string }>;
  correct: string;
};

type TextMark = { targetId: string; text: string; color: string; start: number; end: number };
type PendingMark = { targetId: string; text: string; start: number; end: number };
const MARK_COLORS = ["#fde047", "#4ade80", "#38bdf8", "#fb7185", "#c084fc"];

const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, " ");

function loadMarks(testId: string): TextMark[] {
  try {
    const value = JSON.parse(localStorage.getItem(`test_marks_${testId}`) ?? "[]") as unknown;
    return Array.isArray(value) ? value.filter((mark): mark is TextMark => Boolean(
      mark
      && typeof mark === "object"
      && typeof (mark as TextMark).targetId === "string"
      && typeof (mark as TextMark).text === "string"
      && typeof (mark as TextMark).color === "string"
      && Number.isInteger((mark as TextMark).start)
      && Number.isInteger((mark as TextMark).end),
    )) : [];
  } catch {
    return [];
  }
}

function extractQuestions(test: UserTestDetail): RunnerQuestion[] {
  const part = test.part ?? {};
  const questions: RunnerQuestion[] = [];
  const add = (items: unknown[], prefix: string, options?: Array<{ key: string; text: string }>) => {
    items.forEach((raw, index) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      const correct = String(item.correctAnswer ?? item.answer ?? "");
      const inlineOptions = ["A", "B", "C", "D", "E", "F"].flatMap((key) => {
        const text = item[`option${key}`];
        return typeof text === "string" && text ? [{ key, text }] : [];
      });
      questions.push({
        id: String(item.id ?? `${prefix}-${index}`),
        text: String(item.questionText ?? item.statementText ?? `Javob ${questions.length + 1}`),
        options: inlineOptions.length ? inlineOptions : options,
        correct,
      });
    });
  };

  const options = Array.isArray(part.options)
    ? (part.options as Array<Record<string, unknown>>).map((item) => ({ key: String(item.key), text: String(item.text) }))
    : undefined;

  if (Array.isArray(part.answers)) {
    (part.answers as unknown[]).forEach((answer, index) => questions.push({ id: `answer-${index}`, text: "", correct: String(answer) }));
  }
  if (Array.isArray(part.questions)) add(part.questions, "question", options);
  if (Array.isArray(part.section1)) add(part.section1, "section1");
  if (Array.isArray(part.section2)) add(part.section2, "section2");
  return questions;
}

function passageFor(test: UserTestDetail) {
  const part = test.part ?? {};
  return String(part.passage ?? part.instruction ?? part.text1 ?? test.description ?? "Savollarni diqqat bilan o‘qing va javoblarni kiriting.");
}

function highlightedPassage(text: string, marks: TextMark[]) {
  if (!marks.length) return text;
  const output: React.ReactNode[] = [];
  const validMarks = marks
    .filter((mark) => Number.isInteger(mark.start) && Number.isInteger(mark.end) && mark.start >= 0 && mark.end <= text.length && mark.end > mark.start)
    .sort((a, b) => a.start - b.start);
  let cursor = 0;
  for (const mark of validMarks) {
    if (mark.start < cursor) continue;
    if (mark.start > cursor) {
      output.push(<span key={`text-${cursor}-${mark.start}`}>{text.slice(cursor, mark.start)}</span>);
    }
    output.push(
      <mark key={`${mark.start}-${mark.end}`} style={{ background: mark.color, borderRadius: "3px", padding: 0 }}>
        {text.slice(mark.start, mark.end)}
      </mark>,
    );
    cursor = mark.end;
  }
  if (cursor < text.length) output.push(<span key={`text-${cursor}-${text.length}`}>{text.slice(cursor)}</span>);
  return output;
}

function MarkedText({
  targetId,
  text,
  marks,
  onSelect,
  style,
}: {
  targetId: string;
  text: string;
  marks: TextMark[];
  onSelect: (selection: PendingMark) => void;
  style?: React.CSSProperties;
}) {
  const textRef = useRef<HTMLSpanElement>(null);

  function captureSelection() {
    const selection = window.getSelection();
    const target = textRef.current;
    if (!selection || !target || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (!target.contains(range.commonAncestorContainer)) return;

    const before = range.cloneRange();
    before.selectNodeContents(target);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    const selectedText = range.toString();
    if (!selectedText.trim() || selectedText.length > 120) return;
    onSelect({ targetId, text: selectedText, start, end: start + selectedText.length });
  }

  return (
    <span ref={textRef} onMouseUp={captureSelection} style={{ cursor: "text", ...style }}>
      {highlightedPassage(text, marks.filter((mark) => mark.targetId === targetId))}
    </span>
  );
}

function ReadingPart2Layout({
  questions,
  answers,
  submitted,
  onAnswer,
  marks,
  onMarkSelection,
}: {
  questions: RunnerQuestion[];
  answers: Record<string, string>;
  submitted: boolean;
  onAnswer: (questionId: string, answer: string) => void;
  marks: TextMark[];
  onMarkSelection: (selection: PendingMark) => void;
}) {
  const statements = questions[0]?.options ?? [];

  return (
    <>
      <div style={{ padding: "18px 24px", borderRadius: "16px", background: "#eef4ff", color: "#1e3a8a", lineHeight: 1.65 }}>
        Read the statements and match each one with the correct text. Each letter can be used only once.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 1fr) minmax(360px, 1.05fr)", gap: "20px", alignItems: "start" }}>
        <article style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "18px", background: "#fff" }}>
          <h2 style={{ margin: "0 0 16px", color: "#4338ca", fontSize: "18px" }}>▣ STATEMENTS (A–J)</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {statements.map((statement) => (
              <div key={statement.key} style={{ display: "grid", gridTemplateColumns: "38px 1fr", gap: "12px", alignItems: "start", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "11px" }}>
                <strong style={{ display: "grid", placeItems: "center", width: "32px", height: "32px", borderRadius: "8px", color: "#4f46e5", background: "#eef2ff" }}>{statement.key}</strong>
                <MarkedText targetId={`part2-option-${statement.key}`} text={statement.text} marks={marks} onSelect={onMarkSelection} style={{ color: "#1e293b", lineHeight: 1.45 }} />
              </div>
            ))}
          </div>
        </article>
        <article style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "18px", background: "#fff" }}>
          <h2 style={{ margin: "0 0 16px", color: "#0f766e", fontSize: "18px" }}>▤ TEXTS</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {questions.map((question, index) => {
              const value = answers[question.id] ?? "";
              const isCorrect = submitted && normalize(value) === normalize(question.correct);
              return (
                <div key={question.id} style={{ display: "grid", gridTemplateColumns: "38px 1fr minmax(110px, 150px)", alignItems: "center", gap: "12px", padding: "12px", border: `1px solid ${submitted ? (isCorrect ? "#86efac" : "#fca5a5") : "#e2e8f0"}`, borderRadius: "11px", background: submitted ? (isCorrect ? "#f0fdf4" : "#fef2f2") : "#fff" }}>
                  <strong style={{ display: "grid", placeItems: "center", width: "32px", height: "32px", borderRadius: "8px", color: "#0f766e", background: "#d1fae5" }}>{index + 1}</strong>
                  <strong style={{ color: "#0f172a" }}><MarkedText targetId={`part2-question-${question.id}`} text={question.text} marks={marks} onSelect={onMarkSelection} /></strong>
                  <select value={value} disabled={submitted} onChange={(event) => onAnswer(question.id, event.target.value)} style={{ minHeight: "40px", padding: "0 10px", border: "1px solid #cbd5e1", borderRadius: "9px", background: "#fff", color: "#334155", font: "inherit" }}>
                    <option value="">Select</option>
                    {statements.map((statement) => <option key={statement.key} value={statement.key}>{statement.key}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </>
  );
}

function ReadingPart3Layout({
  questions,
  answers,
  submitted,
  onAnswer,
  marks,
  onMarkSelection,
}: {
  questions: RunnerQuestion[];
  answers: Record<string, string>;
  submitted: boolean;
  onAnswer: (questionId: string, answer: string) => void;
  marks: TextMark[];
  onMarkSelection: (selection: PendingMark) => void;
}) {
  const options = questions[0]?.options ?? [];
  const usedAnswers = new Set(Object.values(answers));

  return (
    <>
      <div style={{ padding: "18px 24px", borderRadius: "16px", background: "#eef4ff", color: "#1e3a8a", lineHeight: 1.65 }}>
        Read the questions and answer options. Choose the best answer from A–H for every question. Each option can be used once.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, .92fr) minmax(380px, 1.08fr)", gap: "20px", alignItems: "start" }}>
        <article style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "18px", background: "#fff" }}>
          <h2 style={{ margin: "0 0 16px", color: "#6d28d9", fontSize: "18px" }}>▣ QUESTIONS</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {questions.map((question, index) => (
              <div key={question.id} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: "12px", alignItems: "start", padding: "14px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff" }}>
                <strong style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", borderRadius: "9px", color: "#6d28d9", background: "#f3e8ff" }}>{index + 15}</strong>
                <MarkedText targetId={`part3-question-${question.id}`} text={question.text} marks={marks} onSelect={onMarkSelection} style={{ color: "#1e293b", lineHeight: 1.5, fontWeight: 700 }} />
              </div>
            ))}
          </div>
        </article>
        <article style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "18px", background: "#fff" }}>
          <h2 style={{ margin: "0 0 16px", color: "#0f766e", fontSize: "18px" }}>▤ ANSWER OPTIONS (A–H)</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {options.map((option) => (
              <div key={option.key} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: "12px", alignItems: "start", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "11px" }}>
                <strong style={{ display: "grid", placeItems: "center", width: "36px", height: "36px", borderRadius: "9px", color: "#6d28d9", background: "#f3e8ff" }}>{option.key}</strong>
                <MarkedText targetId={`part3-option-${option.key}`} text={option.text} marks={marks} onSelect={onMarkSelection} style={{ color: "#1e293b", lineHeight: 1.45 }} />
              </div>
            ))}
          </div>
        </article>
      </div>
      <article style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "18px", background: "linear-gradient(135deg, #faf7ff, #fff)" }}>
        <h2 style={{ margin: "0 0 6px", color: "#6d28d9", fontSize: "17px" }}>SELECT ANSWERS</h2>
        <p style={{ margin: "0 0 16px", color: "#64748b" }}>Select one option for each question.</p>
        <div style={{ display: "grid", gap: "9px" }}>
          {questions.map((question, index) => {
            const value = answers[question.id] ?? "";
            const isCorrect = submitted && normalize(value) === normalize(question.correct);
            return (
              <div key={question.id} style={{ display: "grid", gridTemplateColumns: "54px repeat(8, minmax(34px, 1fr))", gap: "8px", alignItems: "center" }}>
                <strong style={{ display: "grid", placeItems: "center", minHeight: "40px", borderRadius: "9px", color: "#0f766e", background: "#d1fae5" }}>{index + 15}</strong>
                {options.map((option) => {
                  const selected = value === option.key;
                  const unavailable = !selected && usedAnswers.has(option.key);
                  return (
                    <button key={option.key} type="button" disabled={submitted || unavailable} onClick={() => onAnswer(question.id, option.key)} style={{ minHeight: "40px", border: `1px solid ${selected ? "#6d28d9" : submitted && !isCorrect ? "#fca5a5" : "#c4b5fd"}`, borderRadius: "9px", background: selected ? "#6d28d9" : "#fff", color: selected ? "#fff" : "#6d28d9", cursor: submitted || unavailable ? "not-allowed" : "pointer", opacity: unavailable ? .36 : 1, font: "inherit", fontWeight: 900 }}>{option.key}</button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </article>
    </>
  );
}

function ReadingPart5Layout({
  test,
  questions,
  answers,
  submitted,
  onAnswer,
  marks,
  onMarkSelection,
}: {
  test: UserTestDetail;
  questions: RunnerQuestion[];
  answers: Record<string, string>;
  submitted: boolean;
  onAnswer: (questionId: string, answer: string) => void;
  marks: TextMark[];
  onMarkSelection: (selection: PendingMark) => void;
}) {
  const gapQuestions = questions.filter((question) => !question.options?.length);
  const choiceQuestions = questions.filter((question) => question.options?.length);

  return (
    <>
      <div style={{ padding: "18px 24px", borderRadius: "16px", background: "#eef4ff", color: "#1e3a8a", lineHeight: 1.65 }}>
        Read the passage carefully. Complete Section 1, then choose the best answer for every Section 2 question.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(380px, 1fr)", gap: "22px", alignItems: "start" }}>
        <article style={{ minHeight: "500px", padding: "26px", border: "1px solid #e2e8f0", borderRadius: "18px", background: "#fff" }}>
          <div style={{ display: "inline-flex", padding: "6px 10px", borderRadius: "999px", background: "#dbeafe", color: "#1d4ed8", fontWeight: 900, fontSize: "12px" }}>READING PASSAGE</div>
          <h2 style={{ margin: "14px 0", color: "#0f172a" }}>{test.testName}</h2>
          <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#334155", fontSize: "16px", lineHeight: 1.9 }}><MarkedText targetId="part5-passage" text={passageFor(test)} marks={marks} onSelect={onMarkSelection} style={{ display: "block", whiteSpace: "pre-wrap" }} /></p>
        </article>
        <div style={{ display: "grid", gap: "18px" }}>
          <article style={{ padding: "22px", border: "1px solid #e2e8f0", borderRadius: "18px", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", borderRadius: "9px", background: "#ede9fe", color: "#6d28d9", fontWeight: 950 }}>1</span>
              <div><strong style={{ color: "#0f172a" }}>Section 1 — Complete the gaps</strong><small style={{ display: "block", color: "#64748b", marginTop: "3px" }}>Type one answer for each gap.</small></div>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              {gapQuestions.map((question, index) => {
                const value = answers[question.id] ?? "";
                const isCorrect = submitted && normalize(value) === normalize(question.correct);
                return (
                  <label key={question.id} style={{ display: "grid", gridTemplateColumns: "34px 1fr", alignItems: "center", gap: "10px", padding: "9px", border: `1px solid ${submitted ? (isCorrect ? "#86efac" : "#fca5a5") : "#e2e8f0"}`, borderRadius: "10px", background: submitted ? (isCorrect ? "#f0fdf4" : "#fef2f2") : "#f8fafc" }}>
                    <strong style={{ color: "#6d28d9" }}>{index + 1}</strong>
                    <input value={value} disabled={submitted} placeholder="Type your answer" onChange={(event) => onAnswer(question.id, event.target.value)} style={{ minHeight: "39px", padding: "0 11px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", font: "inherit" }} />
                  </label>
                );
              })}
            </div>
          </article>
          <article style={{ padding: "22px", border: "1px solid #e2e8f0", borderRadius: "18px", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", borderRadius: "9px", background: "#d1fae5", color: "#0f766e", fontWeight: 950 }}>2</span>
              <div><strong style={{ color: "#0f172a" }}>Section 2 — Choose the answer</strong><small style={{ display: "block", color: "#64748b", marginTop: "3px" }}>Select one option for each question.</small></div>
            </div>
            <div style={{ display: "grid", gap: "14px" }}>
              {choiceQuestions.map((question, index) => {
                const value = answers[question.id] ?? "";
                const isCorrect = submitted && normalize(value) === normalize(question.correct);
                return (
                  <div key={question.id} style={{ padding: "13px", border: `1px solid ${submitted ? (isCorrect ? "#86efac" : "#fca5a5") : "#e2e8f0"}`, borderRadius: "11px", background: submitted ? (isCorrect ? "#f0fdf4" : "#fef2f2") : "#f8fafc" }}>
                    <strong style={{ color: "#0f172a" }}>{gapQuestions.length + index + 1}. <MarkedText targetId={`part5-question-${question.id}`} text={question.text} marks={marks} onSelect={onMarkSelection} /></strong>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: "8px", marginTop: "11px" }}>
                      {question.options?.map((option) => {
                        const selected = value === option.key;
                        return (
                          <button
                            key={option.key}
                            type="button"
                            disabled={submitted}
                            onClick={() => onAnswer(question.id, option.key)}
                            style={{ display: "flex", alignItems: "center", gap: "9px", minHeight: "48px", padding: "8px 11px", border: `1px solid ${selected ? "#2563eb" : "#cbd5e1"}`, borderRadius: "8px", background: selected ? "#2563eb" : "#fff", color: selected ? "#fff" : "#334155", cursor: submitted ? "not-allowed" : "pointer", font: "inherit", fontWeight: 700, textAlign: "left" }}
                          >
                            <b style={{ display: "grid", flex: "0 0 auto", placeItems: "center", width: "25px", height: "25px", borderRadius: "6px", background: selected ? "rgba(255,255,255,.2)" : "#eff6ff", color: selected ? "#fff" : "#1d4ed8" }}>{option.key}</b>
                            <span>{option.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

export default function TestRunnerPage() {
  const { testId = "" } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [savedResult, setSavedResult] = useState<SavedTestResult | undefined>(() => loadTestResults().find((result) => result.testId === testId));
  const [test, setTest] = useState<UserTestDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>(() => savedResult?.answers ?? {});
  const [seconds, setSeconds] = useState(240);
  const [submitted, setSubmitted] = useState(Boolean(savedResult));
  const [message, setMessage] = useState("");
  const [pendingSelection, setPendingSelection] = useState<PendingMark | null>(null);
  const [marks, setMarks] = useState<TextMark[]>(() => loadMarks(testId));
  const [vocabularyNotes, setVocabularyNotes] = useState(() => localStorage.getItem(`test_vocabulary_${testId}`) ?? "");
  const [activeTestId, setActiveTestId] = useState(testId);

  useEffect(() => {
    let active = true;
    const previousResult = loadTestResults().find((result) => result.testId === testId);

    setActiveTestId(testId);
    setTest(null);
    setMessage("");
    setSavedResult(previousResult);
    setAnswers(previousResult?.answers ?? {});
    setSeconds(240);
    setSubmitted(Boolean(previousResult));
    setPendingSelection(null);
    setMarks(loadMarks(testId));
    setVocabularyNotes(localStorage.getItem(`test_vocabulary_${testId}`) ?? "");

    if (!testId) {
      setMessage("Test ID is missing.");
      return () => { active = false; };
    }

    getUserTest(testId)
      .then((result) => {
        if (active) setTest(result.test);
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "Test yuklanmadi");
      });

    return () => { active = false; };
  }, [testId]);

  useEffect(() => {
    if (!testId || activeTestId !== testId) return;
    localStorage.setItem(`test_marks_${testId}`, JSON.stringify(marks));
    localStorage.setItem(`test_vocabulary_${testId}`, vocabularyNotes);
  }, [activeTestId, marks, testId, vocabularyNotes]);

  const questions = useMemo(() => test ? extractQuestions(test) : [], [test]);
  const correctCount = useMemo(() => questions.filter((question) => normalize(answers[question.id] ?? "") === normalize(question.correct)).length, [answers, questions]);

  useEffect(() => {
    if (!test || submitted) return;
    if (seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((current) => current - 1), 1000);
    return () => window.clearInterval(timer);
  }, [seconds, submitted, test]);

  if (message) return (
    <section className="user-page">
      <div className="user-empty-state">
        <strong>Test ochilmadi</strong>
        <span>{message}</span>
        <button type="button" onClick={() => navigate("/user/tests")}>Testlarga qaytish</button>
      </div>
    </section>
  );
  if (!test) return <section className="user-page"><div className="user-empty-state"><strong>Test yuklanmoqda...</strong></div></section>;

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const answered = questions.filter((question) => answers[question.id]?.trim()).length;
  const displayedCorrect = savedResult?.correct ?? correctCount;
  const isReadingPart2 = test.kind === "reading" && test.part?.type === "part2";
  const isReadingPart3 = test.kind === "reading" && test.part?.type === "part3";
  const isReadingPart5 = test.kind === "reading" && test.part?.type === "part5";
  const isReadingTest = test.kind === "reading";
  const listeningAudio = test.kind === "listening"
    ? (test.part?.audio as { audioFileName?: string; audioDataUrl?: string } | undefined)
    : undefined;
  function submitAnswers() {
    if (answered !== questions.length) return;
    const result: SavedTestResult = {
      testId,
      correct: correctCount,
      total: questions.length,
      wrong: questions.length - correctCount,
      answers,
      completedAt: new Date().toISOString(),
    };
    saveTestResult(result);
    setSavedResult(result);
    setSubmitted(true);
  }

  function retryTest() {
    deleteTestResult(testId);
    setSavedResult(undefined);
    setAnswers({});
    setSeconds(240);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyMark(color: string) {
    if (!pendingSelection) return;
    const selectedRange = pendingSelection;
    window.getSelection()?.removeAllRanges();
    setMarks((current) => [
      ...current.filter((mark) => mark.targetId !== selectedRange.targetId || mark.end <= selectedRange.start || mark.start >= selectedRange.end),
      { ...selectedRange, color },
    ]);
    setPendingSelection(null);
  }

  return (
    <section className="user-page" style={{ display: "grid", gap: "22px" }}>
      <header style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "18px", padding: "18px 24px", border: "1px solid #e2e8f0", borderRadius: "18px", background: "#fff" }}>
        <button
          type="button"
          onClick={() => navigate("/user/tests")}
          style={{ justifySelf: "start", display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "42px", padding: "0 16px", border: "1px solid #bfdbfe", borderRadius: "12px", background: "#eff6ff", color: "#1d4ed8", cursor: "pointer", font: "inherit", fontWeight: 900, boxShadow: "0 8px 18px rgba(37,99,235,.08)", transition: "transform 150ms, background 150ms" }}
          onMouseEnter={(event) => { event.currentTarget.style.transform = "translateY(-1px)"; event.currentTarget.style.background = "#dbeafe"; }}
          onMouseLeave={(event) => { event.currentTarget.style.transform = "translateY(0)"; event.currentTarget.style.background = "#eff6ff"; }}
        >
          <span aria-hidden="true" style={{ fontSize: "18px" }}>←</span> {test.examType} {test.skill}
        </button>
        <strong style={{ padding: "12px 20px", borderRadius: "14px", background: seconds < 60 ? "#fee2e2" : "#f1f5f9", color: seconds < 60 ? "#b91c1c" : "#0f172a", fontSize: "18px" }}>⏱ {minutes}:{secs}</strong>
        <span style={{ justifySelf: "end", color: "#475569", fontWeight: 800 }}>{answered} / {questions.length} answered</span>
      </header>

      <div style={{ padding: "18px 24px", borderRadius: "16px", background: "#eef4ff", color: "#1e3a8a", lineHeight: 1.6 }}>
        You have 4 minutes for this test. Read the questions, enter every answer, then click “Submit answers”.
      </div>

      {listeningAudio && (
        <section style={{ display: "grid", gap: "12px", padding: "18px 22px", border: "1px solid #bfdbfe", borderRadius: "16px", background: "linear-gradient(135deg, #eff6ff, #f8fbff)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "grid", placeItems: "center", width: "38px", height: "38px", borderRadius: "11px", background: "#2563eb", color: "#fff", fontSize: "18px" }}>♫</span>
            <div>
              <strong style={{ color: "#0f172a" }}>Listening audio</strong>
              <small style={{ display: "block", marginTop: "2px", color: "#64748b" }}>{listeningAudio.audioFileName || "Audio track"}</small>
            </div>
          </div>
          {listeningAudio.audioDataUrl ? (
            <audio controls preload="metadata" src={listeningAudio.audioDataUrl} style={{ width: "100%" }}>
              Your browser does not support audio playback.
            </audio>
          ) : (
            <small style={{ color: "#b45309", fontWeight: 800 }}>This older test has no saved audio file. Upload the audio again in the admin panel.</small>
          )}
        </section>
      )}

      {isReadingTest && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "10px", background: "#f8fafc" }}>
          <strong style={{ marginRight: "4px", fontSize: "13px" }}>
            {pendingSelection ? `Selected: “${pendingSelection.text.slice(0, 28)}${pendingSelection.text.length > 28 ? "…" : ""}”` : "Select text, then choose a color:"}
          </strong>
          {MARK_COLORS.map((color) => <button key={color} type="button" disabled={!pendingSelection} aria-label={`Mark with ${color}`} onClick={() => applyMark(color)} style={{ width: "30px", height: "30px", padding: 0, borderRadius: "8px", border: "2px solid rgba(15,23,42,.2)", background: color, cursor: pendingSelection ? "pointer" : "not-allowed", opacity: pendingSelection ? 1 : .45, boxShadow: pendingSelection ? `0 4px 10px ${color}88` : "none" }} />)}
          <button type="button" onClick={() => { setMarks([]); setPendingSelection(null); }} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "7px", minHeight: "36px", padding: "0 12px", border: "1px solid #fecaca", borderRadius: "9px", background: "#fff7f7", color: "#be123c", cursor: "pointer", font: "inherit", fontSize: "12px", fontWeight: 900 }}><span aria-hidden="true">×</span> Clear marks</button>
        </div>
      )}

      {isReadingPart5 ? (
        <ReadingPart5Layout
          test={test}
          questions={questions}
          answers={answers}
          submitted={submitted}
          onAnswer={(questionId, answer) => setAnswers((current) => ({ ...current, [questionId]: answer }))}
          marks={marks}
          onMarkSelection={setPendingSelection}
        />
      ) : isReadingPart3 ? (
        <ReadingPart3Layout
          questions={questions}
          answers={answers}
          submitted={submitted}
          onAnswer={(questionId, answer) => setAnswers((current) => ({ ...current, [questionId]: answer }))}
          marks={marks}
          onMarkSelection={setPendingSelection}
        />
      ) : isReadingPart2 ? (
        <ReadingPart2Layout
          questions={questions}
          answers={answers}
          submitted={submitted}
          onAnswer={(questionId, answer) => setAnswers((current) => ({ ...current, [questionId]: answer }))}
          marks={marks}
          onMarkSelection={setPendingSelection}
        />
      ) : (
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "22px", alignItems: "start" }}>
        <article style={{ minHeight: "520px", padding: "30px", border: "1px solid #e2e8f0", borderRadius: "18px", background: "#fff" }}>
          <h1 style={{ marginTop: 0, color: "#0f172a" }}>{test.testName}</h1>
          <p style={{ whiteSpace: "pre-wrap", color: "#334155", fontSize: "16px", lineHeight: 1.9 }}><MarkedText targetId="reading-passage" text={passageFor(test)} marks={marks} onSelect={setPendingSelection} style={{ display: "block", whiteSpace: "pre-wrap" }} /></p>
          <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #dbeafe", borderRadius: "12px", background: "#f8fbff" }}>
            <label style={{ display: "grid", gap: "8px", color: "#0f172a", fontWeight: 900 }}>
              Vocabulary Notes
              <textarea value={vocabularyNotes} onChange={(event) => setVocabularyNotes(event.target.value)} placeholder="Write your vocabulary notes..." rows={6} style={{ width: "100%", padding: "12px", resize: "vertical", border: "1px solid #bfdbfe", borderRadius: "9px", font: "inherit", fontWeight: 500 }} />
            </label>
          </div>
        </article>

        <article style={{ padding: "26px", border: "1px solid #e2e8f0", borderRadius: "18px", background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>Questions 1–{questions.length}</h2>
          <div style={{ display: "grid", gap: "18px" }}>
            {questions.map((question, index) => {
              const value = answers[question.id] ?? "";
              const hasSavedAnswer = Boolean(value.trim());
              const isCorrect = submitted && hasSavedAnswer && normalize(value) === normalize(question.correct);
              const isTrueFalseNotGiven = ["true", "false", "not given"].includes(normalize(question.correct));
              return (
                <div key={question.id} style={{ padding: "16px", border: `1px solid ${submitted && hasSavedAnswer ? (isCorrect ? "#86efac" : "#fca5a5") : "#e2e8f0"}`, borderRadius: "12px", background: submitted && hasSavedAnswer ? (isCorrect ? "#f0fdf4" : "#fef2f2") : "#f8fafc" }}>
                  <p style={{ margin: "0 0 10px", color: "#0f172a", fontWeight: 700 }}>
                    {index + 1}{question.text ? `. ${question.text}` : ""}
                  </p>
                  {question.options?.length ? (
                    <div style={{ display: "grid", gap: "8px" }}>{question.options.map((option) => <label key={option.key} style={{ display: "flex", gap: "9px" }}><input type="radio" name={question.id} value={option.key} checked={value === option.key} disabled={submitted} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} /> <span><b>{option.key}.</b> {option.text}</span></label>)}</div>
                  ) : isTrueFalseNotGiven ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "9px" }}>
                      {["True", "False", "Not Given"].map((option) => {
                        const selected = value === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={submitted}
                            onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                            style={{ minHeight: "42px", padding: "0 8px", border: `1px solid ${selected ? "#2563eb" : "#cbd5e1"}`, borderRadius: "9px", background: selected ? "#2563eb" : "#fff", color: selected ? "#fff" : "#334155", cursor: submitted ? "not-allowed" : "pointer", font: "inherit", fontSize: "13px", fontWeight: 900 }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input value={value} disabled={submitted} placeholder="Type your answer" onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} style={{ width: "100%", minHeight: "42px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "9px" }} />
                  )}
                  {submitted && hasSavedAnswer && (
                    <small style={{ display: "block", marginTop: "9px", color: isCorrect ? "#166534" : "#b91c1c", fontWeight: 800 }}>
                      {isCorrect ? "Correct" : "Incorrect"}
                    </small>
                  )}
                </div>
              );
            })}
          </div>
        </article>
      </div>
      )}

      <footer style={{ position: "sticky", bottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", border: "1px solid #dbeafe", borderRadius: "16px", background: "rgba(255,255,255,.96)", boxShadow: "0 12px 30px rgba(15,23,42,.12)" }}>
        <strong>
          {submitted
            ? `Result: ${displayedCorrect} / ${questions.length} correct · Completed`
            : answered < questions.length
              ? `Answer all questions to submit (${answered}/${questions.length})`
              : `${answered} of ${questions.length} answers completed`}
        </strong>
        {!submitted ? (
          <button
            type="button"
            disabled={!questions.length || answered !== questions.length}
            onClick={submitAnswers}
            style={{ padding: "13px 28px", border: 0, borderRadius: "10px", background: answered === questions.length ? "#2563eb" : "#94a3b8", color: "#fff", fontWeight: 900, cursor: answered === questions.length ? "pointer" : "not-allowed" }}
          >
            Submit answers
          </button>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button
              type="button"
              onClick={retryTest}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", minHeight: "44px", padding: "0 20px", border: "1px solid #2563eb", borderRadius: "12px", color: "#fff", background: "linear-gradient(135deg, #2563eb, #0891b2)", boxShadow: "0 10px 22px rgba(37,99,235,.22)", cursor: "pointer", font: "inherit", fontWeight: 900, transition: "transform 150ms, box-shadow 150ms" }}
              onMouseEnter={(event) => { event.currentTarget.style.transform = "translateY(-2px)"; event.currentTarget.style.boxShadow = "0 14px 28px rgba(37,99,235,.3)"; }}
              onMouseLeave={(event) => { event.currentTarget.style.transform = "translateY(0)"; event.currentTarget.style.boxShadow = "0 10px 22px rgba(37,99,235,.22)"; }}
            >
              <span aria-hidden="true" style={{ fontSize: "18px" }}>↻</span> Retry test
            </button>
            <button
              type="button"
              onClick={() => navigate("/user/tests")}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", minHeight: "44px", padding: "0 20px", border: "1px solid #bfdbfe", borderRadius: "12px", color: "#1d4ed8", background: "#eff6ff", boxShadow: "0 8px 18px rgba(37,99,235,.08)", cursor: "pointer", font: "inherit", fontWeight: 900, transition: "background 150ms, transform 150ms" }}
              onMouseEnter={(event) => { event.currentTarget.style.transform = "translateY(-2px)"; event.currentTarget.style.background = "#dbeafe"; }}
              onMouseLeave={(event) => { event.currentTarget.style.transform = "translateY(0)"; event.currentTarget.style.background = "#eff6ff"; }}
            >
              <span aria-hidden="true">←</span> Back to tests
            </button>
          </div>
        )}
      </footer>
    </section>
  );
}
