import { fetchStories, fetchStory } from "./api.js";
import { t } from "./i18n.js";

export async function renderStoriesList(ctx) {
  const { el, lang, state } = ctx;
  if (!state.settings.storiesEnabled) {
    el.innerHTML = `<p>${t("stories", lang)}</p>`;
    return;
  }
  const stories = await fetchStories();
  el.innerHTML = `<a class="back-link" href="#/">← ${t("backHome", lang)}</a>
    <div class="panel"><h2>${t("stories", lang)}</h2></div>`;
  const grid = document.createElement("nav");
  grid.className = "card-grid";
  stories.forEach((s) => {
    const a = document.createElement("a");
    a.className = "card-link";
    a.href = `#/stories/${s.id}`;
    const title = lang === "te" ? s.title_te : s.title_en;
    a.innerHTML = `<img class="story-card-img" src="${s.image}" alt="" loading="lazy" /><strong>${title}</strong>`;
    grid.appendChild(a);
  });
  el.appendChild(grid);
}

export async function renderStoryDetail(ctx) {
  const id = Number(ctx.params.get("id") || 1);
  const { el, lang } = ctx;
  const story = await fetchStory(id);
  el.innerHTML = `
    <a class="back-link" href="#/stories">← ${t("stories", lang)}</a>
    <div class="panel">
      <img class="story-hero-img" src="${story.image}" alt="" />
      <h2>${lang === "te" ? story.title_te : story.title_en}</h2>
      <p>${lang === "te" ? story.body_te : story.body_en}</p>
      <p><strong>${lang === "te" ? story.moral_te : story.moral_en}</strong></p>
    </div>
  `;
}
