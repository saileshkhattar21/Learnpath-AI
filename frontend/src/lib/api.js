const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Thin fetch wrapper for the LearnPath AI backend.
 * `getToken` should be the function returned by Clerk's useAuth() hook —
 * pass it in from the calling component so this module stays framework-free.
 */
export async function apiRequest(path, { method = "GET", body, getToken } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (getToken) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error || `Request to ${path} failed with ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const getCurrentUser = (getToken) => apiRequest("/users/me", { getToken });
