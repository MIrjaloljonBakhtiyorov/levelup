type AdminHeaderProps = {
  onLogout: () => void;
};

function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div>
        <span>Admin panel</span>
        <h1>Ro‘yxatdan o‘tgan foydalanuvchilar</h1>
        <p>Foydalanuvchilar holati va kurs menyularini bitta joydan boshqaring.</p>
      </div>

      <button type="button" onClick={onLogout}>
        Chiqish
      </button>
    </header>
  );
}

export default AdminHeader;
