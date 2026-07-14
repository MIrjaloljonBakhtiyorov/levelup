import { apiRequest } from "../../../services/apiClient";
import type { AdminCourse } from "../types/adminTypes";

type CoursesResponse = {
  success: true;
  courses: AdminCourse[];
};

type CourseResponse = {
  success: true;
  course: AdminCourse;
};

export type CoursePayload = Omit<AdminCourse, "createdAt" | "id" | "stats">;

export function getPublicCourses() {
  return apiRequest<CoursesResponse>("/courses");
}

export function getAdminCourses(token: string) {
  return apiRequest<CoursesResponse>("/admin/courses", {
    token,
  });
}

export function getAdminCourse(token: string, courseId: string) {
  return apiRequest<CourseResponse>(`/admin/courses/${courseId}`, {
    token,
  });
}

export function createAdminCourse(token: string, data: CoursePayload) {
  return apiRequest<CourseResponse>("/admin/courses", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateAdminCourse(token: string, courseId: string, data: CoursePayload) {
  return apiRequest<CourseResponse>(`/admin/courses/${courseId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export function updateAdminCourseStatus(token: string, courseId: string, isActive: boolean) {
  return apiRequest<CourseResponse>(`/admin/courses/${courseId}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ isActive }),
  });
}

export function deleteAdminCourse(token: string, courseId: string) {
  return apiRequest<{ success: true; message: string }>(`/admin/courses/${courseId}`, {
    method: "DELETE",
    token,
  });
}
