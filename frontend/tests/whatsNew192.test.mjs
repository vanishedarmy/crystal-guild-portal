import test from "node:test";
import assert from "node:assert/strict";
import { MAJOR_UPDATES } from "../src/player/whatsNewData.js";
import { WEB_VERSION } from "../src/version.js";
import { readFile } from "node:fs/promises";

test("What's New promotes v1.9.93 and preserves v1.9.92 Job Ascension details", () => {
  const [latest, previous] = MAJOR_UPDATES;
  assert.equal(latest.version, "v1.9.93");
  assert.equal(latest.version, WEB_VERSION);
  assert.equal(latest.name, "Limit Break Awakening");
  assert.equal(latest.action.tab, "jobs");
  assert.ok(latest.highlights.length >= 4);
  assert.match(latest.summary, /169 active abilities/);
  assert.match(latest.summary, /90 passives/);
  assert.equal(previous.version, "v1.9.92");
  assert.equal(previous.name, "Job Ascension");
  assert.match(previous.summary, /Black Mage and White Mage/);
});

test("What's New action points to the existing Relics page", async () => {
  const profile = await readFile(new URL("../src/pages/PlayerProfile.jsx", import.meta.url), "utf8");
  assert.match(profile, /relics: lazy\(\(\) => import\("\.\.\/player\/Relics\.jsx"\)\)/);
});
