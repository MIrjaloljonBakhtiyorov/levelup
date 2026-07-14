import { apiRequest } from "../../../services/apiClient";

export type StudyPlanType = "daily" | "weekly" | "custom";
export type StudyPlanStatus = "active" | "paused" | "completed";

export type StudyPlanItem = {
  id: string;
  day: string;
  title: string;
  details: string;
  order: number;
  completed: boolean;
};

export type StudyPlan = {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: StudyPlanType;
  status: StudyPlanStatus;
  items: StudyPlanItem[];
  createdAt: string;
  updatedAt: string;
};

export type StudyPlanPayload = Pick<StudyPlan, "title" | "description" | "type" | "status"> & {
  items: Array<Pick<StudyPlanItem, "day" | "title"> & Partial<Pick<StudyPlanItem, "id" | "details" | "order" | "completed">>>;
};

type StudyPlansResponse = {
  success: true;
  plans: StudyPlan[];
};

type StudyPlanResponse = {
  success: true;
  plan: StudyPlan;
};

export function getStudyPlans(token: string) {
  return apiRequest<StudyPlansResponse>("/user/study-plans", { token });
}

export function createStudyPlan(token: string, payload: StudyPlanPayload) {
  return apiRequest<StudyPlanResponse>("/user/study-plans", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateStudyPlan(token: string, planId: string, payload: StudyPlanPayload) {
  return apiRequest<StudyPlanResponse>(`/user/study-plans/${planId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteStudyPlan(token: string, planId: string) {
  return apiRequest<{ success: true; message: string }>(`/user/study-plans/${planId}`, {
    method: "DELETE",
    token,
  });
}

export function toggleStudyPlanItem(token: string, planId: string, itemId: string) {
  return apiRequest<StudyPlanResponse>(`/user/study-plans/${planId}/items/${itemId}/toggle`, {
    method: "PATCH",
    token,
  });
}
