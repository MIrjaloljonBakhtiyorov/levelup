const DEFAULT_API_URL = "http://localhost:3000/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? DEFAULT_API_URL;

type ApiRequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  { headers, token, ...options }: ApiRequestOptions = {},
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Server bilan bog‘lanishda xatolik");
  }

  return payload as T;
}
