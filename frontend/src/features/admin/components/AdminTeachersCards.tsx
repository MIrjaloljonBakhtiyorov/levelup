import { useState } from "react";

import type { AdminTeacher } from "../types/adminTypes";
import AdminSectionTitle from "./AdminSectionTitle";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(t: AdminTeacher) {
  return `${t.firstName.charAt(0)}${t.lastName.charAt(0)}`.toUpperCase();
}

function StarScore({ score }: { score: number }) {
  const full  = Math.floor(score);
  const half  = score - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
      {Array.from({ length: full  }).map((_, i) => (
        <svg key={`f${i}`} aria-hidden="true" width="14" height="14" viewBox="0 0 24 24"
          fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {half && (
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="#f59e0b" strokeWidth="1.5">
          <defs>
            <linearGradient id="hg">
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#hg)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} aria-hidden="true" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="#d1d5db" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ marginLeft: "4px", color: "#64748b", fontSize: "13px", fontWeight: 700 }}>
        {score.toFixed(1)}
      </span>
    </span>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
}

function StatusBadge({ status }: { status: AdminTeacher["status"] }) {
  const map = {
    active:   { label: "Faol",       bg: "#dcfce7", color: "#166534" },
    inactive: { label: "Nofaol",     bg: "#fee2e2", color: "#991b1b" },
    pending:  { label: "Kutilmoqda", bg: "#fef9c3", color: "#854d0e" },
  };
  const { label, bg, color } = map[status];
  return (
    <span style={{
      display: "inline-grid", placeItems: "center",
      padding: "4px 12px", borderRadius: "999px",
      background: bg, color, fontWeight: 900,
      fontSize: "var(--adm-fs-sm)", whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ─── Courses cell ─────────────────────────────────────────────────────────────

function CoursesList({ courses }: { courses: AdminTeacher["courses"] }) {
  const [open, setOpen] = useState(false);

  if (!courses.length) {
    return <span style={{ color: "#94a3b8", fontSize: "var(--adm-fs-sm)" }}>—</span>;
  }

  const shown = open ? courses : courses.slice(0, 2);

  return (
    <div style={{ display: "grid", gap: "4px" }}>
      {shown.map((c) => (
        <div key={c.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span style={{ fontSize: "var(--adm-fs-sm)", color: "#334155", fontWeight: 700 }}>{c.title}</span>
          <span style={{ fontSize: "var(--adm-fs-sm)", color: "#2563eb", fontWeight: 900, whiteSpace: "nowrap" }}>
            {formatPrice(c.price)}
          </span>
        </div>
      ))}
      {courses.length > 2 && (
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#2563eb", fontSize: "var(--adm-fs-sm)", fontWeight: 800,
            padding: 0, textAlign: "left",
          }}
        >
          {open ? "Kamroq ko'rish ▲" : `+${courses.length - 2} ta ko'rish ▼`}
        </button>
      )}
    </div>
  );
}

// ─── Search icon ──────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type AdminTeachersCardsProps = {
  teachers?: AdminTeacher[];
};

function AdminTeachersCards({ teachers = [] }: AdminTeachersCardsProps) {
  const [search, setSearch] = useState("");

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.firstName.toLowerCase().includes(q) ||
      t.lastName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.phoneNumber.includes(q)
    );
  });

  return (
    <section className="admin-table-section" id="teachers">
      <AdminSectionTitle
        title="O'qituvchilar ro'yxati"
        description="Platformadagi barcha o'qituvchilar, ularning reytingi va kurs narxlari."
        meta={`${filtered.length} / ${teachers.length} ta o'qituvchi`}
      />

      {/* Search */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0" }}>
        <label style={{ position: "relative", display: "flex", alignItems: "center", maxWidth: "400px" }}>
          <span style={{
            position: "absolute", left: "12px", color: "#94a3b8",
            display: "grid", placeItems: "center",
          }}>
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Ism, familiya, email yoki telefon…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", minHeight: "42px",
              border: "1px solid #e2e8f0", borderRadius: "10px",
              padding: "0 14px 0 40px", font: "inherit",
              fontSize: "var(--adm-fs-body)", background: "#f8fafc",
              outline: "none", transition: "border-color 150ms",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "#e2e8f0")}
          />
        </label>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "52px" }}>№</th>
              <th>Ism / Familiya</th>
              <th>Telefon</th>
              <th>Email</th>
              <th>Overall ball</th>
              <th>Status</th>
              <th>Kurslar va narxlar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((teacher, index) => (
              <tr key={teacher.id}>
                {/* № */}
                <td>
                  <span className="admin-row-number">{index + 1}</span>
                </td>

                {/* Ism / Familiya */}
                <td>
                  <div className="admin-user-cell">
                    <span className="admin-user-cell__avatar" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                      {getInitials(teacher)}
                    </span>
                    <span>
                      <strong style={{ display: "block" }}>
                        {teacher.lastName} {teacher.firstName}
                      </strong>
                      <small style={{ display: "block", color: "#64748b", marginTop: "2px" }}>
                        {teacher.middleName || ""}
                      </small>
                    </span>
                  </div>
                </td>

                {/* Telefon */}
                <td style={{ whiteSpace: "nowrap" }}>{teacher.phoneNumber}</td>

                {/* Email */}
                <td>
                  <a href={`mailto:${teacher.email}`}
                    style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
                    {teacher.email}
                  </a>
                </td>

                {/* Overall ball */}
                <td><StarScore score={teacher.overallScore} /></td>

                {/* Status */}
                <td><StatusBadge status={teacher.status} /></td>

                {/* Kurslar */}
                <td style={{ minWidth: "220px" }}>
                  <CoursesList courses={teacher.courses} />
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="admin-dashboard-empty">
                    <strong>
                      {search
                        ? "Qidiruv bo'yicha natija topilmadi"
                        : "Hozircha o'qituvchi mavjud emas"}
                    </strong>
                    <span>
                      {search
                        ? `"${search}" — boshqa so'z bilan qidiring`
                        : "O'qituvchilar qo'shilgandan keyin shu yerda ko'rinadi."}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div style={{
        padding: "14px 20px",
        borderTop: "1px solid #e2e8f0",
        background: "#fffbeb",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#d97706" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <p style={{ margin: 0, color: "#92400e", fontSize: "var(--adm-fs-sm)", fontWeight: 700 }}>
          Bu qism hali ishlab chiqish jarayonida — o'qituvchilar ma'lumotlari
          backend bilan to'liq integratsiya qilingandan keyin ko'rinadi.
        </p>
      </div>
    </section>
  );
}

export default AdminTeachersCards;
