import type { ExamType, SpeakingTest } from "../types/adminTypes";

const KEY = "admin_speaking_tests";

export function loadSpeakingTests(): SpeakingTest[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SpeakingTest[]) : [];
  } catch {
    return [];
  }
}

export function saveSpeakingTests(tests: SpeakingTest[]): void {
  localStorage.setItem(KEY, JSON.stringify(tests));
  window.dispatchEvent(new Event("admin-data-changed"));
}

export function getSpeakingTestsByExam(examType: ExamType): SpeakingTest[] {
  return loadSpeakingTests().filter((t) => t.examType === examType);
}

export function deleteSpeakingTest(id: string): void {
  const updated = loadSpeakingTests().filter((t) => t.id !== id);
  saveSpeakingTests(updated);
}
