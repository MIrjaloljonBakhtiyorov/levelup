import { apiRequest } from "../../../services/apiClient";
import type {
  ExtraTest,
  ListeningTest,
  ReadingTest,
  SpeakingTest,
  WritingTest,
} from "../types/adminTypes";

export type AdminTestKind = "listening" | "reading" | "writing" | "speaking" | "extra";
export type AdminStoredTest = ListeningTest | ReadingTest | WritingTest | SpeakingTest | ExtraTest;

type TestsResponse<T> = {
  success: true;
  tests: T[];
};

type TestResponse<T> = {
  success: true;
  test: T;
};

export type PublicTestSummary = {
  id: string;
  kind: AdminTestKind;
  examType: string;
  skill: string;
  testName: string;
  level: string;
  questionCount: number;
  partType?: string;
  createdAt: string;
};

export function getAdminTests<T extends AdminStoredTest>(
  token: string,
  params: { kind?: AdminTestKind; examType?: string; skill?: string } = {},
) {
  const search = new URLSearchParams();
  if (params.kind) search.set("kind", params.kind);
  if (params.examType) search.set("examType", params.examType);
  if (params.skill) search.set("skill", params.skill);
  const suffix = search.toString() ? `?${search.toString()}` : "";

  return apiRequest<TestsResponse<T>>(`/admin/tests${suffix}`, { token });
}

export function createAdminTest<T extends AdminStoredTest>(
  token: string,
  kind: AdminTestKind,
  data: Omit<T, "id" | "createdAt">,
) {
  return apiRequest<TestResponse<T>>(`/admin/tests/${kind}`, {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteAdminTest(token: string, kind: AdminTestKind, id: string) {
  return apiRequest<{ success: true; message: string }>(`/admin/tests/${kind}/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getPublicTests() {
  return apiRequest<TestsResponse<PublicTestSummary>>("/tests");
}
