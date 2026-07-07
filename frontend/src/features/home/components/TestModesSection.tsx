import "./TestModesSection.css";

const waveformBars = [
  10, 17, 25, 15, 34, 23, 40, 18, 30, 45, 22, 37, 16, 28, 43, 21, 35,
  14, 25, 39, 18, 31, 23, 42, 17, 29, 38, 20,
];

const freeTests = [
  {
    name: "Multilevel",
    code: "CEFR",
    description: "A2 dan C1 gacha darajani aniqlash uchun bepul sinov.",
    duration: "90 daq",
    questions: "60 savol",
    accent: "green",
  },
  {
    name: "IELTS",
    code: "IELTS",
    description: "Listening, Reading, Writing va Speaking formatidagi testlar.",
    duration: "2:45 soat",
    questions: "4 bo‘lim",
    accent: "blue",
  },
  {
    name: "TOEFL",
    code: "TOEFL",
    description: "Akademik ingliz tili uchun internet-based test namunasi.",
    duration: "2 soat",
    questions: "4 bo‘lim",
    accent: "purple",
  },
  {
    name: "SAT",
    code: "SAT",
    description: "Reading, Writing va Math bo‘yicha diagnostik topshiriqlar.",
    duration: "75 daq",
    questions: "45 savol",
    accent: "orange",
  },
  {
    name: "Duolingo",
    code: "DET",
    description: "Tezkor adaptiv test va interaktiv speaking-writing mashqlari.",
    duration: "45 daq",
    questions: "Adaptiv",
    accent: "lime",
  },
];

function ListeningCard() {
  return (
    <article className="test-mode-card test-mode-card--listening">
      <header className="test-mode-card__header">
        <div className="test-mode-card__title">
          <span className="test-mode-card__number test-mode-card__number--purple">
            1
          </span>

          <h2>IELTS Tinglash</h2>
        </div>

        <span className="test-mode-card__badge">Audio</span>
      </header>

      <div className="listening-preview">
        <div className="listening-preview__headphones" aria-hidden="true">
          <span className="listening-preview__headband" />
          <span className="listening-preview__ear listening-preview__ear--left" />
          <span className="listening-preview__ear listening-preview__ear--right" />
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
              <button type="button" aria-label="Oldingi audio">
                ‹
              </button>

              <button
                className="listening-preview__play"
                type="button"
                aria-label="Audioni ijro etish"
              >
                ▶
              </button>

              <button type="button" aria-label="Keyingi audio">
                ›
              </button>
            </div>

            <strong>30:00</strong>
          </div>

          <div className="listening-question">
            <span>12-savol / 40</span>

            <p>Suhbatning asosiy maqsadi nimadan iborat?</p>

            <label>
              <input type="radio" name="demo-listening" />
              <span>Band qilish</span>
            </label>

            <label>
              <input type="radio" name="demo-listening" />
              <span>Yo‘nalish so‘rash</span>
            </label>

            <label className="listening-question__selected">
              <input
                type="radio"
                name="demo-listening"
                defaultChecked
              />
              <span>Mavjud xizmatlarni taqqoslash</span>
            </label>
          </div>
        </div>
      </div>

      <button className="test-mode-card__button test-mode-card__button--purple">
        Tinglash testini boshlash
      </button>
    </article>
  );
}

function ReadingCard() {
  return (
    <article className="test-mode-card test-mode-card--reading">
      <header className="test-mode-card__header">
        <div className="test-mode-card__title">
          <span className="test-mode-card__number test-mode-card__number--blue">
            2
          </span>

          <h2>IELTS O‘qish</h2>
        </div>

        <span className="test-mode-card__time">
          <span aria-hidden="true">◷</span>
          60:00
        </span>
      </header>

      <div className="reading-preview">
        <div className="reading-document">
          <span className="reading-document__sheet reading-document__sheet--back" />
          <span className="reading-document__sheet reading-document__sheet--middle" />

          <div className="reading-document__sheet reading-document__sheet--front">
            <strong>Urban transport kelajagi</strong>

            <p>
              Shaharlar barqaror va ishonchli transport tizimlari orqali
              harakatlanish madaniyatini qayta qurmoqda.
            </p>

            <span className="reading-document__line reading-document__line--long" />
            <span className="reading-document__line" />
            <span className="reading-document__line reading-document__line--short" />
          </div>
        </div>

        <div className="reading-pagination" aria-label="O‘qish sahifalari">
          <button type="button">11</button>
          <button className="reading-pagination__active" type="button">
            12
          </button>
          <button type="button">13</button>
          <button type="button">14</button>
        </div>
      </div>

      <button className="test-mode-card__button test-mode-card__button--blue">
        <a href="" className="test-mode-card__link">
          O‘qish testini boshlash
        </a>
      </button>
    </article>
  );
}

function MockTestCard() {
  const sections = [
    {
      name: "Tinglash",
      duration: "30 daq",
    },
    {
      name: "O‘qish",
      duration: "60 daq",
    },
    {
      name: "Yozish",
      duration: "60 daq",
    },
    {
      name: "Gapirish",
      duration: "11–14 daq",
    },
  ];

  return (
    <article className="test-mode-card test-mode-card--mock">
      <header className="test-mode-card__header">
        <div className="test-mode-card__title">
          <span className="test-mode-card__number test-mode-card__number--green">
            3
          </span>

          <h2>Full Mock imtihon</h2>
        </div>

        <span className="test-mode-card__time">
          <span aria-hidden="true">◷</span>
          2:54:00
        </span>
      </header>

      <div className="mock-preview">
        <div className="mock-preview__details">
          <div className="mock-date">
            <span className="mock-date__icon" aria-hidden="true">
              ▣
            </span>

            <div>
              <strong>18-may, 2026</strong>
              <p>Yakshanba · 06:00</p>
            </div>
          </div>

          <div className="mock-sections">
            {sections.map((section) => (
              <div className="mock-section" key={section.name}>
                <span>{section.name}</span>

                <div>
                  <small>{section.duration}</small>
                  <strong aria-label="Tayyor">✓</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mock-score">
          <div className="mock-score__ring">
            <div>
              <span>Taxminiy band</span>
              <strong>7.0</strong>
            </div>
          </div>
        </div>
      </div>

      <button className="test-mode-card__button test-mode-card__button--green">
        To‘liq mock testni boshlash
      </button>
    </article>
  );
}

function FreeTestCard({ test }: { test: (typeof freeTests)[number] }) {
  return (
    <article className={`free-test-card free-test-card--${test.accent}`}>
      <div className="free-test-card__top">
        <span className="free-test-card__code">{test.code}</span>
        <span className="free-test-card__label">Bepul</span>
      </div>

      <h3>{test.name}</h3>
      <p>{test.description}</p>

      <div className="free-test-card__meta">
        <span>{test.duration}</span>
        <span>{test.questions}</span>
      </div>

      <button type="button">Testni boshlash</button>
    </article>
  );
}

function TestModesSection() {
  return (
    <section className="test-modes-section" id="tests">
      <div className="test-modes-section__heading">
        <span>Imtihonga tayyorgarlikni real testlar bilan boshlang</span>
        <h2>Asosiy test rejimlari</h2>
        <p>
          Tinglash, o‘qish va to‘liq mock imtihonlar orqali darajangizni
          aniq baholang va keyingi qadamni ishonch bilan tanlang.
        </p>
      </div>

      <div className="test-modes-section__container">
        <ListeningCard />
        <ReadingCard />
        <MockTestCard />
      </div>

      <div className="free-tests">
        <div className="free-tests__heading">
          <span>Free tests</span>
          <h2>Bepul imtihon sinovlari</h2>
          <p>
            Multilevel, IELTS, TOEFL, SAT va Duolingo bo‘yicha boshlang‘ich
            diagnostik testlarni bepul sinab ko‘ring.
          </p>
        </div>

        <div className="free-tests__grid">
          {freeTests.map((test) => (
            <FreeTestCard key={test.name} test={test} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestModesSection;
