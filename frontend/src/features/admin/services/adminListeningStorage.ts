import type { ExamType, ListeningTest } from "../types/adminTypes";

const KEY = "admin_listening_tests";

export function loadListeningTests(): ListeningTest[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ListeningTest[]) : [];
  } catch {
    return [];
  }
}

export function saveListeningTests(tests: ListeningTest[]): void {
  localStorage.setItem(KEY, JSON.stringify(tests));
  window.dispatchEvent(new Event("admin-data-changed"));
}

export function getListeningTestsByExam(examType: ExamType): ListeningTest[] {
  return loadListeningTests().filter((t) => t.examType === examType);
}

export function deleteListeningTest(id: string): void {
  const updated = loadListeningTests().filter((t) => t.id !== id);
  saveListeningTests(updated);
}
