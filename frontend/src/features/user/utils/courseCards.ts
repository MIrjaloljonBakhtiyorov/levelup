import type { AdminCourse, CourseCategory } from "../../admin/types/adminTypes";
import type { CourseCardData, LessonCardData, Tone } from "../components/UserUI";
import type { StartedCourse } from "../services/userCoursesApi";

const examCategories: CourseCategory[] = ["CEFR", "IELTS", "TOEFL", "SAT"];

const examTones: Partial<Record<CourseCategory, Tone>> = {
  CEFR: "green",
  IELTS: "blue",
  TOEFL: "purple",
  SAT: "orange",
};

function getCourseTone(course: AdminCourse): Tone {
  const exam = examCategories.find((category) => course.categories.includes(category));
  return exam ? examTones[exam] ?? "blue" : "pink";
}

function getMainCategory(course: AdminCourse) {
  return course.categories.find((category) => examCategories.includes(category))
    ?? course.categories[0]
    ?? "Kurs";
}

function getSkill(course: AdminCourse) {
  return course.categories.find((category) => !examCategories.includes(category))
    ?? getMainCategory(course);
}

function getTeacherInitials(course: AdminCourse) {
  return `${course.mentorFirstName.charAt(0)}${course.mentorLastName.charAt(0)}`.toUpperCase();
}

function getCertificate(course: AdminCourse) {
  const exam = examCategories.find((category) => course.categories.includes(category));
  return exam ? `${exam} sertifikati` : "Ishtirok sertifikati";
}

function getCourseType(course: AdminCourse) {
  return course.isFree
    ? "Bepul"
    : `${new Intl.NumberFormat("uz-UZ").format(course.price)} so'm`;
}

export function mapCourseToLessonCard(course: AdminCourse & { progress?: number }): LessonCardData {
  const category = getMainCategory(course);
  const lessonsCount = course.lessons?.length ?? (course.videoUrl ? 1 : 0);
  const progress = course.progress ?? 0;

  return {
    id: course.id,
    category,
    title: course.title,
    description: course.description || `${course.level} daraja uchun ${lessonsCount > 0 ? `${lessonsCount} dars` : "bepul kurs"}.`,
    duration: lessonsCount > 0 ? `${lessonsCount} dars` : "Erkin o'qish",
    level: course.level,
    mentor: `${course.mentorFirstName} ${course.mentorLastName}`,
    mentorPhotoUrl: course.mentorPhotoUrl,
    progress,
    tone: getCourseTone(course),
    accent: category.slice(0, 2).toUpperCase(),
    actionLabel: progress > 0 ? "Davom ettirish" : "Boshlash",
  };
}

export function mapCourseToCourseCard(course: StartedCourse): CourseCardData {
  const lessonsCount = course.lessons?.length ?? (course.videoUrl ? 1 : 0);
  const status = course.progress >= 100
    ? "completed"
    : course.isFree
      ? "free"
      : "purchased";

  return {
    id: course.id,
    title: course.title,
    description: course.description || `${getSkill(course)} bo'yicha ${lessonsCount > 0 ? `${lessonsCount} darslik` : "personal"} kurs.`,
    skill: getSkill(course),
    progress: course.progress,
    score: course.level,
    nextLesson: lessonsCount > 0 ? `${lessonsCount} darsdan davom ettirish` : "Kursga qaytish",
    teacher: getTeacherInitials(course),
    teacherName: `${course.mentorFirstName} ${course.mentorLastName}`,
    teacherPhotoUrl: course.mentorPhotoUrl,
    certificate: getCertificate(course),
    type: getCourseType(course),
    status,
    statusLabel: course.progress >= 100
      ? "Yakunlangan"
      : course.isFree
        ? "Bepul boshlangan"
        : "Pullik kurs",
    tone: getCourseTone(course),
  };
}
