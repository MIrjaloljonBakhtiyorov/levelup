import "./HeroSection.css";

const stats = [
  {
    icon: "👤",
    title: "Faol o‘quvchilar",
    description: "Pilot bosqich",
  },
  {
    icon: "✓",
    title: "Yakunlangan testlar",
    description: "Ma’lumotlar yig‘ilmoqda",
  },
  {
    icon: "♟",
    title: "Ustozlar",
    description: "Mentorlar",
  },
  {
    icon: "▣",
    title: "Yakunlangan darslar",
    description: "Ma’lumotlar yig‘ilmoqda",
  },
  {
    icon: "★",
    title: "O‘rtacha reyting",
    description: "Tez orada",
  },
];

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__grid-overlay" />

      <div className="hero__container">
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            <span>Pilot bosqich</span>
            <span>•</span>
            <span>APIga tayyor platforma</span>
          </div>

          <h1 className="hero__title">
            <span className="hero__title-white">
              Maqsad ballingizga
            </span>

            <span className="hero__title-gradient">
              aqlli reja bilan yeting
            </span>
          </h1>

          <p className="hero__description">
            IELTS va Multilevel imtihonlariga tekshirilgan ustozlar,
            real formatdagi testlar va shaxsiy o‘quv reja bilan tayyorlaning.
          </p>

          <div className="hero__actions">
            <a className="hero__button hero__button--primary" href="/tests">
              Bepul diagnostik test
            </a>

            <a
              className="hero__button hero__button--secondary"
              href="/courses"
            >
              Kurslarni ko‘rish
            </a>
          </div>

          <div className="hero__social-proof">
            <div className="hero__avatars">
              <span>A</span>
              <span>S</span>
              <span>M</span>
              <span>J</span>
              <span>N</span>
            </div>

            <div className="hero__rating">
              <div>
                <span className="hero__stars">★★★★★</span>
                <strong>4.8</strong>
                <small>(Pilot bosqich)</small>
              </div>

              <p>O‘quvchilarni qabul qilish boshlandi</p>
            </div>
          </div>

          <div className="hero__security">
            <span>♙</span>
            <span>Karta ma’lumotlari talab qilinmaydi</span>
          </div>
        </div>

        <div className="hero__visual" aria-label="IELTS natijalari va AI yordamchi dashboardi">
          <video
            className="hero__video"
            src="/herosection image.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
      </div>

      <div className="hero__scroll">
        <span className="hero__mouse">
          <span />
        </span>

        <small>Pastga aylantiring</small>
      </div>

      <div className="hero__stats">
        {stats.map((item) => (
          <article className="hero__stat" key={item.title}>
            <span className="hero__stat-icon">{item.icon}</span>

            <div>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HeroSection;
