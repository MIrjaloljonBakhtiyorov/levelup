import { useNavigate } from "react-router";

import { logoutAdmin } from "../../auth/services/authApi";
import { clearAdminToken, getAdminToken } from "../../auth/services/adminSession";
import AdminSidebar from "./AdminSidebar";
import AdminEnglishLayer from "./AdminEnglishLayer";
import "../styles/admin.css";
import "../styles/adminUltraTheme.css";

type AdminLayoutProps = {
  children: React.ReactNode;
};

function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();

  async function logout() {
    const token = getAdminToken();
    if (token) {
      await logoutAdmin(token).catch(() => undefined);
    }
    clearAdminToken();
    navigate("/login");
  }

  return (
    <main className="admin-page">
      <AdminSidebar />

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <span>Admin panel</span>
            <h1>Management dashboard</h1>
            <p>Manage users, courses, and the system from one place.</p>
          </div>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </header>

        <AdminEnglishLayer>{children}</AdminEnglishLayer>
      </section>
    </main>
  );
}

export default AdminLayout;
