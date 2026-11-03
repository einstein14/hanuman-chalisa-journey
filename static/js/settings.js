import { t, applyI18n } from "./i18n.js";
import { loadState, resetProgress, saveState } from "./storage.js";

let gateTimer = null;

export function renderSettingsGate(ctx) {
  const { el, lang } = ctx;
  el.innerHTML = `
    <a class="back-link" href="#/">← ${t("backHome", lang)}</a>
    <div class="panel parent-gate">
      <p>${t("parentGate", lang)}</p>
      <button type="button" class="btn hold-btn" id="holdBtn">${t("holdOpen", lang)}</button>
    </div>
  `;
  const btn = document.getElementById("holdBtn");
  const start = () => {
    gateTimer = window.setTimeout(() => ctx.navigate("#/settings/panel"), 3000);
  };
  const stop = () => {
    if (gateTimer) window.clearTimeout(gateTimer);
    gateTimer = null;
  };
  btn.addEventListener("mousedown", start);
  btn.addEventListener("touchstart", start);
  btn.addEventListener("mouseup", stop);
  btn.addEventListener("mouseleave", stop);
  btn.addEventListener("touchend", stop);
}

export function renderSettingsPanel(ctx) {
  const { el, lang, state, onSettingsChange } = ctx;
  const s = state.settings;
  el.innerHTML = `
    <a class="back-link" href="#/">← ${t("backHome", lang)}</a>
    <div class="panel">
      <h2>${t("settings", lang)}</h2>
      <div class="settings-field">
        <label for="uiLang">${t("uiLanguage", lang)}</label>
        <select id="uiLang">
          <option value="en">English</option>
          <option value="te">Telugu</option>
        </select>
      </div>
      <div class="settings-field">
        <label for="translit">${t("transliteration", lang)}</label>
        <select id="translit">
          <option value="both">${t("both", lang)}</option>
          <option value="te">${t("teOnly", lang)}</option>
          <option value="en">${t("enOnly", lang)}</option>
        </select>
      </div>
      <div class="settings-field">
        <label for="daily">${t("dailyTarget", lang)}</label>
        <input type="number" id="daily" min="1" max="5" value="${s.dailyTarget}" />
      </div>
      <div class="settings-field">
        <label><input type="checkbox" id="gamesOn" ${s.gamesEnabled ? "checked" : ""} /> ${t("enableGames", lang)}</label>
      </div>
      <div class="settings-field">
        <label><input type="checkbox" id="storiesOn" ${s.storiesEnabled ? "checked" : ""} /> ${t("enableStories", lang)}</label>
      </div>
      <div class="settings-field">
        <label for="speed">${t("playbackSpeed", lang)}: <span id="speedVal">${s.playbackSpeed}</span></label>
        <input type="range" id="speed" min="0.5" max="1.5" step="0.25" value="${s.playbackSpeed}" />
      </div>
      <button type="button" class="btn ghost" id="resetBtn">${t("resetProgress", lang)}</button>
    </div>
  `;
  document.getElementById("uiLang").value = s.uiLang;
  document.getElementById("translit").value = s.transliteration;
  const persist = () => {
    state.settings.uiLang = document.getElementById("uiLang").value;
    state.settings.transliteration = document.getElementById("translit").value;
    state.settings.dailyTarget = Number(document.getElementById("daily").value) || 2;
    state.settings.gamesEnabled = document.getElementById("gamesOn").checked;
    state.settings.storiesEnabled = document.getElementById("storiesOn").checked;
    state.settings.playbackSpeed = Number(document.getElementById("speed").value);
    saveState(state);
    onSettingsChange(state.settings.uiLang);
  };
  ["uiLang", "translit", "daily", "gamesOn", "storiesOn", "speed"].forEach((id) => {
    document.getElementById(id).addEventListener("change", persist);
  });
  document.getElementById("speed").addEventListener("input", (e) => {
    document.getElementById("speedVal").textContent = e.target.value;
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (window.confirm("Reset all learning progress?")) {
      const next = resetProgress(state);
      Object.assign(state, next);
      onSettingsChange(state.settings.uiLang);
      ctx.navigate("#/");
    }
  });
}
