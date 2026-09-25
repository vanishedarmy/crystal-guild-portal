import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const blacksmith = fs.readFileSync(new URL("../src/player/Blacksmith.jsx", import.meta.url), "utf8");
const emp = fs.readFileSync(new URL("../src/player/MoogleEmporium.jsx", import.meta.url), "utf8");
const chocobo = fs.readFileSync(new URL("../src/player/ChocoboStable.jsx", import.meta.url), "utf8");
const connection = fs.readFileSync(new URL("../src/components/PortalLinkPanel.jsx", import.meta.url), "utf8");
const fellowship = fs.readFileSync(new URL("../src/pages/FellowshipPage.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");

// Focused UI pass requested after Alpha 3 H3; no gameplay contract changes.
test("blacksmith tab subtitles are concise", () => {
  assert.match(blacksmith, /<small>Craft items<\/small>/);
  assert.match(blacksmith, /<small>Upgrade equipment<\/small>/);
  assert.doesNotMatch(blacksmith, /Active · (?:Craft items|Upgrade equipment)/);
});

test("Emporium buy cards omit long item description copy", () => {
  assert.doesNotMatch(emp, /className="moogle-item-description"/);
  assert.match(emp, /className="moogle-stat-summary"/);
  assert.match(emp, /formatBestUse\(item\)/);
  assert.match(emp, /Requires Lv\./);
});

test("registered companion and recipe grids hug their content", () => {
  assert.match(chocobo, /chocobo-companion-card featured/);
  assert.match(css, /\.chocobo-owned-layout \{ align-items: start; \}/);
  assert.match(css, /\.chocobo-companion-card\.featured \{[\s\S]*?min-height: 0;[\s\S]*?align-self: start;/);
  assert.match(css, /\.blacksmith-grid \{ align-items: start; \}/);
  assert.match(css, /\.blacksmith-card \{[\s\S]*?padding: 13px;[\s\S]*?gap: 8px;/);
});

test("Fellowship level card is bounded on mobile", () => {
  assert.match(fellowship, /className="fellowship-level-card"/);
  assert.match(css, /@media \(max-width: 760px\) \{[\s\S]*?\.fellowship-level-card \{[\s\S]*?max-width: 100%;[\s\S]*?overflow: hidden;/);
  assert.match(css, /\.fellowship-level-progress \.progress-track \{[\s\S]*?max-width: 100%;/);
});

test("connection strip is passive status only", () => {
  assert.match(connection, /Crystal Guild Connection/);
  assert.match(connection, /ONLINE/);
  assert.match(connection, /OFFLINE/);
  assert.doesNotMatch(connection, /Refresh connection/);
  assert.doesNotMatch(connection, /Your Twitch account is linked to this adventurer/);
});
