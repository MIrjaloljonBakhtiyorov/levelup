import AdminSectionTitle from "../components/AdminSectionTitle";

/* ── Demo ma'lumotlar (backend tayyor bo'lgunicha) ── */
const DEMO_TEACHERS = [
  {
    id: "1",
    firstName: "Jasur",
    lastName: "Toshmatov",
    middleName: "Bahodirovich",
    phoneNumber: "+998 90 123 45 67",
    email: "jasur@example.com",
    overallScore: 4.8,
    courses: [
      { title: "IELTS Academic", price: 450_000 },
      { title: "TOEFL iBT",      price: 500_000 },
    ],
    status: "active" as const,
  },
  {
    id: "2",
    firstName: "Nilufar",
    lastName: "Yusupova",
    middleName: "Hamidovna",
    phoneNumber: "+998 91 234 56 78",
    email: "nilufar@example.com",
    overallScore: 4.5,
    courses: [
      { title: "IELTS General", price: 380_000 },
    ],
    status: "active" as const,
  },
  {
    id: "3",
    firstName: "Bobur",
    lastName: "Karimov",
    middleName: "Alievich",
    phoneNumber: "+998 93 345 67 89",
    email: "bobur@example.com",
    overallScore: 3.9,
    courses: [
      { title: "SAT Math",            price: 400_000 },
      { title: "SAT Reading/Writing", price: 350_000 },
    ],
    status: "inactive" as const,
  },
];

type TeacherStatus = "active" | "inactive" | "pending";

const STATUS_MAP: Record<TeacherStatus, { label: string; bg: string; color: string }> = {
  active:   { label: "Faol",       bg: "#dcfce7", color: "#166534" },
  inactive: { label: "Nofaol",     bg: "#fee2e2", color: "#991b1b" },
  pending:  { label: "Kutilmoqda", bg: "#fef9c3", color: "#854d0e" },
};

function StarScore({ score }: { score: number }) {
  const full  = Math.floor(score);
  const half  = score - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", color: "#f59e0b", fontWeight: 800, fontSize: "var(--adm-fs-body)" }}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(empty)}
      <span style={{ color: "#64748b", marginLeft: "5px" }}>{score.toFixed(1)}</span>
    </span>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
}

function TeachersPage() {
  const teachers = DEMO_TEACHERS;

  return (
    <section className="admin-table-section">
      <AdminSectionTitle
        title="O'qituvchilar"
        description="Platformadagi barcha o'qituvchilar ro'yxati va ularning asosiy ma'lumotlari."
        meta={`${teachers.length} ta o'qituvchi`}
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Ism Familiya</th>
              <th>Telefon</th>
              <th>Email</th>
              <th>Overall ball</th>
              <th>Kurslar va narxlar</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, idx) => {
              const statusCfg = STATUS_MAP[t.status];
              return (
                <tr key={t.id}>
                  {/* № */}
                  <td>
                    <span className="admin-row-number">{idx + 1}</span>
                  </td>

                  {/* Ism */}
                  <td>
                    <div className="admin-user-cell">
                      <span className="admin-user-cell__avatar">
                        {t.firstName[0]}{t.lastName[0]}
                      </span>
                      <span>
                        <strong>{t.firstName} {t.lastName}</strong>
                        <small>{t.middleName}</small>
                      </span>
                    </div>
                  </td>

                  {/* Telefon */}
                  <td>{t.phoneNumber}</td>

                  {/* Email */}
                  <td>{t.email}</td>

                  {/* Overall ball */}
                  <td><StarScore score={t.overallScore} /></td>

                  {/* Kurslar */}
                  <td>
                    <div style={{ display: "grid", gap: "5px" }}>
                      {t.courses.map((c) => (
                        <div key={c.title} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          gap: "12px", padding: "5px 10px",
                          border: "1px solid #e2e8f0", borderRadius: "7px",
                          background: "#f8fafc", fontSize: "var(--adm-fs-sm)",
                          whiteSpace: "nowrap",
                        }}>
                          <span style={{ color: "#1e293b", fontWeight: 700 }}>{c.title}</span>
                          <span style={{ color: "#2563eb", fontWeight: 900 }}>{formatPrice(c.price)}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span style={{
                      display: "inline-block", padding: "5px 12px",
                      borderRadius: "999px", fontSize: "var(--adm-fs-sm)",
                      fontWeight: 900, background: statusCfg.bg, color: statusCfg.color,
                    }}>
                      {statusCfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}

            {teachers.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="admin-dashboard-empty">
                    <strong>Hozircha o'qituvchi yo'q</strong>
                    <span>O'qituvchilar qo'shilganda shu yerda ko'rinadi.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Izoh ── */}
      <div style={{
        margin: "0 20px 20px",
        padding: "14px 18px",
        borderRadius: "10px",
        background: "#fffbeb",
        border: "1px solid #fde68a",
        color: "#92400e",
        fontSize: "var(--adm-fs-sm)",
        fontWeight: 700,
        lineHeight: 1.6,
      }}>
        ⚠️ Bu qism hali ishlab chiqish jarayonida. Ma'lumotlar backend bilan to'liq ulangandan so'ng real ko'rsatiladi.
      </div>
    </section>
  );
}

export default TeachersPage;
