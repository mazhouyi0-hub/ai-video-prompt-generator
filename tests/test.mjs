import assert from "node:assert";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { buildPrompt, buildJson, wordCount, TEMPLATES } = require("../assets/app.js");

const empty = { idea:"", subject:"", action:"", setting:"", shot:"", camera:"", lighting:"", style:"", mood:"", audio:"none", dialogue:"", duration:"", aspect:"", negative:"", model:"generic" };

// 1. Empty input -> empty prompt
assert.equal(buildPrompt(empty), "");

// 2. Full assembly keeps order: scene, camera, lighting, style, mood, audio, tech, negative
const full = { ...empty,
  subject: "a young shepherd leading a flock of sheep",
  action: "walks a stone path above the clouds",
  setting: "a terraced mountain village at dawn",
  shot: "wide shot", camera: "slow tracking shot", lighting: "golden hour light",
  style: "cinematic realism", mood: "calm and hopeful",
  audio: "ambient", duration: "8 seconds", aspect: "16:9", negative: "blurry, watermark" };
const p = buildPrompt(full);
assert.ok(p.startsWith("Wide shot of a young shepherd"), p);
assert.ok(p.indexOf("Camera:") > p.indexOf("dawn."), p);
assert.ok(p.indexOf("Lighting:") > p.indexOf("Camera:"), p);
assert.ok(p.includes("Audio: natural ambient sound"), p);
assert.ok(p.includes("8 seconds, 16:9 aspect ratio."), p);
assert.ok(p.endsWith("Avoid: blurry, watermark."), p);

// 3. Empty fields skipped, no double spaces or stray commas
const sparse = buildPrompt({ ...empty, action: "a cat chases a butterfly" });
assert.equal(sparse, "A cat chases a butterfly.");
assert.ok(!/  /.test(buildPrompt(full)));

// 4. Dialogue only appears in dialogue mode and is quoted
const dlg = buildPrompt({ ...empty, subject: "a vendor", audio: "dialogue", dialogue: "We open in five minutes." });
assert.ok(dlg.includes('Dialogue: "We open in five minutes."'), dlg);
const noDlg = buildPrompt({ ...empty, subject: "a vendor", audio: "music", dialogue: "should not appear" });
assert.ok(!noDlg.includes("should not appear"), noDlg);

// 5. JSON is valid and carries separated fields
const j = JSON.parse(buildJson({ ...full, model: "veo3" }));
assert.equal(j.config.aspectRatio, "16:9");
assert.equal(j.config.camera, "slow tracking shot");
assert.equal(j.negativePrompt, "blurry, watermark");
assert.ok(j.scene.length > 20 && !j.scene.includes("Avoid:"), j.scene);

// 6. Templates are complete
for (const [k, t] of Object.entries(TEMPLATES)) {
  for (const f of ["shot","camera","lighting","style","mood","audio"]) assert.ok(t[f], `${k}.${f}`);
}

// 7. Word count
assert.equal(wordCount("one two  three"), 3);
assert.equal(wordCount(""), 0);

console.log("ALL TESTS PASS");
