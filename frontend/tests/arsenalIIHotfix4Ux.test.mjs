import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const hunts = fs.readFileSync(path.join(root, "src/player/Hunts.jsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");

 test("Hotfix 4 uses authoritative Solo Venture odds and defaults to encounter-focused 80/20", () => {
  assert.match(hunts, /encounter_chance_percent \?\? 80/);
  assert.match(hunts, /treasure_chance_percent \?\? 20/);
  assert.match(hunts, /\{soloEncounterChance\} \/ \{soloTreasureChance\}/);
  assert.doesNotMatch(hunts, /<strong>60 \/ 40<\/strong>/);
});

test("Hotfix 4 renders Hunt resolutions as structured results instead of raw chat output", () => {
  assert.match(hunts, /function HuntResult\(/);
  assert.match(hunts, /Last Hunt Result/);
  assert.match(hunts, /hunt-result-reward-grid/);
  assert.match(hunts, /Mark remaining HP/);
  assert.match(hunts, /Auto plan/);
  assert.match(hunts, /pendingHuntResults\.map/);
  assert.match(hunts, /<HuntResult/);
});

test("Hotfix 4 reduces redundant Adventure Board copy and improves accessibility", () => {
  assert.match(hunts, /className=\{`equipment-action-status compact-status/);
  assert.match(hunts, /<h2>Travel Regions<\/h2>/);
  assert.match(hunts, /Current · \{currentRegion\.name\}/);
  assert.doesNotMatch(hunts, /<p className="solo-result-summary"/);
  assert.match(css, /Arsenal II Hotfix 4 — Hunt-result clarity, lower visual noise, and accessibility/);
  assert.match(css, /@media \(prefers-contrast: more\)/);
  assert.match(css, /\.hunt-result-outcome\.victory/);
  assert.match(css, /\.equipment-action-status > span \{ flex: 1 1 260px; \}/);
});
