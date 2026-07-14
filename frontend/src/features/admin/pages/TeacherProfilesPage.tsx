import { useRef, useState } from "react";

import {
  loadTeacherProfiles,
  saveTeacherProfiles,
  deleteTeacherProfile,
} from "../services/adminTeacherProfileStorage";
import type { AdminTeacherProfile, TeacherCourseType } from "../types/adminTypes";
import { createId, formatDate } from "../utils/adminFormatters";
import AdminSectionTitle from "../components/AdminSectionTitle";

const COURSE_OPTIONS: TeacherCourseType[] = ["IELTS", "CEFR", "TOEFL", "SAT", "General English"];

const COURSE_COLORS: Record<TeacherCourseType, { bg: string; color: string }> = {
  "IELTS":           { bg: "#dbeafe", color: "#1d4ed8" },
  "CEFR":            { bg: "#fef3c7", color: "#b45309" },
  "TOEFL":           { bg: "#dcfce7", color: "#166534" },
  "SAT":             { bg: "#ede9fe", color: "#7c3aed" },
  "General English": { bg: "#fce7f3", color: "#be185d" },
};

const inp: React.CSSProperties = { width: "100%", minHeight: "44px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0 14px", font: "inherit", fontSize: "var(--adm-fs-body)", background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" };
const ta:  React.CSSProperties = { ...inp, minHeight: "90px", padding: "10px 14px", resize: "vertical" } as React.CSSProperties;
const lb:  React.CSSProperties = { fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155", display: "block", marginBottom: "6px" };
const er:  React.CSSProperties = { color: "#be123c", fontSize: "var(--adm-fs-tag)", fontWeight: 700, marginTop: "4px", display: "block" };

// ─── Photo Picker ─────────────────────────────────────────────────
function PhotoPicker({ value, onChange }: { value: string; onChange: (b: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  function load(file?: File) {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => onChange(e.target?.result as string);
    r.readAsDataURL(file);
  }
  return (
    <div>
      <label style={lb}>Photo *</label>
      <div onClick={() => ref.current?.click()} onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
        role="button" tabIndex={0}
        style={{ cursor: "pointer", border: "2px dashed #93c5fd", borderRadius: "12px", background: value ? "transparent" : "#eff6ff", display: "flex", alignItems: "center", gap: "16px", padding: "14px 18px", overflow: "hidden" }}>
        {value ? (
          <img src={value} alt="Teacher" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
        )}
        <div>
          <span style={{ color: value ? "#1d4ed8" : "#64748b", fontWeight: 800, fontSize: "var(--adm-fs-sm)", display: "block" }}>
            {value ? "Change photo" : "Upload teacher photo"}
          </span>
          <span style={{ color: "#94a3b8", fontSize: "var(--adm-fs-tag)" }}>PNG, JPG — square recommended</span>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => load(e.target.files?.[0])} />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────
function TeacherModal({ initial, onSave, onClose }: { initial?: AdminTeacherProfile; onSave: (t: AdminTeacherProfile) => void; onClose: () => void }) {
  const [firstName,  setFirstName]  = useState(initial?.firstName  ?? "");
  const [lastName,   setLastName]   = useState(initial?.lastName   ?? "");
  const [photoUrl,   setPhotoUrl]   = useState(initial?.photoUrl   ?? "");
  const [courses,    setCourses]    = useState<TeacherCourseType[]>(initial?.courses ?? []);
  const [experience, setExperience] = useState(String(initial?.experience ?? ""));
  const [about,      setAbout]      = useState(initial?.about      ?? "");
  const [status,     setStatus]     = useState<"active" | "inactive">(initial?.status ?? "active");
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  function toggleCourse(c: TeacherCourseType) {
    setCourses((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!firstName.trim())  e.firstName  = "Enter first name";
    if (!lastName.trim())   e.lastName   = "Enter last name";
    if (!photoUrl)          e.photo      = "Upload a photo";
    if (courses.length === 0) e.courses  = "Select at least one course";
    if (!experience || isNaN(Number(experience)) || Number(experience) < 0)
      e.experience = "Enter valid experience (years)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      id:         initial?.id ?? createId(),
      firstName:  firstName.trim(),
      lastName:   lastName.trim(),
      photoUrl,
      courses,
      experience: Number(experience),
      about:      about.trim(),
      status,
      createdAt:  initial?.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    <div className="admin-profile-modal" role="dialog" aria-modal="true">
      <article className="admin-profile-modal__card" style={{ maxWidth: "560px", width: "100%" }}>
        <div className="admin-profile-modal__header">
          <strong style={{ fontSize: "var(--adm-fs-sub)" }}>
            {initial ? "Edit Teacher Profile" : "Add Teacher Profile"}
          </strong>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b" }}>✕</button>
        </div>

        <div style={{ display: "grid", gap: "18px", padding: "20px 0 4px" }}>

          {/* Photo */}
          <div>
            <PhotoPicker value={photoUrl} onChange={setPhotoUrl} />
            {errors.photo && <span style={er}>{errors.photo}</span>}
          </div>

          {/* Name */}
          <div className="admin-form-grid">
            <div>
              <label style={lb}>First name *</label>
              <input style={{ ...inp, borderColor: errors.firstName ? "#cf6d6d" : undefined }}
                value={firstName} placeholder="e.g. Aziza"
                onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: "" })); }} />
              {errors.firstName && <span style={er}>{errors.firstName}</span>}
            </div>
            <div>
              <label style={lb}>Last name *</label>
              <input style={{ ...inp, borderColor: errors.lastName ? "#cf6d6d" : undefined }}
                value={lastName} placeholder="e.g. Karimova"
                onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: "" })); }} />
              {errors.lastName && <span style={er}>{errors.lastName}</span>}
            </div>
          </div>

          {/* Courses */}
          <div>
            <label style={lb}>Courses * <span style={{ color: "#94a3b8", fontWeight: 600 }}>(select all that apply)</span></label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {COURSE_OPTIONS.map((c) => {
                const active = courses.includes(c);
                const cfg    = COURSE_COLORS[c];
                return (
                  <button key={c} type="button" onClick={() => toggleCourse(c)}
                    style={{ minHeight: "34px", padding: "0 14px", border: `2px solid ${active ? cfg.color : "#e2e8f0"}`, borderRadius: "8px", background: active ? cfg.bg : "#f8fafc", color: active ? cfg.color : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-sm)", cursor: "pointer", transition: "all 120ms" }}>
                    {c}
                  </button>
                );
              })}
            </div>
            {errors.courses && <span style={er}>{errors.courses}</span>}
          </div>

          {/* Experience */}
          <div style={{ maxWidth: "200px" }}>
            <label style={lb}>Experience (years) *</label>
            <input style={{ ...inp, borderColor: errors.experience ? "#cf6d6d" : undefined }}
              type="number" min="0" max="50" value={experience} placeholder="e.g. 5"
              onChange={(e) => { setExperience(e.target.value); setErrors((p) => ({ ...p, experience: "" })); }} />
            {errors.experience && <span style={er}>{errors.experience}</span>}
          </div>

          {/* About */}
          <div>
            <label style={lb}>About <span style={{ color: "#94a3b8", fontWeight: 600 }}>(optional)</span></label>
            <textarea style={ta} rows={3} value={about}
              placeholder="Brief bio — teaching style, achievements, etc."
              onChange={(e) => setAbout(e.target.value)} />
          </div>

          {/* Status */}
          <div>
            <label style={lb}>Status *</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["active", "inactive"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  style={{ minHeight: "36px", padding: "0 18px", border: `2px solid ${status === s ? (s === "active" ? "#166534" : "#991b1b") : "#e2e8f0"}`, borderRadius: "8px", background: status === s ? (s === "active" ? "#dcfce7" : "#fee2e2") : "#f8fafc", color: status === s ? (s === "active" ? "#166534" : "#991b1b") : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-sm)", cursor: "pointer", transition: "all 120ms" }}>
                  {s === "active" ? "Active" : "Inactive"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "16px", borderTop: "1px solid #f1f5f9", marginTop: "4px" }}>
          <button type="button" onClick={onClose}
            style={{ minHeight: "42px", padding: "0 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-body)", color: "#475569" }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave}
            style={{ minHeight: "42px", padding: "0 24px", border: "none", borderRadius: "8px", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)" }}>
            {initial ? "Save Changes" : "Add Teacher"}
          </button>
        </div>
      </article>
    </div>
  );
}

// ─── Teacher Card ─────────────────────────────────────────────────
function TeacherCard({ teacher, onEdit, onDelete }: { teacher: AdminTeacherProfile; onEdit: () => void; onDelete: () => void }) {
  const isActive = teacher.status === "active";
  return (
    <article style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>

      {/* Top — photo + name */}
      <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: "16px" }}>
        {teacher.photoUrl ? (
          <img src={teacher.photoUrl} alt={teacher.firstName} style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "3px solid #e2e8f0" }} />
        ) : (
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "24px", fontWeight: 900, color: "#1d4ed8" }}>
            {teacher.firstName[0]}{teacher.lastName[0]}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: "var(--adm-fs-sub)", fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
            {teacher.firstName} {teacher.lastName}
          </h3>
          <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "var(--adm-fs-tag)", fontWeight: 900, background: isActive ? "#dcfce7" : "#fee2e2", color: isActive ? "#166534" : "#991b1b" }}>
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "var(--adm-fs-sm)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
        <span><strong style={{ color: "#0f172a" }}>{teacher.experience}</strong> {teacher.experience === 1 ? "year" : "years"} of experience</span>
      </div>

      {/* Courses */}
      <div style={{ padding: "0 20px 14px" }}>
        <p style={{ margin: "0 0 8px", fontSize: "var(--adm-fs-tag)", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Courses</p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {teacher.courses.map((c) => {
            const cfg = COURSE_COLORS[c];
            return (
              <span key={c} style={{ padding: "3px 10px", borderRadius: "999px", background: cfg.bg, color: cfg.color, fontSize: "var(--adm-fs-tag)", fontWeight: 800 }}>{c}</span>
            );
          })}
        </div>
      </div>

      {/* About */}
      {teacher.about && (
        <div style={{ padding: "0 20px 14px" }}>
          <p style={{ margin: 0, fontSize: "var(--adm-fs-sm)", color: "#64748b", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {teacher.about}
          </p>
        </div>
      )}

      {/* Date */}
      <div style={{ padding: "0 20px 4px", color: "#94a3b8", fontSize: "var(--adm-fs-tag)" }}>
        Added: {formatDate(teacher.createdAt)}
      </div>

      {/* Actions */}
      <div style={{ padding: "12px 20px 16px", display: "flex", gap: "8px", marginTop: "auto" }}>
        <button type="button" onClick={onEdit}
          style={{ flex: 1, minHeight: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-sm)", color: "#334155" }}>
          Edit
        </button>
        <button type="button" onClick={onDelete}
          style={{ minWidth: "36px", minHeight: "36px", border: "1px solid #fca5a5", borderRadius: "8px", background: "#fef2f2", cursor: "pointer", color: "#be123c", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </article>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────
function DeleteConfirm({ teacher, onConfirm, onCancel }: { teacher: AdminTeacherProfile; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="admin-profile-modal" role="dialog" aria-modal="true">
      <article className="admin-profile-modal__card" style={{ maxWidth: "420px" }}>
        <div className="admin-profile-modal__header">
          <strong style={{ fontSize: "var(--adm-fs-sub)", color: "#be123c" }}>Delete Teacher</strong>
          <button type="button" onClick={onCancel} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b" }}>✕</button>
        </div>
        <p style={{ margin: "18px 0 24px", color: "#334155", fontSize: "var(--adm-fs-body)", lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>{teacher.firstName} {teacher.lastName}</strong>'s profile? This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} style={{ minHeight: "42px", padding: "0 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-body)" }}>Cancel</button>
          <button type="button" onClick={onConfirm} style={{ minHeight: "42px", padding: "0 20px", border: "none", borderRadius: "8px", background: "#be123c", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)" }}>Delete</button>
        </div>
      </article>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
function TeacherProfilesPage() {
  const [teachers,     setTeachers]     = useState<AdminTeacherProfile[]>(loadTeacherProfiles);
  const [showAdd,      setShowAdd]      = useState(false);
  const [editing,      setEditing]      = useState<AdminTeacherProfile | null>(null);
  const [deleting,     setDeleting]     = useState<AdminTeacherProfile | null>(null);
  const [search,       setSearch]       = useState("");
  const [courseFilter, setCourseFilter] = useState<TeacherCourseType | "">("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "">("");

  const inp2: React.CSSProperties = { width: "100%", minHeight: "44px", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0 14px", font: "inherit", fontSize: "var(--adm-fs-body)", background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" };

  const filtered = teachers.filter((t) => {
    const name = `${t.firstName} ${t.lastName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchCourse = !courseFilter || t.courses.includes(courseFilter);
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchCourse && matchStatus;
  });

  function handleSave(teacher: AdminTeacherProfile) {
    const updated = editing
      ? teachers.map((t) => t.id === teacher.id ? teacher : t)
      : [teacher, ...teachers];
    saveTeacherProfiles(updated);
    setTeachers(updated);
    setShowAdd(false);
    setEditing(null);
  }

  function handleDelete(teacher: AdminTeacherProfile) {
    deleteTeacherProfile(teacher.id);
    setTeachers(loadTeacherProfiles());
    setDeleting(null);
  }

  return (
    <>
      <section className="admin-table-section">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <AdminSectionTitle
            title="Teacher Profiles"
            description="Manage all teacher profiles on the platform."
            meta={`${teachers.length} teachers`}
          />
          <div style={{ padding: "18px 20px 0 0" }}>
            <button type="button" onClick={() => setShowAdd(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "44px", padding: "0 22px", border: "none", borderRadius: "10px", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)", transition: "background 150ms, transform 150ms" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Add Teacher
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: "0 20px 16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <input style={{ ...inp2, maxWidth: "240px", minHeight: "38px" }} value={search} placeholder="Search by name…" onChange={(e) => setSearch(e.target.value)} />

          {/* Course filter */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button type="button" onClick={() => setCourseFilter("")} style={{ minHeight: "34px", padding: "0 12px", border: `1px solid ${courseFilter === "" ? "#2563eb" : "#e2e8f0"}`, borderRadius: "8px", background: courseFilter === "" ? "#dbeafe" : "#f8fafc", color: courseFilter === "" ? "#1d4ed8" : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-tag)", cursor: "pointer" }}>All courses</button>
            {COURSE_OPTIONS.map((c) => {
              const cfg = COURSE_COLORS[c];
              return (
                <button key={c} type="button" onClick={() => setCourseFilter(c === courseFilter ? "" : c)} style={{ minHeight: "34px", padding: "0 12px", border: `1px solid ${courseFilter === c ? cfg.color : "#e2e8f0"}`, borderRadius: "8px", background: courseFilter === c ? cfg.bg : "#f8fafc", color: courseFilter === c ? cfg.color : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-tag)", cursor: "pointer" }}>{c}</button>
              );
            })}
          </div>

          {/* Status filter */}
          <div style={{ display: "flex", gap: "6px" }}>
            {(["active", "inactive"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatusFilter(s === statusFilter ? "" : s)}
                style={{ minHeight: "34px", padding: "0 12px", border: `1px solid ${statusFilter === s ? (s === "active" ? "#166534" : "#991b1b") : "#e2e8f0"}`, borderRadius: "8px", background: statusFilter === s ? (s === "active" ? "#dcfce7" : "#fee2e2") : "#f8fafc", color: statusFilter === s ? (s === "active" ? "#166534" : "#991b1b") : "#475569", fontWeight: 800, fontSize: "var(--adm-fs-tag)", cursor: "pointer" }}>
                {s === "active" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div style={{ padding: "0 20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {filtered.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} onEdit={() => setEditing(teacher)} onDelete={() => setDeleting(teacher)} />
            ))}
          </div>
        ) : (
          <div className="admin-dashboard-empty" style={{ margin: "0 20px 24px" }}>
            <strong>{search || courseFilter || statusFilter ? "No teachers match your filter" : "No teacher profiles yet"}</strong>
            <span>
              {!(search || courseFilter || statusFilter) && (
                <button type="button" onClick={() => setShowAdd(true)} style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 900, fontSize: "inherit" }}>Add the first teacher</button>
              )}
            </span>
          </div>
        )}
      </section>

      {(showAdd || editing) && (
        <TeacherModal initial={editing ?? undefined} onSave={handleSave} onClose={() => { setShowAdd(false); setEditing(null); }} />
      )}
      {deleting && (
        <DeleteConfirm teacher={deleting} onConfirm={() => handleDelete(deleting)} onCancel={() => setDeleting(null)} />
      )}
    </>
  );
}

export default TeacherProfilesPage;
