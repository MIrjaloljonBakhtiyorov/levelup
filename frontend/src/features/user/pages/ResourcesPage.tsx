import { useMemo, useState } from "react";

import { ResourceCard, type ResourceCardData } from "../components/UserUI";

type ResourceSection = "A1" | "A2" | "B1" | "B2" | "C1" | "Listening" | "Podcast";

type ResourceItem = ResourceCardData & {
  section: ResourceSection;
  format: string;
};

const resourceSections: ResourceSection[] = ["A1", "A2", "B1", "B2", "C1", "Listening", "Podcast"];

const resources: ResourceItem[] = [
  { section: "A1", category: "Starter", title: "Daily words and simple sentences", level: "A1", duration: "10 daqiqa", tone: "blue", format: "Vocabulary" },
  { section: "A1", category: "Grammar", title: "To be, articles and basic questions", level: "A1", duration: "14 daqiqa", tone: "green", format: "Grammar" },
  { section: "A1", category: "Reading", title: "Short stories for beginners", level: "A1", duration: "8 daqiqa", tone: "orange", format: "Reading" },
  { section: "A2", category: "Speaking", title: "Everyday conversation patterns", level: "A2", duration: "16 daqiqa", tone: "purple", format: "Speaking" },
  { section: "A2", category: "Grammar", title: "Past simple and future plans", level: "A2", duration: "18 daqiqa", tone: "pink", format: "Grammar" },
  { section: "A2", category: "Listening", title: "Beginner listening stories", level: "A2", duration: "12 daqiqa", tone: "orange", format: "Audio" },
  { section: "B1", category: "Reading", title: "News articles with vocabulary", level: "B1", duration: "20 daqiqa", tone: "green", format: "Article" },
  { section: "B1", category: "Writing", title: "Opinion paragraph templates", level: "B1", duration: "22 daqiqa", tone: "blue", format: "Writing" },
  { section: "B1", category: "Listening", title: "Dialogues with distractors", level: "B1", duration: "17 daqiqa", tone: "purple", format: "Audio" },
  { section: "B2", category: "IELTS", title: "Band 6.5 essay improvement pack", level: "B2", duration: "28 daqiqa", tone: "pink", format: "Writing" },
  { section: "B2", category: "Vocabulary", title: "Academic topic vocabulary", level: "B2", duration: "19 daqiqa", tone: "blue", format: "Vocabulary" },
  { section: "B2", category: "Cinema", title: "Scene shadowing practice", level: "B2", duration: "22 daqiqa", tone: "purple", format: "Video" },
  { section: "C1", category: "Advanced", title: "Complex argument and nuance", level: "C1", duration: "30 daqiqa", tone: "green", format: "Writing" },
  { section: "C1", category: "Reading", title: "Long-form academic analysis", level: "C1", duration: "32 daqiqa", tone: "orange", format: "Reading" },
  { section: "C1", category: "Speaking", title: "Abstract questions and follow-ups", level: "C1", duration: "24 daqiqa", tone: "blue", format: "Speaking" },
  { section: "Listening", category: "Listening", title: "IELTS Section 3 strategy drill", level: "B1-B2", duration: "21 daqiqa", tone: "blue", format: "Audio" },
  { section: "Listening", category: "Listening", title: "CEFR note-taking practice", level: "B2-C1", duration: "18 daqiqa", tone: "green", format: "Audio" },
  { section: "Listening", category: "Listening", title: "Fast speech and connected sounds", level: "B2", duration: "15 daqiqa", tone: "pink", format: "Audio" },
  { section: "Podcast", category: "Podcast", title: "Academic English daily", level: "B2", duration: "18 daqiqa", tone: "blue", format: "Podcast" },
  { section: "Podcast", category: "Podcast", title: "IELTS ideas in 10 minutes", level: "B1-B2", duration: "10 daqiqa", tone: "orange", format: "Podcast" },
  { section: "Podcast", category: "Podcast", title: "Fluent speaking habits", level: "B2-C1", duration: "16 daqiqa", tone: "purple", format: "Podcast" },
];

function ResourcesPage() {
  const [activeSection, setActiveSection] = useState<ResourceSection>("A1");

  const visibleResources = useMemo(() => {
    return resources.filter((resource) => resource.section === activeSection);
  }, [activeSection]);

  const audioCount = visibleResources.filter((resource) => resource.format === "Audio" || resource.format === "Podcast").length;

  return (
    <section className="user-page resources-page">
      <div className="user-page-header resources-page__header">
        <span>Resurslar</span>
        <h1>Daraja va format bo‘yicha content library</h1>
        <p>A1 dan C1 gacha grammar, vocabulary, reading, writing, listening va podcast materiallarini alohida bo‘limlarda toping.</p>
      </div>

      <div className="resources-filter-panel">
        <div className="user-tabs course-filter-tabs resources-tabs" aria-label="Resurs bo‘limlari">
          {resourceSections.map((section) => (
            <button
              className={activeSection === section ? "is-active" : ""}
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="resources-section-summary">
          <span>{activeSection}</span>
          <strong>{visibleResources.length} ta resurs</strong>
          <small>{audioCount > 0 ? `${audioCount} ta audio material` : "Matn va amaliy mashqlar"}</small>
        </div>
      </div>

      <div className="user-card-grid resources-grid">
        {visibleResources.map((resource) => (
          <ResourceCard resource={resource} key={`${resource.section}-${resource.title}`} />
        ))}
      </div>
    </section>
  );
}

export default ResourcesPage;
