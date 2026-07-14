import { apiRequest } from "../../../services/apiClient";
import type { AdminArticle, AdminCartoon, AdminCinema, AdminPodcast } from "../types/adminTypes";

export type AdminContentKind = "podcasts" | "articles" | "cinema" | "cartoons";

export type AdminContentItem = AdminPodcast | AdminArticle | AdminCinema | AdminCartoon;

export type ResourceItemFromApi = {
  id: string;
  type: AdminContentKind;
  section: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Podcast";
  category: string;
  title: string;
  level: string;
  duration: string;
  tone: "blue" | "green" | "orange" | "purple" | "pink";
  format: string;
  url?: string;
  fileName?: string;
  createdAt: string;
};

type ContentListResponse<T> = {
  success: true;
  items: T[];
};

type ContentItemResponse<T> = {
  success: true;
  item: T;
};

type ResourcesResponse = {
  success: true;
  resources: ResourceItemFromApi[];
};

type Payload<T extends AdminContentItem> = Omit<T, "id" | "createdAt">;

export function getAdminContent<T extends AdminContentItem>(token: string, kind: AdminContentKind) {
  return apiRequest<ContentListResponse<T>>(`/admin/content/${kind}`, { token });
}

export function createAdminContent<T extends AdminContentItem>(
  token: string,
  kind: AdminContentKind,
  data: Payload<T>,
) {
  return apiRequest<ContentItemResponse<T>>(`/admin/content/${kind}`, {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateAdminContent<T extends AdminContentItem>(
  token: string,
  kind: AdminContentKind,
  id: string,
  data: Payload<T>,
) {
  return apiRequest<ContentItemResponse<T>>(`/admin/content/${kind}/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteAdminContent(token: string, kind: AdminContentKind, id: string) {
  return apiRequest<{ success: true; message: string }>(`/admin/content/${kind}/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getPublicResources() {
  return apiRequest<ResourcesResponse>("/resources");
}
