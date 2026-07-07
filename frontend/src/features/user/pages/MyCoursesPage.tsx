import { useMemo, useState } from "react";

import { CourseCard, type CourseCardData } from "../components/UserUI";

type CourseFilter = CourseCardData["status"] | "all";

const courseFilters: { id: CourseFilter; label: string }[] = [
  { id: "all", label: "Barchasi" },
  { id: "studying", label: "O‘qiyotgan kurslarim" },
  { id: "purchased", label: "Sotib olingan" },
  { id: "free", label: "Bepul kurslar" },
  { id: "upcoming", label: "Boshlanishi kutilayotgan" },
  { id: "live", label: "Bo‘layotgan kurslar" },
  { id: "completed", label: "Yakunlangan" },
];

const courses: CourseCardData[] = [
  {
    title: "IELTS Intensive 7.5",
    skill: "Writing + Speaking",
    progress: 58,
    score: "7.0",
    nextLesson: "Opinion essay structure",
    teacher: "MU",
    teacherName: "Madina Umarova",
    certificate: "IELTS sertifikati",
    type: "Sotib olingan",
    status: "studying",
    statusLabel: "O‘qiyapman",
    tone: "blue",
  },
  {
    title: "CEFR B2 Mastery",
    skill: "Listening",
    progress: 74,
    score: "B2",
    nextLesson: "Long conversation",
    teacher: "DS",
    teacherName: "Dilshod Sobirov",
    certificate: "CEFR sertifikati",
    type: "Sotib olingan",
    status: "purchased",
    statusLabel: "Sotib olingan",
    tone: "green",
  },
  {
    title: "TOEFL Academic Pack",
    skill: "Reading",
    progress: 36,
    score: "91",
    nextLesson: "Inference questions",
    teacher: "JM",
    teacherName: "Jasur Mirzayev",
    certificate: "TOEFL sertifikati",
    type: "Premium",
    status: "live",
    statusLabel: "Bo‘layapti",
    tone: "purple",
  },
  {
    title: "SAT Reading Sprint",
    skill: "Reading and Writing",
    progress: 82,
    score: "680",
    nextLesson: "Command of evidence",
    teacher: "AK",
    teacherName: "Aziza Karimova",
    certificate: "SAT certificate",
    type: "Yaqin start",
    status: "upcoming",
    statusLabel: "Kutilmoqda",
    tone: "orange",
  },
  {
    title: "Grammar Foundation",
    skill: "Grammar",
    progress: 18,
    score: "A2-B1",
    nextLesson: "Tenses overview",
    teacher: "NX",
    teacherName: "Nodira Xolmatova",
    certificate: "Ishtirok sertifikati",
    type: "Bepul",
    status: "free",
    statusLabel: "Bepul",
    tone: "pink",
  },
  {
    title: "Speaking Confidence",
    skill: "Speaking",
    progress: 100,
    score: "6.5",
    nextLesson: "Kurs yakunlangan",
    teacher: "FR",
    teacherName: "Farrux Rahimov",
    certificate: "Completion certificate",
    type: "Yakunlangan",
    status: "completed",
    statusLabel: "Yakunlangan",
    tone: "blue",
  },
];

function MyCoursesPage() {
  const [activeFilter, setActiveFilter] = useState<CourseFilter>("all");
  const filteredCourses = useMemo(
    () =>
      activeFilter === "all"
        ? courses
        : courses.filter((course) => course.status === activeFilter),
    [activeFilter],
  );

  return (
    <section className="user-page">
      <div className="user-page-header">
        <span>Kurslarim</span>
        <h1>Davom etayotgan va sotib olingan kurslar</h1>
        <p>
          O‘qiyotgan, sotib olingan, bepul, bo‘layotgan va yakunlangan
          kurslaringizni filter orqali boshqaring.
        </p>
      </div>

      <div className="user-tabs course-filter-tabs" aria-label="Kurs filterlari">
        {courseFilters.map((filter) => (
          <button
            className={activeFilter === filter.id ? "is-active" : ""}
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="user-card-grid">
        {filteredCourses.map((course) => <CourseCard course={course} key={course.title} />)}
      </div>
    </section>
  );
}

export default MyCoursesPage;
