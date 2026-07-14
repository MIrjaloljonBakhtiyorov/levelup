import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getAdminToken } from "../../auth/services/adminSession";
import { createAdminTest } from "../services/adminTestsApi";
import type { ExamType, SpeakingTest } from "../types/adminTypes";
import AdminSectionTitle from "../components/AdminSectionTitle";

const LEVELS      = ["A1","A2","B1","B2","C1","C2"];
const EXAM_LABELS: Record<string,string> = { cefr:"CEFR", ielts:"IELTS", toefl:"TOEFL", sat:"SAT" };

const inp: React.CSSProperties = { width:"100%", minHeight:"44px", border:"1px solid #e2e8f0", borderRadius:"10px", padding:"0 14px", font:"inherit", fontSize:"var(--adm-fs-body)", background:"#f8fafc", color:"#0f172a", outline:"none", boxSizing:"border-box" };
const ta:  React.CSSProperties = { ...inp, minHeight:"80px", padding:"10px 14px", resize:"vertical" } as React.CSSProperties;
const fs:  React.CSSProperties = { border:"1px solid #e2e8f0", borderRadius:"12px", padding:"18px 20px", margin:0 };
const lg:  React.CSSProperties = { fontSize:"var(--adm-fs-sm)", fontWeight:900, color:"#0f172a", padding:"0 8px" };
const lb:  React.CSSProperties = { fontSize:"var(--adm-fs-sm)", fontWeight:800, color:"#334155", display:"block", marginBottom:"6px" };
const er:  React.CSSProperties = { color:"#be123c", fontSize:"var(--adm-fs-tag)", fontWeight:700, marginTop:"4px", display:"block" };

type PartKey = "part1" | "part1_2" | "part2" | "part3";

// ─── Image Picker ─────────────────────────────────────────────────
function ImagePicker({ value, onChange }: { value: string; onChange: (b: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  function load(file?: File) { if (!file) return; const r = new FileReader(); r.onload = (e) => onChange(e.target?.result as string); r.readAsDataURL(file); }
  return (
    <div>
      <p style={{ ...lb, marginBottom: "8px" }}>Image *</p>
      <div onClick={() => ref.current?.click()} onKeyDown={(e) => e.key==="Enter" && ref.current?.click()} role="button" tabIndex={0} aria-label="Upload image"
        style={{ cursor:"pointer", border:"2px dashed #93c5fd", borderRadius:"12px", background: value ? "transparent" : "#eff6ff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"10px", minHeight:"160px", overflow:"hidden", position:"relative" }}>
        {value ? (
          <><img src={value} alt="speaking" style={{ maxHeight:"150px", maxWidth:"100%", objectFit:"contain", borderRadius:"8px" }} />
          <span style={{ position:"absolute", bottom:"8px", right:"8px", background:"rgba(15,23,42,0.6)", color:"#fff", fontSize:"var(--adm-fs-tag)", fontWeight:800, padding:"3px 8px", borderRadius:"6px" }}>Change</span></>
        ) : (
          <><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span style={{ color:"#64748b", fontSize:"var(--adm-fs-sm)", fontWeight:700 }}>Upload image (PNG, JPG)</span></>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => load(e.target.files?.[0])} />
    </div>
  );
}

// ─── State types ──────────────────────────────────────────────────
type P1S   = { questions: string[] };           // 3 ta
type P12S  = { imageBase64: string; questions: string[] }; // 2 ta
type P2S   = { questions: string[] };           // 3 ta
type P3S   = { tableTitle: string; tableHeaders: string[]; tableRows: string[][]; questions: string[] };

const mkP1   = (): P1S   => ({ questions: ["","",""] });
const mkP12  = (): P12S  => ({ imageBase64:"", questions: ["",""] });
const mkP2   = (): P2S   => ({ questions: ["","",""] });
const mkP3   = (): P3S   => ({
  tableTitle: "",
  tableHeaders: ["","",""],
  tableRows: [["","",""],["","",""],["","",""]],
  questions: ["",""],
});

// ─── Questions list editor ────────────────────────────────────────
function QList({ questions, onChange, min, max, label = "Question", errors, errPrefix }:{
  questions: string[]; onChange: (q: string[]) => void;
  min: number; max: number; label?: string;
  errors: Record<string,string>; errPrefix: string;
}) {
  function upQ(i: number, v: string) { const n = [...questions]; n[i] = v; onChange(n); }
  function addQ() { if (questions.length < max) onChange([...questions, ""]); }
  function remQ(i: number) { if (questions.length > min) onChange(questions.filter((_,idx) => idx !== i)); }
  return (
    <div style={{ display:"grid", gap:"10px" }}>
      {questions.map((q, i) => (
        <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"8px", alignItems:"flex-start" }}>
          <div>
            <label style={lb}>{label} {i+1} *</label>
            <textarea style={{ ...ta, minHeight:"66px", borderColor: errors[`${errPrefix}${i}`] ? "#cf6d6d" : undefined }}
              rows={2} value={q} placeholder={`${label} ${i+1}…`} onChange={(e) => upQ(i, e.target.value)} />
            {errors[`${errPrefix}${i}`] && <span style={er}>{errors[`${errPrefix}${i}`]}</span>}
          </div>
          {questions.length > min && (
            <button type="button" onClick={() => remQ(i)}
              style={{ marginTop:"26px", minWidth:"36px", minHeight:"36px", border:"1px solid #fca5a5", borderRadius:"8px", background:"#fef2f2", color:"#be123c", cursor:"pointer", fontWeight:900, fontSize:"16px" }}>✕</button>
          )}
        </div>
      ))}
      {questions.length < max && (
        <button type="button" onClick={addQ}
          style={{ display:"inline-flex", alignItems:"center", gap:"6px", minHeight:"38px", padding:"0 16px", border:"1px dashed #93c5fd", borderRadius:"8px", background:"#eff6ff", color:"#2563eb", cursor:"pointer", fontWeight:800, fontSize:"var(--adm-fs-sm)" }}>
          + Add question
        </button>
      )}
    </div>
  );
}

// ─── Part 3 Table Editor ──────────────────────────────────────────
function TableEditor({ s, set, errors }: { s: P3S; set: (v: P3S) => void; errors: Record<string,string> }) {
  const colCount = s.tableHeaders.length;

  function setHeader(i: number, v: string) {
    const h = [...s.tableHeaders]; h[i] = v; set({ ...s, tableHeaders: h });
  }
  function setCell(r: number, c: number, v: string) {
    const rows = s.tableRows.map((row) => [...row]);
    rows[r][c] = v; set({ ...s, tableRows: rows });
  }
  function addCol() {
    set({ ...s, tableHeaders: [...s.tableHeaders,""], tableRows: s.tableRows.map((r) => [...r,""]) });
  }
  function remCol() {
    if (colCount <= 1) return;
    set({ ...s, tableHeaders: s.tableHeaders.slice(0,-1), tableRows: s.tableRows.map((r) => r.slice(0,-1)) });
  }
  function addRow() {
    set({ ...s, tableRows: [...s.tableRows, Array(colCount).fill("")] });
  }
  function remRow() {
    if (s.tableRows.length <= 1) return;
    set({ ...s, tableRows: s.tableRows.slice(0,-1) });
  }

  return (
    <div style={{ display:"grid", gap:"20px" }}>
      {/* Table title */}
      <div>
        <label style={lb}>Table title *</label>
        <input style={{ ...inp, borderColor: errors.p3title ? "#cf6d6d" : undefined }} value={s.tableTitle} placeholder="e.g. Work Experience Survey Results" onChange={(e) => set({ ...s, tableTitle: e.target.value })} />
        {errors.p3title && <span style={er}>{errors.p3title}</span>}
      </div>

      {/* Table builder */}
      <fieldset style={fs}>
        <legend style={lg}>Table</legend>
        <div style={{ marginTop:"12px", overflowX:"auto" }}>
          <table style={{ borderCollapse:"collapse", width:"100%", minWidth:"400px" }}>
            <thead>
              <tr>
                {s.tableHeaders.map((h, i) => (
                  <th key={i} style={{ padding:"4px 6px", borderBottom:"2px solid #e2e8f0" }}>
                    <input style={{ ...inp, minHeight:"36px", fontSize:"var(--adm-fs-sm)", fontWeight:900, textAlign:"center" }} value={h} placeholder={`Column ${i+1}`} onChange={(e) => setHeader(i, e.target.value)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.tableRows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} style={{ padding:"4px 6px", borderBottom:"1px solid #f1f5f9" }}>
                      <input style={{ ...inp, minHeight:"36px", fontSize:"var(--adm-fs-sm)" }} value={cell} placeholder={`Row ${r+1}, Col ${c+1}`} onChange={(e) => setCell(r, c, e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Row/Col controls */}
        <div style={{ display:"flex", gap:"8px", marginTop:"12px", flexWrap:"wrap" }}>
          <button type="button" onClick={addRow} style={{ minHeight:"34px", padding:"0 14px", border:"1px dashed #93c5fd", borderRadius:"8px", background:"#eff6ff", color:"#2563eb", cursor:"pointer", fontWeight:800, fontSize:"var(--adm-fs-tag)" }}>+ Row</button>
          <button type="button" onClick={remRow} disabled={s.tableRows.length <= 1} style={{ minHeight:"34px", padding:"0 14px", border:"1px solid #fca5a5", borderRadius:"8px", background:"#fef2f2", color:"#be123c", cursor:"pointer", fontWeight:800, fontSize:"var(--adm-fs-tag)", opacity: s.tableRows.length <= 1 ? 0.4 : 1 }}>− Row</button>
          <button type="button" onClick={addCol} style={{ minHeight:"34px", padding:"0 14px", border:"1px dashed #93c5fd", borderRadius:"8px", background:"#eff6ff", color:"#2563eb", cursor:"pointer", fontWeight:800, fontSize:"var(--adm-fs-tag)" }}>+ Column</button>
          <button type="button" onClick={remCol} disabled={colCount <= 1} style={{ minHeight:"34px", padding:"0 14px", border:"1px solid #fca5a5", borderRadius:"8px", background:"#fef2f2", color:"#be123c", cursor:"pointer", fontWeight:800, fontSize:"var(--adm-fs-tag)", opacity: colCount <= 1 ? 0.4 : 1 }}>− Column</button>
        </div>
      </fieldset>

      {/* Questions */}
      <div>
        <p style={{ ...lb, marginBottom:"10px" }}>Questions about the table *</p>
        <QList questions={s.questions} onChange={(q) => set({ ...s, questions: q })} min={1} max={10} errors={errors} errPrefix="p3q" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
function AddSpeakingTestPage() {
  const navigate = useNavigate();
  const { examType: etp = "cefr" } = useParams<{ examType: string }>();
  const backPath  = `/admin/tests/${etp}/speaking`;
  const examLabel = EXAM_LABELS[etp.toLowerCase()] ?? etp.toUpperCase();

  const [testName, setTestName]       = useState("");
  const [level, setLevel]             = useState("");
  const [activePart, setActivePart]   = useState<PartKey>("part1");
  const [p1,  setP1]  = useState<P1S>(mkP1);
  const [p12, setP12] = useState<P12S>(mkP12);
  const [p2,  setP2]  = useState<P2S>(mkP2);
  const [p3,  setP3]  = useState<P3S>(mkP3);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);

  const errKeys = Object.keys(errors).filter((k) => errors[k] !== "");
  function pErrCount(pk: PartKey) { return errKeys.filter((k) => k.startsWith(pk === "part1_2" ? "p12" : pk === "part1" ? "p1q" : pk === "part2" ? "p2q" : "p3")).length; }

  function validate(): boolean {
    const e: Record<string,string> = {};
    if (!testName.trim()) e.testName = "Enter test name";
    if (!level)           e.level    = "Select a level";

    p1.questions.forEach((q,i)  => { if (!q.trim()) e[`p1q${i}`]  = `Part 1, Q${i+1} required`; });
    if (!p12.imageBase64)        e.p12img = "Part 1.2 image required";
    p12.questions.forEach((q,i) => { if (!q.trim()) e[`p12q${i}`] = `Part 1.2, Q${i+1} required`; });
    p2.questions.forEach((q,i)  => { if (!q.trim()) e[`p2q${i}`]  = `Part 2, Q${i+1} required`; });
    if (!p3.tableTitle.trim())   e.p3title = "Table title required";
    p3.tableHeaders.forEach((h,i) => { if (!h.trim()) e[`p3h${i}`] = `Column ${i+1} header required`; });
    p3.questions.forEach((q,i)  => { if (!q.trim()) e[`p3q${i}`]  = `Part 3, Q${i+1} required`; });

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
      const partMap = {
        part1:   { type: "part1"   as const, questions: p1.questions },
        part1_2: { type: "part1_2" as const, imageBase64: p12.imageBase64, questions: p12.questions },
        part2:   { type: "part2"   as const, questions: p2.questions },
        part3:   { type: "part3"   as const, tableTitle: p3.tableTitle, tableHeaders: p3.tableHeaders, tableRows: p3.tableRows, questions: p3.questions },
      };
      await createAdminTest<SpeakingTest>(token, "speaking", { examType: exam, testName: testName.trim(), level, part: partMap[activePart] });
      setDone(true);
      setTimeout(() => navigate(backPath), 1400);
    } finally { setSaving(false); }
  }

  function handleReset() {
    setTestName(""); setLevel(""); setActivePart("part1");
    setP1(mkP1()); setP12(mkP12()); setP2(mkP2()); setP3(mkP3());
    setErrors({}); setDone(false);
  }

  const PARTS: { key: PartKey; label: string; desc: string }[] = [
    { key: "part1",   label: "Part 1",   desc: "3 questions" },
    { key: "part1_2", label: "Part 1.2", desc: "Image + 2 questions" },
    { key: "part2",   label: "Part 2",   desc: "3 questions" },
    { key: "part3",   label: "Part 3",   desc: "Table + questions" },
  ];

  return (
    <section className="admin-table-section admin-test-editor">
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"16px", flexWrap:"wrap" }}>
        <AdminSectionTitle title={`New ${examLabel} Speaking Test`} description="Fill in all parts then save." meta={examLabel} />
        <div style={{ padding:"18px 20px 0 0" }}>
          <button type="button" onClick={() => navigate(backPath)} style={{ minHeight:"42px", padding:"0 18px", border:"1px solid #e2e8f0", borderRadius:"10px", background:"#f8fafc", cursor:"pointer", fontWeight:800, fontSize:"var(--adm-fs-sm)", color:"#475569" }}>← Back</button>
        </div>
      </div>

      {done && <div style={{ margin:"16px 20px 0", padding:"14px 18px", borderRadius:"10px", background:"#dcfce7", border:"1px solid #86efac", color:"#166534", fontSize:"var(--adm-fs-body)", fontWeight:800 }}>✓ Test saved! Redirecting…</div>}
      {!done && errKeys.length > 0 && <div style={{ margin:"16px 20px 0", padding:"12px 18px", borderRadius:"10px", background:"#fef2f2", border:"1px solid #fca5a5", color:"#be123c", fontSize:"var(--adm-fs-sm)", fontWeight:800 }}>⚠ {errKeys.length} field(s) incomplete.</div>}

      <div style={{ padding:"24px 20px", display:"grid", gap:"28px" }}>

        {/* Info */}
        <fieldset style={fs}><legend style={lg}>Test Information</legend>
          <div className="admin-form-grid" style={{ marginTop:"8px" }}>
            <div>
              <label style={lb}>Test name *</label>
              <input style={{ ...inp, borderColor: errors.testName ? "#cf6d6d" : undefined }} value={testName} placeholder="e.g. CEFR Speaking B1 — Test #1" onChange={(e) => { setTestName(e.target.value); setErrors((p) => ({ ...p, testName:"" })); }} />
              {errors.testName && <span style={er}>{errors.testName}</span>}
            </div>
            <div>
              <label style={lb}>Level *</label>
              <select style={{ ...inp, cursor:"pointer", borderColor: errors.level ? "#e68181" : undefined }} value={level} onChange={(e) => { setLevel(e.target.value); setErrors((p) => ({ ...p, level:"" })); }}>
                <option value="">— Select level —</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.level && <span style={er}>{errors.level}</span>}
            </div>
          </div>
        </fieldset>

        {/* Part tabs */}
        <div>
          <p style={{ fontSize:"var(--adm-fs-sm)", fontWeight:900, color:"#334155", marginBottom:"10px" }}>Select Part</p>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {PARTS.map(({ key, label, desc }) => {
              const ec = pErrCount(key); const active = activePart === key;
              return (
                <button key={key} type="button" onClick={() => setActivePart(key)} style={{ position:"relative", minHeight:"52px", padding:"0 24px", border:`2px solid ${active ? "#2563eb" : ec > 0 ? "#fca5a5" : "#e2e8f0"}`, borderRadius:"10px", background: active ? "#2563eb" : ec > 0 ? "#fef2f2" : "#f8fafc", color: active ? "#fff" : ec > 0 ? "#be123c" : "#334155", fontWeight:900, cursor:"pointer", transition:"all 150ms", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"2px" }}>
                  <span style={{ fontSize:"var(--adm-fs-body)" }}>{label}</span>
                  <span style={{ fontSize:"var(--adm-fs-tag)", opacity:0.75, fontWeight:600 }}>{desc}</span>
                  {ec > 0 && <span style={{ position:"absolute", top:"-8px", right:"-8px", minWidth:"20px", height:"20px", padding:"0 5px", borderRadius:"999px", background:"#be123c", color:"#fff", fontSize:"11px", fontWeight:900, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>{ec}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editors */}
        {activePart === "part1" && (
          <fieldset style={fs}><legend style={lg}>Part 1 — 3 questions</legend>
            <div style={{ marginTop:"12px" }}><QList questions={p1.questions} onChange={(q) => setP1({ questions: q })} min={3} max={3} errors={errors} errPrefix="p1q" /></div>
          </fieldset>
        )}
        {activePart === "part1_2" && (
          <fieldset style={fs}><legend style={lg}>Part 1.2 — Image + 2 questions</legend>
            <div style={{ display:"grid", gap:"20px", marginTop:"12px" }}>
              <ImagePicker value={p12.imageBase64} onChange={(v) => setP12({ ...p12, imageBase64: v })} />
              {errors.p12img && <span style={er}>{errors.p12img}</span>}
              <QList questions={p12.questions} onChange={(q) => setP12({ ...p12, questions: q })} min={2} max={2} errors={errors} errPrefix="p12q" />
            </div>
          </fieldset>
        )}
        {activePart === "part2" && (
          <fieldset style={fs}><legend style={lg}>Part 2 — 3 questions</legend>
            <div style={{ marginTop:"12px" }}><QList questions={p2.questions} onChange={(q) => setP2({ questions: q })} min={3} max={3} errors={errors} errPrefix="p2q" /></div>
          </fieldset>
        )}
        {activePart === "part3" && (
          <fieldset style={fs}><legend style={lg}>Part 3 — Table + questions</legend>
            <div style={{ marginTop:"12px" }}><TableEditor s={p3} set={setP3} errors={errors} /></div>
          </fieldset>
        )}

        {/* Actions */}
        <div style={{ display:"flex", gap:"12px", justifyContent:"flex-end", paddingTop:"8px", borderTop:"1px solid #e2e8f0" }}>
          <button type="button" onClick={handleReset} style={{ minHeight:"46px", padding:"0 24px", border:"1px solid #e2e8f0", borderRadius:"10px", background:"#d5e5f5", cursor:"pointer", fontWeight:800, fontSize:"var(--adm-fs-body)", color:"#475569" }}>Reset</button>
          <button type="button" onClick={() => navigate(backPath)} style={{ minHeight:"46px", padding:"0 24px", border:"1px solid #e2e8f0", borderRadius:"10px", background:"#f8fafc", cursor:"pointer", fontWeight:800, fontSize:"var(--adm-fs-body)", color:"#475569" }}>Cancel</button>
          <button type="button" onClick={handleSave} disabled={saving||done} style={{ minHeight:"46px", padding:"0 32px", border:"none", borderRadius:"10px", background: saving||done ? "#1168cc" : "#07215a", color:"#f3eaea", cursor: saving||done ? "not-allowed" : "pointer", fontWeight:900, fontSize:"var(--adm-fs-body)", transition:"background 150ms" }}>
            {saving ? "Saving…" : done ? "Saved ✓" : "Save Test"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default AddSpeakingTestPage;
