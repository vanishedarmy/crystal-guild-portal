import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Stream Activities is a dedicated profile tab beside Adventure Board", async () => {
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  const overview = await readFile(new URL("player/Overview.jsx", SRC), "utf8");
  assert.match(profile, /stream: lazy\(\(\) => import\("\.\.\/player\/StreamActivities\.jsx"\)\)/);
  assert.match(profile, /\["stream", "Stream Activities", "◉"\]/);
  assert.match(profile, /\["Core", \["overview", "hunts", "stream", "jobs", "inventory"\]\]/);
  assert.match(overview, /\["stream", "Stream Activities"/);
});

test("Adventure Board contains only Portal and off-stream adventure surfaces", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  for (const required of ["Camp & Recovery", "Dungeons", "Expeditions", "Solo Venture · Portal Only", "Travel Regions", "Guild Hunt Board"]) {
    assert.match(board, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(board, /Stream Venture|Rally Venture|<Raids/);
});

test("Stream Activities owns Stream Venture and Raid presentation", async () => {
  const stream = await readFile(new URL("player/StreamActivities.jsx", SRC), "utf8");
  assert.match(stream, /Stream Venture · Live Stream/);
  assert.match(stream, /<Raids username=.*liveRaid=/s);
  assert.match(stream, /submitAdventureState/);
  assert.match(stream, /submitLiveEventJoin/);
  assert.match(stream, /submitLiveEventAction/);
  assert.match(stream, /LiveStreamCombatControls/);
  assert.match(stream, /crystal-guild-live-revision/);
  assert.match(stream, /100% Encounter \/ 0% Treasure Chest/);
});

test("live feature boards do not show release-version labels", async () => {
  const files = await Promise.all([
    "player/ChocoboStable.jsx",
    "player/Dungeons.jsx",
    "player/Expeditions.jsx",
    "player/GoldSaucer.jsx",
    "player/Hunts.jsx",
    "player/Raids.jsx",
    "player/StreamActivities.jsx",
  ].map((name) => readFile(new URL(name, SRC), "utf8")));
  const combined = files.join("\n");
  assert.doesNotMatch(combined, />[^<]*v1\.[0-9][^<]*</i);
});

test("Player Guide points live group content to Stream Activities", async () => {
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(guide, /Adventurer Portal → Stream Activities/);
  assert.match(guide, /Stream Activities<\/b> keeps live Stream Ventures, Trials, and Raids together/);
});
