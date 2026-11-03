import { t } from "./i18n.js";
import { getStats } from "./storage.js";

export function renderProgress(ctx) {
  const { el, lang, state, verses } = ctx;
  const stats = getStats(state, verses.length);
  el.innerHTML = `
    <a class="back-link" href="#/">← ${t("backHome", lang)}</a>
    <div class="panel">
      <h2>${t("progress", lang)}</h2>
      <p>${t("progressTitle", lang)}</p>
      <div class="stat-grid">
        <div class="stat"><strong>${stats.introduced}</strong><span>Introduced</span></div>
        <div class="stat"><strong>${stats.learned}</strong><span>Learned</span></div>
        <div class="stat"><strong>${stats.needsRevision}</strong><span>Review</span></div>
        <div class="stat"><strong>${stats.gamesCompleted}</strong><span>Games</span></div>
        <div class="stat"><strong>${stats.sessionCount}</strong><span>Sessions</span></div>
        <div class="stat"><strong>${stats.lastLearningDate || "—"}</strong><span>Last day</span></div>
      </div>
    </div>
  `;
}
