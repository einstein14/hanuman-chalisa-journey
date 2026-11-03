export async function apiGet(path) {
  const res = await fetch(path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export function fetchVerses() {
  return apiGet("/api/verses").then((d) => d.verses);
}

export function fetchVerse(id) {
  return apiGet(`/api/verses/${id}`);
}

export function fetchStories() {
  return apiGet("/api/stories").then((d) => d.stories);
}

export function fetchStory(id) {
  return apiGet(`/api/stories/${id}`);
}

export function fetchGames(learnedIds) {
  const q = learnedIds.length ? `?learned=${learnedIds.join(",")}` : "";
  return apiGet(`/api/games${q}`);
}

export function fetchJourney() {
  return apiGet("/api/journey");
}

export function fetchSections() {
  return apiGet("/api/sections").then((d) => d.sections);
}
