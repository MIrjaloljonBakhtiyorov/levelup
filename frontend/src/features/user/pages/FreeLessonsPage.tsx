import { LessonCard, type LessonCardData } from "../components/UserUI";

const lessons: LessonCardData[] = [
  { category: "IELTS", title: "IELTS Speaking Part 2 starter", duration: "18 daqiqa", level: "Intermediate", mentor: "AI mentor", progress: 62, tone: "blue", accent: "SP" },
  { category: "CEFR", title: "CEFR Listening B2 practice", duration: "22 daqiqa", level: "B2", mentor: "Madina ustoz", progress: 40, tone: "green", accent: "B2" },
  { category: "TOEFL", title: "TOEFL note-taking basics", duration: "16 daqiqa", level: "Upper", mentor: "AI mentor", progress: 25, tone: "purple", accent: "NF" },
  { category: "SAT", title: "SAT Reading evidence questions", duration: "28 daqiqa", level: "Advanced", mentor: "Jasur mentor", progress: 10, tone: "orange", accent: "RW" },
  { category: "Grammar", title: "Complex sentence masterclass", duration: "20 daqiqa", level: "Intermediate", mentor: "AI mentor", progress: 76, tone: "pink", accent: "GR" },
  { category: "Vocabulary", title: "Academic words for Writing", duration: "14 daqiqa", level: "B1-B2", mentor: "Dilnoza ustoz", progress: 55, tone: "blue", accent: "AW" },
  { category: "Beginner", title: "Beginner speaking confidence", duration: "12 daqiqa", level: "Beginner", mentor: "AI mentor", progress: 90, tone: "green", accent: "A1" },
];

const lessonFilters = ["Barchasi", "IELTS", "CEFR", "TOEFL", "SAT", "Grammar", "Vocabulary"];

function FreeLessonsPage() {
  return (
    <section className="user-page">
      <div className="free-lessons-hero">
        <div>
          <span>Bepul darslar</span>
          <h1>Premium free lessons katalogi</h1>
          <p>IELTS, CEFR, TOEFL, SAT, grammar va vocabulary bo‘yicha qisqa, foydali va progressga ulangan darslar.</p>
        </div>

        <div className="free-lessons-hero__stats">
          <div>
            <strong>7</strong>
            <span>Kategoriya</span>
          </div>
          <div>
            <strong>42</strong>
            <span>Mini dars</span>
          </div>
          <div>
            <strong>18m</strong>
            <span>O‘rtacha vaqt</span>
          </div>
        </div>
      </div>

      <div className="lesson-filter-bar" aria-label="Dars kategoriyalari">
        {lessonFilters.map((filter, index) => (
          <button className={index === 0 ? "is-active" : ""} type="button" key={filter}>
            {filter}
          </button>
        ))}
      </div>

      <div className="user-card-grid lesson-grid">
        {lessons.map((lesson) => <LessonCard lesson={lesson} key={lesson.title} />)}
      </div>
    </section>
  );
}

export default FreeLessonsPage;
