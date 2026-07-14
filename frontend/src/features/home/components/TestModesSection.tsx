import "./TestModesSection.css";
import { useNavigate } from "react-router";
import { useHomeI18n } from "../i18n/HomeI18n";

const waveformBars = [
  10, 17, 25, 15, 34, 23, 40, 18, 30, 45, 22, 37, 16, 28, 43, 21, 35,
  14, 25, 39, 18, 31, 23, 42, 17, 29, 38, 20,
];

function ListeningCard() {
  const { t } = useHomeI18n();

  return (
    <article className="test-mode-card test-mode-card--listening">
      <header className="test-mode-card__header">
        <div className="test-mode-card__title">
          <span className="test-mode-card__number test-mode-card__number--purple">
            1
          </span>

          <h2>{t("IELTS Listening")}</h2>
        </div>

        <span className="test-mode-card__badge">{t("Audio")}</span>
      </header>

      <div className="listening-preview">
        <div className="listening-preview__headphones" aria-hidden="true">
          <svg viewBox="0 0 120 132" role="presentation">
            <defs>
              <linearGradient id="headphone-band" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="1" stopColor="#5b35d5" />
              </linearGradient>
              <linearGradient id="headphone-cup" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8b7cf0" />
                <stop offset="0.58" stopColor="#654bd4" />
                <stop offset="1" stopColor="#382694" />
              </linearGradient>
              <filter id="headphone-shadow" x="-30%" y="-30%" width="160%" height="180%">
                <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#4633a8" floodOpacity=".25" />
              </filter>
            </defs>
            <path className="headphone-svg__band" d="M21 71V55C21 27 37 11 60 11s39 16 39 44v16" />
            <path className="headphone-svg__band-shine" d="M29 56c0-23 12-36 31-36 13 0 23 7 28 19" />
            <g filter="url(#headphone-shadow)">
              <path className="headphone-svg__cup" d="M15 64c0-8 5-13 12-12l10 2c6 1 9 6 8 12l-6 43c-1 7-6 11-12 10l-10-2c-7-1-10-6-9-13l7-40Z" />
              <path className="headphone-svg__cup" d="M105 64c0-8-5-13-12-12l-10 2c-6 1-9 6-8 12l6 43c1 7 6 11 12 10l10-2c7-1 10-6 9-13l-7-40Z" />
              <path className="headphone-svg__cushion" d="M20 67 14 103c-1 5 1 8 6 9" />
              <path className="headphone-svg__cushion" d="m100 67 6 36c1 5-1 8-6 9" />
            </g>
          </svg>
        </div>

        <div className="listening-preview__content">
          <div className="listening-preview__wave">
            {waveformBars.map((height, index) => (
              <span
                key={`${height}-${index}`}
                style={{ height: `${height}px` }}
              />
            ))}
          </div>

          <div className="listening-preview__player">
            <span>00:42</span>

            <div className="listening-preview__controls">
              <button
                className="listening-preview__play"
                type="button"
                aria-label={t("Play audio")}
              >
                &#9654;
              </button>
            </div>

            <strong>30:00</strong>
          </div>

          <div className="listening-question">
            <span>{t("Question 37 / 40")}</span>

            <p>{t("What does the speaker say about the new language course?")}</p>

            <label>
              <input type="radio" name="demo-listening" />
              <span>{t("A. It is suitable for beginners only.")}</span>
            </label>

            <label>
              <input type="radio" name="demo-listening" />
              <span>{t("B. It includes both lessons and practice tests.")}</span>
            </label>

            <label className="listening-question__selected">
              <input
                type="radio"
                name="demo-listening"
                defaultChecked
              />
              <span>{t("C. It requires previous exam experience.")}</span>
            </label>
          </div>
        </div>
      </div>

      <button className="test-mode-card__button test-mode-card__button--purple">
        {t("Start Listening Test")}
      </button>
    </article>
  );
}

function ReadingCard() {
  const { t } = useHomeI18n();

  return (
    <article className="test-mode-card test-mode-card--reading">
      <header className="test-mode-card__header">
        <div className="test-mode-card__title">
          <span className="test-mode-card__number test-mode-card__number--blue">
            2
          </span>

          <h2>{t("IELTS Reading")}</h2>
        </div>

        <span className="test-mode-card__time">
          <span aria-hidden="true">&#9711;</span>
          60:00
        </span>
      </header>

      <div className="reading-preview">
        <div className="reading-document">
          <span className="reading-document__sheet reading-document__sheet--back" />
          <span className="reading-document__sheet reading-document__sheet--middle" />

          <div className="reading-document__sheet reading-document__sheet--front">
            <strong>{t("The Future of Urban Transport")}</strong>

            <p>
              {t("Cities are transforming the way people travel by developing cleaner, smarter, and more reliable transport systems.")}
            </p>

            <span className="reading-document__line reading-document__line--long" />
            <span className="reading-document__line" />
            <span className="reading-document__line reading-document__line--short" />
          </div>
        </div>

        <div className="reading-pagination" aria-label={t("Reading pages")}>
          <button type="button">19</button>
          <button className="reading-pagination__active" type="button">
            20
          </button>
          <button type="button">21</button>
          <button type="button">22</button>
        </div>
      </div>

      <button className="test-mode-card__button test-mode-card__button--blue">
        <a href="" className="test-mode-card__link">
          {t("Start Reading Test")}
        </a>
      </button>
    </article>
  );
}

function MockTestCard() {
  const { t } = useHomeI18n();
  const sections = [
    {
      name: "Listening",
      duration: "30 minutes",
    },
    {
      name: "Reading",
      duration: "60 minutes",
    },
    {
      name: "Writing",
      duration: "60 minutes",
    },
    {
      name: "Speaking",
      duration: "11–14 minutes",
    },
  ];

  return (
    <article className="test-mode-card test-mode-card--mock">
      <header className="test-mode-card__header">
        <div className="test-mode-card__title">
          <span className="test-mode-card__number test-mode-card__number--green">
            3
          </span>

          <h2>{t("Full Mock Exam")}</h2>
        </div>

        <span className="test-mode-card__time">
          <span aria-hidden="true">&#9711;</span>
          2:54:00
        </span>
      </header>

      <div className="mock-preview">
        <div className="mock-preview__details">
          <div className="mock-date">
            <span className="mock-date__icon" aria-hidden="true">
              &#9635;
            </span>

            <div>
              <strong>{t("All mock tests reviewed by a professional teacher.")}</strong>
            </div>
          </div>

          <div className="mock-sections">
            {sections.map((section) => (
              <div className="mock-section" key={section.name}>
                <span>{t(section.name)}</span>

                <div>
                  <small>{t(section.duration)}</small>
                  <strong aria-label={t("Ready")}>&#10003;</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mock-score">
          <div className="mock-score__ring">
            <div>
              <span>{t("Estimated band")}</span>
              <strong>8.0</strong>
            </div>
          </div>
        </div>
      </div>

      <button className="test-mode-card__button test-mode-card__button--green">
        {t("Start Free Mock Test")}
      </button>
    </article>
  );
}

const examPrograms = [
  {
    code: "CEFR",
    title: "CEFR Multilevel Exam",
    description: "Determine your English level from A2 to C1 with a complete four-skill assessment.",
    duration: "2 h 45 min",
    questions: "4 skills",
    score: "A2–C1",
    sections: ["Listening", "Reading", "Writing", "Speaking"],
    accent: "cefr",
  },
  {
    code: "SAT",
    title: "Digital SAT Exam",
    description: "Practice the adaptive Digital SAT format with academic reading, writing, and math tasks.",
    duration: "2 h 14 min",
    questions: "98 questions",
    score: "1600",
    sections: ["Reading & Writing", "Math", "Module 1", "Module 2"],
    accent: "sat",
  },
  {
    code: "TOEFL",
    title: "TOEFL iBT Exam",
    description: "Build the academic English skills required for the complete TOEFL internet-based test.",
    duration: "2 hours",
    questions: "4 sections",
    score: "120",
    sections: ["Reading", "Listening", "Speaking", "Writing"],
    accent: "toefl",
  },
] as const;

function ExamProgramCard({ exam }: { exam: (typeof examPrograms)[number] }) {
  const { t } = useHomeI18n();
  const navigate = useNavigate();

  return (
    <article className={`exam-program-card exam-program-card--${exam.accent}`}>
      <header className="exam-program-card__header">
        <span className="exam-program-card__code">{exam.code}</span>
        <span className="exam-program-card__duration">{t(exam.duration)}</span>
      </header>

      <h3>{t(exam.title)}</h3>
      <p>{t(exam.description)}</p>

      <div className="exam-program-card__visual">
        <div className="exam-program-card__score">
          <small>{t("Max score")}</small>
          <strong>{exam.score}</strong>
        </div>
        <div className="exam-program-card__sections">
          {exam.sections.map((section, index) => (
            <span key={section}>
              <i>{index + 1}</i>
              {t(section)}
            </span>
          ))}
        </div>
      </div>

      <footer className="exam-program-card__footer">
        <span>{t(exam.questions)}</span>
        <button type="button" onClick={() => navigate("/login")}>{t("Start Exam")}</button>
      </footer>
    </article>
  );
}

function TestModesSection() {
  const { t } = useHomeI18n();

  return (
    <section className="test-modes-section" id="tests">
      <div className="test-modes-section__heading">
        <span>{t("PREPARE WITH REAL EXAM-STYLE TESTS")}</span>
        <h2>{t("Main Test Modes")}</h2>
        <p>
          {t("Assess your level through Listening, Reading, and full mock exams, identify your weak areas, and move to the next stage with a clear study plan.")}
        </p>
      </div>

      <div className="test-modes-section__container">
        <ListeningCard />
        <ReadingCard />
        <MockTestCard />
      </div>

      <div className="exam-programs">
        <div className="exam-programs__grid">
          {examPrograms.map((exam) => (
            <ExamProgramCard exam={exam} key={exam.code} />
          ))}
        </div>
      </div>

    </section>
  );
}

export default TestModesSection;
