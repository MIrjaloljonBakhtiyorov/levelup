import { examSkills } from "../constants/adminNavigation";
import type { AdminUser, ExamSkill, ExamTest } from "../types/adminTypes";
import { formatDate } from "../utils/adminFormatters";
import AdminSectionTitle from "./AdminSectionTitle";

type AdminDashboardOverviewProps = {
  testCountsBySkill: Record<ExamSkill, number>;
  tests: ExamTest[];
  users: AdminUser[];
};

function getPercent(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function AdminDashboardOverview({
  testCountsBySkill,
  tests,
  users,
}: AdminDashboardOverviewProps) {
  const activeUsers = users.filter((user) => user.status === "active").length;
  const temporaryBlockedUsers = users.filter(
    (user) => user.status === "temporary_blocked",
  ).length;
  const blockedUsers = users.filter((user) => user.status === "blocked").length;
  const blockedUsersTotal = temporaryBlockedUsers + blockedUsers;
  const recentUsers = users.slice(0, 5);
  const maxSkillCount = Math.max(...examSkills.map((skill) => testCountsBySkill[skill]), 1);
  const activePercent = getPercent(activeUsers, users.length);
  const blockedPercent = getPercent(blockedUsersTotal, users.length);

  return (
    <section className="admin-dashboard">
      <AdminSectionTitle
        title="Dashboard"
        description="Platformadagi real foydalanuvchi va test ma’lumotlari asosidagi umumiy ko‘rsatkichlar."
        meta="Live overview"
      />

      <div className="admin-dashboard__grid">
        <article className="admin-dashboard-card admin-dashboard-card--wide">
          <div className="admin-dashboard-card__header">
            <span>Foydalanuvchilar holati</span>
            <strong>{users.length} ta</strong>
          </div>

          <div
            className="admin-donut"
            style={{
              background: `conic-gradient(#16a34a 0 ${activePercent}%, #f97316 ${activePercent}% ${
                activePercent + blockedPercent
              }%, #e2e8f0 ${activePercent + blockedPercent}% 100%)`,
            }}
            aria-label="Foydalanuvchilar holati diagrammasi"
          >
            <div>
              <strong>{activePercent}%</strong>
              <span>active</span>
            </div>
          </div>

          <div className="admin-chart-legend">
            <span><i className="admin-chart-legend__active" /> Active: {activeUsers}</span>
            <span><i className="admin-chart-legend__warning" /> Vaqtincha blok: {temporaryBlockedUsers}</span>
            <span><i className="admin-chart-legend__danger" /> Bloklangan: {blockedUsers}</span>
          </div>
        </article>

        <article className="admin-dashboard-card">
          <div className="admin-dashboard-card__header">
            <span>Testlar</span>
            <strong>{tests.length} ta</strong>
          </div>

          <div className="admin-skill-chart">
            {examSkills.map((skill) => {
              const count = testCountsBySkill[skill];
              const width = `${Math.max(8, getPercent(count, maxSkillCount))}%`;

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

        <article className="admin-dashboard-card">
          <div className="admin-dashboard-card__header">
            <span>Oxirgi ro‘yxatdan o‘tganlar</span>
            <strong>{recentUsers.length} ta</strong>
          </div>

          {recentUsers.length > 0 ? (
            <div className="admin-recent-list">
              {recentUsers.map((user) => (
                <div className="admin-recent-list__item" key={user.id}>
                  <span>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
                  <div>
                    <strong>{user.firstName} {user.lastName}</strong>
                    <small>{formatDate(user.createdAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-dashboard-empty">
              <strong>Hali foydalanuvchi yo‘q</strong>
              <span>Ro‘yxatdan o‘tganlar shu yerda ko‘rinadi.</span>
            </div>
          )}
        </article>

        <article className="admin-dashboard-card admin-dashboard-card--wide">
          <div className="admin-dashboard-card__header">
            <span>Tizim holati</span>
            <strong>Admin</strong>
          </div>

          <div className="admin-health-grid">
            <div>
              <span>Backend users</span>
              <strong>{users.length > 0 ? "Ulangan" : "Data kutilmoqda"}</strong>
            </div>
            <div>
              <span>Test storage</span>
              <strong>{tests.length > 0 ? "Faol" : "Bo‘sh"}</strong>
            </div>
            <div>
              <span>Bloklanganlar</span>
              <strong>{blockedUsersTotal}</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default AdminDashboardOverview;
