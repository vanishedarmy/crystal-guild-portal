import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const guideHtml = read("public/guide-body.html");
const guideCss = read("public/guide.css");
const guideRuntime = read("src/guide/guideRuntime.js");

test("mobile Guide uses a compact dedicated intro instead of the desktop flavor hero", () => {
  assert.match(guideHtml, /class="guide-mobile-intro"/);
  assert.match(guideHtml, /Find what you need\. Get back to adventuring\./);
  assert.match(guideHtml, /class="guide-desktop-intro"/);
  assert.match(guideCss, /focused Player Guide mobile top-of-page cleanup/);
  assert.match(guideCss, /\.guide-desktop-intro \{ display: none; \}/);
  assert.match(guideCss, /\.guide-mobile-intro \{[\s\S]*display: grid/);
});

test("phone Guide removes the redundant second header and oversized hero chrome", () => {
  assert.match(guideCss, /@media \(max-width: 760px\)[\s\S]*\.mobile-top \{ display: none !important; \}/);
  assert.match(guideCss, /\.hero::after \{ display: none; \}/);
  assert.match(guideCss, /\.hero \{[\s\S]*padding: 14px var\(--guide-gutter\) 13px/);
});

test("mobile browse and search surfaces are intentionally ordered as one toolbox", () => {
  assert.match(guideCss, /\.guide-section-toolbar \{[\s\S]*order: 2/);
  assert.match(guideCss, /\.topsearch \{[\s\S]*order: 3/);
  assert.match(guideCss, /\.content\.guide-accordion-content \{[\s\S]*order: 4/);
  assert.match(guideCss, /\.guide-section-toolbar-actions \{ display: none !important; \}/);
});

test("compact All sections button opens the accessible Guide drawer and restores focus", () => {
  assert.match(guideRuntime, /data-guide-nav-open/);
  assert.match(guideRuntime, /guideNavReturnFocus/);
  assert.match(guideRuntime, /setGuideNav\(true,\{trigger:indexNavOpen\}\)/);
  assert.match(guideRuntime, /\$\$\('\[data-guide-nav-open\]'\).*aria-expanded/);
  assert.match(guideRuntime, /guideNavReturnFocus\?\.focus\(\)/);
});
