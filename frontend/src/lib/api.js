const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function apiRequest(
  path,
  { method = "GET", body, getToken } = {},
) {
  if (!getToken) throw new Error("This request requires an authenticated session.");

  const requestWithToken = (token) => fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });

  let token = await getToken();
  if (!token) throw new Error("Your secure session is still loading. Please try again in a moment.");
  let res = await requestWithToken(token);

  // A restored session can briefly expose a token the API has not accepted.
  // Mint one fresh token and retry once; genuine 401 responses still surface.
  if (res.status === 401) {
    token = await getToken({ skipCache: true });
    if (token) res = await requestWithToken(token);
  }

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

export const getTrackStudy = (slug, getToken) =>
  apiRequest(`/tracks/${slug}/study`, { getToken });

export const regenerateLearningPath = (slug, getToken) =>
  apiRequest(`/tracks/${slug}/path/regenerate`, { method: "POST", getToken });

export const getSectionQuiz = (slug, sectionId, getToken) =>
  apiRequest(`/tracks/${slug}/sections/${sectionId}/quiz`, { getToken });

export const submitSectionQuiz = (slug, sectionId, responses, getToken) =>
  apiRequest(`/tracks/${slug}/sections/${sectionId}/quiz/submit`, {
    method: "POST",
    body: { responses },
    getToken,
  });
