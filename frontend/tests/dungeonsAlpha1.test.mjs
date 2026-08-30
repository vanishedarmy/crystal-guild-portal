import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("Dungeons Alpha 1 exposes typed Portal actions and Adventure Board integration", () => {
  const api = read("src/api/auth.js");
  const board = read("src/player/Hunts.jsx");
  const dungeons = read("src/player/Dungeons.jsx");
  for (const token of ["DUNGEON_START", "DUNGEON_ACTION", "DUNGEON_CONTINUE", "DUNGEON_CHOICE", "DUNGEON_RETREAT"]) assert.match(api, new RegExp(token));
  assert.match(board, /import Dungeons from "\.\/Dungeons\.jsx"/);
  assert.match(board, /data=\{state\?\.dungeons\}/);
  assert.match(board, /Dungeon · \$\{dungeonRun\.name/);
  assert.match(dungeons, /Dungeon Board/);
  assert.match(dungeons, /Continue Deeper/);
  assert.match(dungeons, /Retreat — Bank 50% of Cache/);
});

test("Dungeon combat is player-paced and carries full battle resources", () => {
  const dungeons = read("src/player/Dungeons.jsx");
  for (const label of ["Attack", "Ability", "Use Item", "Defend", "Enemy intent", "HP", "MP", "AP"]) assert.match(dungeons, new RegExp(label));
  assert.match(dungeons, /submitDungeonAction\(active\.run_id, active\.room\?\.id, active\.revision, "attack"/);
  assert.match(dungeons, /submitDungeonAction\(active\.run_id, active\.room\?\.id, active\.revision, `ability:\$\{ability\.id\}`/);
  assert.match(dungeons, /submitDungeonAction\(active\.run_id, active\.room\?\.id, active\.revision, `item:\$\{item\.id\}`/);
  assert.match(dungeons, /submitDungeonAction\(active\.run_id, active\.room\?\.id, active\.revision, "defend"/);
});

test("Dungeon Board uses the existing shared collapse pointer and responsive layout", () => {
  const dungeons = read("src/player/Dungeons.jsx");
  const css = read("src/styles/portal.css");
  assert.match(dungeons, /<CollapsePointer open=\{open\}/);
  assert.match(css, /v1\.4\.0 Dungeons & Delves RC1/);
  assert.match(css, /\.dungeon-card-grid/);
  assert.match(css, /\.dungeon-run-shell/);
  assert.match(css, /@media \(max-width: 620px\)/);
});

test("Player Guide preserves Dungeon cache rules alongside Alpha 2 expansion", () => {
  const guide = read("public/guide-body.html");
  assert.match(guide, /id="dungeons"/);
  assert.match(guide, /The Forgotten Ossuary/);
  assert.match(guide, /25% Emerald Wilds/);
  assert.match(guide, /voluntary retreat banks <b>50%<\/b>/);
  assert.match(guide, /defeat recovers <b>25%<\/b>/);
});

test("v1.4 Alpha 4 current entry does not repopulate prerelease history", () => {
  const whatsNew = read("src/player/whatsNewData.js");
  assert.match(whatsNew, /name: "Dungeons & Delves RC1"/);
  const currentIndex = whatsNew.indexOf('name: "Dungeons & Delves RC1"');
  const stableIndex = whatsNew.indexOf('name: "Asset Optimization"');
  assert.ok(currentIndex > 0 && stableIndex > currentIndex);
});


test("Dungeon mutations are bound to the run and room visible in the browser", () => {
  const api = read("src/api/auth.js");
  const dungeons = read("src/player/Dungeons.jsx");
  assert.match(api, /DUNGEON_ACTION", \{ run_id: runId, room_id: roomId, revision: Number\(revision\), action \}/);
  assert.match(api, /DUNGEON_CONTINUE", \{ run_id: runId, room_id: roomId, revision: Number\(revision\) \}/);
  assert.match(api, /DUNGEON_RETREAT", \{ run_id: runId, room_id: roomId, revision: Number\(revision\) \}/);
  assert.match(dungeons, /submitDungeonContinue\(active\.run_id, active\.room\?\.id/);
  assert.match(dungeons, /submitDungeonRetreat\(active\.run_id, active\.room\?\.id/);
});
