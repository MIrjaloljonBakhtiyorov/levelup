import { useEffect, useRef, useState } from "react";

import { useUserI18n, type UserLanguage } from "../i18n/UserI18n";

type UserTopbarProps = {
  onOpenMenu: () => void;
};

const languages: { code: UserLanguage; label: string; shortLabel: string }[] = [
  { code: "uz", label: "O'zbek", shortLabel: "UZ" },
  { code: "ru", label: "Русский", shortLabel: "RU" },
  { code: "en", label: "English", shortLabel: "EN" },
];

function UserTopbar({ onOpenMenu }: UserTopbarProps) {
  const { language, setLanguage } = useUserI18n();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const activeLanguage = languages.find((item) => item.code === language) ?? languages[0];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!languageRef.current?.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLanguageOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleLanguageChange(nextLanguage: UserLanguage) {
    setLanguage(nextLanguage);
    setIsLanguageOpen(false);
  }

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
        <div className="user-language-switcher" ref={languageRef}>
          <button
            className="user-language-switcher__trigger"
            type="button"
            aria-expanded={isLanguageOpen}
            aria-haspopup="listbox"
            aria-label="Til"
            onClick={() => setIsLanguageOpen((current) => !current)}
          >
            <span className="user-language-switcher__label">Til</span>
            <strong>{activeLanguage.label}</strong>
            <i aria-hidden="true">{activeLanguage.shortLabel}</i>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="M6 8l4 4 4-4" />
            </svg>
          </button>

          {isLanguageOpen && (
            <div className="user-language-switcher__menu" role="listbox" aria-label="Til">
              {languages.map((item) => (
                <button
                  className={item.code === language ? "is-active" : ""}
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={item.code === language}
                  onClick={() => handleLanguageChange(item.code)}
                >
                  <span>{item.shortLabel}</span>
                  <strong>{item.label}</strong>
                </button>
              ))}
            </div>
          )}
        </div>
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
