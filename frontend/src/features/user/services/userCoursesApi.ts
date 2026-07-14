import { apiRequest } from "../../../services/apiClient";
import type { AdminCourse } from "../../admin/types/adminTypes";

export type StartedCourse = AdminCourse & {
  lastOpenedAt: string;
  progress: number;
  startedAt: string;
  viewedLessonIds?: string[];
  completedLessonIds?: string[];
};

export type LessonNote = {
  userId: string;
  courseId: string;
  lessonId: string;
  grammar: string;
  important: string;
  vocabulary: string;
  personal: string;
  updatedAt: string;
};

type StartedCoursesResponse = {
  success: true;
  courses: StartedCourse[];
};

type StartCourseResponse = {
  success: true;
  course: StartedCourse;
};

type CourseLearningResponse = {
  success: true;
  course: StartedCourse;
  notes: LessonNote[];
};

type SaveLessonNotePayload = Pick<LessonNote, "grammar" | "important" | "vocabulary" | "personal">;

type SaveLessonNoteResponse = {
  success: true;
  note: LessonNote;
};

type CompleteLessonResponse = {
  success: true;
  progress: number;
  viewedLessonIds?: string[];
  completedLessonIds?: string[];
};

export function getStartedCourses(token: string) {
  return apiRequest<StartedCoursesResponse>("/user/courses", {
    token,
  });
}

export function startCourse(token: string, courseId: string) {
  return apiRequest<StartCourseResponse>(`/user/courses/${courseId}/start`, {
    method: "POST",
    token,
  });
}

export function getCourseLearning(token: string, courseId: string, lessonId?: string) {
  const suffix = lessonId ? `?lessonId=${encodeURIComponent(lessonId)}` : "";

  return apiRequest<CourseLearningResponse>(`/user/courses/${courseId}/learn${suffix}`, {
    token,
  });
}

export function saveLessonNote(
  token: string,
  courseId: string,
  lessonId: string,
  payload: SaveLessonNotePayload,
) {
  return apiRequest<SaveLessonNoteResponse>(`/user/courses/${courseId}/lessons/${lessonId}/notes`, {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

export function completeLesson(token: string, courseId: string, lessonId: string) {
  return apiRequest<CompleteLessonResponse>(`/user/courses/${courseId}/lessons/${lessonId}/complete`, {
    method: "POST",
    token,
  });
}
