const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function apiRequest(
  path,
  { method = "GET", body, getToken } = {},
) {
  const headers = { "Content-Type": "application/json" };

  if (getToken) {
    const token = await getToken();
    console.log("[api] token:", token ? token.slice(0, 20) + "…" : token);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log("[api] response status:", res.status, path);

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      data?.error || `Request to ${path} failed with ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const getCurrentUser = (getToken) =>
  apiRequest("/users/me", { getToken });

export const getTracks = (getToken) => apiRequest("/tracks", { getToken });

export const getTrack = (slug, getToken) =>
  apiRequest(`/tracks/${slug}`, { getToken });

export const saveTrackSkillRatings = (slug, ratings, getToken) =>
  apiRequest(`/tracks/${slug}/skills`, {
    method: "POST",
    body: { ratings },
    getToken,
  });

export const getTrackQuiz = (slug, getToken) =>
  apiRequest(`/tracks/${slug}/quiz`, { getToken });

export const submitTrackQuiz = (slug, responses, getToken) =>
  apiRequest(`/tracks/${slug}/quiz/submit`, {
    method: "POST",
    body: { responses },
    getToken,
  });

export const generateLearningPath = (slug, getToken) =>
  apiRequest(`/tracks/${slug}/path`, { method: "POST", getToken });
