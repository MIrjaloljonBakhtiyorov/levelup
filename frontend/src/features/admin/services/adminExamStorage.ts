import type { ExamTest } from "../types/adminTypes";

const ADMIN_EXAM_TESTS_KEY = "adminExamTests";

export function loadStoredExamTests() {
  const savedTests = localStorage.getItem(ADMIN_EXAM_TESTS_KEY);

  if (!savedTests) {
    return [];
  }

  try {
    return JSON.parse(savedTests) as ExamTest[];
  } catch {
    return [];
  }
}

export function saveStoredExamTests(tests: ExamTest[]) {
  localStorage.setItem(ADMIN_EXAM_TESTS_KEY, JSON.stringify(tests));
  window.dispatchEvent(new Event("admin-data-changed"));
}
