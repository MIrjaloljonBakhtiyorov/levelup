import "./ResourcesCenterSection.css";

type ResourceAccess = "free" | "premium";

type ResourceItem = {
  id: number;
  icon: string;
  title: string;
  level: string;
  duration: string;
  description: string;
  access: ResourceAccess;
};

const resources: ResourceItem[] = [
  {
    id: 1,
    icon: "♪",
    title: "English Grammar for beginner and elementary learners (A1)",
    level: "Elementary",
    duration: "Number of lessons 14",
    description: "Anglish Grammar for pre - intermediate learners (B1) uchun mashqlar va testlar.",
    access: "free",
  },
  {
    id: 2,
    icon: "▤",
    title: "English Grammar for pre - intermediate learners (A2)",
    level: "Pre-Intermediate",
    duration: "Number of lessons 24",
    description: "English Grammar for pre - intermediate learners (B1) uchun mashqlar va testlar.",
    access: "free",
  },
  {
    id: 3,
    icon: "✎",
    title: "English Grammar for intermediate learners (B1)",
    level: "Intermediate",
    duration: "Number of lessons 29",
    description: "English Grammar for intermediate learners (B1) uchun mashqlar va testlar.",
    access: "premium",
  },
  {
    id: 4,
    icon: "◉",
    title: "English Grammar for upper-intermediate learners (B2)",
    level: "Upper-Intermediate",
    duration: "Number of lessons 34",
    description: "Speaking bo‘limi uchun mavzu va savollar.",
    access: "free",
  },
  {
    id: 5,
    icon: "A",
    title: "English Grammar for advanced learners (C1)",
    level: "Advanced",
    duration: "Number of lessons 40",
    description: "C1 daraja uchun murakkab grammatika va amaliy testlar.",
    access: "premium",
  },
  {
    id: 6,
    icon: "G",
    title: "English Grammar for proficient learners (C2)",
    level: "Proficient",
    duration: "Number of lessons 38",
    description: "C2 daraja uchun akademik va professional grammatika mashqlari.",
    access: "premium",
  },
  {
    id: 7,
    icon: "▣",
    title: "IELTS grammar booster for high scores",
    level: "B2-C1",
    duration: "Number of lessons 18",
    description: "IELTS Writing va Speaking uchun yuqori ball grammatikasi.",
    access: "free",
  },
];

function ResourceCard({ resource }: { resource: ResourceItem }) {
  return (
    <article className="resource-card">
      <div className="resource-card__top">
        <div className="resource-card__icon" aria-hidden="true">
          {resource.icon}
        </div>

        <span
          className={
            resource.access === "premium"
              ? "resource-card__access resource-card__access--premium"
              : "resource-card__access resource-card__access--free"
          }
        >
          {resource.access === "premium" ? "Premium" : "Bepul"}
        </span>
      </div>

      <h3>{resource.title}</h3>

      <p className="resource-card__description">
        {resource.description}
      </p>

      <div className="resource-card__meta">
        <div>
          <span>Daraja</span>
          <strong>{resource.level}</strong>
        </div>

        <div>
          <span>Davomiyligi</span>
          <strong>{resource.duration}</strong>
        </div>
      </div>

      <div className="resource-card__actions">
        <button
          className="resource-card__save"
          type="button"
          aria-label={`${resource.title} resursini saqlash`}
        >
          ♡
        </button>

        <button className="resource-card__open" type="button">
          Boshlash
        </button>
      </div>
    </article>
  );
}

function MoreResourcesCard() {
  return (
    <article className="resource-card resource-card--more">
      <div className="resource-card__more-icon" aria-hidden="true">
        ↗
      </div>

      <h3>Ko‘proq ko‘rish</h3>

      <p className="resource-card__description">
        Barcha mashqlar, qo‘llanmalar va yangi materiallarni ko‘ring.
      </p>

      <button className="resource-card__more-button" type="button">
        Barcha resurslar
        <span aria-hidden="true">→</span>
      </button>
    </article>
  );
}

function ResourcesCenterSection() {
  const visibleResources = resources.slice(0, 7);

  return (
    <section className="resources-center-section" id="resources">
      <div className="resources-center-section__container">
        <header className="resources-center-section__heading">
          <div>
            <span className="resources-center-section__eyebrow">
              Bepul darslar to'plami
            </span>

            <h2>Resurslar markazi</h2>

            <p>
              Imtihonga tayyorlanish uchun kerakli materiallar bir joyda.
            </p>
          </div>

          <button
            className="resources-center-section__all-button"
            type="button"
          >
            Barcha resurslar
            <span aria-hidden="true">→</span>
          </button>
        </header>

        <div className="resources-center-section__grid" aria-label="Resurslar ro‘yxati">
          {visibleResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}

          <MoreResourcesCard />
        </div>
      </div>
    </section>
  );
}

export default ResourcesCenterSection;
