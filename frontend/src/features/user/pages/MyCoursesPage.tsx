import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { getUserToken } from "../../auth/services/userSession";
import { CourseCard, EmptyState, type CourseCardData } from "../components/UserUI";
import { getStartedCourses, startCourse } from "../services/userCoursesApi";
import { mapCourseToCourseCard } from "../utils/courseCards";

type CourseFilter = CourseCardData["status"] | "all";

const courseFilters: { id: CourseFilter; label: string }[] = [
  { id: "all", label: "Barchasi" },
  { id: "studying", label: "O'qiyotgan kurslarim" },
  { id: "purchased", label: "Sotib olingan" },
  { id: "free", label: "Bepul kurslar" },
  { id: "upcoming", label: "Boshlanishi kutilayotgan" },
  { id: "live", label: "Bo'layotgan kurslar" },
  { id: "completed", label: "Yakunlangan" },
];

function MyCoursesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<CourseFilter>("all");
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = getUserToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    getStartedCourses(token)
      .then((result) => {
        setCourses((result.courses ?? []).map(mapCourseToCourseCard));
        setMessage("");
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "Kurslarimni yuklab bo'lmadi");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const filteredCourses = useMemo(
    () =>
      activeFilter === "all"
        ? courses
        : courses.filter((course) => course.status === activeFilter),
    [activeFilter, courses],
  );

  async function handleContinue(course: CourseCardData) {
    const token = getUserToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const result = await startCourse(token, course.id);
      setCourses((current) => {
        const nextCourse = mapCourseToCourseCard(result.course);
        return [
          nextCourse,
          ...current.filter((item) => item.id !== nextCourse.id),
        ];
      });
      setMessage("");
      navigate(`/user/courses/${course.id}/learn`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kursni davom ettirib bo'lmadi");
    }
  }

  return (
    <section className="user-page">
      <div className="user-page-header">
        <span>Kurslarim</span>
        <h1>Boshlangan kurslar ro'yxati</h1>
        <p>
          Bepul darslarda yoki boshqa kurs sahifalarida Boshlash tugmasini
          bosgan kurslaringiz shu yerda saqlanadi.
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

      {message && <p className="user-alert">{message}</p>}

      {loading ? (
        <EmptyState title="Kurslar yuklanmoqda" text="Backend bazadan boshlagan kurslaringiz olinmoqda." />
      ) : filteredCourses.length > 0 ? (
        <div className="user-card-grid my-course-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              course={course}
              key={course.id}
              onAction={handleContinue}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Hozircha boshlangan kurs yo'q"
          text="Bepul darslardan birini boshlang, keyin u Kurslarim ro'yxatida ko'rinadi."
        />
      )}
    </section>
  );
}

export default MyCoursesPage;
