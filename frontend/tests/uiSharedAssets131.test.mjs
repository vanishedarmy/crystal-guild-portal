import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

test("shared collapse pointer ships as a lightweight optimized WebP", () => {
  const rel = "public/ui/collapse-pointer-right.webp";
  const stat = fs.statSync(path.join(root, rel));
  assert.ok(stat.size > 0 && stat.size < 10000, `${rel} should stay lightweight`);
});

test("Rally Venture applies the dedicated scene directly to the panel", () => {
  const rel = "public/retro-phase-iii/scene-backgrounds-v4/rally_venture.webp";
  assert.ok(fs.existsSync(path.join(root, rel)));
  const css = read("src/styles/portal.css");
  assert.match(css, /\.rally-venture-notice \{[\s\S]*rally_venture\.webp/);
  assert.doesNotMatch(css, /\.rally-venture-notice::before[\s\S]{0,700}rally_venture\.webp/);
});

test("player collapsibles use one graphic with no visible Expand Collapse labels", () => {
  const css = read("src/styles/portal.css");
  assert.match(css, /section-collapse-button::before[\s\S]*collapse-pointer-right\.webp/);
  assert.doesNotMatch(css, /collapse-pointer-down\.webp/);
  for (const rel of ["src/player/Hunts.jsx", "src/player/Expeditions.jsx", "src/player/WhatsNew.jsx"]) {
    const source = read(rel);
    assert.doesNotMatch(source, />\{[^}]*\? \"Collapse\" : \"Expand\"\}\<\/button>/);
    assert.match(source, /aria-label=/);
  }
});

test("streamer and guide disclosures use the same shared pointer", () => {
  const streamer = read("src/styles/streamer.css");
  const guide = read("public/guide.css");
  assert.match(streamer, /collapse-pointer-right\.webp/);
  assert.doesNotMatch(streamer, /collapse-pointer-down\.webp/);
  assert.match(guide, /collapse-pointer-right\.webp/);
  assert.doesNotMatch(guide, /collapse-pointer-down\.webp/);
  assert.doesNotMatch(read("src/guide/guideRuntime.js"), />⌄</);
});
