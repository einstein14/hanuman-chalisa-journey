import { fetchSections } from "./api.js";
import { audioAvailable, AudioPlayer } from "./audio-player.js";
import { t } from "./i18n.js";

let player = null;

const SECTION_KEYS = [
  { id: "full_chalisa", key: "sectionFull", audioField: "audio" },
  { id: "intro_dohas", key: "sectionIntro", audioField: "audio" },
  { id: "chaupais", key: "sectionChaupais", audioField: "audio" },
  { id: "concluding_doha", key: "sectionEnd", audioField: "audio" },
];

function mountYoutube(container, videoId, lang) {
  container.innerHTML = "";
  const panel = document.createElement("div");
  panel.className = "audio-panel video-panel";
  const note = document.createElement("p");
  note.className = "video-note";
  note.textContent = t("fullChalisaVideoNote", lang);
  panel.appendChild(note);
  const wrap = document.createElement("div");
  wrap.className = "video-wrap";
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
  iframe.title = t("sectionFull", lang);
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.loading = "lazy";
  wrap.appendChild(iframe);
  panel.appendChild(wrap);
  container.appendChild(panel);
}

export async function renderChant(ctx) {
  const { el, lang, settings } = ctx;
  const sections = await fetchSections();
  el.innerHTML = `
    <a class="back-link" href="#/">← ${t("backHome", lang)}</a>
    <div class="panel">
      <h2>${t("listenChant", lang)}</h2>
      <p>${t("listenDesc", lang)}</p>
      <div class="btn-row" id="sectionPick"></div>
    </div>
    <div id="chant-audio"></div>
  `;
  const pick = document.getElementById("sectionPick");
  const host = document.getElementById("chant-audio");

  async function selectSection(meta, secKey) {
    pick.querySelectorAll("button").forEach((x) => x.classList.remove("secondary"));
    if (player) {
      player.destroy();
      player = null;
    }
    host.innerHTML = "";

    if (meta.youtube_id && secKey === "full_chalisa") {
      mountYoutube(host, meta.youtube_id, lang);
      if (meta.audio && (await audioAvailable(meta.audio))) {
        const local = document.createElement("div");
        host.appendChild(local);
        player = new AudioPlayer(local, lang);
        player.setSpeed(settings.playbackSpeed || 1);
        await player.mount({ src: meta.audio, label: t("sectionFullLocal", lang) });
      }
      return;
    }

    player = new AudioPlayer(host, lang);
    player.setSpeed(settings.playbackSpeed || 1);
    await player.mount({
      src: meta.audio,
      label: t(SECTION_KEYS.find((s) => s.id === secKey)?.key || "listenChant", lang),
    });
  }

  SECTION_KEYS.forEach((sec, i) => {
    const meta = sections[sec.id] || {};
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn ghost";
    b.textContent = t(sec.key, lang);
    b.addEventListener("click", () => {
      pick.querySelectorAll("button").forEach((x) => x.classList.remove("secondary"));
      b.classList.add("secondary");
      selectSection(meta, sec.id);
    });
    pick.appendChild(b);
    if (i === 0) {
      selectSection(meta, sec.id);
    }
  });
}
