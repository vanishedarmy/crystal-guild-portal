import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WEB_VERSION, WEB_BUILD, WEB_ASSET_REVISION } from "../src/version.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const main = read("src/main.jsx");
const portalCss = read("src/styles/portal-ux-1947.css");
const streamer = read("src/pages/StreamerDashboard.jsx");
const guidePage = read("src/guide/GuidePage.jsx");
const guideHtml = read("public/guide-body.html");
const guideCss = read("public/guide-ux-1947.css");
const guideRuntime = read("src/guide/guideRuntime.js");

test("compact layout follows the usability and readability layers", () => {
  const imports = [...main.matchAll(/import "\.\/styles\/[^"]+";/g)].map((match) => match[0]);
  assert.ok(imports.includes('import "./styles/readability-1945.css";'));
  assert.equal(imports.at(-1), 'import "./styles/compact-ui.css";');
  assert.ok(imports.indexOf('import "./styles/readability-1945.css";') < imports.indexOf('import "./styles/portal-ux-1947.css";'));
  assert.equal(imports.at(-2), 'import "./styles/portal-ux-1947.css";');
  assert.match(portalCss, /--portal-hit-target:\s*44px/);
  assert.match(portalCss, /--portal-hit-target-mobile:\s*48px/);
  assert.match(portalCss, /site-header\.mobile-header-collapsed[\s\S]*transform:\s*none !important/);
  assert.match(portalCss, /prefers-reduced-motion/);
  assert.match(portalCss, /prefers-contrast: more/);
});

test("Streamer summary cards can filter the roster and filters have visible labels plus a reset", () => {
  assert.match(streamer, /streamer-summary-filter/);
  assert.match(streamer, /aria-pressed=\{active\}/);
  assert.match(streamer, /onActivate=\{\(\) => setStatusFilter\("ready"\)\}/);
  assert.match(streamer, /Find adventurer/);
  assert.match(streamer, /<span>Status<\/span>/);
  assert.match(streamer, /Clear filters/);
  assert.match(streamer, /data-mobile-label="Health"/);
  assert.match(portalCss, /\.streamer-toolbar-field/);
  assert.match(portalCss, /\.streamer-player-row \[data-mobile-label\]::before/);
});

test("Streamer navigation is sticky, descriptive, and horizontally usable on small screens", () => {
  assert.match(streamer, /<small>Owner tools<\/small>/);
  assert.match(streamer, /<small>Player status<\/small>/);
  assert.match(streamer, /<small>Broadcast link<\/small>/);
  assert.match(portalCss, /\.streamer-jumpbar\s*\{[\s\S]*position:\s*sticky/);
  assert.match(portalCss, /@media \(max-width: 720px\)[\s\S]*\.streamer-jumpbar\s*\{[\s\S]*overflow-x:\s*auto/);
  assert.match(portalCss, /scroll-snap-type:\s*x proximity/);
});

test("Player Guide loads a dedicated usability layer and exposes quick links and keyboard-search help", () => {
  assert.match(guidePage, /guide-ux-1947\.css/);
  assert.match(guideHtml, /class="guide-quick-links"/);
  assert.match(guideHtml, /href="#quickstart">Quick Start/);
  assert.match(guideHtml, /id="guideSearchHint"/);
  assert.match(guideHtml, /id="guideSearchEmpty"/);
  assert.match(guideCss, /\.guide-quick-links/);
  assert.match(guideCss, /\.guide-section-toolbar\s*\{[\s\S]*position:\s*sticky/);
});

test("Player Guide slash shortcut, escape clear, empty results, and reading-position navigation are wired", () => {
  assert.match(guideRuntime, /event\.key==='\/'/);
  assert.match(guideRuntime, /event\.key==='Escape'/);
  assert.match(guideRuntime, /clearGlobalGuideSearch/);
  assert.match(guideRuntime, /globalGuideSearchEmpty\.hidden=n!==0/);
  assert.match(guideRuntime, /IntersectionObserver/);
  assert.match(guideRuntime, /setCurrentGuideSection\(nearest\.id\)/);
});

test("Web metadata identifies the usability release", () => {
  const pkg = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  assert.equal(WEB_VERSION, "v1.9.7");
  assert.equal(WEB_BUILD, "Queen's Blood");
  assert.equal(WEB_ASSET_REVISION, "1.9.7-queens-blood");
  assert.equal(pkg.version, "1.9.7");
  assert.equal(lock.version, "1.9.7");
  assert.equal(lock.packages[""].version, "1.9.7");
});
