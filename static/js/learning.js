import { fetchVerse } from "./api.js";
import { AudioPlayer } from "./audio-player.js";
import { t } from "./i18n.js";
import {
  getVerseProgress,
  recordSession,
  setVerseProgress,
} from "./storage.js";
import {
  renderMeaningBlock,
  renderTransliteration,
  verseLabel,
} from "./home.js";

let player = null;

export async function renderLearn(ctx) {
  const id = Number(ctx.params.get("id") || 1);
  const { el, lang, state, verses, settings } = ctx;
  const verse = await fetchVerse(id);
  const idx = verses.findIndex((v) => v.id === id);
  const prev = idx > 0 ? verses[idx - 1].id : null;
  const next = idx < verses.length - 1 ? verses[idx + 1].id : null;
  const progress = getVerseProgress(state, id);
  if (progress.status === "new") {
    setVerseProgress(state, id, {
      status: "introduced",
      lastPracticed: new Date().toISOString(),
    });
  } else {
    setVerseProgress(state, id, {
      status: progress.status === "learned" ? "learned" : "learning",
      practiceCount: (progress.practiceCount || 0) + 1,
      lastPracticed: new Date().toISOString(),
    });
  }
  recordSession(state);
  const learnedCount = Object.values(state.verses).filter(
    (v) => v.status === "learned"
  ).length;
  const pct = Math.round((learnedCount / verses.length) * 100);
  el.innerHTML = `
    <a class="back-link" href="#/">← ${t("backHome", lang)}</a>
    <div class="panel">
      <p><strong>${verseLabel(verse, lang)}</strong></p>
      <div class="progress-bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
      <p class="verse-hindi">${verse.hindi}</p>
      ${renderTransliteration(verse, settings, lang)}
    </div>
    <div id="learn-audio"></div>
    ${renderMeaningBlock(verse, lang)}
    <div class="btn-row">
      ${prev ? `<a class="btn ghost" href="#/learn/${prev}">${t("prev", lang)}</a>` : ""}
      ${next ? `<a class="btn ghost" href="#/learn/${next}">${t("next", lang)}</a>` : ""}
      <button type="button" class="btn secondary" id="markLearned">${t("markLearned", lang)}</button>
      <button type="button" class="btn" id="practiceAgain">${t("practiceAgain", lang)}</button>
    </div>
  `;
  if (player) player.destroy();
  player = new AudioPlayer(document.getElementById("learn-audio"), lang);
  player.setSpeed(settings.playbackSpeed || 1);
  await player.mount({ src: verse.audio, label: null });
  document.getElementById("markLearned").addEventListener("click", () => {
    setVerseProgress(state, id, {
      status: "learned",
      lastPracticed: new Date().toISOString(),
    });
    if (next) ctx.navigate(`#/learn/${next}`);
  });
  document.getElementById("practiceAgain").addEventListener("click", () => {
    setVerseProgress(state, id, {
      status: "needs_revision",
      practiceCount: (getVerseProgress(state, id).practiceCount || 0) + 1,
      lastPracticed: new Date().toISOString(),
    });
    player?.replay();
  });
}

export async function renderMeaning(ctx) {
  const id = Number(ctx.params.get("id") || 1);
  const { el, lang, verses, settings } = ctx;
  const verse = await fetchVerse(id);
  const idx = verses.findIndex((v) => v.id === id);
  const prev = idx > 0 ? verses[idx - 1].id : null;
  const next = idx < verses.length - 1 ? verses[idx + 1].id : null;
  el.innerHTML = `
    <a class="back-link" href="#/">← ${t("backHome", lang)}</a>
    <div class="panel">
      <p><strong>${verseLabel(verse, lang)}</strong></p>
      <p class="verse-hindi">${verse.hindi}</p>
      ${renderTransliteration(verse, settings, lang)}
    </div>
    ${renderMeaningBlock(verse, lang)}
    <div class="btn-row">
      ${prev ? `<a class="btn ghost" href="#/meaning/${prev}">${t("prev", lang)}</a>` : ""}
      ${next ? `<a class="btn ghost" href="#/meaning/${next}">${t("next", lang)}</a>` : ""}
      <a class="btn" href="#/learn/${id}">${t("learnChalisa", lang)}</a>
    </div>
  `;
}
