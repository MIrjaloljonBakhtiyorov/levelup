import { useEffect, useMemo, useState } from "react";

import { ResourceCard } from "../components/UserUI";
import { getResources, type ResourceSection, type UserResource } from "../services/resourcesApi";

const resourceSections: ResourceSection[] = ["A1", "A2", "B1", "B2", "C1", "C2", "Podcast"];

function ResourcesPage() {
  const [activeSection, setActiveSection] = useState<ResourceSection>("A1");
  const [resources, setResources] = useState<UserResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;

    getResources()
      .then((result) => {
        if (!alive) return;
        setResources(result.resources);
        const firstSection = resourceSections.find((section) =>
          result.resources.some((resource) => resource.section === section),
        );
        if (firstSection) setActiveSection(firstSection);
      })
      .catch((error) => {
        if (!alive) return;
        setMessage(error instanceof Error ? error.message : "Resurslarni yuklab bo'lmadi");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const visibleResources = useMemo(() => {
    return resources.filter((resource) => resource.section === activeSection);
  }, [activeSection, resources]);

  const audioCount = visibleResources.filter((resource) => resource.format === "Audio" || resource.format === "Podcast").length;

  return (
    <section className="user-page resources-page">
      <div className="user-page-header resources-page__header">
        <span>Resurslar</span>
        <h1>Daraja va format bo‘yicha content library</h1>
        <p>Admin panelda qo‘shilgan podcast, article, cinema va cartoon materiallari shu yerda category bo‘yicha saralanadi.</p>
      </div>

      <div className="resources-filter-panel">
        <div className="user-tabs course-filter-tabs resources-tabs" aria-label="Resurs bo‘limlari">
          {resourceSections.map((section) => {
            const count = resources.filter((resource) => resource.section === section).length;
            return (
              <button
                className={activeSection === section ? "is-active" : ""}
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
              >
                {section} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}
        </div>

        <div className="resources-section-summary">
          <span>{activeSection}</span>
          <strong>{visibleResources.length} ta resurs</strong>
          <small>{audioCount > 0 ? `${audioCount} ta audio material` : "Matn va video materiallar"}</small>
        </div>
      </div>

      {loading && (
        <div className="user-empty-state">
          <strong>Resurslar yuklanmoqda...</strong>
          <span>Admin paneldagi real contentlar olinmoqda.</span>
        </div>
      )}

      {!loading && message && (
        <div className="user-empty-state">
          <strong>Resurslar yuklanmadi</strong>
          <span>{message}</span>
        </div>
      )}

      {!loading && !message && visibleResources.length > 0 && (
        <div className="user-card-grid resources-grid">
          {visibleResources.map((resource) => (
            <ResourceCard resource={resource} key={resource.id} />
          ))}
        </div>
      )}

      {!loading && !message && visibleResources.length === 0 && (
        <div className="user-empty-state">
          <strong>Hozircha resurs yo'q</strong>
          <span>Admin panelda {activeSection} bo‘limiga content qo‘shilganda shu yerda ko‘rinadi.</span>
        </div>
      )}
    </section>
  );
}

export default ResourcesPage;
