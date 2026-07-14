import type { ExamType, ReadingTest } from "../types/adminTypes";

const KEY = "admin_reading_tests";

export function loadReadingTests(): ReadingTest[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ReadingTest[]) : [];
  } catch {
    return [];
  }
}

export function saveReadingTests(tests: ReadingTest[]): void {
  localStorage.setItem(KEY, JSON.stringify(tests));
  window.dispatchEvent(new Event("admin-data-changed"));
}

export function getReadingTestsByExam(examType: ExamType): ReadingTest[] {
  return loadReadingTests().filter((t) => t.examType === examType);
}

export function deleteReadingTest(id: string): void {
  const updated = loadReadingTests().filter((t) => t.id !== id);
  saveReadingTests(updated);
}
