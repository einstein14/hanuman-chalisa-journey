import { fetchVerses } from "./api.js";
import { applyI18n, t } from "./i18n.js";
import { registerRoute, startRouter } from "./router.js";
import { loadState, saveState } from "./storage.js";
import { renderChant } from "./chant.js";
import { renderGames } from "./games.js";
import { renderHome } from "./home.js";
import { renderLearn, renderMeaning } from "./learning.js";
import { renderProgress } from "./progress.js";
import { renderSettingsGate, renderSettingsPanel } from "./settings.js";
import { renderStoriesList, renderStoryDetail } from "./stories.js";

const viewEl = document.getElementById("view");
let state = loadState();
let verses = [];
let lang = state.settings.uiLang || "en";

function syncLangToggle() {
  const btn = document.getElementById("langToggle");
  if (!btn) return;
  btn.textContent = lang === "en" ? "TE" : "EN";
}

function setLang(next) {
  lang = next;
  state.settings.uiLang = next;
  saveState(state);
  applyI18n(lang);
  syncLangToggle();
}

async function ctx(extra = {}) {
  return {
    el: viewEl,
    lang,
    state,
    verses,
    settings: state.settings,
    navigate: (h) => {
      window.location.hash = h.startsWith("#") ? h : `#${h.replace(/^#/, "")}`;
    },
    onSettingsChange: (l) => setLang(l),
    ...extra,
  };
}

async function boot() {
  verses = await fetchVerses();
  applyI18n(lang);
  syncLangToggle();
  document.getElementById("langToggle").addEventListener("click", () => {
    setLang(lang === "en" ? "te" : "en");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

  registerRoute("/", async () => renderHome(await ctx()));
  registerRoute("/learn/:id", async (r) => renderLearn(await ctx(r)));
  registerRoute("/meaning/:id", async (r) => renderMeaning(await ctx(r)));
  registerRoute("/chant", async () => renderChant(await ctx()));
  registerRoute("/games", async () => renderGames(await ctx()));
  registerRoute("/stories", async () => renderStoriesList(await ctx()));
  registerRoute("/stories/:id", async (r) => renderStoryDetail(await ctx(r)));
  registerRoute("/progress", async () => renderProgress(await ctx()));
  registerRoute("/settings", async () => renderSettingsGate(await ctx()));
  registerRoute("/settings/panel", async () => renderSettingsPanel(await ctx()));

  await startRouter();
}

boot().catch((err) => {
  viewEl.innerHTML = `<p class="audio-placeholder">${err.message}</p>`;
});
