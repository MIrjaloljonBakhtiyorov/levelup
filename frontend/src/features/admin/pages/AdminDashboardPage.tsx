import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { useAdminDashboardContent } from "../hooks/useAdminDashboardContent";
import AdminDashboardOverview from "../components/AdminDashboardOverview";

function AdminDashboardPage() {
  const { users, message } = useAdminDashboard();
  const contentStats = useAdminDashboardContent();

  return (
    <>
      {message && <p className="admin-message">{message}</p>}
      <AdminDashboardOverview
        contentStats={contentStats}
        users={users}
      />
    </>
  );
}

export default AdminDashboardPage;
