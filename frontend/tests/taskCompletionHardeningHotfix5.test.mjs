import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

const guide = read("../public/guide-body.html");
const whatsNew = read("../src/player/whatsNewData.js");

test("Fellowship guide explains broad versus source-specific task progress", () => {
  assert.match(guide, /Broad milestones count every valid source/);
  assert.match(guide, /Monsters defeated[\s\S]*normal encounters, Hunts, Ventures, Expeditions, Dungeons, and World Events/);
  assert.match(guide, /Combat victories[\s\S]*Raid victories/);
  assert.match(guide, /Hunts won, Raid clears, Ventures completed, or Expeditions completed remain specific/);
});

test("Hotfix 5 is surfaced as progress accounting hardening", () => {
  assert.match(whatsNew, /v1\.9\.0 Alpha 6 Hotfix 5/);
  assert.match(whatsNew, /Progress Accounting Hardening/);
  assert.match(whatsNew, /One victory, one receipt/);
});

test("Moogle Annex whats-new copy reflects the authoritative Hotfix 4 category stock", () => {
  assert.match(whatsNew, /v1\.9\.0 Alpha 6 Hotfix 4/);
  assert.match(whatsNew, /\+2 Weapons, \+4 Armor & Accessories, and \+6 Items/);
  assert.match(whatsNew, /from 9 to 21 choices/);
});
