import type { AdminTeacherProfile } from "../types/adminTypes";

const KEY = "admin_teacher_profiles";

export function loadTeacherProfiles(): AdminTeacherProfile[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminTeacherProfile[]) : [];
  } catch {
    return [];
  }
}

export function saveTeacherProfiles(profiles: AdminTeacherProfile[]): void {
  localStorage.setItem(KEY, JSON.stringify(profiles));
}

export function deleteTeacherProfile(id: string): void {
  saveTeacherProfiles(loadTeacherProfiles().filter((p) => p.id !== id));
}
