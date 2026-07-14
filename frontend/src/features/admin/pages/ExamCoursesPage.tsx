import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { isUnauthorizedError } from "../../../services/apiClient";
import { clearAdminToken, getAdminToken } from "../../auth/services/adminSession";
import AdminSectionTitle from "../components/AdminSectionTitle";
import { deleteAdminCourse, getAdminCourses, updateAdminCourseStatus } from "../services/adminCoursesApi";
import type { AdminCourse, CourseCategory } from "../types/adminTypes";
import { formatDate } from "../utils/adminFormatters";

type Tab = "free" | "paid";
type CourseListType = Extract<CourseCategory, "Grammar" | "CEFR" | "IELTS" | "TOEFL" | "SAT">;

type ExamCourseConfig = {
  title: string;
  description: string;
  category: CourseCategory;
  addPath: string;
};

const EXAM_CONFIG: Record<CourseListType, ExamCourseConfig> = {
  Grammar: {
    title: "Grammar kurslari",
    description: "Grammar qoidalari, strukturalar va accuracy darslari ro'yxati.",
    category: "Grammar",
    addPath: "/admin/courses/grammar/add",
  },
  CEFR: {
    title: "CEFR kurslari",
    description: "Barcha CEFR darajalari uchun kurslar ro'yxati.",
    category: "CEFR",
    addPath: "/admin/courses/cefr/add",
  },
  IELTS: {
    title: "IELTS kurslari",
    description: "Barcha IELTS darslari va kurslari ro'yxati.",
    category: "IELTS",
    addPath: "/admin/courses/ielts/add",
  },
  TOEFL: {
    title: "TOEFL kurslari",
    description: "TOEFL iBT uchun bepul va pullik darslar ro'yxati.",
    category: "TOEFL",
    addPath: "/admin/courses/toefl/add",
  },
  SAT: {
    title: "SAT kurslari",
    description: "SAT Reading and Writing hamda Math tayyorlov darslari.",
    category: "SAT",
    addPath: "/admin/courses/sat/add",
  },
};

function getInitialTab(value: string | null): Tab {
  return value === "paid" ? "paid" : "free";
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
}

function LevelBadge({ level }: { level: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Beginner: { bg: "#dbeafe", color: "#1d4ed8" },
    Elementary: { bg: "#e0e7ff", color: "#4338ca" },
    "Pre-Intermediate": { bg: "#ede9fe", color: "#7c3aed" },
    Intermediate: { bg: "#fce7f3", color: "#be185d" },
    "Upper-Intermediate": { bg: "#fef3c7", color: "#b45309" },
    Advanced: { bg: "#dcfce7", color: "#166534" },
  };
  const cfg = map[level] ?? { bg: "#f1f5f9", color: "#475569" };

  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: "999px",
        background: cfg.bg,
        color: cfg.color,
        fontSize: "var(--adm-fs-tag)",
        fontWeight: 900,
        whiteSpace: "nowrap",
      }}
    >
      {level}
    </span>
  );
}

function CourseStatsCell({ course }: { course: AdminCourse }) {
  const stats = course.stats ?? {
    startedStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    averageProgress: 0,
  };

  const items = [
    { label: "Started", value: stats.startedStudents, color: "#1d4ed8", bg: "#dbeafe" },
    { label: "Studying", value: stats.activeStudents, color: "#0f766e", bg: "#ccfbf1" },
    { label: "Done", value: stats.completedStudents, color: "#166534", bg: "#dcfce7" },
    { label: "Avg", value: `${stats.averageProgress}%`, color: "#92400e", bg: "#fef3c7" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(70px, 1fr))", gap: "6px", minWidth: "160px" }}>
      {items.map((item) => (
        <span
          key={item.label}
          style={{
            display: "grid",
            gap: "1px",
            minHeight: "38px",
            padding: "6px 8px",
            borderRadius: "10px",
            background: item.bg,
            color: item.color,
            fontSize: "var(--adm-fs-tag)",
            fontWeight: 900,
            lineHeight: 1.1,
          }}
        >
          <strong style={{ fontSize: "var(--adm-fs-sm)", lineHeight: 1 }}>{item.value}</strong>
          <small style={{ color: "inherit", fontSize: "10px", fontWeight: 900, opacity: 0.78, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {item.label}
          </small>
        </span>
      ))}
    </div>
  );
}

function DeleteConfirm({
  course,
  onCancel,
  onConfirm,
}: {
  course: AdminCourse;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="admin-profile-modal" role="dialog" aria-modal="true">
      <article className="admin-profile-modal__card" style={{ maxWidth: "420px" }}>
        <div className="admin-profile-modal__header">
          <strong style={{ fontSize: "var(--adm-fs-sub)", color: "#be123c" }}>
            Kursni o'chirish
          </strong>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Yopish"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b" }}
          >
            x
          </button>
        </div>
        <p style={{ margin: "18px 0 24px", color: "#334155", fontSize: "var(--adm-fs-body)", lineHeight: 1.6 }}>
          <strong>"{course.title}"</strong> kursini o'chirasizmi? Bu amal qaytarib bo'lmaydi.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              minHeight: "42px",
              padding: "0 20px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              background: "#f8fafc",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: "var(--adm-fs-body)",
            }}
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              minHeight: "42px",
              padding: "0 20px",
              border: "none",
              borderRadius: "8px",
              background: "#be123c",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
              fontSize: "var(--adm-fs-body)",
            }}
          >
            O'chirish
          </button>
        </div>
      </article>
    </div>
  );
}

function ExamCoursesPage({ examType }: { examType: CourseListType }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => getInitialTab(searchParams.get("tab")));
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [deleting, setDeleting] = useState<AdminCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const config = EXAM_CONFIG[examType];
  const token = getAdminToken();

  useEffect(() => {
    setTab(getInitialTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    getAdminCourses(token)
      .then((result) => {
        setCourses(result.courses ?? []);
        setMessage("");
      })
      .catch((error: unknown) => {
        if (isUnauthorizedError(error)) {
          clearAdminToken();
          navigate("/login");
          return;
        }

        setMessage("Kurslarni yuklab bo'lmadi");
      })
      .finally(() => setLoading(false));
  }, [navigate, token]);

  function handleTabChange(nextTab: Tab) {
    setTab(nextTab);
    setSearchParams({ tab: nextTab }, { replace: true });
  }

  async function handleDelete(course: AdminCourse) {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await deleteAdminCourse(token, course.id);
      setCourses((current) => current.filter((item) => item.id !== course.id));
      setDeleting(null);
      setMessage("");
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAdminToken();
        navigate("/login");
        return;
      }

      setMessage("Kursni o'chirib bo'lmadi");
    }
  }

  async function handleToggleStatus(course: AdminCourse) {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const result = await updateAdminCourseStatus(token, course.id, !(course.isActive ?? true));
      setCourses((current) => current.map((item) => (
        item.id === course.id ? result.course : item
      )));
      setMessage("");
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAdminToken();
        navigate("/login");
        return;
      }

      setMessage("Kurs statusini o'zgartirib bo'lmadi");
    }
  }

  const examCourses = courses.filter((course) => course.categories.includes(config.category));
  const freeCount = examCourses.filter((course) => course.isFree).length;
  const paidCount = examCourses.filter((course) => !course.isFree).length;
  const activeCount = examCourses.filter((course) => course.isActive ?? true).length;
  const inactiveCount = examCourses.length - activeCount;
  const filtered = examCourses.filter((course) => (tab === "free" ? course.isFree : !course.isFree));

  return (
    <>
      <section className="admin-table-section">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <AdminSectionTitle
            title={config.title}
            description={config.description}
            meta={`${examCourses.length} courses · ${activeCount} active · ${inactiveCount} inactive`}
          />

          <div style={{ padding: "18px 20px 0 0" }}>
            <button
              type="button"
              onClick={() => navigate(config.addPath)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "44px",
                padding: "0 22px",
                border: "none",
                borderRadius: "10px",
                background: "#2563eb",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: "var(--adm-fs-body)",
                boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
                transition: "background 150ms, transform 150ms",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "#1d4ed8";
                event.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "#2563eb";
                event.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Dars qo'shish
            </button>
          </div>
        </div>

        {message && <p className="admin-message">{message}</p>}

        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 20px" }}>
          {([
            { key: "free", label: "Bepul kurslar", count: freeCount },
            { key: "paid", label: "Pullik kurslar", count: paidCount },
          ] as { key: Tab; label: string; count: number }[]).map(({ count, key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTabChange(key)}
              style={{
                padding: "14px 20px",
                border: "none",
                borderBottom: `2px solid ${tab === key ? "#2563eb" : "transparent"}`,
                background: "none",
                cursor: "pointer",
                fontSize: "var(--adm-fs-body)",
                fontWeight: tab === key ? 900 : 700,
                color: tab === key ? "#2563eb" : "#64748b",
                transition: "color 150ms",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {label}
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  minWidth: "22px",
                  height: "22px",
                  padding: "0 6px",
                  borderRadius: "999px",
                  background: tab === key ? "#dbeafe" : "#f1f5f9",
                  color: tab === key ? "#1d4ed8" : "#64748b",
                  fontSize: "var(--adm-fs-tag)",
                  fontWeight: 900,
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kurs nomi</th>
                <th>Daraja</th>
                <th>Kategoriyalar</th>
                <th>Lessons</th>
                <th>Students</th>
                <th>Mentor</th>
                <th>Status</th>
                <th>{tab === "free" ? "Narx" : "Narx (so'm)"}</th>
                <th>Qo'shilgan</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course, index) => (
                <tr key={course.id}>
                  <td>
                    <span className="admin-row-number">{index + 1}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {course.logoUrl ? (
                        <img
                          src={course.logoUrl}
                          alt={course.title}
                          style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }}
                        />
                      ) : (
                        <span
                          style={{
                            display: "grid",
                            placeItems: "center",
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            background: "#dbeafe",
                            color: "#1d4ed8",
                            fontSize: "var(--adm-fs-sm)",
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          {course.title.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <strong style={{ display: "block", color: "#0f172a", fontSize: "var(--adm-fs-body)" }}>
                          {course.title}
                        </strong>
                        {course.description && (
                          <small style={{ color: "#64748b", fontSize: "var(--adm-fs-tag)" }}>
                            {course.description.slice(0, 50)}
                            {course.description.length > 50 ? "..." : ""}
                          </small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <LevelBadge level={course.level} />
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {course.categories.map((category) => (
                        <span
                          key={category}
                          style={{
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background: "#f1f5f9",
                            color: "#475569",
                            fontSize: "var(--adm-fs-tag)",
                            fontWeight: 800,
                          }}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: "#e0f2fe",
                        color: "#0369a1",
                        fontSize: "var(--adm-fs-sm)",
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {course.lessons?.length ?? (course.videoUrl ? 1 : 0)} lessons
                    </span>
                  </td>
                  <td>
                    <CourseStatsCell course={course} />
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {course.mentorPhotoUrl ? (
                        <img
                          src={course.mentorPhotoUrl}
                          alt="Mentor"
                          style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }}
                        />
                      ) : (
                        <span
                          style={{
                            display: "grid",
                            placeItems: "center",
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            background: "#dbeafe",
                            color: "#1d4ed8",
                            fontSize: "var(--adm-fs-tag)",
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          {course.mentorFirstName[0]}
                          {course.mentorLastName[0]}
                        </span>
                      )}
                      <div>
                        <strong style={{ display: "block", fontSize: "var(--adm-fs-sm)", color: "#0f172a" }}>
                          {course.mentorFirstName} {course.mentorLastName}
                        </strong>
                        {course.mentorTelegram && (
                          <a
                            href={course.mentorTelegram.startsWith("http") ? course.mentorTelegram : `https://t.me/${course.mentorTelegram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#2563eb", fontSize: "var(--adm-fs-tag)", fontWeight: 700 }}
                          >
                            {course.mentorTelegram}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(course)}
                      title={(course.isActive ?? true) ? "User paneldan yashirish" : "User panelda ko'rsatish"}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        minHeight: "32px",
                        padding: "0 11px",
                        border: `1px solid ${(course.isActive ?? true) ? "#86efac" : "#fecaca"}`,
                        borderRadius: "999px",
                        background: (course.isActive ?? true) ? "#dcfce7" : "#fef2f2",
                        color: (course.isActive ?? true) ? "#166534" : "#be123c",
                        cursor: "pointer",
                        fontSize: "var(--adm-fs-sm)",
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: (course.isActive ?? true) ? "#22c55e" : "#ef4444",
                          boxShadow: (course.isActive ?? true)
                            ? "0 0 0 4px rgba(34,197,94,0.14)"
                            : "0 0 0 4px rgba(239,68,68,0.12)",
                        }}
                      />
                      {(course.isActive ?? true) ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>
                    {course.isFree ? (
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "999px",
                          background: "#dcfce7",
                          color: "#166534",
                          fontSize: "var(--adm-fs-sm)",
                          fontWeight: 900,
                        }}
                      >
                        Bepul
                      </span>
                    ) : (
                      <span style={{ color: "#0f172a", fontWeight: 800, fontSize: "var(--adm-fs-body)" }}>
                        {formatPrice(course.price)}
                      </span>
                    )}
                  </td>
                  <td style={{ whiteSpace: "nowrap", color: "#64748b", fontSize: "var(--adm-fs-sm)" }}>
                    {formatDate(course.createdAt)}
                  </td>
                  <td>
                    <div className="admin-user-actions">
                      <button
                        type="button"
                        title={(course.isActive ?? true) ? "Inactive qilish" : "Active qilish"}
                        aria-label={(course.isActive ?? true) ? "Inactive qilish" : "Active qilish"}
                        onClick={() => handleToggleStatus(course)}
                      >
                        {(course.isActive ?? true) ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.89 1 12a18.45 18.45 0 0 1 5.06-6.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c5 0 9.27 3.11 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                            <path d="M1 1l22 22" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        title="Tahrirlash"
                        aria-label="Tahrirlash"
                        onClick={() => navigate(`${config.addPath}?edit=${course.id}`)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="O'chirish"
                        aria-label="O'chirish"
                        className="admin-user-actions__danger"
                        onClick={() => setDeleting(course)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11}>
                    <div className="admin-dashboard-empty">
                      <strong>
                        {loading
                          ? "Kurslar yuklanmoqda..."
                          : tab === "free"
                            ? "Bepul kurs yo'q"
                            : "Pullik kurs yo'q"}
                      </strong>
                      <span>
                        Yangi kurs qo'shish uchun yuqoridagi{" "}
                        <button
                          type="button"
                          onClick={() => navigate(config.addPath)}
                          style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 900, fontSize: "inherit" }}
                        >
                          "Dars qo'shish"
                        </button>{" "}
                        tugmasini bosing.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {deleting && (
        <DeleteConfirm
          course={deleting}
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}

export default ExamCoursesPage;
