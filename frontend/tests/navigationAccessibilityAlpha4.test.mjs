import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("Alpha 4 Navigation Accessibility remains carried forward in the current web build", () => {
  const version = read("../src/version.js");
  const whatsNew = read("../src/player/whatsNewData.js");
  assert.match(version, /WEB_VERSION = "v1\.9\.96"/);
  assert.match(version, /WEB_BUILD = "Sovereign Encounters"/);
  assert.match(whatsNew, /version: "v1\.9\.0 Alpha 4"/);
  assert.match(whatsNew, /name: "Navigation Accessibility"/);
});

test("profile destinations carry persistent non-color identity plus tone metadata", () => {
  const profile = read("../src/pages/PlayerProfile.jsx");
  assert.match(profile, /\["overview", "Overview", "◇"\]/);
  assert.match(profile, /overview: "aqua"/);
  assert.match(profile, /\["hunts", "Adventure Board", "⌖"\]/);
  assert.match(profile, /hunts: "gold"/);
  assert.match(profile, /\["achievements", "Achievements & Titles", "★"\]/);
  assert.match(profile, /achievements: "magenta"/);
  assert.match(profile, /data-tab-tone=\{TAB_TONES\[id\]\}/);
  assert.match(profile, /aria-selected=\{activeTab === id\}/);
  assert.match(profile, /<span className="tab-glyph"/);
});

test("profile navigation adapts from desktop through a two-column mobile grid", () => {
  const css = read("../src/styles/portal.css");
  assert.match(css, /v1\.9\.0 Alpha 4 — Navigation Accessibility/);
  assert.match(css, /@media \(min-width: 1280px\)[\s\S]*repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(min-width: 1024px\) and \(max-width: 1279px\)[\s\S]*repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(min-width: 721px\) and \(max-width: 1023px\)[\s\S]*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.profile-tab-select \{ display: none; \}[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(css, /\.profile-tabs button:last-child \{ grid-column: 1 \/ -1; \}/);
  assert.doesNotMatch(css, /\.profile-tabs button:nth-last-child\(2\) \{ grid-column: 2; \}/);
});

test("navigation accessibility does not rely on color alone", () => {
  const css = read("../src/styles/portal.css");
  assert.match(css, /outline: 3px solid #f2d77b/);
  assert.match(css, /@media \(prefers-contrast: more\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /white-space: normal/);
});

test("What's New documents the Alpha 4 navigation pass", () => {
  const whatsNew = read("../src/player/whatsNewData.js");
  assert.match(whatsNew, /version: "v1\.9\.0 Alpha 4"/);
  assert.match(whatsNew, /name: "Navigation Accessibility"/);
  assert.match(whatsNew, /Color-assisted scanning/);
  assert.match(whatsNew, /Responsive button grid/);
  assert.match(whatsNew, /No gameplay migration/);
});
