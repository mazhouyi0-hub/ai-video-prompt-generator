"use strict";
/* AI Video Prompt Generator — core logic (pure, testable) + DOM wiring.
   Assembles an English video prompt in cinematographic order from
   structured fields. Empty fields are skipped. Original implementation. */

const MODELS = {
  generic: { label: "Any model", durations: ["5 seconds", "8 seconds", "10 seconds"], json: false },
  veo3: { label: "Veo 3 / 3.1", durations: ["8 seconds"], json: true },
  sora2: { label: "Sora 2", durations: ["10 seconds", "15 seconds", "25 seconds"], json: false }
};

const TEMPLATES = {
  cinematic: {
    label: "Cinematic Film",
    shot: "medium shot", camera: "slow push-in", lighting: "golden hour light",
    style: "cinematic realism, shallow depth of field, 24fps film look",
    mood: "emotional and quietly dramatic", audio: "ambient"
  },
  product: {
    label: "Product Ad",
    shot: "close-up", camera: "slow orbit around the subject", lighting: "clean studio softbox light",
    style: "premium commercial look, crisp details, glossy reflections",
    mood: "confident and aspirational", audio: "music"
  },
  social: {
    label: "Social Short (9:16)",
    shot: "medium close-up", camera: "handheld with natural micro-movement", lighting: "bright soft daylight",
    style: "native social video look, punchy colors, fast first-second hook",
    mood: "energetic and playful", audio: "sfx"
  },
  documentary: {
    label: "Documentary",
    shot: "wide shot", camera: "slow tracking shot", lighting: "natural available light",
    style: "observational documentary realism, subtle film grain",
    mood: "calm and authentic", audio: "ambient"
  },
  animation3d: {
    label: "3D Animation",
    shot: "wide shot", camera: "gentle crane move rising upward", lighting: "warm sunset glow",
    style: "high-end 3D animated feature look, soft global illumination, expressive characters",
    mood: "whimsical and heartwarming", audio: "music"
  },
  anime: {
    label: "Anime",
    shot: "medium shot", camera: "smooth pan across the scene", lighting: "vivid dusk light with a gradient sky",
    style: "hand-drawn anime look, clean line art, rich background painting",
    mood: "dreamy and nostalgic", audio: "music"
  }
};

const EXAMPLES = [
  {
    idea: "A street food vendor opens for the night",
    subject: "an elderly street food vendor with a weathered apron",
    action: "lights a gas stove and tosses noodles in a flaming wok, sparks of oil catching the light",
    setting: "a narrow night-market alley hung with paper lanterns, steam drifting between stalls"
  },
  {
    idea: "A robot learns to paint",
    subject: "a small round robot with a single expressive camera eye",
    action: "dips a brush into bright paint and makes its first careful stroke on a blank canvas",
    setting: "a sunlit artist studio with tall windows and plants on the shelves"
  },
  {
    idea: "A diver meets a whale",
    subject: "a lone freediver in a dark wetsuit",
    action: "holds still as a huge humpback whale glides past, one eye looking straight at her",
    setting: "deep blue open ocean with shafts of sunlight falling from the surface"
  },
  {
    idea: "Morning in a mountain village",
    subject: "a young shepherd leading a flock of sheep",
    action: "walks a stone path above the clouds as the first sunlight touches the rooftops below",
    setting: "a terraced mountain village at dawn, sea of clouds in the valley"
  }
];

const AUDIO_PHRASES = {
  none: "",
  ambient: "Audio: natural ambient sound of the location, no music.",
  music: "Audio: an instrumental score that matches the mood, swelling gently toward the end.",
  sfx: "Audio: crisp, punchy sound effects synced to the action.",
  dialogue: "Audio: clear dialogue with natural room tone and subtle ambient sound underneath."
};

function clean(v) { return (v || "").trim().replace(/\s+/g, " "); }
function sentence(v) {
  const t = clean(v);
  if (!t) return "";
  return /[.!?]$/.test(t) ? t : t + ".";
}
function cap(v) { const t = clean(v); return t ? t.charAt(0).toUpperCase() + t.slice(1) : ""; }

function buildPrompt(s) {
  const parts = [];
  // Opening sentence: "<Shot> of <subject>, <action>, in <setting>."
  let first = "";
  if (clean(s.shot) || clean(s.subject)) {
    first = cap([clean(s.shot), clean(s.subject)].filter(Boolean).join(" of "));
    if (clean(s.action)) first += (first ? ", " : "") + clean(s.action);
    if (clean(s.setting)) first += ", in " + clean(s.setting);
  } else {
    first = cap([clean(s.action), clean(s.setting) ? "in " + clean(s.setting) : ""].filter(Boolean).join(", "));
  }
  if (first) parts.push(sentence(first));
  if (clean(s.idea) && clean(s.idea).toLowerCase() !== clean(s.subject).toLowerCase()) {
    // idea only used when it adds info beyond subject; kept out of main flow unless no subject
    if (!clean(s.subject)) parts.unshift(sentence(cap(s.idea)));
  }
  if (clean(s.camera)) parts.push(sentence("Camera: " + clean(s.camera)));
  if (clean(s.lighting)) parts.push(sentence("Lighting: " + clean(s.lighting)));
  if (clean(s.style)) parts.push(sentence("Style: " + clean(s.style)));
  if (clean(s.mood)) parts.push(sentence("Mood: " + clean(s.mood)));
  const audio = AUDIO_PHRASES[s.audio] || "";
  if (audio) parts.push(audio);
  if (s.audio === "dialogue" && clean(s.dialogue)) {
    parts.push('Dialogue: "' + clean(s.dialogue).replace(/^"|"$/g, "") + '"');
  }
  const tech = [clean(s.duration), clean(s.aspect) ? clean(s.aspect) + " aspect ratio" : ""].filter(Boolean).join(", ");
  if (tech) parts.push(sentence(cap(tech)));
  if (clean(s.negative)) parts.push(sentence("Avoid: " + clean(s.negative)));
  return parts.join(" ");
}

function buildJson(s) {
  const obj = {
    scene: buildPrompt(Object.assign({}, s, { audio: "none", duration: "", aspect: "", negative: "" })),
    config: {
      duration: clean(s.duration) || undefined,
      aspectRatio: clean(s.aspect) || undefined,
      camera: clean(s.camera) || undefined,
      lighting: clean(s.lighting) || undefined
    },
    audio: (AUDIO_PHRASES[s.audio] || "").replace(/^Audio: /, "") || undefined,
    negativePrompt: clean(s.negative) || undefined
  };
  Object.keys(obj.config).forEach(k => obj.config[k] === undefined && delete obj.config[k]);
  Object.keys(obj).forEach(k => obj[k] === undefined && delete obj[k]);
  return JSON.stringify(obj, null, 2);
}

function wordCount(t) { const m = clean(t); return m ? m.split(" ").length : 0; }

/* ---------- DOM wiring (browser only) ---------- */
if (typeof document !== "undefined") {
  const $ = id => document.getElementById(id);
  const fields = ["idea", "subject", "action", "setting", "shot", "camera", "lighting", "style", "mood", "audio", "dialogue", "duration", "aspect", "negative"];
  function read() {
    const s = {};
    fields.forEach(f => { const el = $(f); s[f] = el ? el.value : ""; });
    s.model = ($("model") || {}).value || "generic";
    return s;
  }
  function render() {
    const s = read();
    const text = buildPrompt(s);
    $("output").value = text;
    $("wordcount").textContent = wordCount(text) + " words";
    const jsonBox = $("jsonwrap");
    if (jsonBox) {
      const show = MODELS[s.model] && MODELS[s.model].json;
      jsonBox.style.display = show ? "block" : "none";
      if (show) $("jsonoutput").value = buildJson(s);
    }
    const dWrap = $("dialoguewrap");
    if (dWrap) dWrap.style.display = s.audio === "dialogue" ? "block" : "none";
  }
  function fill(obj) {
    Object.keys(obj).forEach(k => { const el = $(k); if (el) el.value = obj[k]; });
    render();
  }
  document.addEventListener("DOMContentLoaded", () => {
    fields.forEach(f => { const el = $(f); if (el) el.addEventListener("input", render); });
    const modelEl = $("model");
    if (modelEl) {
      modelEl.addEventListener("change", () => {
        const d = $("duration");
        if (d) {
          const list = MODELS[modelEl.value].durations;
          d.innerHTML = list.map(x => '<option>' + x + "</option>").join("");
        }
        render();
      });
      const pageModel = document.body.getAttribute("data-model");
      if (pageModel && MODELS[pageModel]) {
        modelEl.value = pageModel;
        modelEl.dispatchEvent(new Event("change"));
      }
    }
    document.querySelectorAll("[data-template]").forEach(btn => {
      btn.addEventListener("click", () => {
        const t = TEMPLATES[btn.getAttribute("data-template")];
        if (t) fill({ shot: t.shot, camera: t.camera, lighting: t.lighting, style: t.style, mood: t.mood, audio: t.audio });
      });
    });
    document.querySelectorAll("[data-neg]").forEach(chip => {
      chip.addEventListener("click", () => {
        const el = $("negative");
        const cur = clean(el.value);
        const val = chip.getAttribute("data-neg");
        el.value = cur ? cur + ", " + val : val;
        render();
      });
    });
    const ex = $("example");
    if (ex) ex.addEventListener("click", () => {
      const e = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
      fill({ idea: e.idea, subject: e.subject, action: e.action, setting: e.setting });
    });
    const copyBtn = $("copy");
    if (copyBtn) copyBtn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText($("output").value); copyBtn.textContent = "Copied ✓"; }
      catch (e) { $("output").select(); document.execCommand("copy"); copyBtn.textContent = "Copied ✓"; }
      setTimeout(() => copyBtn.textContent = "Copy prompt", 1600);
    });
    const copyJson = $("copyjson");
    if (copyJson) copyJson.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText($("jsonoutput").value); copyJson.textContent = "Copied ✓"; }
      catch (e) { $("jsonoutput").select(); document.execCommand("copy"); copyJson.textContent = "Copied ✓"; }
      setTimeout(() => copyJson.textContent = "Copy JSON", 1600);
    });
    const dl = $("download");
    if (dl) dl.addEventListener("click", () => {
      const blob = new Blob([$("output").value], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "video-prompt.txt";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    render();
  });
}

/* Monetization slot: "generate with" destinations.
   Replace each url with your affiliate link when a program is approved;
   keep data-slot names stable for tracking. */
const GEN_LINKS = [
  { slot: "veo-flow", label: "Generate with Veo 3 (Google Flow)", url: "https://labs.google/flow" },
  { slot: "sora", label: "Generate with Sora 2", url: "https://sora.chatgpt.com" },
  { slot: "kling", label: "Generate with Kling", url: "https://klingai.com" },
  { slot: "runway", label: "Generate with Runway", url: "https://runwayml.com" }
];
function renderGenBar() {
  const box = document.getElementById("genwith");
  if (!box) return;
  const row = GEN_LINKS.map(l =>
    `<a href="${l.url}" target="_blank" rel="sponsored nofollow noopener" data-slot="${l.slot}">${l.label}</a>`).join("");
  box.innerHTML = `<p><strong>Got your prompt?</strong> Paste it into a video model to generate the clip:</p><div class="row">${row}</div>`;
}
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", renderGenBar);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { MODELS, TEMPLATES, EXAMPLES, buildPrompt, buildJson, wordCount };
}
