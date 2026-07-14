import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { isUnauthorizedError } from "../../../services/apiClient";
import { clearAdminToken, getAdminToken } from "../../auth/services/adminSession";
import {
  createAdminCourse,
  getAdminCourse,
  updateAdminCourse,
  type CoursePayload,
} from "../services/adminCoursesApi";
import type { AdminCourse, CourseCategory, CourseLevel, CourseLesson } from "../types/adminTypes";
import AdminSectionTitle from "../components/AdminSectionTitle";

// ─── Constants ────────────────────────────────────────────────────

type CourseType = Extract<CourseCategory, "Grammar" | "CEFR" | "IELTS" | "TOEFL" | "SAT">;

const COURSE_TYPES: Array<{ value: CourseType; title: string; description: string; color: string; bg: string }> = [
  { value: "Grammar", title: "Grammar", description: "Grammar rules, structures and accuracy lessons", color: "#be185d", bg: "#fce7f3" },
  { value: "CEFR", title: "CEFR", description: "CEFR level-based English lessons", color: "#b45309", bg: "#fef3c7" },
  { value: "IELTS", title: "IELTS", description: "IELTS preparation and skill lessons", color: "#1d4ed8", bg: "#dbeafe" },
  { value: "TOEFL", title: "TOEFL", description: "TOEFL iBT preparation lessons", color: "#065f46", bg: "#d1fae5" },
  { value: "SAT", title: "SAT", description: "SAT English preparation lessons", color: "#7c3aed", bg: "#ede9fe" },
];

const LEVELS: CourseLevel[] = [
  "Beginner", "Elementary", "Pre-Intermediate",
  "Intermediate", "Upper-Intermediate", "Advanced",
];

export type ExamType = CourseType | "General";
function ImagePicker({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (base64: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <p style={{ fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155", marginBottom: "8px" }}>
        {label}
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={label}
        style={{
          cursor: "pointer",
          border: "2px dashed #93c5fd",
          borderRadius: "12px",
          background: value ? "transparent" : "#eff6ff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          minHeight: "140px",
          overflow: "hidden",
          transition: "border-color 150ms",
          position: "relative",
        }}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              style={{ maxHeight: "130px", maxWidth: "100%", objectFit: "contain", borderRadius: "8px" }}
            />
            <span style={{
              position: "absolute", bottom: "8px", right: "8px",
              background: "rgba(15,23,42,0.6)", color: "#fff",
              fontSize: "var(--adm-fs-tag)", fontWeight: 800,
              padding: "3px 8px", borderRadius: "6px",
            }}>
              O'zgartirish
            </span>
          </>
        ) : (
          <>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span style={{ color: "#64748b", fontSize: "var(--adm-fs-sm)", fontWeight: 700 }}>
              {hint}
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

function Field({ label, error, children }: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: "6px" }}>
      <span style={{ fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155" }}>
        {label}
      </span>
      {children}
      {error && (
        <span style={{ color: "#be123c", fontSize: "var(--adm-fs-tag)", fontWeight: 700 }}>
          {error}
        </span>
      )}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", minHeight: "44px",
  border: "1px solid #e2e8f0", borderRadius: "10px",
  padding: "0 14px", font: "inherit",
  fontSize: "var(--adm-fs-body)", background: "#f8fafc",
  color: "#0f172a", outline: "none",
  transition: "border-color 150ms, box-shadow 150ms",
};

function normalizePrice(value: string) {
  return Number(value.replace(/\D/g, ""));
}

type FormState = {
  title: string;
  courseType: CourseType | "";
  categories: CourseCategory[];
  level: CourseLevel | "";
  price: string;
  isFree: boolean;
  isActive: boolean;
  mentorFirstName: string;
  mentorLastName: string;
  mentorTelegram: string;
  description: string;
  logoUrl: string;
  mentorPhotoUrl: string;
  lessons: CourseLesson[];
};

const EMPTY: FormState = {
  title: "", courseType: "", categories: [], level: "",
  price: "", isFree: false, isActive: true,
  mentorFirstName: "", mentorLastName: "", mentorTelegram: "",
  description: "", logoUrl: "", mentorPhotoUrl: "",
  lessons: [],
};

function getCourseTypeFromCategories(categories: CourseCategory[]): CourseType | "" {
  return COURSE_TYPES.find((type) => categories.includes(type.value))?.value ?? "";
}

function getCategoriesForCourseType(courseType: CourseType | ""): CourseCategory[] {
  return courseType ? [courseType] : [];
}

function getListPath(courseType: CourseType | "") {
  if (!courseType) return "/admin/courses/add";
  return `/admin/courses/${courseType.toLowerCase()}`;
}

function courseToForm(course: AdminCourse): FormState {
  const courseType = getCourseTypeFromCategories(course.categories);

  return {
    title: course.title,
    courseType,
    categories: getCategoriesForCourseType(courseType),
    level: course.level,
    price: course.price ? String(course.price) : "",
    isFree: course.isFree,
    isActive: course.isActive ?? true,
    mentorFirstName: course.mentorFirstName,
    mentorLastName: course.mentorLastName,
    mentorTelegram: course.mentorTelegram,
    description: course.description,
    logoUrl: course.logoUrl,
    mentorPhotoUrl: course.mentorPhotoUrl,
    lessons: course.lessons ?? (
      course.videoUrl
        ? [{
            id: crypto.randomUUID(),
            title: "Main lesson",
            description: course.description,
            videoUrl: course.videoUrl,
            duration: "",
            order: 1,
            isFree: course.isFree,
          }]
        : []
    ),
  };
}

type AddCoursePageProps = {
  examType?: ExamType;
};

// Exam badge config
const EXAM_CONFIG: Record<ExamType, { color: string; bg: string; label: string }> = {
  Grammar: { color: "#be185d", bg: "#fce7f3", label: "Grammar" },
  IELTS:   { color: "#1d4ed8", bg: "#dbeafe", label: "IELTS" },
  TOEFL:   { color: "#065f46", bg: "#d1fae5", label: "TOEFL" },
  SAT:     { color: "#7c3aed", bg: "#ede9fe", label: "SAT" },
  CEFR:    { color: "#b45309", bg: "#fef3c7", label: "CEFR" },
  General: { color: "#475569", bg: "#f1f5f9", label: "Umumiy" },
};

function AddCoursePage({ examType = "General" }: AddCoursePageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = getAdminToken();

  const defaultCourseType: CourseType | "" = examType === "General" ? "" : examType;
  const editCourseId = searchParams.get("edit");
  const [editCourse, setEditCourse] = useState<AdminCourse | null>(null);
  const isEditing = Boolean(editCourse);

  const [form, setForm] = useState<FormState>({
    ...EMPTY,
    courseType: defaultCourseType,
    categories: getCategoriesForCourseType(defaultCourseType),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);
  const [loading, setLoading] = useState(Boolean(editCourseId));
  const [message, setMessage] = useState("");
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);

  const examCfg = EXAM_CONFIG[form.courseType || examType];
  const visibleCourseTypes = examType === "General"
    ? COURSE_TYPES
    : COURSE_TYPES.filter((type) => type.value === examType);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!editCourseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getAdminCourse(token, editCourseId)
      .then((result) => {
        setEditCourse(result.course);
        setForm(courseToForm(result.course));
        setMessage("");
      })
      .catch((error: unknown) => {
        if (isUnauthorizedError(error)) {
          clearAdminToken();
          navigate("/login");
          return;
        }

        setMessage("Kurs ma'lumotlarini yuklab bo'lmadi");
      })
      .finally(() => setLoading(false));
  }, [editCourseId, navigate, token]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function selectCourseType(courseType: CourseType) {
    setForm((f) => ({
      ...f,
      courseType,
      categories: getCategoriesForCourseType(courseType),
    }));
    setErrors((e) => ({ ...e, categories: undefined }));
  }

  function addLesson() {
    const lessonId = crypto.randomUUID();
    setForm((current) => ({
      ...current,
      lessons: [
        ...current.lessons,
        {
          id: lessonId,
          title: "",
          description: "",
          videoUrl: "",
          duration: "",
          order: current.lessons.length + 1,
          isFree: current.isFree,
        },
      ],
    }));
    setOpenLessonId(lessonId);
  }

  function updateLesson(index: number, patch: Partial<CourseLesson>) {
    setForm((current) => ({
      ...current,
      lessons: current.lessons.map((lesson, lessonIndex) =>
        lessonIndex === index ? { ...lesson, ...patch } : lesson,
      ),
    }));
  }

  function removeLesson(index: number) {
    const lessonId = form.lessons[index]?.id;
    setForm((current) => ({
      ...current,
      lessons: current.lessons
        .filter((_, lessonIndex) => lessonIndex !== index)
        .map((lesson, lessonIndex) => ({ ...lesson, order: lessonIndex + 1 })),
    }));
    if (lessonId === openLessonId) {
      setOpenLessonId(null);
    }
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim())           e.title        = "Kurs nomini kiriting";
    if (!form.courseType)             e.categories   = "Kurs turini tanlang";
    if (!form.level)                  e.level        = "Darajani tanlang";
    if (!form.isFree && normalizePrice(form.price) <= 0) e.price = "Narxni faqat raqam bilan kiriting";
    if (!form.mentorFirstName.trim()) e.mentorFirstName = "Mentor ismini kiriting";
    if (!form.mentorLastName.trim())  e.mentorLastName  = "Mentor familiyasini kiriting";
    const invalidLesson = form.lessons.some((lesson) => !lesson.title.trim());
    if (invalidLesson) e.lessons = "Har bir dars uchun nom kiriting";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!token) {
      navigate("/login");
      return;
    }

    setSaving(true);
    try {
      const course: CoursePayload = {
        title:           form.title.trim(),
        categories:      getCategoriesForCourseType(form.courseType),
        level:           form.level as CourseLevel,
        price:           form.isFree ? 0 : normalizePrice(form.price),
        isFree:          form.isFree,
        isActive:        form.isActive,
        mentorFirstName: form.mentorFirstName.trim(),
        mentorLastName:  form.mentorLastName.trim(),
        mentorTelegram:  form.mentorTelegram.trim(),
        logoUrl:         form.logoUrl,
        mentorPhotoUrl:  form.mentorPhotoUrl,
        description:     form.description.trim(),
        lessons:         form.lessons.map((lesson, index) => ({
          ...lesson,
          title: lesson.title.trim(),
          description: lesson.description.trim(),
          videoUrl: lesson.videoUrl.trim(),
          duration: lesson.duration.trim(),
          order: index + 1,
          isFree: form.isFree ? true : lesson.isFree,
        })),
      };

      if (editCourse) {
        await updateAdminCourse(token, editCourse.id, course);
      } else {
        await createAdminCourse(token, course);
      }
      setDone(true);
      setTimeout(() => navigate(getListPath(form.courseType)), 1200);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAdminToken();
        navigate("/login");
        return;
      }

      setMessage(error instanceof Error ? error.message : "Kursni saqlab bo'lmadi");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setForm(editCourse ? courseToForm(editCourse) : {
      ...EMPTY,
      courseType: defaultCourseType,
      categories: getCategoriesForCourseType(defaultCourseType),
    });
    setErrors({});
    setDone(false);
  }

  return (
    <section className="admin-table-section admin-course-editor">
      <AdminSectionTitle
        title={isEditing ? `${examCfg.label} kursini tahrirlash` : `Yangi ${examCfg.label} kursi qo'shish`}
        description="Kurs ma'lumotlarini to'ldiring va saqlang."
        meta={
          <span style={{
            padding: "3px 12px", borderRadius: "999px",
            background: examCfg.bg, color: examCfg.color,
            fontSize: "var(--adm-fs-tag)", fontWeight: 900,
          }}>
            {examCfg.label}
          </span>
        }
      />

      {message && <p className="admin-message">{message}</p>}

      {done && (
        <div style={{
          margin: "16px 20px 0", padding: "14px 18px",
          borderRadius: "10px", background: "#dcfce7",
          border: "1px solid #86efac", color: "#166534",
          fontSize: "var(--adm-fs-body)", fontWeight: 800,
        }}>
          ✓ Kurs muvaffaqiyatli {isEditing ? "yangilandi" : "saqlandi"}! Yo'naltirilmoqda…
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ padding: "24px 20px", display: "grid", gap: "28px" }}>
        {loading && (
          <div style={{ color: "#64748b", fontWeight: 800 }}>
            Kurs ma'lumotlari yuklanmoqda...
          </div>
        )}

        {/* ── Asosiy ma'lumotlar ── */}
        <fieldset style={{ border: "none", padding: 0, margin: 0, display: "grid", gap: "18px" }}>
          <legend style={{ fontSize: "var(--adm-fs-sub)", fontWeight: 900, color: "#0f172a", marginBottom: "4px" }}>
            Course category
          </legend>

          <Field label="Category / course group name *" error={errors.title}>
            <input
              type="text"
              placeholder="Example: Ibrat Farzandlari Beginner"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              style={inputStyle}
            />
          </Field>

          {/* Course type */}
          <div>
            <p style={{ fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155", marginBottom: "10px" }}>
              Course type * <span style={{ color: "#94a3b8", fontWeight: 700 }}>(bittasini tanlang)</span>
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px" }}>
              {visibleCourseTypes.map((type) => {
                const active = form.courseType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => selectCourseType(type.value)}
                    style={{
                      display: "grid",
                      gap: "5px",
                      minHeight: "76px",
                      padding: "12px 14px",
                      borderRadius: "16px",
                      border: `1.5px solid ${active ? type.color : "rgba(191,219,254,0.85)"}`,
                      background: active ? type.bg : "rgba(248,250,252,0.92)",
                      color: active ? type.color : "#334155",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 150ms",
                      boxShadow: active ? `0 14px 30px ${type.color}22` : "0 8px 20px rgba(15,23,42,0.04)",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--adm-fs-sm)", fontWeight: 950 }}>
                      <i
                        aria-hidden="true"
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: active ? type.color : "#93c5fd",
                          boxShadow: active ? `0 0 0 4px ${type.color}22` : "none",
                        }}
                      />
                      {type.title}
                    </span>
                    <small style={{ color: active ? type.color : "#64748b", fontSize: "var(--adm-fs-tag)", fontWeight: 750, lineHeight: 1.35 }}>
                      {type.description}
                    </small>
                  </button>
                );
              })}
            </div>
            {errors.categories && (
              <span style={{ color: "#be123c", fontSize: "var(--adm-fs-tag)", fontWeight: 700, marginTop: "6px", display: "block" }}>
                {errors.categories}
              </span>
            )}
          </div>

          {/* Daraja va narx */}
          <div className="admin-form-grid">
            <Field label="Daraja *" error={errors.level}>
              <select
                value={form.level}
                onChange={(e) => set("level", e.target.value as CourseLevel)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">— Darajani tanlang —</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>

            <div style={{ display: "grid", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) => set("isFree", e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2563eb" }}
                />
                Bepul kurs
              </label>
              {!form.isFree && (
                <Field label="Narx (so'm) *" error={errors.price}>
                  <input
                    type="text"
                    placeholder="450 000"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    style={inputStyle}
                  />
                </Field>
              )}
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#16a34a" }}
                />
                Active course — user panelda ko'rinsin
              </label>
            </div>
          </div>

          {/* Tavsif */}
          <Field label="Kurs tavsifi">
            <textarea
              placeholder="Kurs haqida qisqacha yozing…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              style={{ ...inputStyle, minHeight: "90px", padding: "10px 14px", resize: "vertical" }}
            />
          </Field>
        </fieldset>

        <fieldset style={{ border: "none", padding: 0, margin: 0, display: "grid", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
            <div>
              <legend style={{ fontSize: "var(--adm-fs-sub)", fontWeight: 900, color: "#0f172a", marginBottom: "4px" }}>
                Lessons inside this category
              </legend>
              <p style={{ margin: 0, color: "#64748b", fontSize: "var(--adm-fs-sm)", fontWeight: 700 }}>
                Create one category first, then add multiple lessons inside it. Example: Ibrat Farzandlari Beginner → Lesson 1, Lesson 2, Lesson 3.
              </p>
            </div>

            <button
              type="button"
              onClick={addLesson}
              style={{
                minHeight: "42px",
                padding: "0 18px",
                border: "none",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 900,
                boxShadow: "0 14px 30px rgba(37,99,235,0.2)",
              }}
            >
              + Add lesson
            </button>
          </div>

          {errors.lessons && (
            <span style={{ color: "#be123c", fontSize: "var(--adm-fs-tag)", fontWeight: 800 }}>
              {errors.lessons}
            </span>
          )}

          {form.lessons.length === 0 ? (
            <div className="admin-dashboard-empty" style={{ margin: 0 }}>
              <strong>No lessons added yet</strong>
              <span>Click “Add lesson” to create the first lesson in this category.</span>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {form.lessons.map((lesson, index) => (
                <article
                  key={lesson.id}
                  style={{
                    display: "grid",
                    gap: openLessonId === lesson.id ? "14px" : "0",
                    padding: "12px",
                    border: "1px solid rgba(147,197,253,0.36)",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.78))",
                    boxShadow: openLessonId === lesson.id
                      ? "0 18px 42px rgba(26,70,150,0.08)"
                      : "0 10px 24px rgba(26,70,150,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "44px minmax(0, 1fr) auto",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: "44px",
                        height: "44px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                        color: "#ffffff",
                        fontWeight: 900,
                      }}
                    >
                      {index + 1}
                    </span>

                    <div style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          display: "block",
                          overflow: "hidden",
                          color: "#0f172a",
                          fontSize: "var(--adm-fs-body)",
                          fontWeight: 900,
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lesson.title.trim() || `Lesson ${index + 1}`}
                      </strong>
                      <span
                        style={{
                          display: "block",
                          overflow: "hidden",
                          marginTop: "3px",
                          color: "#64748b",
                          fontSize: "var(--adm-fs-sm)",
                          fontWeight: 750,
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lesson.duration || "Duration not set"} · {lesson.videoUrl ? "Video link added" : "No video link"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => setOpenLessonId(openLessonId === lesson.id ? null : lesson.id)}
                        style={{
                          minHeight: "36px",
                          padding: "0 13px",
                          border: "1px solid rgba(37,99,235,0.22)",
                          borderRadius: "11px",
                          background: openLessonId === lesson.id ? "#2563eb" : "#eff6ff",
                          color: openLessonId === lesson.id ? "#ffffff" : "#1d4ed8",
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                      >
                        {openLessonId === lesson.id ? "Close" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        style={{
                          minHeight: "36px",
                          padding: "0 12px",
                          border: "1px solid rgba(244,63,94,0.24)",
                          borderRadius: "11px",
                          background: "#fff1f2",
                          color: "#be123c",
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {openLessonId === lesson.id && (
                    <div
                      style={{
                        display: "grid",
                        gap: "12px",
                        padding: "14px",
                        border: "1px solid rgba(191,219,254,0.78)",
                        borderRadius: "15px",
                        background: "rgba(255,255,255,0.78)",
                      }}
                    >
                      <div className="admin-form-grid">
                        <Field label="Lesson title *">
                          <input
                            type="text"
                            placeholder="Example: Alphabet and pronunciation"
                            value={lesson.title}
                            onChange={(event) => updateLesson(index, { title: event.target.value })}
                            style={inputStyle}
                          />
                        </Field>

                        <Field label="Duration">
                          <input
                            type="text"
                            placeholder="Example: 18 minutes"
                            value={lesson.duration}
                            onChange={(event) => updateLesson(index, { duration: event.target.value })}
                            style={inputStyle}
                          />
                        </Field>
                      </div>

                      <Field label="YouTube / video link">
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={lesson.videoUrl}
                          onChange={(event) => updateLesson(index, { videoUrl: event.target.value })}
                          style={inputStyle}
                        />
                      </Field>

                      <Field label="Lesson description">
                        <textarea
                          rows={2}
                          placeholder="Short explanation about this lesson..."
                          value={lesson.description}
                          onChange={(event) => updateLesson(index, { description: event.target.value })}
                          style={{ ...inputStyle, minHeight: "72px", padding: "10px 14px", resize: "vertical" }}
                        />
                      </Field>

                      {!form.isFree && (
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", color: "#334155", fontWeight: 800 }}>
                          <input
                            type="checkbox"
                            checked={lesson.isFree}
                            onChange={(event) => updateLesson(index, { isFree: event.target.checked })}
                            style={{ width: "18px", height: "18px", accentColor: "#2563eb" }}
                          />
                          Mark this lesson as free preview
                        </label>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </fieldset>

        {/* ── Mentor ma'lumotlari ── */}
        <fieldset style={{ border: "none", padding: 0, margin: 0, display: "grid", gap: "18px" }}>
          <legend style={{ fontSize: "var(--adm-fs-sub)", fontWeight: 900, color: "#0f172a", marginBottom: "4px" }}>
            Mentor ma'lumotlari
          </legend>

          <div className="admin-form-grid">
            <Field label="Ismi *" error={errors.mentorFirstName}>
              <input
                type="text"
                placeholder="Jasur"
                value={form.mentorFirstName}
                onChange={(e) => set("mentorFirstName", e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="Familiyasi *" error={errors.mentorLastName}>
              <input
                type="text"
                placeholder="Toshmatov"
                value={form.mentorLastName}
                onChange={(e) => set("mentorLastName", e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Telegram profili (ixtiyoriy)">
            <input
              type="text"
              placeholder="@username yoki https://t.me/username"
              value={form.mentorTelegram}
              onChange={(e) => set("mentorTelegram", e.target.value)}
              style={inputStyle}
            />
          </Field>
        </fieldset>

        {/* ── Rasmlar ── */}
        <fieldset style={{ border: "none", padding: 0, margin: 0, display: "grid", gap: "18px" }}>
          <legend style={{ fontSize: "var(--adm-fs-sub)", fontWeight: 900, color: "#0f172a", marginBottom: "4px" }}>
            Rasmlar
          </legend>

          <div className="admin-form-grid">
            <ImagePicker
              label="Kurs logosi"
              hint="Rasm yuklash (PNG, JPG)"
              value={form.logoUrl}
              onChange={(v) => set("logoUrl", v)}
            />

            <ImagePicker
              label="Mentor rasmi"
              hint="Rasm yuklash (PNG, JPG)"
              value={form.mentorPhotoUrl}
              onChange={(v) => set("mentorPhotoUrl", v)}
            />
          </div>
        </fieldset>

        {/* ── Tugmalar ── */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              minHeight: "46px", padding: "0 24px",
              border: "1px solid #e2e8f0", borderRadius: "10px",
              background: "#d5e5f5ff", cursor: "pointer",
              fontWeight: 800, fontSize: "var(--adm-fs-body)", color: "#475569",
            }}
          >
            Tozalash
          </button>

          <button
            type="button"
            onClick={() => navigate(getListPath(form.courseType || defaultCourseType))}
            style={{
              minHeight: "46px", padding: "0 24px",
              border: "1px solid #e2e8f0", borderRadius: "10px",
              background: "#f8fafc", cursor: "pointer",
              fontWeight: 800, fontSize: "var(--adm-fs-body)", color: "#475569",
            }}
          >
            Bekor qilish
          </button>

          <button
            type="submit"
            disabled={saving || done || loading}
            style={{
              minHeight: "46px", padding: "0 32px",
              border: "none", borderRadius: "10px",
              background: saving || done || loading ? "#1168ccff" : "#07215aff",
              color: "#fff", cursor: saving || done || loading ? "not-allowed" : "pointer",
              fontWeight: 900, fontSize: "var(--adm-fs-body)",
              transition: "background 150ms",
            }}
          >
            {saving ? "Saqlanmoqda…" : done ? "Saqlandi ✓" : isEditing ? "O'zgarishlarni saqlash" : "Kursni saqlash"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddCoursePage;
