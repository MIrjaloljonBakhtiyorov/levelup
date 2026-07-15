import { useState } from "react";
import { useHomeI18n } from "../i18n/HomeI18nContext";
import "./HeroSection.css";

const CARDS = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    title: "IELTS Preparation",
    desc: "Prepare for Reading, Listening, Writing, and Speaking with exam-style practice, mock tests, and clear progress tracking.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: "MULTILEVEL Program",
    desc: "Improve your English from A1 to C1 through level-based lessons, practical exercises, and structured skill development.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    title: "Smart Mock Tests",
    desc: "Take realistic practice tests, review your answers, identify weak areas, and understand exactly where to improve.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Personal Study Plan",
    desc: "Follow a study plan tailored to your level, target score, available time, and learning goals.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: "Mentor Support",
    desc: "Learn with expert guidance, receive feedback, ask questions, and stay motivated throughout your English journey.",
  },
];

function HeroSection() {
  const { t } = useHomeI18n();
  const [idx, setIdx] = useState(0);

  const total = CARDS.length;
  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  const visible = [0, 1, 2].map((offset) => CARDS[(idx + offset) % total]);

  return (
    <section className="hero-v2">
      {/* Video background */}
      <video
        className="hero-v2__video"
        src="/course-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      {/* Dark overlay */}
      <div className="hero-v2__overlay" aria-hidden="true" />

      {/* Content */}
      <div className="hero-v2__content">
        <p className="hero-v2__sub">
          {t("MASTER ENGLISH WITH A CLEAR, PRACTICAL, AND RESULTS-FOCUSED APPROACH.")}
        </p>
        <h1 className="hero-v2__title">
          {t("LEVELUP — MOVE TO THE NEXT LEVEL IN ENGLISH")}
        </h1>
        <p className="hero-v2__desc">
          {t("Build your English skills through IELTS, CEFR, and general English tests, practical lessons, mentor support, and a personalized study plan designed to help you reach your goals step by step.")}
        </p>
        <a href="/register" className="hero-v2__btn">
          {t("Join")}
        </a>
      </div>

      {/* Cards slider */}
      <div className="hero-v2__cards-wrap">
        <button className="hero-v2__arrow" onClick={prev} aria-label={t("Previous")}>
          &#8249;
        </button>

        <div className="hero-v2__cards">
          {visible.map((card, i) => (
            <article className={`hero-v2__card${i === 1 ? " hero-v2__card--active" : ""}`} key={i}>
              <span className="hero-v2__card-icon">{card.icon}</span>
              <h3 className="hero-v2__card-title">{t(card.title)}</h3>
              <p className="hero-v2__card-desc">{t(card.desc)}</p>
            </article>
          ))}
        </div>

        <button className="hero-v2__arrow" onClick={next} aria-label={t("Next")}>
          &#8250;
        </button>
      </div>
    </section>
  );
}

export default HeroSection;
