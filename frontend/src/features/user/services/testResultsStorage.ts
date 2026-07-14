export type SavedTestResult = {
  testId: string;
  correct: number;
  total: number;
  wrong: number;
  answers?: Record<string, string>;
  completedAt: string;
};

const KEY = "levelup_test_results";

export function loadTestResults(): SavedTestResult[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as SavedTestResult[];
  } catch {
    return [];
  }
}

export function saveTestResult(result: SavedTestResult) {
  const current = loadTestResults().filter((item) => item.testId !== result.testId);
  localStorage.setItem(KEY, JSON.stringify([result, ...current]));
}

export function deleteTestResult(testId: string) {
  localStorage.setItem(KEY, JSON.stringify(loadTestResults().filter((item) => item.testId !== testId)));
}

export function resultColor(wrong: number) {
  if (wrong <= 1) return { background: "#dcfce7", color: "#166534", border: "#86efac" };
  if (wrong === 2) return { background: "#fef3c7", color: "#92400e", border: "#fcd34d" };
  return { background: "#fee2e2", color: "#b91c1c", border: "#fca5a5" };
}
