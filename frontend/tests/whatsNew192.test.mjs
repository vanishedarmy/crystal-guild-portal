import test from "node:test";
import assert from "node:assert/strict";
import { MAJOR_UPDATES } from "../src/player/whatsNewData.js";
import { WEB_VERSION } from "../src/version.js";
import { readFile } from "node:fs/promises";

test("What's New promotes v1.9.3 and preserves the v1.9.2 entry", () => {
  const latest = MAJOR_UPDATES.find((update) => update.version === "v1.9.3");
  const previous = MAJOR_UPDATES.find((update) => update.version === "v1.9.2");
  assert.equal(MAJOR_UPDATES[0].version, WEB_VERSION);
  assert.equal(latest.version, "v1.9.3");
  assert.equal(latest.name, "Guild Initiatives");
  assert.equal(latest.action.tab, "guild_board");
  assert.equal(latest.highlights.length, 4);
  assert.match(latest.summary, /Fellowship Contracts/);
  assert.equal(previous.version, "v1.9.2");
  assert.equal(previous.name, "Relic Arsenal Overhaul");
});

test("What's New action points to the existing Relics page", async () => {
  const profile = await readFile(new URL("../src/pages/PlayerProfile.jsx", import.meta.url), "utf8");
  assert.match(profile, /relics: lazy\(\(\) => import\("\.\.\/player\/Relics\.jsx"\)\)/);
});
