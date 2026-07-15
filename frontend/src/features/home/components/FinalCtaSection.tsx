import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";

import { useHomeI18n, type HomeLanguage } from "../i18n/HomeI18nContext";
import "./FinalCtaSection.css";

function FinalCtaSection() {
  const { language, setLanguage, t } = useHomeI18n();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setMessage(t("Enter a valid email address."));
      return;
    }

    setMessage(t("Subscription received successfully."));
    setEmail("");
  }

  return (
    <section className="final-cta">
      <div className="final-cta__grid" />

      <div className="final-cta__container">
        <div className="final-cta__content">
          <span className="final-cta__eyebrow">
            {t("Free diagnostic test")}
          </span>

          <h2>
            {t("Your target score")}
            <span>{t(" is closer than you think")}</span>
          </h2>

          <p>
            {t("Take a free diagnostic test and get an individual preparation plan that fits you.")}
          </p>

          <Link className="final-cta__button" to="/tests">
            {t("Start free test")}
          </Link>

          <div className="final-cta__security">
            <span aria-hidden="true">♙</span>
            <span>{t("No card details required")}</span>
          </div>
        </div>

        <div className="final-cta__visual" aria-hidden="true">
          <div className="cta-orbit cta-orbit--outer" />
          <div className="cta-orbit cta-orbit--inner" />

          <div className="cta-globe">
            <span className="cta-globe__line cta-globe__line--one" />
            <span className="cta-globe__line cta-globe__line--two" />
            <span className="cta-globe__line cta-globe__line--three" />
          </div>

          <div className="cta-cap">
            <span className="cta-cap__top" />
            <span className="cta-cap__base" />
            <span className="cta-cap__rope" />
          </div>

          <div className="cta-score-card">
            <span>{t("Your Goal")}</span>
            <strong>7.5</strong>
            <small>{t("You can do it!")}</small>
          </div>

          <div className="cta-books">
            <div className="cta-book cta-book--one">
              {t("IELTS ACADEMIC")}
            </div>

            <div className="cta-book cta-book--two">
              {t("GRAMMAR IN USE")}
            </div>

            <div className="cta-book cta-book--three">
              {t("VOCABULARY")}
            </div>
          </div>

          <span className="cta-particle cta-particle--one" />
          <span className="cta-particle cta-particle--two" />
          <span className="cta-particle cta-particle--three" />
        </div>

        <div className="final-cta__subscribe">
          <div>
            <span className="final-cta__subscribe-label">
              {t("News and useful tips")}
            </span>

            <h3>{t("Do not miss education updates")}</h3>
          </div>

          <form
            className="final-cta__form"
            onSubmit={handleSubscribe}
            noValidate
          >
            <label htmlFor="newsletter-email">
              {t("Your email address")}
            </label>

            <div className="final-cta__form-row">
              <input
                id="newsletter-email"
                type="email"
                value={email}
                placeholder="example@email.com"
                autoComplete="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setMessage("");
                }}
              />

              <button type="submit">{t("Subscribe")}</button>
            </div>

            {message && (
              <p className="final-cta__form-message">{message}</p>
            )}
          </form>

          <label className="final-cta__language">
            <span>{t("Language")}</span>

            <select value={language} onChange={(event) => setLanguage(event.target.value as HomeLanguage)}>
              <option value="uz">🇺🇿 O‘zbekcha</option>
              <option value="en">🇬🇧 English</option>
              <option value="ru">🇷🇺 Русский</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}

export default FinalCtaSection;
