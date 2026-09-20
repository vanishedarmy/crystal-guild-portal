import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const main = read("src/main.jsx");
const css = read("src/styles/uiux-polish.css");
const guide = read("public/guide.css");

test("v1.8.2 comprehensive polish loads as the final Portal style layer", () => {
  const fit = main.indexOf('import "./styles/button-fit.css"');
  const polish = main.indexOf('import "./styles/uiux-polish.css"');
  assert.ok(fit >= 0);
  assert.ok(polish > fit);
  assert.match(css, /comprehensive UI\/UX polish pass/i);
});

test("polish layer hardens containment and natural text wrapping", () => {
  assert.match(css, /universal containment \+ readable wrapping/);
  assert.match(css, /min-width: 0;/);
  assert.match(css, /text-wrap: balance;/);
  assert.match(css, /text-wrap: pretty;/);
  assert.match(css, /word-break: normal;/);
});

test("keyboard focus and motion preferences receive explicit treatment", () => {
  assert.match(css, /:focus-visible \{/);
  assert.match(css, /outline: 3px solid rgba\(143, 219, 255, \.66\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /transition-duration: \.001ms !important/);
});

test("mobile forms use readable no-zoom text sizing", () => {
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*input, select, textarea\)[\s\S]*font-size: 16px/);
});

test("mobile core combat actions remain compact while long choices can stack", () => {
  assert.match(css, /\.live-stream-core-actions,[\s\S]*\.expedition-action-grid \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.live-stream-option-grid,[\s\S]*grid-template-columns: 1fr/);
});

test("mobile recovery inventory keeps the requested two-column layout", () => {
  assert.match(css, /\.recovery-quick-grid \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 360px\)[\s\S]*\.recovery-quick-grid,[\s\S]*grid-template-columns: 1fr/);
});

test("Merc card images preserve the full authored 3:4 frame", () => {
  assert.match(css, /\.merc-card-art-frame \{[\s\S]*aspect-ratio: 3 \/ 4/);
  assert.match(css, /\.merc-card-art-frame img \{[\s\S]*height: 100%;[\s\S]*object-fit: contain;[\s\S]*object-position: center/);
});

test("compact connection/status strips remain readable", () => {
  assert.match(css, /\.equipment-action-status \{[\s\S]*padding: \.52rem \.68rem;[\s\S]*border-radius: 10px/);
  assert.match(css, /\.equipment-action-status span,[\s\S]*line-height: 1\.36/);
});

test("Guide receives matching containment focus and mobile accessibility polish", () => {
  assert.match(guide, /comprehensive Guide UI\/UX polish/i);
  assert.match(guide, /:focus-visible \{/);
  assert.match(guide, /@media \(max-width: 720px\)[\s\S]*font-size: 16px/);
  assert.match(guide, /@media \(prefers-reduced-motion: reduce\)/);
});

test("high-contrast and forced-colors fallbacks are included", () => {
  assert.match(css, /@media \(prefers-contrast: more\)/);
  assert.match(css, /@media \(forced-colors: active\)/);
});

test("mobile polish restores full player names, badges, merc objectives, and action labels", () => {
  assert.match(css, /mobile anti-truncation pass/);
  assert.match(css, /\.profile-identity \.display-name,[\s\S]*\.character-player-card h2 \{[\s\S]*white-space: normal;[\s\S]*text-overflow: clip/);
  assert.match(css, /\.merc-objectives > div strong \{[\s\S]*white-space: normal;[\s\S]*overflow-wrap: anywhere/);
  assert.match(css, /\.solo-action-picker \.solo-action-grid:not\(\.solo-ability-grid\)[\s\S]*text-overflow: clip;[\s\S]*white-space: normal/);
});
