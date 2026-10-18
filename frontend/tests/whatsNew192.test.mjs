import test from "node:test";
import assert from "node:assert/strict";
import { MAJOR_UPDATES } from "../src/player/whatsNewData.js";
import { WEB_VERSION } from "../src/version.js";
import { readFile } from "node:fs/promises";

test("What's New shows v1.9.7 first while preserving Guild Initiatives and Relics history", () => {
  const [latest] = MAJOR_UPDATES;
  const initiative = MAJOR_UPDATES.find((item) => item.version === "v1.9.3");
  const previous = MAJOR_UPDATES.find((item) => item.version === "v1.9.2");
  assert.equal(latest.version, "v1.9.7");
  assert.equal(latest.action.tab, "card_hall");
  assert.equal(initiative?.name, "Guild Initiatives");
  assert.equal(latest.version, WEB_VERSION);
  assert.equal(initiative.action.tab, "guild_board");
  assert.equal(initiative.highlights.length, 4);
  assert.match(initiative.summary, /Fellowship Contracts/);
  assert.equal(previous.version, "v1.9.2");
  assert.equal(previous.name, "Relic Arsenal Overhaul");
});

test("What's New action points to the existing Relics page", async () => {
  const profile = await readFile(new URL("../src/pages/PlayerProfile.jsx", import.meta.url), "utf8");
  assert.match(profile, /relics: lazy\(\(\) => import\("\.\.\/player\/Relics\.jsx"\)\)/);
});
