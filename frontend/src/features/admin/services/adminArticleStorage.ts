import type { AdminArticle } from "../types/adminTypes";

const KEY = "admin_articles";

export function loadArticles(): AdminArticle[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminArticle[]) : [];
  } catch {
    return [];
  }
}

export function saveArticles(articles: AdminArticle[]): void {
  localStorage.setItem(KEY, JSON.stringify(articles));
  window.dispatchEvent(new Event("admin-data-changed"));
}

export function deleteArticle(id: string): void {
  saveArticles(loadArticles().filter((a) => a.id !== id));
}
