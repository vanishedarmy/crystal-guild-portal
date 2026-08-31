import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const body = fs.readFileSync(new URL("../public/guide-body.html", import.meta.url), "utf8");
const version = fs.readFileSync(new URL("../src/version.js", import.meta.url), "utf8");

test("Player Guide exposes a dedicated Expeditions section", () => {
  assert.match(body, /href="#expeditions"[\s\S]*?>\s*Expeditions/);
  assert.match(body, /<section class="section searchable" id="expeditions">/);
  assert.match(body, /Fellowship LVL 6 \+ Guild Hall Lv\. 1/);
  assert.match(body, /Emerald Wilds · Lv\.1–12/);
  assert.match(body, /Ashen Highlands · Lv\.8–20/);
  assert.match(body, /Mistfen Marshes · Lv\.15–28/);
  assert.match(body, /Frostveil Reach · Lv\.22–38/);
  assert.match(body, /The Astral Scar · Lv\.30\+/);
  assert.match(body, /Scout[\s\S]*3 stages/);
  assert.match(body, /Journey[\s\S]*5 stages/);
  assert.match(body, /Deep Expedition[\s\S]*8 stages/);
  assert.match(body, /25%, 50%, 75%, and 100%/);
  assert.match(body, /Elder Ochu/);
  assert.match(body, /Rift Wyrm/);
  assert.match(body, /Region Mastery/);
  assert.match(body, /Expedition Cache/);
  assert.match(body, /Chocobo Rescue/);
});

test("Guide asset revision advances for Expeditions guide hotfix", () => {
  assert.match(version, /1\.5\.0-trails-raids-rc1/);
});
