import "./ResourcesCenterSection.css";
import { useEffect, useState } from "react";
import { apiRequest } from "../../../services/apiClient";
import { useHomeI18n } from "../i18n/HomeI18n";

type ResourceItem = {
  id: string;
  icon: string;
  title: string;
  level: string;
  lessonCount: number;
  description: string;
  access: "free";
  category: string;
  logoUrl: string;
  mentorName: string;
  mentorPhotoUrl: string;
};

type FreeLessonCourse = {
  id: string;
  title: string;
  category: string;
  level: string;
  description: string;
  lessonCount: number;
  logoUrl: string;
  mentorName: string;
  mentorPhotoUrl: string;
};

type FreeLessonsResponse = { success: true; courses: FreeLessonCourse[] };

const categoryIcons: Record<string, string> = {
  IELTS: "I",
  CEFR: "C",
  TOEFL: "T",
  SAT: "S",
  Grammar: "G",
  "General English": "A",
};

function toResource(course: FreeLessonCourse): ResourceItem {
  const summary = course.description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? course.description;

  return {
    id: course.id,
    icon: categoryIcons[course.category] ?? "▶",
    title: course.title,
    level: course.level,
    lessonCount: course.lessonCount,
    description: summary,
    access: "free",
    category: course.category,
    logoUrl: course.logoUrl,
    mentorName: course.mentorName,
    mentorPhotoUrl: course.mentorPhotoUrl,
  };
}

function ResourceCard({ resource }: { resource: ResourceItem }) {
  const { t } = useHomeI18n();
  const title = t(resource.title);
  const description = t(resource.description);
  const duration = t("{count} free lessons", { count: resource.lessonCount });

  return (
    <article className="resource-card">
      <div className="resource-card__cover">
        {resource.logoUrl ? (
          <img src={resource.logoUrl} alt={t("{title} course logo", { title })} loading="lazy" />
        ) : (
          <span>{resource.icon}</span>
        )}
        <span className="resource-card__category">{t(resource.category)}</span>
      </div>

      <div className="resource-card__top">
        <span
          className="resource-card__access resource-card__access--free"
        >
          {t("Free")}
        </span>
      </div>

      <h3>{title}</h3>

      <p className="resource-card__description">
        {description}
      </p>

      <div className="resource-card__mentor">
        {resource.mentorPhotoUrl ? (
          <img src={resource.mentorPhotoUrl} alt={resource.mentorName} loading="lazy" />
        ) : (
          <span>{resource.mentorName.slice(0, 1) || "M"}</span>
        )}
        <div>
          <small>{t("Mentor")}</small>
          <strong>{resource.mentorName || t("Professional mentor")}</strong>
        </div>
      </div>

      <div className="resource-card__meta">
        <div>
          <span>{t("Level")}</span>
          <strong>{t(resource.level)}</strong>
        </div>

        <div>
          <span>{t("Duration")}</span>
          <strong>{duration}</strong>
        </div>
      </div>

      <div className="resource-card__actions">
        <button
          className="resource-card__save"
          type="button"
          aria-label={t("Save {title}", { title })}
        >
          ♡
        </button>

        <button className="resource-card__open" type="button" onClick={() => { window.location.href = "/login"; }}>
          {t("Start")}
        </button>
      </div>
    </article>
  );
}

function MoreResourcesCard() {
  const { t } = useHomeI18n();

  return (
    <article className="resource-card resource-card--more">
      <div className="resource-card__more-icon" aria-hidden="true">
        ↗
      </div>

      <h3>{t("See More")}</h3>

      <p className="resource-card__description">
        {t("Browse all exercises, guides, and the latest learning materials.")}
      </p>

      <button className="resource-card__more-button" type="button">
        {t("All Resources")}
        <span aria-hidden="true">→</span>
      </button>
    </article>
  );
}

function ResourcesCenterSection() {
  const { t } = useHomeI18n();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let retryTimer = 0;

    const loadFreeLessons = (attempt = 0) => {
      apiRequest<FreeLessonsResponse>("/free-lessons")
        .then((response) => {
          if (!active) return;
          setResources(response.courses.map(toResource));
          setError("");
          setLoading(false);
        })
        .catch(() => {
          if (!active) return;
          if (attempt < 3) {
            retryTimer = window.setTimeout(() => loadFreeLessons(attempt + 1), 1500);
            return;
          }
          setError("Free lessons could not be loaded.");
          setLoading(false);
        });
    };

    loadFreeLessons();
    return () => {
      active = false;
      window.clearTimeout(retryTimer);
    };
  }, []);

  const visibleResources = resources.slice(0, 5);

  return (
    <section className="resources-center-section" id="free-lessons">
      <div className="resources-center-section__container">
        <header className="resources-center-section__heading">
          <div>
            <span className="resources-center-section__eyebrow">
              {t("Free Lesson Collection")}
            </span>

            <h2>{t("Resources Center")}</h2>

            <p>
              {t("All the materials you need to prepare for your exam, in one place.")}
            </p>
          </div>

          <button
            className="resources-center-section__all-button"
            type="button"
          >
            {t("All Resources")}
            <span aria-hidden="true">→</span>
          </button>
        </header>

        <div className="resources-center-section__grid" aria-label={t("Resources list")}>
          {loading && <div className="resources-center-section__state">{t("Loading free lessons...")}</div>}
          {!loading && error && <div className="resources-center-section__state resources-center-section__state--error">{t(error)}</div>}
          {!loading && !error && visibleResources.length === 0 && (
            <div className="resources-center-section__state">{t("No free lessons are available yet.")}</div>
          )}
          {visibleResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}

          {!loading && !error && visibleResources.length > 0 && <MoreResourcesCard />}
        </div>
      </div>
    </section>
  );
}

export default ResourcesCenterSection;
