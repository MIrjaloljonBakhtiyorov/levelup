import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import { clearUserSession, getUserProfile } from "../../features/auth/services/userSession";
import { useHomeI18n, type HomeLanguage } from "../../features/home/i18n/HomeI18n";
import "./Navbar.css";

type NavigationItem = {
  label: string;
  path: string;
};

const navigationItems: NavigationItem[] = [
  { label: "Home",    path: "/" },
  { label: "Free Test",        path: "/#tests" },
  { label: "Teachers",  path: "/#teachers" },
  { label: "Free lessons",  path: "/#free-lessons" },
  { label: "Partners",      path: "/#partners" },
];

function Navbar() {
  const location = useLocation();
  const { language, setLanguage, t } = useHomeI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(() => getUserProfile());
  const languages: { code: HomeLanguage; label: string; short: string }[] = [
    { code: "uz", label: "O‘zbekcha", short: "UZ" },
    { code: "ru", label: "Русский", short: "RU" },
    { code: "en", label: "English", short: "EN" },
  ];

  useEffect(() => {
    function closeLanguage(event: PointerEvent) {
      if (!(event.target as HTMLElement).closest(".navbar-language")) {
        setIsLanguageOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeLanguage);
    return () => document.removeEventListener("pointerdown", closeLanguage);
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function toggleMenu() {
    setIsMenuOpen((currentState) => !currentState);
  }

  function logoutUser() {
    clearUserSession();
    setUserProfile(null);
    closeMenu();
  }

  function isActiveItem(path: string) {
    const [pathname, hash = ""] = path.split("#");
    if (location.pathname !== pathname) return false;
    return hash ? location.hash === `#${hash}` : !location.hash;
  }

  function languagePicker(mobile = false) {
    const selected = languages.find((item) => item.code === language) ?? languages[2];
    return (
      <div className={`navbar-language ${mobile ? "navbar-language--mobile" : ""}`}>
        <button
          className="navbar-language__trigger"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isLanguageOpen}
          onClick={() => setIsLanguageOpen((current) => !current)}
        >
          <span>{t("Language")}</span>
          <strong>{selected.short}</strong>
          <i aria-hidden="true" />
        </button>
        {isLanguageOpen && (
          <div className="navbar-language__menu" role="listbox" aria-label={t("Language")}>
            {languages.map((item) => (
              <button
                type="button"
                role="option"
                aria-selected={language === item.code}
                className={language === item.code ? "is-selected" : ""}
                key={item.code}
                onClick={() => {
                  setLanguage(item.code);
                  setIsLanguageOpen(false);
                }}
              >
                <b>{item.short}</b>
                <span>{item.label}</span>
                <i aria-hidden="true">✓</i>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const authActions = userProfile ? (
    <>
      <span className="navbar-user">{userProfile.firstName}</span>

      <button className="navbar-login" type="button" onClick={logoutUser}>
        {t("Chiqish")}
      </button>
    </>
  ) : (
    <>
      <Link
        className="navbar-login"
        to="/login"
        onClick={closeMenu}
      >
        {t("Sign in")}
      </Link>

      <Link
        className="navbar-start-button"
        to="/register"
        onClick={closeMenu}
      >
        {t("Sign up")}
      </Link>
    </>
  );

  return (
    <header className="site-header">
      <div className="navbar-container">
        <Link
          className="navbar-brand"
          to="/"
          aria-label="LevelUp bosh sahifasi"
          onClick={closeMenu}
        >
          <span className="navbar-brand__icon" aria-hidden="true">
            <span className="navbar-brand__book-line" />
            <span className="navbar-brand__book-line" />
            <span className="navbar-brand__book-line" />
          </span>

          <span className="navbar-brand__name">LevelUp</span>
        </Link>

        <nav
          className={`navbar-menu ${
            isMenuOpen ? "navbar-menu--open" : ""
          }`}
          aria-label="Asosiy navigatsiya"
        >
          <div className="navbar-menu__links">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`navbar-menu__link ${isActiveItem(item.path) ? "navbar-menu__link--active" : ""}`}
                aria-current={isActiveItem(item.path) ? "page" : undefined}
              >
                {t(item.label)}
              </Link>
            ))}
          </div>

          {languagePicker(true)}

          <div className="navbar-menu__mobile-actions">{authActions}</div>
        </nav>

        {languagePicker()}

        <div className="navbar-actions">{authActions}</div>

        <button
          className={`navbar-toggle ${
            isMenuOpen ? "navbar-toggle--open" : ""
          }`}
          type="button"
          aria-label="Navigatsiya menyusini ochish"
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
