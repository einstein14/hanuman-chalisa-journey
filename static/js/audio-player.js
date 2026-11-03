import { t } from "./i18n.js";

export class AudioPlayer {
  constructor(container, lang) {
    this.container = container;
    this.lang = lang;
    this.audio = new Audio();
    this.repeatLeft = 0;
    this.speed = 1;
    this.currentSrc = null;
    this.available = null;
    this.audio.addEventListener("ended", () => this.onEnded());
  }

  setSpeed(rate) {
    this.speed = rate;
    this.audio.playbackRate = rate;
  }

  async probe(url) {
    if (!url) return false;
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok) return false;
      const type = res.headers.get("content-type") || "";
      return type.includes("audio") || url.endsWith(".mp3") || url.endsWith(".m4a");
    } catch {
      return false;
    }
  }

  async mount({ src, label }) {
    this.container.innerHTML = "";
    this.currentSrc = src;
    this.available = src ? await this.probe(src) : false;
    const panel = document.createElement("div");
    panel.className = "audio-panel";
    if (label) {
      const lbl = document.createElement("p");
      lbl.textContent = label;
      panel.appendChild(lbl);
    }
    if (!this.available) {
      const ph = document.createElement("p");
      ph.className = "audio-placeholder";
      ph.textContent = t("audioMissing", this.lang);
      panel.appendChild(ph);
      this.container.appendChild(panel);
      return;
    }
    this.audio.src = src;
    this.audio.playbackRate = this.speed;
    const row = document.createElement("div");
    row.className = "btn-row";
    row.style.justifyContent = "center";
    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "btn big-play";
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", t("play", this.lang));
    playBtn.addEventListener("click", () => this.toggle());
    row.appendChild(playBtn);
    const controls = [
      ["pause", () => this.pause()],
      ["replay", () => this.replay()],
      ["slow", () => this.setSpeed(0.75)],
      ["repeat3", () => this.repeat(3)],
      ["repeat5", () => this.repeat(5)],
    ];
    controls.forEach(([key, fn]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn ghost";
      b.textContent = t(key, this.lang);
      b.addEventListener("click", fn);
      row.appendChild(b);
    });
    panel.appendChild(row);
    this.container.appendChild(panel);
    this.playBtn = playBtn;
  }

  toggle() {
    if (this.audio.paused) this.audio.play().catch(() => {});
    else this.pause();
  }

  pause() {
    this.audio.pause();
    if (this.playBtn) this.playBtn.textContent = "▶";
  }

  replay() {
    this.audio.currentTime = 0;
    this.audio.play().catch(() => {});
    if (this.playBtn) this.playBtn.textContent = "⏸";
  }

  repeat(n) {
    this.repeatLeft = n;
    this.replay();
  }

  onEnded() {
    if (this.repeatLeft > 1) {
      this.repeatLeft -= 1;
      this.replay();
      return;
    }
    this.repeatLeft = 0;
    if (this.playBtn) this.playBtn.textContent = "▶";
  }

  destroy() {
    this.audio.pause();
    this.audio.src = "";
  }
}

export async function audioAvailable(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}
