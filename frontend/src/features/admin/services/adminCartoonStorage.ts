import type { AdminCartoon } from "../types/adminTypes";

const KEY = "admin_cartoons";

export function loadCartoons(): AdminCartoon[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminCartoon[]) : [];
  } catch {
    return [];
  }
}

export function saveCartoons(items: AdminCartoon[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("admin-data-changed"));
}

export function deleteCartoon(id: string): void {
  saveCartoons(loadCartoons().filter((c) => c.id !== id));
}
