import { useState } from "react";

import type { AdminUser, UserStatus } from "../types/adminTypes";
import { formatDate, getInitials } from "../utils/adminFormatters";
import AdminSectionTitle from "./AdminSectionTitle";

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function Icon({ name }: {
  name: "view" | "edit" | "temporary" | "block" | "unblock" | "delete" | "close" | "search";
}) {
  const paths: Record<typeof name, React.ReactElement> = {
    view: (
      <>
        <path d="M2.8 12s3.3-6 9.2-6 9.2 6 9.2 6-3.3 6-9.2 6-9.2-6-9.2-6Z" />
        <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
      </>
    ),
    edit: (
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
      </>
    ),
    temporary: (
      <>
        <path d="M12 7v5l3 2" />
        <path d="M12 21a9 9 0 1 0-8.2-5.3" />
        <path d="M3 21v-5h5" />
      </>
    ),
    block: (
      <>
        <path d="M5.6 5.6 18.4 18.4" />
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      </>
    ),
    unblock: (
      <>
        <path d="M7 11V8a5 5 0 0 1 9.4-2.4" />
        <path d="M6 11h12v9H6z" />
        <path d="M12 15v2" />
      </>
    ),
    delete: (
      <>
        <path d="M3 6h18" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
      </>
    ),
    close: (
      <>
        <path d="M18 6 6 18M6 6l12 12" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: UserStatus }) {
  const map: Record<UserStatus, { label: string; cls: string }> = {
    active:            { label: "Faol",         cls: "admin-status--active" },
    temporary_blocked: { label: "Vaqtincha bl.", cls: "admin-status--temporary_blocked" },
    blocked:           { label: "Bloklangan",   cls: "admin-status--blocked" },
  };
  const { label, cls } = map[status];
  return <div className={`admin-status ${cls}`}><span>{label}</span></div>;
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

type EditForm = {
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  email: string;
};

function EditModal({
  user,
  onSave,
  onClose,
}: {
  user: AdminUser;
  onSave: (data: EditForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EditForm>({
    firstName:   user.firstName,
    lastName:    user.lastName,
    middleName:  user.middleName,
    phoneNumber: user.phoneNumber,
    email:       user.email,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  function set(field: keyof EditForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-profile-modal" role="dialog" aria-modal="true" aria-label="Foydalanuvchini tahrirlash">
      <article className="admin-profile-modal__card">
        <div className="admin-profile-modal__header">
          <strong style={{ fontSize: "var(--adm-fs-sub)", color: "#0f172a" }}>
            Ma'lumotlarni tahrirlash
          </strong>
          <button type="button" onClick={onClose} aria-label="Yopish">
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
          {error && <p className="admin-message" role="alert">{error}</p>}

          <div className="admin-form-grid">
            {(
              [
                { field: "firstName",   label: "Ism" },
                { field: "lastName",    label: "Familiya" },
                { field: "middleName",  label: "Sharif" },
                { field: "phoneNumber", label: "Telefon" },
              ] as { field: keyof EditForm; label: string }[]
            ).map(({ field, label }) => (
              <label key={field} style={{ display: "grid", gap: "6px", fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155" }}>
                {label}
                <input
                  type="text"
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value)}
                  required={field !== "middleName"}
                  style={{ width: "100%", minHeight: "42px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 12px", font: "inherit", fontSize: "var(--adm-fs-body)" }}
                />
              </label>
            ))}
          </div>

          <label style={{ display: "grid", gap: "6px", fontSize: "var(--adm-fs-sm)", fontWeight: 800, color: "#334155" }}>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              style={{ width: "100%", minHeight: "42px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0 12px", font: "inherit", fontSize: "var(--adm-fs-body)" }}
            />
          </label>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ minHeight: "42px", padding: "0 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-body)" }}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ minHeight: "42px", padding: "0 20px", border: "none", borderRadius: "8px", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)" }}
            >
              {saving ? "Saqlanmoqda…" : "Saqlash"}
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ user, onConfirm, onClose }: {
  user: AdminUser;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try { await onConfirm(); onClose(); }
    finally { setLoading(false); }
  }

  return (
    <div className="admin-profile-modal" role="dialog" aria-modal="true" aria-label="O'chirishni tasdiqlash">
      <article className="admin-profile-modal__card" style={{ maxWidth: "420px" }}>
        <div className="admin-profile-modal__header">
          <strong style={{ fontSize: "var(--adm-fs-sub)", color: "#be123c" }}>
            Foydalanuvchini o'chirish
          </strong>
          <button type="button" onClick={onClose} aria-label="Yopish">
            <Icon name="close" />
          </button>
        </div>

        <p style={{ margin: "18px 0 24px", color: "#334155", fontSize: "var(--adm-fs-body)", lineHeight: 1.6 }}>
          <strong>{user.firstName} {user.lastName}</strong> ({user.email}) foydalanuvchisini{" "}
          <strong style={{ color: "#be123c" }}>butunlay o'chirasizmi?</strong> Bu amal qaytarib bo'lmaydi.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button" onClick={onClose}
            style={{ minHeight: "42px", padding: "0 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", fontWeight: 800, fontSize: "var(--adm-fs-body)" }}
          >
            Bekor qilish
          </button>
          <button
            type="button" onClick={handle} disabled={loading}
            style={{ minHeight: "42px", padding: "0 20px", border: "none", borderRadius: "8px", background: "#be123c", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: "var(--adm-fs-body)" }}
          >
            {loading ? "O'chirilmoqda…" : "Ha, o'chirish"}
          </button>
        </div>
      </article>
    </div>
  );
}

// ─── Profile view modal ───────────────────────────────────────────────────────

function ProfileModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  return (
    <div className="admin-profile-modal" role="dialog" aria-modal="true">
      <article className="admin-profile-modal__card">
        <div className="admin-profile-modal__header">
          <div className="admin-user-cell">
            <span className="admin-user-cell__avatar">{getInitials(user)}</span>
            <span>
              <strong>{user.firstName} {user.lastName}</strong>
              <small>{user.email}</small>
            </span>
          </div>
          <button type="button" onClick={onClose} aria-label="Yopish">
            <Icon name="close" />
          </button>
        </div>

        <dl className="admin-profile-modal__details">
          {[
            { label: "Ism",                value: user.firstName },
            { label: "Familiya",           value: user.lastName },
            { label: "Sharifi",            value: user.middleName || "—" },
            { label: "Telefon",            value: user.phoneNumber },
            { label: "Email",              value: user.email },
            { label: "Status",             value: user.status },
            { label: "Ro'yxatdan o'tgan",  value: formatDate(user.createdAt) },
            { label: "Blok muddati",       value: user.blockedUntil ? `${formatDate(user.blockedUntil)} gacha` : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </article>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type AdminUsersTableProps = {
  users: AdminUser[];
  onUpdateStatus: (userId: string, status: UserStatus, blockedUntil?: string) => void;
  onEditUser: (userId: string, data: EditForm) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
};

type Modal =
  | { type: "view";     user: AdminUser }
  | { type: "edit";     user: AdminUser }
  | { type: "delete";   user: AdminUser };

function AdminUsersTable({
  users,
  onUpdateStatus,
  onEditUser,
  onDeleteUser,
}: AdminUsersTableProps) {
  const [modal, setModal]   = useState<Modal | null>(null);
  const [search, setSearch] = useState("");

  function blockTemporarily(userId: string) {
    const blockedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    onUpdateStatus(userId, "temporary_blocked", blockedUntil);
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phoneNumber.includes(q)
    );
  });

  return (
    <>
      <section className="admin-table-section" id="users">
        <AdminSectionTitle
          title="Foydalanuvchilar ro'yxati"
          description="Yangi ro'yxatdan o'tganlar birinchi qatorda ko'rinadi."
          meta={`${filtered.length} / ${users.length} ta`}
        />

        {/* ── Search bar ── */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0" }}>
          <label style={{ position: "relative", display: "flex", alignItems: "center", maxWidth: "400px" }}>
            <span style={{ position: "absolute", left: "12px", color: "#94a3b8", display: "grid", placeItems: "center", width: "18px", height: "18px" }}>
              <Icon name="search" />
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

        {/* ── Table ── */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Ism / Foydalanuvchi</th>
                <th>Familiya</th>
                <th>Sharifi</th>
                <th>Telefon</th>
                <th>Email</th>
                <th>Status</th>
                <th>Ro'yxatdan o'tgan</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, index) => (
                <tr key={user.id}>
                  {/* № */}
                  <td>
                    <span className="admin-row-number">{index + 1}</span>
                  </td>

                  {/* Name cell */}
                  <td>
                    <div className="admin-user-cell">
                      <span className="admin-user-cell__avatar">{getInitials(user)}</span>
                      <span>
                        <strong>{user.firstName}</strong>
                        <small>O'quvchi</small>
                      </span>
                    </div>
                  </td>

                  <td>{user.lastName}</td>
                  <td>{user.middleName || "—"}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.email}</td>

                  {/* Status */}
                  <td><StatusBadge status={user.status} /></td>

                  <td>{formatDate(user.createdAt)}</td>

                  {/* Actions */}
                  <td>
                    <div className="admin-user-actions">
                      {/* Ko'rish */}
                      <button type="button" title="Profilni ko'rish" aria-label="Profilni ko'rish"
                        onClick={() => setModal({ type: "view", user })}>
                        <Icon name="view" />
                      </button>

                      {/* Tahrirlash */}
                      <button type="button" title="Tahrirlash" aria-label="Tahrirlash"
                        onClick={() => setModal({ type: "edit", user })}>
                        <Icon name="edit" />
                      </button>

                      {/* Vaqtincha bloklash */}
                      <button type="button" title="Vaqtincha bloklash (7 kun)" aria-label="Vaqtincha bloklash"
                        onClick={() => blockTemporarily(user.id)}>
                        <Icon name="temporary" />
                      </button>

                      {/* Bloklash / Blokdan chiqarish */}
                      {user.status === "active" ? (
                        <button
                          type="button" title="Butunlay bloklash" aria-label="Butunlay bloklash"
                          className="admin-user-actions__danger"
                          onClick={() => onUpdateStatus(user.id, "blocked")}>
                          <Icon name="block" />
                        </button>
                      ) : (
                        <button
                          type="button" title="Blokdan chiqarish" aria-label="Blokdan chiqarish"
                          onClick={() => onUpdateStatus(user.id, "active")}>
                          <Icon name="unblock" />
                        </button>
                      )}

                      {/* O'chirish */}
                      <button
                        type="button" title="O'chirish" aria-label="O'chirish"
                        className="admin-user-actions__danger"
                        onClick={() => setModal({ type: "delete", user })}>
                        <Icon name="delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="admin-dashboard-empty">
                      <strong>
                        {search ? "Qidiruv bo'yicha natija topilmadi" : "Hozircha foydalanuvchi yo'q"}
                      </strong>
                      <span>
                        {search ? `"${search}" — boshqa so'z bilan qidiring` : "Ro'yxatdan o'tganlar shu yerda paydo bo'ladi."}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Modals ── */}
      {modal?.type === "view" && (
        <ProfileModal user={modal.user} onClose={() => setModal(null)} />
      )}

      {modal?.type === "edit" && (
        <EditModal
          user={modal.user}
          onSave={(data) => onEditUser(modal.user.id, data)}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteModal
          user={modal.user}
          onConfirm={() => onDeleteUser(modal.user.id)}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

export default AdminUsersTable;
