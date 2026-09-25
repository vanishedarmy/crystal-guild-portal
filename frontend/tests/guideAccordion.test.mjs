import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const legacyUrl = new URL("../src/guide/guideRuntime.js", import.meta.url);
const cssUrl = new URL("../public/guide.css", import.meta.url);
const directoryUrl = new URL("../src/pages/GuildDirectory.jsx", import.meta.url);
const profileUrl = new URL("../src/pages/PlayerProfile.jsx", import.meta.url);

test("Player Guide major sections are promoted into expandable disclosure rows", async () => {
  const legacy = await readFile(legacyUrl, "utf8");
  assert.match(legacy, /function setupGuideSectionAccordions\(\)/);
  assert.match(legacy, /guide-section-accordion/);
  assert.match(legacy, /Browse by section/);
  assert.match(legacy, /Expand All/);
  assert.match(legacy, /Collapse All/);
  assert.match(legacy, /details\.open=saved\?saved==='open':false/);
  assert.match(legacy, /openHashSection/);
  assert.match(legacy, /cg-guide-section-/);
});

test("Guide descriptions are runtime-protected from stale ellipsis CSS", async () => {
  const legacy = await readFile(legacyUrl, "utf8");
  const portalCss = await readFile(new URL("../src/styles/portal.css", import.meta.url), "utf8");
  assert.match(legacy, /function forceSummaryWrapping\(summary\)/);
  assert.match(legacy, /style\.setProperty\('white-space','normal','important'\)/);
  assert.match(legacy, /\['text-overflow','clip'\]/);
  assert.doesNotMatch(legacy, /guide-section-state-label">Open section/);
  assert.match(portalCss, /guide-section-lead-full[\s\S]*?white-space:\s*normal !important[\s\S]*?text-overflow:\s*clip !important/);
});



test("Guide lead copy uses its own full-width summary row", async () => {
  const legacy = await readFile(legacyUrl, "utf8");
  const css = await readFile(cssUrl, "utf8");
  assert.match(legacy, /guide-section-lead-full/);
  assert.doesNotMatch(legacy, /lead\?`<span class="guide-section-description">/);
  assert.match(css, /\.guide-section-summary > \.guide-section-lead-full\{[\s\S]*?grid-column:2 \/ -1 !important[\s\S]*?white-space:normal !important[\s\S]*?text-overflow:clip !important/);
  assert.match(css, /grid-template-rows:auto auto !important/);
});
test("Player Guide accordion styling is table-like, responsive, and accessible", async () => {
  const css = await readFile(cssUrl, "utf8");
  assert.match(css, /\.guide-section-summary\s*\{/);
  assert.match(css, /grid-template-columns:48px minmax\(0,1fr\) auto/);
  assert.match(css, /\.guide-section-accordion\[open\]/);
  assert.match(css, /@media \(max-width:760px\)/);
  assert.match(css, /\.guide-section-summary > \.guide-section-lead-full\{/);
  assert.match(css, /white-space:normal !important/);
  assert.match(css, /overflow:visible !important/);
  assert.match(css, /text-overflow:clip !important/);
  assert.doesNotMatch(css, /guide-section-description/);
  assert.doesNotMatch(css, /-webkit-line-clamp:\s*[1-9]/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test("Adventurer Portal preserves the established tab navigation", async () => {
  const directory = await readFile(directoryUrl, "utf8");
  const profile = await readFile(profileUrl, "utf8");
  assert.match(directory, /className="player-grid"/);
  assert.match(directory, /className="player-card/);
  assert.match(profile, /className="profile-tabs"/);
  assert.doesNotMatch(directory, /roster-table|guild-roster-accordion/);
  assert.doesNotMatch(profile, /profile-accordion|Expand All/);
});
