import { apiRequest } from "../../../services/apiClient";

export type UserTestSummary = {
  id: string;
  kind: "listening" | "reading" | "writing" | "speaking" | "extra";
  examType: string;
  skill: string;
  testName: string;
  level: string;
  questionCount: number;
  partType?: string;
  createdAt: string;
};

type TestsResponse = {
  success: true;
  tests: UserTestSummary[];
};

export function getUserTests() {
  return apiRequest<TestsResponse>("/tests");
}

export type UserTestDetail = UserTestSummary & {
  part?: Record<string, unknown>;
  task?: Record<string, unknown>;
  description?: string;
};

export function getUserTest(testId: string) {
  return apiRequest<{ success: true; test: UserTestDetail }>(`/tests/${testId}`);
}
