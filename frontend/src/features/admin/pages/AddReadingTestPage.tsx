import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getAdminToken } from "../../auth/services/adminSession";
import { createAdminTest } from "../services/adminTestsApi";
import type { ExamType, ReadingPart2Question, ReadingPart3Question, ReadingPart4McqQuestion, ReadingPart4TfngQuestion, ReadingPart5GapQuestion, ReadingPart5McqQuestion, ReadingTest } from "../types/adminTypes";
import { createId } from "../utils/adminFormatters";
import AdminSectionTitle from "../components/AdminSectionTitle";

const LEVELS      = ["A1", "A2", "B1", "B2", "C1", "C2"];
const EXAM_LABELS: Record<string, string> = { cefr: "CEFR", ielts: "IELTS", toefl: "TOEFL", sat: "SAT" };
const OPT_KEYS    = ["A","B","C","D","E","F","G","H","I","J"] as const;
const OPT_KEYS_P3 = ["A","B","C","D","E","F","G","H"] as const;

// ─── Shared styles ────────────────────────────────────────────────
const inp: React.CSSProperties = { width: "100%", minHeight: "44px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0 14px", font: "inherit", fontSize: "var(--adm-fs-body)", background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" };
const ta:  React.CSSProperties = { ...inp, minHeight: "130px", padding: "10px 14px", resize: "vertical" } as React.CSSProperties;
const fs:  React.CSSProperties = { border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", margin: 0 };
const lg:  React.CSSProperties = { fontSize: "var(--adm-fs-sm)", fontWeight: 900, color: "#0f172a", padding: "0 8px" };
const lb:  React.CSSProperties = { fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155", display: "block", marginBottom: "6px" };
const er:  React.CSSProperties = { color: "#be123c", fontSize: "var(--adm-fs-tag)", fontWeight: 700, marginTop: "4px", display: "block" };

type PartNum = 1 | 2 | 3 | 4 | 5;

// ─── State types ──────────────────────────────────────────────────
type P1S = { title: string; passage: string; answers: string[] };
type P2S = { options: string[]; questions: ReadingPart2Question[] };
type P3S = { instruction: string; options: string[]; questions: ReadingPart3Question[] };
type P4S = {
  instruction: string;
  text1: string;
  text2: string;
  section1: ReadingPart4McqQuestion[];
  section2: ReadingPart4TfngQuestion[];
};

type P5S = {
  passage: string;
  instruction: string;
  section1: ReadingPart5GapQuestion[];
  section2: ReadingPart5McqQuestion[];
};

const mkP1 = (): P1S => ({
  title: "",
  passage: "",
  answers: Array.from({ length: 6 }, () => ""),
});

const mkP2 = (): P2S => ({
  options: Array.from({ length: 10 }, () => ""),
  questions: Array.from({ length: 8 }, () => ({ id: createId(), questionText: "", correctAnswer: "" })),
});

const mkP3 = (): P3S => ({
  instruction: "",
  options: Array.from({ length: 8 }, () => ""),
  questions: Array.from({ length: 6 }, () => ({ id: createId(), questionText: "", correctAnswer: "" })),
});

const mkP4 = (): P4S => ({
  instruction: "",
  text1: "",
  text2: "",
  section1: Array.from({ length: 4 }, () => ({ id: createId(), questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" as const })),
  section2: Array.from({ length: 5 }, () => ({ id: createId(), questionText: "", correctAnswer: "True" as const })),
});

const mkP5 = (): P5S => ({
  passage: "",
  instruction: "",
  section1: Array.from({ length: 4 }, () => ({ id: createId(), answer: "" })),
  section2: Array.from({ length: 2 }, () => ({ id: createId(), questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" as const })),
});

// ─── Part 1 Editor — Gap Fill ─────────────────────────────────────
function Part1Editor({ s, set, errors }: { s: P1S; set: (v: P1S) => void; errors: Record<string, string> }) {
  return (
    <div style={{ display: "grid", gap: "24px" }}>

      {/* Title */}
      <div>
        <label style={lb}>Exercise title / instruction *</label>
        <input
          style={{ ...inp, borderColor: errors.p1title ? "#cf6d6d" : undefined }}
          value={s.title}
          placeholder="e.g. Complete the passage. Use ONE word for each gap."
          onChange={(e) => set({ ...s, title: e.target.value })}
        />
        {errors.p1title && <span style={er}>{errors.p1title}</span>}
      </div>

      {/* Passage */}
      <div>
        <label style={lb}>
          Passage *{" "}
          <span style={{ color: "#94a3b8", fontWeight: 600 }}>
            (mark the 6 gaps with _____________)
          </span>
        </label>
        <textarea
          style={{ ...ta, minHeight: "200px", borderColor: errors.p1passage ? "#cf6d6d" : undefined }}
          rows={10}
          value={s.passage}
          placeholder={"The climate of a region is determined by _____________ factors such as altitude,\nlatitude, and proximity to _____________ bodies of water…"}
          onChange={(e) => set({ ...s, passage: e.target.value })}
        />
        {errors.p1passage && <span style={er}>{errors.p1passage}</span>}
        <small style={{ color: "#64748b", fontSize: "var(--adm-fs-tag)", marginTop: "6px", display: "block" }}>
          Tip: use <strong>_____________</strong> (underscores) to mark each blank in the text.
        </small>
      </div>

      {/* 6 answers */}
      <fieldset style={fs}>
        <legend style={lg}>Correct answers (6 words in order of appearance)</legend>
        <div className="admin-form-grid" style={{ marginTop: "12px" }}>
          {s.answers.map((ans, i) => (
            <div key={i}>
              <label style={lb}>Gap {i + 1} *</label>
              <input
                style={{ ...inp, borderColor: errors[`p1a${i}`] ? "#cf6d6d" : undefined }}
                value={ans}
                placeholder={`e.g. several`}
                onChange={(e) => {
                  const next = [...s.answers];
                  next[i] = e.target.value;
                  set({ ...s, answers: next });
                }}
              />
              {errors[`p1a${i}`] && <span style={er}>{errors[`p1a${i}`]}</span>}
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

// ─── Part 2 Editor — Matching (8 questions, 10 options A–J) ──────
function Part2Editor({ s, set, errors }: { s: P2S; set: (v: P2S) => void; errors: Record<string, string> }) {
  function upQ(i: number, p: Partial<ReadingPart2Question>) {
    set({ ...s, questions: s.questions.map((q, idx) => idx === i ? { ...q, ...p } : q) });
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>

      {/* 10 options */}
      <fieldset style={fs}>
        <legend style={lg}>Answer options (A – J) — 10 options</legend>
        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
          {OPT_KEYS.map((key, i) => (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "36px 1fr", alignItems: "center", gap: "12px" }}>
              <span style={{ fontWeight: 900, fontSize: "var(--adm-fs-body)", color: "#2563eb", textAlign: "center", background: "#dbeafe", borderRadius: "8px", padding: "6px 0" }}>
                {key}
              </span>
              <input
                style={{ ...inp, borderColor: errors[`p2opt${i}`] ? "#cf6d6d" : undefined }}
                value={s.options[i]}
                placeholder={`Option ${key} text…`}
                onChange={(e) => {
                  const next = [...s.options];
                  next[i] = e.target.value;
                  set({ ...s, options: next });
                }}
              />
            </div>
          ))}
        </div>
      </fieldset>

      {/* 8 questions */}
      <fieldset style={fs}>
        <legend style={lg}>Questions (8) — match each question to one option</legend>
        <div style={{ display: "grid", gap: "16px", marginTop: "12px" }}>
          {s.questions.map((q, i) => (
            <div key={q.id} style={{ display: "grid", gap: "8px" }}>
              <label style={lb}>Question {i + 1} *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "flex-start" }}>
                {/* Question text */}
                <div>
                  <textarea
                    style={{ ...ta, minHeight: "70px", borderColor: errors[`p2qt${i}`] ? "#cf6d6d" : undefined }}
                    rows={2}
                    value={q.questionText}
                    placeholder={`Question ${i + 1} text…`}
                    onChange={(e) => upQ(i, { questionText: e.target.value })}
                  />
                  {errors[`p2qt${i}`] && <span style={er}>{errors[`p2qt${i}`]}</span>}
                </div>

                {/* Correct answer dropdown */}
                <div style={{ minWidth: "90px" }}>
                  <label style={{ ...lb, whiteSpace: "nowrap" }}>Answer *</label>
                  <select
                    style={{ ...inp, minWidth: "90px", cursor: "pointer", borderColor: errors[`p2qa${i}`] ? "#cf6d6d" : undefined }}
                    value={q.correctAnswer}
                    onChange={(e) => upQ(i, { correctAnswer: e.target.value })}
                  >
                    <option value="">—</option>
                    {OPT_KEYS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  {errors[`p2qa${i}`] && <span style={er}>{errors[`p2qa${i}`]}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

// ─── Part 3 Editor — Matching (6 questions, 8 options A–H) ──────
function Part3Editor({ s, set, errors }: { s: P3S; set: (v: P3S) => void; errors: Record<string, string> }) {
  function upQ(i: number, p: Partial<ReadingPart3Question>) {
    set({ ...s, questions: s.questions.map((q, idx) => idx === i ? { ...q, ...p } : q) });
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>

      {/* Instruction */}
      <div>
        <label style={lb}>Instruction / condition text *</label>
        <textarea
          style={{ ...ta, minHeight: "90px", borderColor: errors.p3instr ? "#cf6d6d" : undefined }}
          rows={3}
          value={s.instruction}
          placeholder="e.g. Match each person (1–6) with the correct statement (A–H)."
          onChange={(e) => set({ ...s, instruction: e.target.value })}
        />
        {errors.p3instr && <span style={er}>{errors.p3instr}</span>}
      </div>

      {/* 8 options A–H */}
      <fieldset style={fs}>
        <legend style={lg}>Answer options (A – H) — 8 options</legend>
        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
          {OPT_KEYS_P3.map((key, i) => (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "36px 1fr", alignItems: "center", gap: "12px" }}>
              <span style={{ fontWeight: 900, fontSize: "var(--adm-fs-body)", color: "#7c3aed", textAlign: "center", background: "#ede9fe", borderRadius: "8px", padding: "6px 0" }}>
                {key}
              </span>
              <input
                style={{ ...inp, borderColor: errors[`p3opt${i}`] ? "#cf6d6d" : undefined }}
                value={s.options[i]}
                placeholder={`Option ${key} text…`}
                onChange={(e) => {
                  const next = [...s.options];
                  next[i] = e.target.value;
                  set({ ...s, options: next });
                }}
              />
              {errors[`p3opt${i}`] && <span style={er}>{errors[`p3opt${i}`]}</span>}
            </div>
          ))}
        </div>
      </fieldset>

      {/* 6 questions */}
      <fieldset style={fs}>
        <legend style={lg}>Questions (6) — match each question to one option</legend>
        <div style={{ display: "grid", gap: "16px", marginTop: "12px" }}>
          {s.questions.map((q, i) => (
            <div key={q.id} style={{ display: "grid", gap: "8px" }}>
              <label style={lb}>Question {i + 1} *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "flex-start" }}>
                <div>
                  <textarea
                    style={{ ...ta, minHeight: "70px", borderColor: errors[`p3qt${i}`] ? "#cf6d6d" : undefined }}
                    rows={2}
                    value={q.questionText}
                    placeholder={`Question ${i + 1} text…`}
                    onChange={(e) => upQ(i, { questionText: e.target.value })}
                  />
                  {errors[`p3qt${i}`] && <span style={er}>{errors[`p3qt${i}`]}</span>}
                </div>
                <div style={{ minWidth: "90px" }}>
                  <label style={{ ...lb, whiteSpace: "nowrap" }}>Answer *</label>
                  <select
                    style={{ ...inp, minWidth: "90px", cursor: "pointer", borderColor: errors[`p3qa${i}`] ? "#cf6d6d" : undefined }}
                    value={q.correctAnswer}
                    onChange={(e) => upQ(i, { correctAnswer: e.target.value })}
                  >
                    <option value="">—</option>
                    {OPT_KEYS_P3.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  {errors[`p3qa${i}`] && <span style={er}>{errors[`p3qa${i}`]}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

// ─── Part 4 Editor — 2 sections ──────────────────────────────────
function Part4Editor({ s, set, errors }: { s: P4S; set: (v: P4S) => void; errors: Record<string, string> }) {
  function upS1(i: number, p: Partial<ReadingPart4McqQuestion>) {
    set({ ...s, section1: s.section1.map((q, idx) => idx === i ? { ...q, ...p } : q) });
  }
  function upS2(i: number, p: Partial<ReadingPart4TfngQuestion>) {
    set({ ...s, section2: s.section2.map((q, idx) => idx === i ? { ...q, ...p } : q) });
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>

      {/* Instruction */}
      <div>
        <label style={lb}>General instruction *</label>
        <textarea
          style={{ ...ta, minHeight: "80px", borderColor: errors.p4instr ? "#cf6d6d" : undefined }}
          rows={3}
          value={s.instruction}
          placeholder="e.g. Read the two texts and answer the questions below."
          onChange={(e) => set({ ...s, instruction: e.target.value })}
        />
        {errors.p4instr && <span style={er}>{errors.p4instr}</span>}
      </div>

      {/* Two texts side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={lb}>Text 1 * <span style={{ color: "#94a3b8", fontWeight: 600 }}>(for Section 1 — MCQ)</span></label>
          <textarea
            style={{ ...ta, minHeight: "200px", borderColor: errors.p4text1 ? "#cf6d6d" : undefined }}
            rows={10}
            value={s.text1}
            placeholder="First reading passage…"
            onChange={(e) => set({ ...s, text1: e.target.value })}
          />
          {errors.p4text1 && <span style={er}>{errors.p4text1}</span>}
        </div>
        <div>
          <label style={lb}>Text 2 * <span style={{ color: "#94a3b8", fontWeight: 600 }}>(for Section 2 — True/False/Not Given)</span></label>
          <textarea
            style={{ ...ta, minHeight: "200px", borderColor: errors.p4text2 ? "#cf6d6d" : undefined }}
            rows={10}
            value={s.text2}
            placeholder="Second reading passage…"
            onChange={(e) => set({ ...s, text2: e.target.value })}
          />
          {errors.p4text2 && <span style={er}>{errors.p4text2}</span>}
        </div>
      </div>

      {/* Section 1 — MCQ */}
      <fieldset style={{ ...fs, borderColor: "#dbeafe" }}>
        <legend style={{ ...lg, color: "#1d4ed8" }}>Section 1 — Multiple Choice (4 questions, A/B/C/D)</legend>
        <div style={{ display: "grid", gap: "20px", marginTop: "12px" }}>
          {s.section1.map((q, i) => (
            <fieldset key={q.id} style={fs}>
              <legend style={lg}>Question {i + 1}</legend>
              <div style={{ display: "grid", gap: "12px", marginTop: "8px" }}>
                <div>
                  <label style={lb}>Question text *</label>
                  <input
                    style={{ ...inp, borderColor: errors[`p4s1qt${i}`] ? "#cf6d6d" : undefined }}
                    value={q.questionText}
                    placeholder="Question text…"
                    onChange={(e) => upS1(i, { questionText: e.target.value })}
                  />
                  {errors[`p4s1qt${i}`] && <span style={er}>{errors[`p4s1qt${i}`]}</span>}
                </div>
                <div className="admin-form-grid">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <div key={opt}>
                      <label style={lb}>Option {opt} *</label>
                      <input
                        style={{ ...inp, borderColor: errors[`p4s1q${i}o${opt}`] ? "#cf6d6d" : undefined }}
                        value={q[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"]}
                        placeholder={`Option ${opt}…`}
                        onChange={(e) => upS1(i, { [`option${opt}`]: e.target.value } as Partial<ReadingPart4McqQuestion>)}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={lb}>Correct answer *</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {(["A", "B", "C", "D"] as const).map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => upS1(i, { correctAnswer: opt })}
                        style={{ minWidth: "42px", minHeight: "38px", border: `2px solid ${q.correctAnswer === opt ? "#2563eb" : "#e2e8f0"}`, borderRadius: "8px", background: q.correctAnswer === opt ? "#2563eb" : "#f8fafc", color: q.correctAnswer === opt ? "#fff" : "#334155", fontWeight: 900, fontSize: "var(--adm-fs-sm)", cursor: "pointer", transition: "all 120ms" }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {errors[`p4s1qa${i}`] && <span style={er}>{errors[`p4s1qa${i}`]}</span>}
                </div>
              </div>
            </fieldset>
          ))}
        </div>
      </fieldset>

      {/* Section 2 — True/False/Not Given */}
      <fieldset style={{ ...fs, borderColor: "#dcfce7" }}>
        <legend style={{ ...lg, color: "#166534" }}>Section 2 — True / False / Not Given (5 questions)</legend>
        <div style={{ display: "grid", gap: "16px", marginTop: "12px" }}>
          {s.section2.map((q, i) => (
            <fieldset key={q.id} style={fs}>
              <legend style={lg}>Statement {i + 1}</legend>
              <div style={{ display: "grid", gap: "12px", marginTop: "8px" }}>
                <div>
                  <label style={lb}>Statement text *</label>
                  <input
                    style={{ ...inp, borderColor: errors[`p4s2qt${i}`] ? "#cf6d6d" : undefined }}
                    value={q.questionText}
                    placeholder="Statement text…"
                    onChange={(e) => upS2(i, { questionText: e.target.value })}
                  />
                  {errors[`p4s2qt${i}`] && <span style={er}>{errors[`p4s2qt${i}`]}</span>}
                </div>
                <div>
                  <label style={lb}>Correct answer *</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {(["True", "False", "Not Given"] as const).map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => upS2(i, { correctAnswer: opt })}
                        style={{ minHeight: "38px", padding: "0 14px", border: `2px solid ${q.correctAnswer === opt ? "#166534" : "#e2e8f0"}`, borderRadius: "8px", background: q.correctAnswer === opt ? "#166534" : "#f8fafc", color: q.correctAnswer === opt ? "#fff" : "#334155", fontWeight: 900, fontSize: "var(--adm-fs-sm)", cursor: "pointer", transition: "all 120ms" }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </fieldset>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

// ─── Part 5 Editor — passage + 2 sections ────────────────────────
function Part5Editor({ s, set, errors }: { s: P5S; set: (v: P5S) => void; errors: Record<string, string> }) {
  function upS2(i: number, p: Partial<ReadingPart5McqQuestion>) {
    set({ ...s, section2: s.section2.map((q, idx) => idx === i ? { ...q, ...p } : q) });
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>

      {/* Big passage */}
      <div>
        <label style={lb}>Reading passage * <span style={{ color: "#94a3b8", fontWeight: 600 }}>(shared for both sections)</span></label>
        <textarea
          style={{ ...ta, minHeight: "220px", borderColor: errors.p5passage ? "#cf6d6d" : undefined }}
          rows={11}
          value={s.passage}
          placeholder="Enter the main reading text here…"
          onChange={(e) => set({ ...s, passage: e.target.value })}
        />
        {errors.p5passage && <span style={er}>{errors.p5passage}</span>}
      </div>

      {/* Instruction */}
      <div>
        <label style={lb}>General instruction *</label>
        <textarea
          style={{ ...ta, minHeight: "80px", borderColor: errors.p5instr ? "#cf6d6d" : undefined }}
          rows={3}
          value={s.instruction}
          placeholder="e.g. Read the text and complete the tasks below."
          onChange={(e) => set({ ...s, instruction: e.target.value })}
        />
        {errors.p5instr && <span style={er}>{errors.p5instr}</span>}
      </div>

      {/* Section 1 — Gap fill (4 answers from text) */}
      <fieldset style={{ ...fs, borderColor: "#fef3c7" }}>
        <legend style={{ ...lg, color: "#b45309" }}>Section 1 — Words from the text (4 gaps)</legend>
        <p style={{ fontSize: "var(--adm-fs-tag)", color: "#92400e", margin: "8px 0 14px", fontWeight: 600 }}>
          Enter the correct word that should fill each gap. The answers come directly from the passage above.
        </p>
        <div className="admin-form-grid">
          {s.section1.map((q, i) => (
            <div key={q.id}>
              <label style={lb}>Gap {i + 1} — correct word *</label>
              <input
                style={{ ...inp, borderColor: errors[`p5s1a${i}`] ? "#cf6d6d" : undefined }}
                value={q.answer}
                placeholder="e.g. significant"
                onChange={(e) => set({ ...s, section1: s.section1.map((x, idx) => idx === i ? { ...x, answer: e.target.value } : x) })}
              />
              {errors[`p5s1a${i}`] && <span style={er}>{errors[`p5s1a${i}`]}</span>}
            </div>
          ))}
        </div>
      </fieldset>

      {/* Section 2 — MCQ (4 questions A/B/C/D) */}
      <fieldset style={{ ...fs, borderColor: "#dbeafe" }}>
        <legend style={{ ...lg, color: "#1d4ed8" }}>Section 2 — Multiple Choice (2 questions, A/B/C/D)</legend>
        <div style={{ display: "grid", gap: "20px", marginTop: "12px" }}>
          {s.section2.map((q, i) => (
            <fieldset key={q.id} style={fs}>
              <legend style={lg}>Question {i + 1}</legend>
              <div style={{ display: "grid", gap: "12px", marginTop: "8px" }}>
                <div>
                  <label style={lb}>Question text *</label>
                  <input
                    style={{ ...inp, borderColor: errors[`p5s2qt${i}`] ? "#cf6d6d" : undefined }}
                    value={q.questionText}
                    placeholder="Question text…"
                    onChange={(e) => upS2(i, { questionText: e.target.value })}
                  />
                  {errors[`p5s2qt${i}`] && <span style={er}>{errors[`p5s2qt${i}`]}</span>}
                </div>
                <div className="admin-form-grid">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <div key={opt}>
                      <label style={lb}>Option {opt} *</label>
                      <input
                        style={{ ...inp, borderColor: errors[`p5s2q${i}o${opt}`] ? "#cf6d6d" : undefined }}
                        value={q[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"]}
                        placeholder={`Option ${opt}…`}
                        onChange={(e) => upS2(i, { [`option${opt}`]: e.target.value } as Partial<ReadingPart5McqQuestion>)}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={lb}>Correct answer *</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {(["A", "B", "C", "D"] as const).map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => upS2(i, { correctAnswer: opt })}
                        style={{ minWidth: "42px", minHeight: "38px", border: `2px solid ${q.correctAnswer === opt ? "#2563eb" : "#e2e8f0"}`, borderRadius: "8px", background: q.correctAnswer === opt ? "#2563eb" : "#f8fafc", color: q.correctAnswer === opt ? "#fff" : "#334155", fontWeight: 900, fontSize: "var(--adm-fs-sm)", cursor: "pointer", transition: "all 120ms" }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </fieldset>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
function AddReadingTestPage() {
  const navigate = useNavigate();
  const { examType: etp = "cefr" } = useParams<{ examType: string }>();
  const backPath  = `/admin/tests/${etp}/reading`;
  const examLabel = EXAM_LABELS[etp.toLowerCase()] ?? etp.toUpperCase();

  const [testName, setTestName]     = useState("");
  const [level, setLevel]           = useState("");
  const [activePart, setActivePart] = useState<PartNum>(1);
  const [p1, setP1] = useState<P1S>(mkP1);
  const [p2, setP2] = useState<P2S>(mkP2);
  const [p3, setP3] = useState<P3S>(mkP3);
  const [p4, setP4] = useState<P4S>(mkP4);
  const [p5, setP5] = useState<P5S>(mkP5);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [saving, setSaving]         = useState(false);
  const [done, setDone]             = useState(false);

  const errKeys = Object.keys(errors).filter((v) => errors[v] !== "");
  function pErrCount(pn: PartNum) { return errKeys.filter((k) => k.startsWith(`p${pn}`)).length; }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!testName.trim()) e.testName = "Enter test name";
    if (!level)           e.level    = "Select a level";

    // Faqat aktiv partni tekshir
    if (activePart === 1) {
      if (!p1.title.trim())   e.p1title   = "Enter exercise title";
      if (!p1.passage.trim()) e.p1passage = "Enter the passage text";
      p1.answers.forEach((a, i) => { if (!a.trim()) e[`p1a${i}`] = `Gap ${i + 1} answer is required`; });
    }
    if (activePart === 2) {
      p2.options.forEach((o, i) => { if (!o.trim()) e[`p2opt${i}`] = `Option ${OPT_KEYS[i]} is required`; });
      p2.questions.forEach((q, i) => {
        if (!q.questionText.trim()) e[`p2qt${i}`] = `Question ${i + 1} text is required`;
        if (!q.correctAnswer)       e[`p2qa${i}`] = `Question ${i + 1} answer is required`;
      });
    }
    if (activePart === 3) {
      if (!p3.instruction.trim()) e.p3instr = "Enter instruction text";
      p3.options.forEach((o, i) => { if (!o.trim()) e[`p3opt${i}`] = `Option ${OPT_KEYS_P3[i]} is required`; });
      p3.questions.forEach((q, i) => {
        if (!q.questionText.trim()) e[`p3qt${i}`] = `Question ${i + 1} text is required`;
        if (!q.correctAnswer)       e[`p3qa${i}`] = `Question ${i + 1} answer is required`;
      });
    }
    if (activePart === 4) {
      if (!p4.instruction.trim()) e.p4instr = "Enter general instruction";
      if (!p4.text1.trim())       e.p4text1 = "Enter Text 1";
      if (!p4.text2.trim())       e.p4text2 = "Enter Text 2";
      p4.section1.forEach((q, i) => {
        if (!q.questionText.trim()) e[`p4s1qt${i}`] = `Section 1, Q${i + 1} text`;
        if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) e[`p4s1q${i}oA`] = `Section 1, Q${i + 1} options`;
      });
      p4.section2.forEach((q, i) => {
        if (!q.questionText.trim()) e[`p4s2qt${i}`] = `Section 2, S${i + 1} text`;
      });
    }
    if (activePart === 5) {
      if (!p5.passage.trim())     e.p5passage = "Enter the main passage";
      if (!p5.instruction.trim()) e.p5instr   = "Enter general instruction";
      p5.section1.forEach((q, i) => {
        if (!q.answer.trim()) e[`p5s1a${i}`] = `Section 1, Gap ${i + 1} answer`;
      });
      p5.section2.forEach((q, i) => {
        if (!q.questionText.trim()) e[`p5s2qt${i}`] = `Section 2, Q${i + 1} text`;
        if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) e[`p5s2q${i}oA`] = `Section 2, Q${i + 1} options`;
      });
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const exam = examLabel as ExamType;
      const partData = activePart === 1
        ? { type: "part1" as const, title: p1.title, passage: p1.passage, answers: p1.answers }
        : activePart === 2
        ? { type: "part2" as const, options: p2.options.map((text, i) => ({ key: OPT_KEYS[i], text })), questions: p2.questions }
        : activePart === 3
        ? { type: "part3" as const, instruction: p3.instruction, options: p3.options.map((text, i) => ({ key: OPT_KEYS_P3[i], text })), questions: p3.questions }
        : activePart === 4
        ? { type: "part4" as const, instruction: p4.instruction, text1: p4.text1, text2: p4.text2, section1: p4.section1, section2: p4.section2 }
        : { type: "part5" as const, passage: p5.passage, instruction: p5.instruction, section1: p5.section1, section2: p5.section2 };

      const token = getAdminToken();
      if (!token) {
        setErrors({ auth: "Admin token topilmadi. Qayta login qiling." });
        return;
      }
      const newTest = {
        examType: exam,
        testName: testName.trim(),
        level,
        part: partData,
      };
      await createAdminTest<ReadingTest>(token, "reading", newTest);
      setDone(true);
      setTimeout(() => navigate(backPath), 1400);
    } finally { setSaving(false); }
  }

  function handleReset() {
    setTestName(""); setLevel(""); setActivePart(1);
    setP1(mkP1()); setP2(mkP2()); setP3(mkP3()); setP4(mkP4()); setP5(mkP5());
    setErrors({}); setDone(false);
  }

  return (
    <section className="admin-table-section admin-test-editor">
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <AdminSectionTitle
          title={`New ${examLabel} Reading Test`}
          description="Fill in all parts then save."
          meta={examLabel}
        />
        <div style={{ padding: "18px 20px 0 0" }}>
          <button type="button" onClick={() => navigate(backPath)}
            style={{ minHeight: "42px", padding: "0 18px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-sm)", color: "#475569" }}>
            ← Back
          </button>
        </div>
      </div>

      {/* Alerts */}
      {done && (
        <div style={{ margin: "16px 20px 0", padding: "14px 18px", borderRadius: "10px", background: "#dcfce7", border: "1px solid #86efac", color: "#166534", fontSize: "var(--adm-fs-body)", fontWeight: 800 }}>
          ✓ Test saved successfully! Redirecting…
        </div>
      )}
      {!done && errKeys.length > 0 && (
        <div style={{ margin: "16px 20px 0", padding: "12px 18px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fca5a5", color: "#be123c", fontSize: "var(--adm-fs-sm)", fontWeight: 800 }}>
          ⚠ {errKeys.length} field(s) incomplete.
        </div>
      )}

      <div style={{ padding: "24px 20px", display: "grid", gap: "28px" }}>

        {/* Test info */}
        <fieldset style={fs}>
          <legend style={lg}>Test Information</legend>
          <div className="admin-form-grid" style={{ marginTop: "8px" }}>
            <div>
              <label style={lb}>Test name *</label>
              <input
                style={{ ...inp, borderColor: errors.testName ? "#cf6d6d" : undefined }}
                value={testName}
                placeholder="e.g. CEFR Reading B1 — Test #1"
                onChange={(e) => { setTestName(e.target.value); setErrors((p) => ({ ...p, testName: "" })); }}
              />
              {errors.testName && <span style={er}>{errors.testName}</span>}
            </div>
            <div>
              <label style={lb}>Level *</label>
              <select
                style={{ ...inp, cursor: "pointer", borderColor: errors.level ? "#e68181" : undefined }}
                value={level}
                onChange={(e) => { setLevel(e.target.value); setErrors((p) => ({ ...p, level: "" })); }}
              >
                <option value="">— Select level —</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.level && <span style={er}>{errors.level}</span>}
            </div>
          </div>
        </fieldset>

        {/* Part tabs */}
        <div>
          <p style={{ fontSize: "var(--adm-fs-sm)", fontWeight: 900, color: "#334155", marginBottom: "10px" }}>Select Part</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {([
              { pn: 1 as PartNum, label: "Part 1", desc: "Gap Fill · 6 blanks" },
              { pn: 2 as PartNum, label: "Part 2", desc: "Matching · 8Q / 10 options" },
              { pn: 3 as PartNum, label: "Part 3", desc: "Matching · 6Q / 8 options" },
              { pn: 4 as PartNum, label: "Part 4", desc: "MCQ + True/False/NG" },
              { pn: 5 as PartNum, label: "Part 5", desc: "Gap Fill (4) + MCQ (2)" },
            ]).map(({ pn, label, desc }) => {
              const ec = pErrCount(pn);
              const active = activePart === pn;
              return (
                <button key={pn} type="button" onClick={() => setActivePart(pn)} style={{
                  position: "relative",
                  minHeight: "52px", padding: "0 24px",
                  border: `2px solid ${active ? "#2563eb" : ec > 0 ? "#fca5a5" : "#e2e8f0"}`,
                  borderRadius: "10px",
                  background: active ? "#2563eb" : ec > 0 ? "#fef2f2" : "#f8fafc",
                  color: active ? "#fff" : ec > 0 ? "#be123c" : "#334155",
                  fontWeight: 900, cursor: "pointer", transition: "all 150ms",
                  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px",
                }}>
                  <span style={{ fontSize: "var(--adm-fs-body)" }}>{label}</span>
                  <span style={{ fontSize: "var(--adm-fs-tag)", opacity: 0.75, fontWeight: 600 }}>{desc}</span>
                  {ec > 0 && (
                    <span style={{ position: "absolute", top: "-8px", right: "-8px", minWidth: "20px", height: "20px", padding: "0 5px", borderRadius: "999px", background: "#be123c", color: "#fff", fontSize: "11px", fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {ec}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editors */}
        {activePart === 1 && (
          <fieldset style={fs}>
            <legend style={lg}>Part 1 — Gap Fill (passage with 6 blanks)</legend>
            <div style={{ marginTop: "8px" }}>
              <Part1Editor s={p1} set={setP1} errors={errors} />
            </div>
          </fieldset>
        )}
        {activePart === 2 && (
          <fieldset style={fs}>
            <legend style={lg}>Part 2 — Matching (8 questions → 10 options A–J)</legend>
            <div style={{ marginTop: "8px" }}>
              <Part2Editor s={p2} set={setP2} errors={errors} />
            </div>
          </fieldset>
        )}
        {activePart === 3 && (
          <fieldset style={fs}>
            <legend style={lg}>Part 3 — Matching (6 questions → 8 options A–H)</legend>
            <div style={{ marginTop: "8px" }}>
              <Part3Editor s={p3} set={setP3} errors={errors} />
            </div>
          </fieldset>
        )}
        {activePart === 4 && (
          <fieldset style={fs}>
            <legend style={lg}>Part 4 — 2 texts: MCQ (4Q) + True/False/Not Given (5Q)</legend>
            <div style={{ marginTop: "8px" }}>
              <Part4Editor s={p4} set={setP4} errors={errors} />
            </div>
          </fieldset>
        )}
        {activePart === 5 && (
          <fieldset style={fs}>
            <legend style={lg}>Part 5 — 1 passage: Gap Fill (4Q) + MCQ (4Q)</legend>
            <div style={{ marginTop: "8px" }}>
              <Part5Editor s={p5} set={setP5} errors={errors} />
            </div>
          </fieldset>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
          <button type="button" onClick={handleReset}
            style={{ minHeight: "46px", padding: "0 24px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#d5e5f5", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-body)", color: "#475569" }}>
            Reset
          </button>
          <button type="button" onClick={() => navigate(backPath)}
            style={{ minHeight: "46px", padding: "0 24px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-body)", color: "#475569" }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving || done}
            style={{ minHeight: "46px", padding: "0 32px", border: "none", borderRadius: "10px", background: saving || done ? "#1168cc" : "#07215a", color: "#f3eaea", cursor: saving || done ? "not-allowed" : "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)", transition: "background 150ms" }}>
            {saving ? "Saving…" : done ? "Saved ✓" : "Save Test"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default AddReadingTestPage;
