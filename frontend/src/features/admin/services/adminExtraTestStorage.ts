import type { ExamType, ExtraTest, ExtraTestSkill } from "../types/adminTypes";

const KEY = "admin_extra_tests";

export function loadExtraTests(): ExtraTest[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ExtraTest[]) : [];
  } catch {
    return [];
  }
}

export function saveExtraTests(tests: ExtraTest[]) {
  localStorage.setItem(KEY, JSON.stringify(tests));
  window.dispatchEvent(new Event("admin-data-changed"));
}

export function getExtraTestsByExamAndSkill(examType: ExamType | "General", skill: ExtraTestSkill) {
  return loadExtraTests().filter((test) => test.examType === examType && test.skill === skill);
}

export function deleteExtraTest(id: string) {
  saveExtraTests(loadExtraTests().filter((test) => test.id !== id));
}
