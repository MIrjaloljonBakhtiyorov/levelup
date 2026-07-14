import type { AdminCinema } from "../types/adminTypes";

const KEY = "admin_cinema";

export function loadCinema(): AdminCinema[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminCinema[]) : [];
  } catch {
    return [];
  }
}

export function saveCinema(items: AdminCinema[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("admin-data-changed"));
}

export function deleteCinemaItem(id: string): void {
  saveCinema(loadCinema().filter((c) => c.id !== id));
}
