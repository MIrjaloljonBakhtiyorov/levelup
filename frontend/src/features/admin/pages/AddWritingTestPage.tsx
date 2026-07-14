import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getAdminToken } from "../../auth/services/adminSession";
import { createAdminTest } from "../services/adminTestsApi";
import type { ExamType, WritingTest } from "../types/adminTypes";
import AdminSectionTitle from "../components/AdminSectionTitle";

const LEVELS      = ["A1", "A2", "B1", "B2", "C1", "C2"];
const EXAM_LABELS: Record<string, string> = { cefr: "CEFR", ielts: "IELTS", toefl: "TOEFL", sat: "SAT" };

const inp: React.CSSProperties = { width: "100%", minHeight: "44px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0 14px", font: "inherit", fontSize: "var(--adm-fs-body)", background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" };
const ta:  React.CSSProperties = { ...inp, minHeight: "130px", padding: "10px 14px", resize: "vertical" } as React.CSSProperties;
const fs:  React.CSSProperties = { border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", margin: 0 };
const lg:  React.CSSProperties = { fontSize: "var(--adm-fs-sm)", fontWeight: 900, color: "#0f172a", padding: "0 8px" };
const lb:  React.CSSProperties = { fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155", display: "block", marginBottom: "6px" };
const er:  React.CSSProperties = { color: "#be123c", fontSize: "var(--adm-fs-tag)", fontWeight: 700, marginTop: "4px", display: "block" };

type TaskType = 1 | 2;

function ImagePicker({ value, onChange }: { value: string; onChange: (b: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  function load(file?: File) { if (!file) return; const r = new FileReader(); r.onload = (e) => onChange(e.target?.result as string); r.readAsDataURL(file); }
  return (
    <div>
      <p style={{ ...lb, marginBottom: "8px" }}>Image (optional) — for charts / graphs</p>
      <div
        onClick={() => ref.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
        role="button" tabIndex={0} aria-label="Upload image"
        style={{ cursor: "pointer", border: "2px dashed #93c5fd", borderRadius: "12px", background: value ? "transparent" : "#eff6ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", minHeight: "140px", overflow: "hidden", position: "relative" }}>
        {value ? (
          <>
            <img src={value} alt="Task chart" style={{ maxHeight: "130px", maxWidth: "100%", objectFit: "contain", borderRadius: "8px" }} />
            <span style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(15,23,42,0.6)", color: "#fff", fontSize: "var(--adm-fs-tag)", fontWeight: 800, padding: "3px 8px", borderRadius: "6px" }}>
              Change
            </span>
          </>
        ) : (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <span style={{ color: "#64748b", fontSize: "var(--adm-fs-sm)", fontWeight: 700 }}>Upload image (PNG, JPG)</span>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => load(e.target.files?.[0])} />
    </div>
  );
}

// ─── Task 1 Editor ────────────────────────────────────────────────
function Task1Editor({ s, set, errors }: {
  s: { taskPrompt: string; imageBase64: string; sampleAnswer: string; wordLimit: string };
  set: (v: typeof s) => void;
  errors: Record<string, string>;
}) {
  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div>
        <label style={lb}>Task prompt * <span style={{ color: "#94a3b8", fontWeight: 600 }}>(what the student must do)</span></label>
        <textarea
          style={{ ...ta, minHeight: "140px", borderColor: errors.t1prompt ? "#cf6d6d" : undefined }}
          rows={6}
          value={s.taskPrompt}
          placeholder="e.g. The chart below shows the percentage of households with internet access in five countries between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
          onChange={(e) => set({ ...s, taskPrompt: e.target.value })}
        />
        {errors.t1prompt && <span style={er}>{errors.t1prompt}</span>}
      </div>

      <ImagePicker value={s.imageBase64} onChange={(v) => set({ ...s, imageBase64: v })} />

      <div>
        <label style={lb}>Word limit *</label>
        <input
          style={{ ...inp, maxWidth: "280px", borderColor: errors.t1wordlimit ? "#cf6d6d" : undefined }}
          value={s.wordLimit}
          placeholder="e.g. Minimum 150 words"
          onChange={(e) => set({ ...s, wordLimit: e.target.value })}
        />
        {errors.t1wordlimit && <span style={er}>{errors.t1wordlimit}</span>}
      </div>

      <div>
        <label style={lb}>Sample answer <span style={{ color: "#94a3b8", fontWeight: 600 }}>(optional — for admin reference)</span></label>
        <textarea
          style={{ ...ta, minHeight: "180px" }}
          rows={9}
          value={s.sampleAnswer}
          placeholder="Write a model answer here for reference…"
          onChange={(e) => set({ ...s, sampleAnswer: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─── Task 2 Editor ────────────────────────────────────────────────
function Task2Editor({ s, set, errors }: {
  s: { taskPrompt: string; sampleAnswer: string; wordLimit: string };
  set: (v: typeof s) => void;
  errors: Record<string, string>;
}) {
  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div>
        <label style={lb}>Essay topic / prompt * <span style={{ color: "#94a3b8", fontWeight: 600 }}>(question the student must answer)</span></label>
        <textarea
          style={{ ...ta, minHeight: "160px", borderColor: errors.t2prompt ? "#cf6d6d" : undefined }}
          rows={7}
          value={s.taskPrompt}
          placeholder="e.g. Some people believe that technology has made our lives more complicated. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience."
          onChange={(e) => set({ ...s, taskPrompt: e.target.value })}
        />
        {errors.t2prompt && <span style={er}>{errors.t2prompt}</span>}
      </div>

      <div>
        <label style={lb}>Word limit *</label>
        <input
          style={{ ...inp, maxWidth: "280px", borderColor: errors.t2wordlimit ? "#cf6d6d" : undefined }}
          value={s.wordLimit}
          placeholder="e.g. Minimum 250 words"
          onChange={(e) => set({ ...s, wordLimit: e.target.value })}
        />
        {errors.t2wordlimit && <span style={er}>{errors.t2wordlimit}</span>}
      </div>

      <div>
        <label style={lb}>Sample answer <span style={{ color: "#94a3b8", fontWeight: 600 }}>(optional — for admin reference)</span></label>
        <textarea
          style={{ ...ta, minHeight: "200px" }}
          rows={10}
          value={s.sampleAnswer}
          placeholder="Write a model essay here for reference…"
          onChange={(e) => set({ ...s, sampleAnswer: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
function AddWritingTestPage() {
  const navigate = useNavigate();
  const { examType: etp = "cefr" } = useParams<{ examType: string }>();
  const backPath  = `/admin/tests/${etp}/writing`;
  const examLabel = EXAM_LABELS[etp.toLowerCase()] ?? etp.toUpperCase();

  const [testName, setTestName]       = useState("");
  const [level, setLevel]             = useState("");
  const [activeTask, setActiveTask]   = useState<TaskType>(1);
  const [task1, setTask1]             = useState({ taskPrompt: "", imageBase64: "", sampleAnswer: "", wordLimit: "" });
  const [task2, setTask2]             = useState({ taskPrompt: "", sampleAnswer: "", wordLimit: "" });
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [saving, setSaving]           = useState(false);
  const [done, setDone]               = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!testName.trim()) e.testName = "Enter test name";
    if (!level)           e.level    = "Select a level";

    if (activeTask === 1) {
      if (!task1.taskPrompt.trim()) e.t1prompt    = "Enter task prompt";
      if (!task1.wordLimit.trim())  e.t1wordlimit = "Enter word limit";
    } else {
      if (!task2.taskPrompt.trim()) e.t2prompt    = "Enter essay topic";
      if (!task2.wordLimit.trim())  e.t2wordlimit = "Enter word limit";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const token = getAdminToken();
      if (!token) {
        setErrors({ auth: "Admin token topilmadi. Qayta login qiling." });
        return;
      }
      const exam = examLabel as ExamType;
      const taskData = activeTask === 1
        ? { type: "task1" as const, taskPrompt: task1.taskPrompt, imageBase64: task1.imageBase64 || undefined, sampleAnswer: task1.sampleAnswer || undefined, wordLimit: task1.wordLimit }
        : { type: "task2" as const, taskPrompt: task2.taskPrompt, sampleAnswer: task2.sampleAnswer || undefined, wordLimit: task2.wordLimit };

      const newTest = {
        examType: exam,
        testName: testName.trim(),
        level,
        task: taskData,
      };
      await createAdminTest<WritingTest>(token, "writing", newTest);
      setDone(true);
      setTimeout(() => navigate(backPath), 1400);
    } finally { setSaving(false); }
  }

  function handleReset() {
    setTestName(""); setLevel(""); setActiveTask(1);
    setTask1({ taskPrompt: "", imageBase64: "", sampleAnswer: "", wordLimit: "" });
    setTask2({ taskPrompt: "", sampleAnswer: "", wordLimit: "" });
    setErrors({}); setDone(false);
  }

  const errKeys = Object.keys(errors).filter((k) => errors[k] !== "");

  return (
    <section className="admin-table-section admin-test-editor">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <AdminSectionTitle title={`New ${examLabel} Writing Test`} description="Fill in test info and task details." meta={examLabel} />
        <div style={{ padding: "18px 20px 0 0" }}>
          <button type="button" onClick={() => navigate(backPath)}
            style={{ minHeight: "42px", padding: "0 18px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-sm)", color: "#475569" }}>
            ← Back
          </button>
        </div>
      </div>

      {done && <div style={{ margin: "16px 20px 0", padding: "14px 18px", borderRadius: "10px", background: "#dcfce7", border: "1px solid #86efac", color: "#166534", fontSize: "var(--adm-fs-body)", fontWeight: 800 }}>✓ Test saved successfully! Redirecting…</div>}
      {!done && errKeys.length > 0 && <div style={{ margin: "16px 20px 0", padding: "12px 18px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fca5a5", color: "#be123c", fontSize: "var(--adm-fs-sm)", fontWeight: 800 }}>⚠ {errKeys.length} field(s) incomplete.</div>}

      <div style={{ padding: "24px 20px", display: "grid", gap: "28px" }}>

        {/* Test info */}
        <fieldset style={fs}><legend style={lg}>Test Information</legend>
          <div className="admin-form-grid" style={{ marginTop: "8px" }}>
            <div>
              <label style={lb}>Test name *</label>
              <input style={{ ...inp, borderColor: errors.testName ? "#cf6d6d" : undefined }} value={testName} placeholder="e.g. CEFR Writing B2 — Test #1" onChange={(e) => { setTestName(e.target.value); setErrors((p) => ({ ...p, testName: "" })); }} />
              {errors.testName && <span style={er}>{errors.testName}</span>}
            </div>
            <div>
              <label style={lb}>Level *</label>
              <select style={{ ...inp, cursor: "pointer", borderColor: errors.level ? "#e68181" : undefined }} value={level} onChange={(e) => { setLevel(e.target.value); setErrors((p) => ({ ...p, level: "" })); }}>
                <option value="">— Select level —</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.level && <span style={er}>{errors.level}</span>}
            </div>
          </div>
        </fieldset>

        {/* Task tabs */}
        <div>
          <p style={{ fontSize: "var(--adm-fs-sm)", fontWeight: 900, color: "#334155", marginBottom: "10px" }}>Select Task Type</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {([
              { t: 1 as TaskType, label: "Task 1", desc: "Graph / Chart / Table" },
              { t: 2 as TaskType, label: "Task 2", desc: "Essay / Opinion" },
            ]).map(({ t, label, desc }) => {
              const active = activeTask === t;
              return (
                <button key={t} type="button" onClick={() => setActiveTask(t)}
                  style={{ position: "relative", minHeight: "52px", padding: "0 24px", border: `2px solid ${active ? "#2563eb" : "#e2e8f0"}`, borderRadius: "10px", background: active ? "#2563eb" : "#f8fafc", color: active ? "#fff" : "#334155", fontWeight: 900, cursor: "pointer", transition: "all 150ms", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                  <span style={{ fontSize: "var(--adm-fs-body)" }}>{label}</span>
                  <span style={{ fontSize: "var(--adm-fs-tag)", opacity: 0.75, fontWeight: 600 }}>{desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editors */}
        {activeTask === 1 && (
          <fieldset style={fs}><legend style={lg}>Task 1 — Report / Description (chart / graph / table)</legend>
            <div style={{ marginTop: "8px" }}><Task1Editor s={task1} set={setTask1} errors={errors} /></div>
          </fieldset>
        )}
        {activeTask === 2 && (
          <fieldset style={fs}><legend style={lg}>Task 2 — Essay / Opinion / Discussion</legend>
            <div style={{ marginTop: "8px" }}><Task2Editor s={task2} set={setTask2} errors={errors} /></div>
          </fieldset>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
          <button type="button" onClick={handleReset}
            style={{ minHeight: "46px", padding: "0 24px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#d5e5f5", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-body)", color: "#475569" }}>Reset</button>
          <button type="button" onClick={() => navigate(backPath)}
            style={{ minHeight: "46px", padding: "0 24px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-body)", color: "#475569" }}>Cancel</button>
          <button type="button" onClick={handleSave} disabled={saving || done}
            style={{ minHeight: "46px", padding: "0 32px", border: "none", borderRadius: "10px", background: saving || done ? "#1168cc" : "#07215a", color: "#f3eaea", cursor: saving || done ? "not-allowed" : "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)", transition: "background 150ms" }}>
            {saving ? "Saving…" : done ? "Saved ✓" : "Save Test"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default AddWritingTestPage;
