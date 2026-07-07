import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";

import "./FinalCtaSection.css";

function FinalCtaSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setMessage("To‘g‘ri email manzilini kiriting.");
      return;
    }

    setMessage("Obuna muvaffaqiyatli qabul qilindi.");
    setEmail("");
  }

  return (
    <section className="final-cta">
      <div className="final-cta__grid" />

      <div className="final-cta__container">
        <div className="final-cta__content">
          <span className="final-cta__eyebrow">
            Bepul diagnostik test
          </span>

          <h2>
            Maqsad ballingiz
            <span> siz o‘ylagandan yaqinroq</span>
          </h2>

          <p>
            Bepul diagnostik testdan o‘ting va siz uchun mos
            individual tayyorgarlik rejasini oling.
          </p>

          <Link className="final-cta__button" to="/tests">
            Bepul testni boshlash
          </Link>

          <div className="final-cta__security">
            <span aria-hidden="true">♙</span>
            <span>Karta ma’lumotlari talab qilinmaydi</span>
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
            <span>Your Goal</span>
            <strong>7.5</strong>
            <small>You can do it!</small>
          </div>

          <div className="cta-books">
            <div className="cta-book cta-book--one">
              IELTS ACADEMIC
            </div>

            <div className="cta-book cta-book--two">
              GRAMMAR IN USE
            </div>

            <div className="cta-book cta-book--three">
              VOCABULARY
            </div>
          </div>

          <span className="cta-particle cta-particle--one" />
          <span className="cta-particle cta-particle--two" />
          <span className="cta-particle cta-particle--three" />
        </div>

        <div className="final-cta__subscribe">
          <div>
            <span className="final-cta__subscribe-label">
              Yangiliklar va foydali maslahatlar
            </span>

            <h3>Ta’lim yangiliklarini o‘tkazib yubormang</h3>
          </div>

          <form
            className="final-cta__form"
            onSubmit={handleSubscribe}
            noValidate
          >
            <label htmlFor="newsletter-email">
              Email manzilingiz
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

              <button type="submit">Obuna bo‘lish</button>
            </div>

            {message && (
              <p className="final-cta__form-message">{message}</p>
            )}
          </form>

          <label className="final-cta__language">
            <span>Til</span>

            <select defaultValue="uz">
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
