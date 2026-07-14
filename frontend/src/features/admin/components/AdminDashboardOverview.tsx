import { examSkills } from "../constants/adminNavigation";
import type { AdminUser } from "../types/adminTypes";
import { formatDate } from "../utils/adminFormatters";
import AdminSectionTitle from "./AdminSectionTitle";
import type { DashboardContentStats } from "../hooks/useAdminDashboardContent";

type AdminDashboardOverviewProps = {
  contentStats: DashboardContentStats;
  users: AdminUser[];
};

function getPercent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

const contentModules = [
  { key: "podcasts", label: "Podcastlar", icon: "🎙" }, { key: "articles", label: "Articllar", icon: "📰" },
  { key: "cinema", label: "Cinema", icon: "🎬" }, { key: "cartoons", label: "Cartoons", icon: "🎭" },
  { key: "grammar", label: "Grammar", icon: "📖" }, { key: "vocabulary", label: "Vocabulary", icon: "📝" },
  { key: "reading-materials", label: "Reading materials", icon: "📚" }, { key: "writing-samples", label: "Writing samples", icon: "✍️" },
  { key: "speaking-topics", label: "Speaking topics", icon: "🎤" }, { key: "blog-categories", label: "Blog kategoriyalar", icon: "🗂" },
  { key: "media-files", label: "Media fayllar", icon: "🗃" },
];

type TestPart = { part: string; count: number };
type TestSkillGroup = { skill: string; color: string; parts: TestPart[] };
type ExamTestGroup = { exam: string; accentColor: string; skills: TestSkillGroup[] };

const testModules: ExamTestGroup[] = [
  {
    exam: "IELTS",
    accentColor: "#05505eff",
    skills: [
      {
        skill: "Reading",
        color: "#083781ff",
        parts: [
          { part: "Part 1", count: 0 },
          { part: "Part 2", count: 0 },
          { part: "Part 3", count: 0 },
          { part: "Part 4", count: 0 },
        ],
      },
      {
        skill: "Listening",
        color: "#10b981",
        parts: [
          { part: "Part 1", count: 0 },
          { part: "Part 2", count: 0 },
          { part: "Part 3", count: 0 },
          { part: "Part 4", count: 0 },
        ],
      },
    ],
  },
  {
    exam: "CEFR",
    accentColor: "#3b82f6",
    skills: [
      {
        skill: "Reading",
        color: "#3b82f6",
        parts: [
          { part: "Part 1", count: 0 },
          { part: "Part 2", count: 0 },
          { part: "Part 3", count: 0 },
          { part: "Part 4", count: 0 },
          { part: "Part 5", count: 0 },
          { part: "Part 6", count: 0 },
        ],
      },
      {
        skill: "Listening",
        color: "#10b981",
        parts: [
          { part: "Part 1", count: 0 },
          { part: "Part 2", count: 0 },
          { part: "Part 3", count: 0 },
          { part: "Part 4", count: 0 },
          { part: "Part 5", count: 0 },
          { part: "Part 6", count: 0 },
        ],
      },
    ],
  },
];

function AdminDashboardOverview({ contentStats, users }: AdminDashboardOverviewProps) {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const activeUsers = users.filter((u) => u.status === "active").length;
  const blockedUsers = users.filter(
    (u) => u.status === "temporary_blocked" || u.status === "blocked",
  ).length;
  const newThisMonth = users.filter((u) => new Date(u.createdAt) >= oneMonthAgo).length;
  // Ustozlar — hozircha stub (keyinroq API dan keladi)
  const teachersCount = 0;

  const recentUsers = users.slice(0, 5);
  const maxSkillCount = Math.max(...examSkills.map((s) => contentStats.testCountsBySkill[s]), 1);
  const activePercent = getPercent(activeUsers, users.length);
  const blockedPercent = getPercent(blockedUsers, users.length);

  // Top stat cards
  const topStats = [
    {
      key: "total",
      label: "Jami foydalanuvchilar",
      value: users.length,
      sub: `${activeUsers} active`,
      color: "#2563eb",
      icon: (
        <svg fill="none" viewBox="0 0 24 24">
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 21v-2a3 3 0 0 0-2-2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      key: "new",
      label: "Yangi (1 oyda)",
      value: newThisMonth,
      sub: "so'nggi 30 kun",
      color: "#10b981",
      icon: (
        <svg fill="none" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      key: "teachers",
      label: "Ustozlar",
      value: teachersCount,
      sub: "platformada",
      color: "#8b5cf6",
      icon: (
        <svg fill="none" viewBox="0 0 24 24">
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4.5 19a4 4 0 0 1 7 0M12.5 19a4 4 0 0 1 7 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      key: "blocked",
      label: "Bloklangan",
      value: blockedUsers,
      sub: "foydalanuvchi",
      color: "#f43f5e",
      icon: (
        <svg fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4.93 4.93l14.14 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="adm-dash">
      <AdminSectionTitle
        title="Dashboard"
        description="Platformadagi real ma'lumotlar asosidagi umumiy ko'rsatkichlar."
        meta="Live overview"
      />

      {/* ── Top stats ── */}
      <div className="adm-dash__stats">
        {topStats.map((stat) => (
          <div className="adm-stat-card" key={stat.key} style={{ "--stat-color": stat.color } as React.CSSProperties}>
            <div className="adm-stat-card__icon">{stat.icon}</div>
            <div className="adm-stat-card__body">
              <span className="adm-stat-card__label">{stat.label}</span>
              <strong className="adm-stat-card__value">{stat.value}</strong>
              <span className="adm-stat-card__sub">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Exam free courses ── */}
      <div className="adm-dash__section-head">
        <span className="adm-dash__section-label">Bepul kurslar</span>
        <span className="adm-dash__section-meta">Har bir imtihon turi bo'yicha</span>
      </div>
      <div className="adm-dash__exams">
        {contentStats.courses.map((e, index) => (
          <div
            className="adm-exam-card"
            key={e.exam}
            style={{ "--exam-color": ["#2563eb", "#06b6d4", "#8b5cf6", "#f59e0b"][index], "--exam-accent": "rgba(59,130,246,0.12)" } as React.CSSProperties}
          >
            <div className="adm-exam-card__top">
              <span className="adm-exam-card__name">{e.exam}</span>
              <span className="adm-exam-card__tag">Free</span>
            </div>
            <strong className="adm-exam-card__count">{e.free}</strong>
            <span className="adm-exam-card__sub">ta bepul dars</span>
            <div className="adm-exam-card__bar">
              <div
                className="adm-exam-card__bar-fill"
                style={{ width: `${getPercent(e.free, e.free + e.paid)}%` }}
              />
            </div>
            <span className="adm-exam-card__hint">
              Jami: {e.free + e.paid} ta ({e.paid} ta pullik)
            </span>
          </div>
        ))}
      </div>

      {/* ── Middle row: user chart + tests + recent ── */}
      <div className="adm-dash__mid">
        {/* User status donut */}
        <article className="adm-dash__card">
          <div className="adm-dash__card-head">
            <span>Foydalanuvchilar holati</span>
            <strong>{users.length} ta</strong>
          </div>
          <div
            className="admin-donut"
            style={{
              background: `conic-gradient(
                #107c38ff 0 ${activePercent}%,
                #8b3f09ff ${activePercent}% ${activePercent + blockedPercent}%,
                #294566ff ${activePercent + blockedPercent}% 100%
              )`,
            }}
            aria-label="Foydalanuvchilar holati"
          >
            <div>
              <strong>{activePercent}%</strong>
              <span>active</span>
            </div>
          </div>
          <div className="admin-chart-legend">
            <span><i className="admin-chart-legend__active" /> Active: {activeUsers}</span>
            <span><i className="admin-chart-legend__warning" /> Vaqtincha blok: {users.filter((u) => u.status === "temporary_blocked").length}</span>
            <span><i className="admin-chart-legend__danger" /> Bloklangan: {users.filter((u) => u.status === "blocked").length}</span>
          </div>
        </article>

        {/* Tests by skill */}
        <article className="adm-dash__card">
          <div className="adm-dash__card-head">
            <span>Testlar (skill bo'yicha)</span>
            <strong>{contentStats.totalTests} ta</strong>
          </div>
          <div className="admin-skill-chart">
            {examSkills.map((skill) => {
              const count = contentStats.testCountsBySkill[skill];
              const width = `${Math.max(6, getPercent(count, maxSkillCount))}%`;
              return (
                <div className="admin-skill-chart__row" key={skill}>
                  <div>
                    <span>{skill}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="admin-skill-chart__track">
                    <span style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        {/* Recent users */}
        <article className="adm-dash__card">
          <div className="adm-dash__card-head">
            <span>Oxirgi ro'yxatdan o'tganlar</span>
            <strong>{recentUsers.length} ta</strong>
          </div>
          {recentUsers.length > 0 ? (
            <div className="admin-recent-list">
              {recentUsers.map((user) => (
                <div className="admin-recent-list__item" key={user.id}>
                  <span>
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </span>
                  <div>
                    <strong>
                      {user.firstName} {user.lastName}
                    </strong>
                    <small>{formatDate(user.createdAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-dashboard-empty">
              <strong>Hali foydalanuvchi yo'q</strong>
              <span>Ro'yxatdan o'tganlar shu yerda ko'rinadi.</span>
            </div>
          )}
        </article>
      </div>

      {/* ── Content modules ── */}
      <div className="adm-dash__section-head">
        <span className="adm-dash__section-label">Kontent modullari</span>
        <span className="adm-dash__section-meta">{contentModules.length} ta modul</span>
      </div>
      <div className="adm-dash__content-grid">
        {contentModules.map((mod) => (
          <div className="adm-content-card" key={mod.label}>
            <span className="adm-content-card__icon">{mod.icon}</span>
            <div className="adm-content-card__body">
              <strong>{mod.label}</strong>
              <span>{contentStats.content.find((item) => item.key === mod.key)?.count ?? 0} ta element</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Test modules by exam ── */}
      <div className="adm-dash__section-head">
        <span className="adm-dash__section-label">Test turlari</span>
        <span className="adm-dash__section-meta">Modul bo'yicha part'lar</span>
      </div>
      <div className="adm-dash__test-modules">
        {testModules.map((exam) => (
          <div
            className="adm-test-exam-card"
            key={exam.exam}
            style={{ "--exam-acc": exam.accentColor } as React.CSSProperties}
          >
            <div className="adm-test-exam-card__head">
              <span className="adm-test-exam-card__name">{exam.exam}</span>
            </div>
            <div className="adm-test-exam-card__skills">
              {exam.skills.map((skillGroup) => (
                <div className="adm-test-skill" key={skillGroup.skill}>
                  <div
                    className="adm-test-skill__label"
                    style={{ color: skillGroup.color }}
                  >
                    {skillGroup.skill}
                  </div>
                  <div className="adm-test-skill__parts">
                    {skillGroup.parts.map((p) => (
                      <div className="adm-test-part" key={p.part}>
                        <span className="adm-test-part__name">{p.part}</span>
                        <strong className="adm-test-part__count">{contentStats.partCounts[exam.exam as "IELTS" | "CEFR"][skillGroup.skill as "Listening" | "Reading"][p.part.toLowerCase().replace(" ", "")] ?? 0}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}

export default AdminDashboardOverview;
