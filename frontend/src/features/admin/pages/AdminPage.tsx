import { Outlet } from "react-router";

import AdminLayout from "../components/AdminLayout";

/** Admin sahifalarining asosiy wrapper'i.
 *  Sidebar + header — AdminLayout ichida.
 *  Har bir yo'l (dashboard, pupils, teachers…) <Outlet> orqali render bo'ladi. */
function AdminPage() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export default AdminPage;
