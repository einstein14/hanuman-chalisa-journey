const KEY = "hanuman_journey_v1";

const DEFAULTS = {
  settings: {
    uiLang: "en",
    transliteration: "both",
    dailyTarget: 2,
    gamesEnabled: true,
    storiesEnabled: true,
    playbackSpeed: 1,
  },
  verses: {},
  gamesCompleted: 0,
  sessionCount: 0,
  lastLearningDate: null,
};

function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULTS));
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw);
    return {
      ...cloneDefaults(),
      ...parsed,
      settings: { ...DEFAULTS.settings, ...(parsed.settings || {}) },
      verses: parsed.verses || {},
    };
  } catch {
    return cloneDefaults();
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getVerseProgress(state, id) {
  return (
    state.verses[id] || {
      status: "new",
      practiceCount: 0,
      lastPracticed: null,
    }
  );
}

export function setVerseProgress(state, id, patch) {
  const current = getVerseProgress(state, id);
  state.verses[id] = { ...current, ...patch };
  saveState(state);
  return state;
}

export function recordSession(state) {
  state.sessionCount += 1;
  state.lastLearningDate = new Date().toISOString().slice(0, 10);
  saveState(state);
}

export function resetProgress(state) {
  const settings = state.settings;
  const fresh = cloneDefaults();
  fresh.settings = settings;
  saveState(fresh);
  return fresh;
}

export function getLearnedIds(state) {
  return Object.entries(state.verses)
    .filter(([, v]) => v.status === "learned")
    .map(([id]) => Number(id))
    .sort((a, b) => a - b);
}

export function getStats(state, totalVerses) {
  let introduced = 0;
  let learned = 0;
  let needsRevision = 0;
  Object.values(state.verses).forEach((v) => {
    if (v.status !== "new") introduced += 1;
    if (v.status === "learned") learned += 1;
    if (v.status === "needs_revision") needsRevision += 1;
  });
  return {
    introduced,
    learned,
    needsRevision,
    totalVerses,
    gamesCompleted: state.gamesCompleted,
    sessionCount: state.sessionCount,
    lastLearningDate: state.lastLearningDate,
  };
}

export function suggestNextVerseId(state, verses) {
  const target = state.settings.dailyTarget || 2;
  const today = new Date().toISOString().slice(0, 10);
  let introducedToday = 0;
  Object.values(state.verses).forEach((v) => {
    if (v.lastPracticed && v.lastPracticed.slice(0, 10) === today && v.status !== "new") {
      introducedToday += 1;
    }
  });
  for (const v of verses) {
    const p = getVerseProgress(state, v.id);
    if (p.status === "learning" || p.status === "introduced") return v.id;
  }
  if (introducedToday < target) {
    for (const v of verses) {
      const p = getVerseProgress(state, v.id);
      if (p.status === "new") return v.id;
    }
  }
  for (const v of verses) {
    const p = getVerseProgress(state, v.id);
    if (p.status === "needs_revision") return v.id;
  }
  return verses[0]?.id || 1;
}
