import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { isUnauthorizedError } from "../../../services/apiClient";
import { clearAdminToken, getAdminToken } from "../../auth/services/adminSession";
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserStatus,
} from "../services/adminUsersApi";
import type { AdminUser, UserStatus } from "../types/adminTypes";
import AdminUsersTable from "../components/AdminUsersTable";

function BlockedUsersPage() {
  const navigate          = useNavigate();
  const token             = getAdminToken();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [msg, setMsg]     = useState("");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    getAdminUsers(token)
      .then((r) => setUsers((r.users ?? []).filter((u) => u.status !== "active")))
      .catch((error: unknown) => {
        if (isUnauthorizedError(error)) {
          clearAdminToken();
          navigate("/login");
          return;
        }

        setMsg("Foydalanuvchilarni yuklab bo'lmadi");
      });
  }, [navigate, token]);

  async function updateStatus(userId: string, status: UserStatus, blockedUntil?: string) {
    if (!token) return;
    await updateAdminUserStatus(token, userId, status, blockedUntil);
    setUsers((cur) =>
      cur
        .map((u) => (u.id === userId ? { ...u, status, blockedUntil } : u))
        .filter((u) => u.status !== "active"),
    );
  }

  async function editUser(
    userId: string,
    data: { firstName: string; lastName: string; middleName: string; phoneNumber: string; email: string },
  ) {
    if (!token) return;
    const res = await updateAdminUser(token, userId, data);
    setUsers((cur) => cur.map((u) => (u.id === userId ? res.user : u)));
  }

  async function removeUser(userId: string) {
    if (!token) return;
    await deleteAdminUser(token, userId);
    setUsers((cur) => cur.filter((u) => u.id !== userId));
  }

  return (
    <>
      {msg && <p className="admin-message">{msg}</p>}
      <AdminUsersTable
        users={users}
        onUpdateStatus={updateStatus}
        onEditUser={editUser}
        onDeleteUser={removeUser}
      />
    </>
  );
}

export default BlockedUsersPage;
