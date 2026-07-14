import { apiRequest } from "../../../services/apiClient";
import type { Tone } from "../components/UserUI";

export type ResourceSection = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Podcast";

export type UserResource = {
  id: string;
  type: "podcasts" | "articles" | "cinema" | "cartoons";
  section: ResourceSection;
  category: string;
  title: string;
  level: string;
  duration: string;
  tone: Tone;
  format: string;
  url?: string;
  fileName?: string;
  createdAt: string;
};

type ResourcesResponse = {
  success: true;
  resources: UserResource[];
};

export function getResources() {
  return apiRequest<ResourcesResponse>("/resources");
}
