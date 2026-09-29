import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const retainer = read("src/player/RetainerService.jsx");
const portalCss = read("src/styles/portal.css");
const guideHtml = read("public/guide-body.html");
const guideCss = read("public/guide.css");
const guideRuntime = read("src/guide/guideRuntime.js");

test("Retainer mobile pass exposes action-first in-page navigation", () => {
  assert.match(retainer, /retainer-mobile-nav/);
  assert.match(retainer, /href="#retainer-current"/);
  assert.match(retainer, /href="#retainer-assignments"/);
  assert.match(retainer, /id="retainer-profile"/);
  assert.match(retainer, /id="retainer-history"/);
  assert.match(portalCss, /\.retainer-current-panel \{ order: 3; \}/);
  assert.match(portalCss, /\.retainer-assignments-panel \{ order: 4; \}/);
});

test("Retainer mobile cards stop using desktop overlay geometry", () => {
  assert.match(portalCss, /targeted Retainer mobile UX cleanup/);
  assert.match(portalCss, /@media \(max-width: 760px\)[\s\S]*\.retainer-status-art \{[\s\S]*position: static/);
  assert.match(portalCss, /\.retainer-assignment-card \{[\s\S]*grid-template-columns: 96px minmax\(0, 1fr\)/);
  assert.match(portalCss, /\.retainer-profile-panel \{[\s\S]*grid-template-columns: 96px minmax\(0, 1fr\)/);
  assert.match(portalCss, /\.retainer-priority-field select \{ font-size: 16px; \}/);
});

test("Player Guide search has an accessible clear control and live result count", () => {
  assert.match(guideHtml, /id="globalSearchClear"/);
  assert.match(guideHtml, /aria-label="Clear Player Guide search"/);
  assert.match(guideHtml, /aria-live="polite" class="resultcount" id="searchCount"/);
  assert.match(guideRuntime, /globalGuideSearchClear/);
  assert.match(guideRuntime, /dispatchEvent\(new Event\('input',\{bubbles:true\}\)\)/);
});

test("Player Guide mobile drawer is removed from tab order while closed", () => {
  assert.match(guideRuntime, /syncGuideNavAccessibility/);
  assert.match(guideRuntime, /navPanel\.setAttribute\('inert',''\)/);
  assert.match(guideRuntime, /navClose\?\.focus\(\)/);
  assert.match(guideRuntime, /restoreFocus:true/);
  assert.match(guideRuntime, /e\.key!==['"]Tab['"]/);
});

test("Player Guide adds direct section jumping and mobile single-section behavior", () => {
  assert.match(guideRuntime, /id='guideIndex'/);
  assert.match(guideRuntime, /guide-section-jump/);
  assert.match(guideRuntime, /id="guideSectionJump"/);
  assert.match(guideRuntime, /closeOtherMobileSections/);
  assert.match(guideRuntime, /mobileGuideAccordion/);
  assert.match(guideRuntime, /guide-back-index/);
});

test("Player Guide mobile CSS prioritizes compact navigation and touch controls", () => {
  assert.match(guideCss, /Player Guide mobile accessibility & navigation pass/);
  assert.match(guideCss, /\.topsearch \{[\s\S]*top: 124px/);
  assert.match(guideCss, /\.guide-section-jump select \{[\s\S]*min-height: 46px[\s\S]*font-size: 16px/);
  assert.match(guideCss, /\[data-guide-sections="expand"\] \{ display: none; \}/);
  assert.match(guideCss, /\.guide-back-index \{[\s\S]*min-height: 44px/);
});
