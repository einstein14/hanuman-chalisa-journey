import { t, pickLangField } from "./i18n.js";
import { suggestNextVerseId } from "./storage.js";

export function renderHome(ctx) {
  const { el, lang, state, verses, navigate } = ctx;
  const nextId = suggestNextVerseId(state, verses);
  el.innerHTML = `
    <section class="hero-welcome">
      <img src="/images/hanuman/hero.jpg" alt="" class="hero-center" />
      <h1>${t("welcome", lang)}</h1>
    </section>
    <nav class="card-grid" aria-label="Main">
      <a class="card-link" href="#/learn/${nextId}">
        <strong>${t("continueLearning", lang)}</strong>
        <span>${t("continueDesc", lang)}</span>
      </a>
      <a class="card-link" href="#/learn/1">
        <strong>${t("learnChalisa", lang)}</strong>
        <span>${t("learnDesc", lang)}</span>
      </a>
      <a class="card-link" href="#/chant">
        <strong>${t("listenChant", lang)}</strong>
        <span>${t("listenDesc", lang)}</span>
      </a>
      <a class="card-link" href="#/meaning/1">
        <strong>${t("understand", lang)}</strong>
        <span>${t("understandDesc", lang)}</span>
      </a>
      <a class="card-link" href="#/games">
        <strong>${t("games", lang)}</strong>
        <span>${t("gamesDesc", lang)}</span>
      </a>
      <a class="card-link" href="#/stories">
        <strong>${t("stories", lang)}</strong>
        <span>${t("storiesDesc", lang)}</span>
      </a>
      <a class="card-link" href="#/progress">
        <strong>${t("progress", lang)}</strong>
        <span>${t("progressDesc", lang)}</span>
      </a>
    </nav>
  `;
}

export function verseLabel(verse, lang) {
  if (verse.type === "introductory_doha") {
    return lang === "te"
      ? `ప్రారంభ దోహ ${verse.number_in_type} / 2`
      : `Opening doha ${verse.number_in_type} of 2`;
  }
  if (verse.type === "concluding_doha") {
    return lang === "te" ? "ముగింపు దోహ" : "Closing doha";
  }
  return lang === "te"
    ? `చౌపాయ ${verse.number_in_type} / 40`
    : `Chaupai ${verse.number_in_type} of 40`;
}

export function renderTransliteration(verse, settings, lang) {
  const mode = settings.transliteration || "both";
  let html = "";
  if (mode === "both" || mode === "te") {
    html += `<p class="verse-trans telugu">${verse.telugu}</p>`;
  }
  if (mode === "both" || mode === "en") {
    html += `<p class="verse-trans">${verse.english_transliteration}</p>`;
  }
  return html;
}

export function renderMeaningBlock(verse, lang) {
  const meaning =
    lang === "te" ? verse.meaning_telugu : verse.meaning_english;
  const why =
    lang === "te" ? verse.why_special_telugu : verse.why_special_english;
  return `
    <div class="panel">
      <h2>${t("meaningTitle", lang)}</h2>
      <p>${meaning}</p>
      <h3>${t("whySpecial", lang)}</h3>
      <p>${why}</p>
    </div>
  `;
}
