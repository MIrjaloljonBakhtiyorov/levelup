type UserTopbarProps = {
  onOpenMenu: () => void;
};

function UserTopbar({ onOpenMenu }: UserTopbarProps) {
  return (
    <header className="user-topbar">
      <button className="user-topbar__menu" type="button" onClick={onOpenMenu} aria-label="Menyuni ochish">
        <span/>
        <span/>
        <span/>
      </button>

      <label className="user-search">
        <span>Qidirish</span>
        <div className="user-search__control">
          <input placeholder="Dars, test yoki mentor qidiring" type="search" />
          <kbd>Ctrl K</kbd>
        </div>
      </label>

      <div className="user-topbar__actions">
        <button className="user-icon-btn" type="button" aria-label="Bildirishnomalar">
          <i aria-hidden="true" />
          <span>3</span>
        </button>
        <span className="user-plan-badge">
          <small>Plan</small>
          Premium
        </span>
        <button className="user-upgrade-btn" type="button">Upgrade</button>
        <div className="user-profile-chip">
          <span>MB</span>
          <div>
            <strong>Mirjalol</strong>
            <small>Student</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default UserTopbar;
