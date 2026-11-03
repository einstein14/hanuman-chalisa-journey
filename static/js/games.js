import { fetchGames } from "./api.js";
import { audioAvailable, AudioPlayer } from "./audio-player.js";
import { t } from "./i18n.js";
import { getLearnedIds, saveState } from "./storage.js";

const POSITIVE = ["wonderful", "greatListening", "learning"];

function feedback(el, positive, lang) {
  el.innerHTML = `<div class="feedback ${positive ? "positive" : "try-again"}">${
    positive ? t(POSITIVE[Math.floor(Math.random() * POSITIVE.length)], lang) : t("tryAgain", lang)
  }</div>`;
}

export async function renderGames(ctx) {
  const { el, lang, state } = ctx;
  if (!state.settings.gamesEnabled) {
    el.innerHTML = `<p>${t("noLearnedGames", lang)}</p>`;
    return;
  }
  const learned = getLearnedIds(state);
  el.innerHTML = `<a class="back-link" href="#/">← ${t("backHome", lang)}</a>
    <div class="panel"><h2>${t("gamesTitle", lang)}</h2></div><div id="gameArea"></div>`;
  const area = document.getElementById("gameArea");
  if (!learned.length) {
    area.innerHTML = `<p>${t("noLearnedGames", lang)}</p>`;
    return;
  }
  const data = await fetchGames(learned);
  const questions = data.questions || [];
  if (!questions.length) {
    area.innerHTML = `<p>${t("noLearnedGames", lang)}</p>`;
    return;
  }
  const q = questions[Math.floor(Math.random() * questions.length)];
  renderQuestion(area, q, lang, state, ctx);
}

function bumpGames(state) {
  state.gamesCompleted += 1;
  saveState(state);
}

async function renderQuestion(area, q, lang, state, ctx) {
  area.innerHTML = "";
  const panel = document.createElement("div");
  panel.className = "panel";
  const fb = document.createElement("div");
  if (q.type === "fill_blank") {
    panel.innerHTML = `<h2>${t("fillBlank", lang)}</h2><p class="verse-hindi">${q.prompt_hindi}</p>`;
    const opts = document.createElement("div");
    opts.className = "game-options";
    q.options.forEach((word) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn ghost";
      b.textContent = word;
      b.addEventListener("click", () => {
        feedback(fb, word === q.correct, lang);
        if (word === q.correct) bumpGames(state);
      });
      opts.appendChild(b);
    });
    panel.appendChild(opts);
  } else if (q.type === "arrange_lines") {
    panel.innerHTML = `<h2>${t("arrange", lang)}</h2>`;
    let order = [...q.shuffled];
    const list = document.createElement("div");
    list.className = "game-options";
    const renderList = () => {
      list.innerHTML = "";
      order.forEach((line, i) => {
        const row = document.createElement("div");
        row.className = "btn-row";
        const span = document.createElement("span");
        span.className = "verse-hindi";
        span.style.fontSize = "1rem";
        span.textContent = line;
        row.appendChild(span);
        if (i > 0) {
          const up = document.createElement("button");
          up.type = "button";
          up.className = "btn ghost";
          up.textContent = "↑";
          up.addEventListener("click", () => {
            [order[i - 1], order[i]] = [order[i], order[i - 1]];
            renderList();
          });
          row.appendChild(up);
        }
        if (i < order.length - 1) {
          const down = document.createElement("button");
          down.type = "button";
          down.className = "btn ghost";
          down.textContent = "↓";
          down.addEventListener("click", () => {
            [order[i + 1], order[i]] = [order[i], order[i + 1]];
            renderList();
          });
          row.appendChild(down);
        }
        list.appendChild(row);
      });
    };
    renderList();
    panel.appendChild(list);
    const check = document.createElement("button");
    check.type = "button";
    check.className = "btn";
    check.textContent = t("check", lang);
    check.addEventListener("click", () => {
      const ok = order.every((l, i) => l === q.lines[i]);
      feedback(fb, ok, lang);
      if (ok) bumpGames(state);
    });
    panel.appendChild(check);
  } else if (q.type === "match_meaning") {
    panel.innerHTML = `<h2>${t("matchMeaning", lang)}</h2><p class="verse-hindi">${q.verse_preview}</p>`;
    const opts = document.createElement("div");
    opts.className = "game-options";
    q.options.forEach((m) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn ghost";
      b.textContent = m;
      b.addEventListener("click", () => {
        feedback(fb, m === q.correct, lang);
        if (m === q.correct) bumpGames(state);
      });
      opts.appendChild(b);
    });
    panel.appendChild(opts);
  } else if (q.type === "listen_identify") {
    const ok = await audioAvailable(q.audio);
    if (!ok) {
      panel.innerHTML = `<p>${t("audioMissing", lang)}</p>`;
      area.appendChild(panel);
      area.appendChild(fb);
      return;
    }
    panel.innerHTML = `<h2>${t("listenId", lang)}</h2><div id="gid-audio"></div>`;
    area.appendChild(panel);
    const audioHost = document.getElementById("gid-audio");
    const pl = new AudioPlayer(audioHost, lang);
    await pl.mount({ src: q.audio });
    const opts = document.createElement("div");
    opts.className = "game-options";
    q.options.forEach((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn ghost";
      b.textContent = o.label;
      b.addEventListener("click", () => {
        feedback(fb, o.id === q.correct_id, lang);
        if (o.id === q.correct_id) bumpGames(state);
      });
      opts.appendChild(b);
    });
    panel.appendChild(opts);
  } else if (q.type === "memory_match") {
    panel.innerHTML = `<h2>${t("memory", lang)}</h2><p>${q.pair_a}</p>`;
    const opts = document.createElement("div");
    opts.className = "game-options";
    const decoys = [q.pair_b, q.pair_b.slice(0, 20) + "…"];
    const choices = [q.pair_b, q.pair_a.slice(0, 30)];
    [...new Set(choices)].forEach((m) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn ghost";
      b.textContent = m;
      b.addEventListener("click", () => {
        feedback(fb, m === q.pair_b, lang);
        if (m === q.pair_b) bumpGames(state);
      });
      opts.appendChild(b);
    });
    panel.appendChild(opts);
  }
  area.appendChild(panel);
  area.appendChild(fb);
  const again = document.createElement("button");
  again.type = "button";
  again.className = "btn ghost";
  again.textContent = t("shuffle", lang);
  again.addEventListener("click", () => renderGames(ctx));
  area.appendChild(again);
}
