import type { AdminPodcast } from "../types/adminTypes";

const KEY = "admin_podcasts";

export function loadPodcasts(): AdminPodcast[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminPodcast[]) : [];
  } catch {
    return [];
  }
}

export function savePodcasts(podcasts: AdminPodcast[]): void {
  localStorage.setItem(KEY, JSON.stringify(podcasts));
  window.dispatchEvent(new Event("admin-data-changed"));
}

export function deletePodcast(id: string): void {
  savePodcasts(loadPodcasts().filter((p) => p.id !== id));
}
