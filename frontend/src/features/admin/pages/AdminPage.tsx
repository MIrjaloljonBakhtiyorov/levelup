import { useState } from "react";

import AdminDashboardOverview from "../components/AdminDashboardOverview";
import AdminHeader from "../components/AdminHeader";
import AdminSectionTitle from "../components/AdminSectionTitle";
import AdminSidebar, { type AdminMenuSelection } from "../components/AdminSidebar";
import AdminStats from "../components/AdminStats";
import AdminTeachersCards from "../components/AdminTeachersCards";
import AdminUsersTable from "../components/AdminUsersTable";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import "../styles/admin.css";

function AdminPage() {
  const dashboard = useAdminDashboard();
  const [activeMenu, setActiveMenu] = useState<AdminMenuSelection | null>(null);

  const renderActiveSection = () => {
    if (!activeMenu || activeMenu.type === "dashboard") {
      return (
        <AdminDashboardOverview
          testCountsBySkill={dashboard.testCountsBySkill}
          tests={dashboard.tests}
          users={dashboard.users}
        />
      );
    }

    if (
      activeMenu.id === "Foydalanuvchilar" ||
      activeMenu.id === "Foydalanuvchilar-O‘quvchilar"
    ) {
      return (
        <AdminUsersTable
          users={dashboard.users}
          onUpdateStatus={dashboard.updateStatus}
        />
      );
    }

    if (activeMenu.id === "Foydalanuvchilar-Bloklangan foydalanuvchilar") {
      return (
        <AdminUsersTable
          users={dashboard.users.filter((user) => user.status !== "active")}
          onUpdateStatus={dashboard.updateStatus}
        />
      );
    }

    if (
      activeMenu.id === "Foydalanuvchilar-Ustozlar" ||
      activeMenu.id === "Ustozlar" ||
      activeMenu.parentTitle === "Ustozlar"
    ) {
      return <AdminTeachersCards />;
    }

    if (activeMenu.id === "Foydalanuvchilar-Login tarixi") {
      return (
        <section className="admin-card-section">
          <AdminSectionTitle
            title="Login tarixi"
            description="Foydalanuvchilarning tizimga kirish holatlari keyingi bosqichda shu yerda yuritiladi."
            meta="Monitoring"
          />

          <div className="admin-info-card">
            <strong>Dasturchi tomonidan hali bu qism tayyor emas</strong>
            <span>Login tarixi backendga ulangandan keyin shu yerda ko‘rinadi.</span>
          </div>
        </section>
      );
    }

    return (
      <section className="admin-placeholder">
        <span>{activeMenu.parentTitle ?? "Tanlangan menyu"}</span>
        <h2>{activeMenu.title}</h2>
        <p>Dasturchi tomonidan hali bu qism tayyor emas.</p>
      </section>
    );
  };

  return (
    <main className="admin-page">
      <AdminSidebar
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
      />

      <section className="admin-content">
        <AdminHeader onLogout={dashboard.logout} />
        <AdminStats stats={dashboard.stats} />

        {dashboard.message && (
          <p className="admin-message">{dashboard.message}</p>
        )}

        {renderActiveSection()}
      </section>
    </main>
  );
}

export default AdminPage;
