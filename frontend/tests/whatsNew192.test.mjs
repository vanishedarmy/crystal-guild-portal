import test from "node:test";
import assert from "node:assert/strict";
import { MAJOR_UPDATES } from "../src/player/whatsNewData.js";
import { WEB_VERSION } from "../src/version.js";
import { readFile } from "node:fs/promises";

test("What's New promotes the shipped v1.9.2 Relic Arsenal release", () => {
  const [latest, previous] = MAJOR_UPDATES;
  assert.equal(latest.version, "v1.9.2");
  assert.equal(latest.version, WEB_VERSION);
  assert.equal(latest.name, "Relic Arsenal Overhaul");
  assert.equal(latest.action.tab, "relics");
  assert.equal(latest.highlights.length, 4);
  assert.match(latest.summary, /18 Job-specific Relic/);
  assert.equal(previous.version, "v1.9.1");
  assert.equal(previous.name, "Performance & Stability");
});

test("What's New action points to the existing Relics page", async () => {
  const profile = await readFile(new URL("../src/pages/PlayerProfile.jsx", import.meta.url), "utf8");
  assert.match(profile, /relics: lazy\(\(\) => import\("\.\.\/player\/Relics\.jsx"\)\)/);
});
