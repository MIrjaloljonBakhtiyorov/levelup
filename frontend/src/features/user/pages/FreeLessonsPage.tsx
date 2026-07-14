import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { getPublicCourses } from "../../admin/services/adminCoursesApi";
import type { AdminCourse } from "../../admin/types/adminTypes";
import { getUserToken } from "../../auth/services/userSession";
import { EmptyState, LessonCard } from "../components/UserUI";
import { getStartedCourses, startCourse } from "../services/userCoursesApi";
import { mapCourseToLessonCard } from "../utils/courseCards";

type FreeLessonCourse = AdminCourse & {
  lastOpenedAt?: string;
  progress?: number;
  startedAt?: string;
};

function FreeLessonsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Barchasi");
  const [courses, setCourses] = useState<FreeLessonCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const freeCourses = useMemo(() => courses.filter((course) => course.isFree), [courses]);
  const lessonFilters = useMemo(
    () => [
      "Barchasi",
      ...Array.from(new Set(freeCourses.flatMap((course) => course.categories))),
    ],
    [freeCourses],
  );
  const filteredCourses = useMemo(
    () =>
      activeFilter === "Barchasi"
        ? freeCourses
        : freeCourses.filter((course) => course.categories.includes(activeFilter as never)),
    [activeFilter, freeCourses],
  );

  useEffect(() => {
    const token = getUserToken();

    setLoading(true);
    Promise.all([
      getPublicCourses(),
      token
        ? getStartedCourses(token).catch(() => ({ success: true as const, courses: [] }))
        : Promise.resolve({ success: true as const, courses: [] }),
    ])
      .then(([publicResult, startedResult]) => {
        const startedById = new Map((startedResult.courses ?? []).map((course) => [course.id, course]));

        setCourses(
          (publicResult.courses ?? []).map((course) => {
            const startedCourse = startedById.get(course.id);

            return {
              ...course,
              progress: startedCourse?.progress ?? 0,
              startedAt: startedCourse?.startedAt,
              lastOpenedAt: startedCourse?.lastOpenedAt,
            };
          }),
        );
        setMessage("");
      })
      .catch(() => setMessage("Bepul darslarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, []);

  async function handleStart(courseId: string) {
    const token = getUserToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await startCourse(token, courseId);
      navigate(`/user/courses/${courseId}/learn`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kursni boshlashda xatolik");
    }
  }

  return (
    <section className="user-page">
      <div className="free-lessons-hero">
        <div>
          <span>Bepul darslar</span>
          <h1>Admin qo'shgan bepul darslar katalogi</h1>
          <p>
            Admin panelda bepul qilib qo'shilgan kurslar shu yerda ko'rinadi.
            Boshlagan darslaringiz esa Kurslarim sahifasiga o'tadi.
          </p>
        </div>

        <div className="free-lessons-hero__stats">
          <div>
            <strong>{lessonFilters.length - 1}</strong>
            <span>Kategoriya</span>
          </div>
          <div>
            <strong>{freeCourses.length}</strong>
            <span>Bepul dars</span>
          </div>
          <div>
            <strong>{filteredCourses.length}</strong>
            <span>Tanlangan</span>
          </div>
        </div>
      </div>

      {message && <p className="user-alert">{message}</p>}

      <div className="lesson-filter-bar" aria-label="Dars kategoriyalari">
        {lessonFilters.map((filter) => (
          <button
            className={activeFilter === filter ? "is-active" : ""}
            type="button"
            key={filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading ? (
        <EmptyState title="Darslar yuklanmoqda" text="Backend bazadan bepul darslar olinmoqda." />
      ) : filteredCourses.length > 0 ? (
        <div className="user-card-grid lesson-grid">
          {filteredCourses.map((course) => (
            <LessonCard
              lesson={mapCourseToLessonCard(course)}
              key={course.id}
              onStart={(lesson) => handleStart(lesson.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Hozircha bepul dars yo'q"
          text="Admin panelda kurs bepul qilib qo'shilsa, shu yerda avtomatik ko'rinadi."
        />
      )}
    </section>
  );
}

export default FreeLessonsPage;
