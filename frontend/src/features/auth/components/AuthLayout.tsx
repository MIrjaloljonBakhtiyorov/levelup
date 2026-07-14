import { useEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router";

import { type HomeLanguage, useHomeI18n } from "../../home/i18n/HomeI18n";
import "../styles/auth.css";

function AuthLayout() {
  const { language, setLanguage, t } = useHomeI18n();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const languages: { code: HomeLanguage; short: string; label: string }[] = [
    { code: "uz", short: "UZ", label: "O‘zbekcha" },
    { code: "ru", short: "RU", label: "Русский" },
    { code: "en", short: "EN", label: "English" },
  ];
  const selectedLanguage = languages.find((item) => item.code === language) ?? languages[2];

  useEffect(() => {
    function closeLanguageMenu(event: PointerEvent) {
      if (!languageRef.current?.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeLanguageMenu);
    return () => document.removeEventListener("pointerdown", closeLanguageMenu);
  }, []);

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="auth-showcase__top">
          <Link className="auth-brand" to="/" aria-label={t("LevelUp home page")}>
            <span className="auth-brand__icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>

            <span>LevelUp</span>
          </Link>

          <div className="auth-language" ref={languageRef}>
            <button
              className="auth-language__trigger"
              type="button"
              aria-label={t("Language")}
              aria-haspopup="listbox"
              aria-expanded={isLanguageOpen}
              onClick={() => setIsLanguageOpen((current) => !current)}
            >
              <b>{selectedLanguage.short}</b>
              <span>{selectedLanguage.label}</span>
              <i aria-hidden="true" />
            </button>

            {isLanguageOpen && (
              <div className="auth-language__menu" role="listbox" aria-label={t("Language")}>
                {languages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    role="option"
                    aria-selected={language === item.code}
                    className={language === item.code ? "is-selected" : ""}
                    onClick={() => {
                      setLanguage(item.code);
                      setIsLanguageOpen(false);
                    }}
                  >
                    <b>{item.short}</b>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="auth-showcase__content">
          <span className="auth-showcase__badge">
            {t("AI-powered learning platform")}
          </span>

          <h1>
            {t("Reach your target score")}
            <span>{t("with a smarter plan")}</span>
          </h1>

          <p>
            {t("IELTS and Multilevel tests, personalized study plans, and expert mentors in one platform.")}
          </p>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <span>✓</span>
              <p>{t("Personalized study plan")}</p>
            </div>

            <div className="auth-benefit">
              <span>✓</span>
              <p>{t("Real exam-style practice tests")}</p>
            </div>

            <div className="auth-benefit">
              <span>✓</span>
              <p>{t("Smart performance analytics")}</p>
            </div>
          </div>
        </div>

        <div className="auth-decoration auth-decoration--one" />
        <div className="auth-decoration auth-decoration--two" />
        <div className="auth-decoration auth-decoration--three" />

        <p className="auth-showcase__footer">
          {t("© 2026 LevelUp. All rights reserved.")}
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-card">
          <Outlet />
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
