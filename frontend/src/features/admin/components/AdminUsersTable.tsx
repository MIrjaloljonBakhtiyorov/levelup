import { useState } from "react";

import type { AdminUser, UserStatus } from "../types/adminTypes";
import { formatDate, getInitials } from "../utils/adminFormatters";
import AdminSectionTitle from "./AdminSectionTitle";

type AdminUsersTableProps = {
  users: AdminUser[];
  onUpdateStatus: (userId: string, status: UserStatus, blockedUntil?: string) => void;
};

function ActionIcon({ name }: { name: "view" | "temporary" | "block" | "unblock" }) {
  if (name === "view") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M2.8 12s3.3-6 9.2-6 9.2 6 9.2 6-3.3 6-9.2 6-9.2-6-9.2-6Z" />
        <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
      </svg>
    );
  }

  if (name === "temporary") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 7v5l3 2" />
        <path d="M12 21a9 9 0 1 0-8.2-5.3" />
        <path d="M3 21v-5h5" />
      </svg>
    );
  }

  if (name === "block") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5.6 5.6 18.4 18.4" />
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 11V8a5 5 0 0 1 9.4-2.4" />
      <path d="M6 11h12v9H6z" />
      <path d="M12 15v2" />
    </svg>
  );
}

function AdminUsersTable({ users, onUpdateStatus }: AdminUsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  function blockTemporarily(userId: string) {
    const blockedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    onUpdateStatus(userId, "temporary_blocked", blockedUntil);
  }

  return (
    <section className="admin-table-section" id="users">
      <AdminSectionTitle
        title="Foydalanuvchilar ro‘yxati"
        description="Yangi ro‘yxatdan o‘tganlar birinchi qatorda ko‘rinadi."
        meta={`${users.length} ta yozuv`}
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Ism</th>
              <th>Familiya</th>
              <th>Sharifi</th>
              <th>Telefon raqam</th>
              <th>Email</th>
              <th>Ro‘yxatdan o‘tgan vaqt</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>
                  <span className="admin-row-number">{index + 1}</span>
                </td>
                <td>
                  <div className="admin-user-cell">
                    <span className="admin-user-cell__avatar">
                      {getInitials(user)}
                    </span>
                    <span>
                      <strong>{user.firstName}</strong>
                      <small>O‘quvchi</small>
                    </span>
                  </div>
                </td>
                <td>{user.lastName}</td>
                <td>{user.middleName || "-"}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.email}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="admin-user-actions">
                    <button
                      type="button"
                      aria-label="Profilni ko‘rish"
                      title="Profilni ko‘rish"
                      onClick={() => setSelectedUser(user)}
                    >
                      <ActionIcon name="view" />
                    </button>

                    <button
                      type="button"
                      aria-label="Vaqtinchalik bloklash"
                      title="Vaqtinchalik bloklash"
                      onClick={() => blockTemporarily(user.id)}
                    >
                      <ActionIcon name="temporary" />
                    </button>

                    <button
                      className="admin-user-actions__danger"
                      type="button"
                      aria-label="Butunlay bloklash"
                      title="Butunlay bloklash"
                      onClick={() => onUpdateStatus(user.id, "blocked")}
                    >
                      <ActionIcon name="block" />
                    </button>

                    {user.status !== "active" && (
                      <button
                        type="button"
                        aria-label="Blokdan chiqarish"
                        title="Blokdan chiqarish"
                        onClick={() => onUpdateStatus(user.id, "active")}
                      >
                        <ActionIcon name="unblock" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td className="admin-empty-state" colSpan={8}>
                  <strong>Hozircha foydalanuvchi yo‘q</strong>
                  <span>Ro‘yxatdan o‘tganlar shu yerda paydo bo‘ladi.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="admin-profile-modal" role="dialog" aria-modal="true">
          <article className="admin-profile-modal__card">
            <div className="admin-profile-modal__header">
              <div className="admin-user-cell">
                <span className="admin-user-cell__avatar">
                  {getInitials(selectedUser)}
                </span>
                <span>
                  <strong>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </strong>
                  <small>{selectedUser.email}</small>
                </span>
              </div>

              <button type="button" onClick={() => setSelectedUser(null)}>
                Yopish
              </button>
            </div>

            <dl className="admin-profile-modal__details">
              <div>
                <dt>Ism</dt>
                <dd>{selectedUser.firstName}</dd>
              </div>
              <div>
                <dt>Familiya</dt>
                <dd>{selectedUser.lastName}</dd>
              </div>
              <div>
                <dt>Sharifi</dt>
                <dd>{selectedUser.middleName || "-"}</dd>
              </div>
              <div>
                <dt>Telefon</dt>
                <dd>{selectedUser.phoneNumber}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{selectedUser.email}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{selectedUser.status}</dd>
              </div>
              <div>
                <dt>Ro‘yxatdan o‘tgan vaqt</dt>
                <dd>{formatDate(selectedUser.createdAt)}</dd>
              </div>
              <div>
                <dt>Blok muddati</dt>
                <dd>
                  {selectedUser.blockedUntil
                    ? `${formatDate(selectedUser.blockedUntil)} gacha`
                    : "-"}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      )}
    </section>
  );
}

export default AdminUsersTable;
