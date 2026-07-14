import type { ExamType, WritingTest } from "../types/adminTypes";

const KEY = "admin_writing_tests";

export function loadWritingTests(): WritingTest[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WritingTest[]) : [];
  } catch {
    return [];
  }
}

export function saveWritingTests(tests: WritingTest[]): void {
  localStorage.setItem(KEY, JSON.stringify(tests));
  window.dispatchEvent(new Event("admin-data-changed"));
}

export function getWritingTestsByExam(examType: ExamType): WritingTest[] {
  return loadWritingTests().filter((t) => t.examType === examType);
}

export function deleteWritingTest(id: string): void {
  const updated = loadWritingTests().filter((t) => t.id !== id);
  saveWritingTests(updated);
}
