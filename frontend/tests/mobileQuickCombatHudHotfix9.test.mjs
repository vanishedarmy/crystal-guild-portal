import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");
const hud = readFileSync(new URL("../src/components/MobileCombatHud.jsx", import.meta.url), "utf8");
const hunts = readFileSync(new URL("../src/player/Hunts.jsx", import.meta.url), "utf8");
const dungeons = readFileSync(new URL("../src/player/Dungeons.jsx", import.meta.url), "utf8");
const expeditions = readFileSync(new URL("../src/player/Expeditions.jsx", import.meta.url), "utf8");
const live = readFileSync(new URL("../src/components/LiveStreamCombatControls.jsx", import.meta.url), "utf8");
const streams = readFileSync(new URL("../src/player/StreamActivities.jsx", import.meta.url), "utf8");
const raids = readFileSync(new URL("../src/player/Raids.jsx", import.meta.url), "utf8");
const version = readFileSync(new URL("../src/version.js", import.meta.url), "utf8");
const guide = readFileSync(new URL("../public/guide-body.html", import.meta.url), "utf8");

test("Hotfix 9 adds a mobile sticky combat HUD with compact vitals and four core actions", () => {
  assert.match(css, /Hotfix 9 — mobile quick combat HUD/);
  assert.match(css, /\.mobile-combat-hud\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:/);
  assert.match(hud, /label="Enemy"/);
  assert.match(hud, /label="You"/);
  assert.match(hud, />Attack<\/button>[\s\S]*?>Ability<\/button>[\s\S]*?>Item<\/button>[\s\S]*?>Defend<\/button>/);
  assert.match(hud, /resourceFor/);
});

test("mobile ability and item choices use bounded drawers instead of long page round-trips", () => {
  assert.match(css, /\.mobile-combat-drawer\s*\{[\s\S]*?position:\s*fixed\s*!important;[\s\S]*?overflow-y:\s*auto/);
  assert.match(css, /mobile-picker-open/);
  assert.match(hunts, /solo-action-picker mobile-combat-drawer/);
  assert.match(dungeons, /solo-action-picker mobile-combat-drawer/);
  assert.match(expeditions, /expedition-abilities-section mobile-combat-drawer/);
  assert.match(expeditions, /expedition-consumables-section mobile-combat-drawer/);
  assert.match(live, /live-stream-action-block mobile-combat-drawer/);
  assert.match(live, /mobile-combat-target/);
});

test("all player-paced combat surfaces wire the quick HUD to authoritative combat state", () => {
  assert.match(hunts, /<MobileCombatHud[\s\S]*?enemy=\{expedition\.combat\.enemy\}[\s\S]*?player=\{expedition\.combat\.player\}/);
  assert.match(dungeons, /<MobileCombatHud[\s\S]*?enemy=\{combat\.enemy\}[\s\S]*?player=\{combat\.player\}/);
  assert.match(expeditions, /<MobileCombatHud[\s\S]*?enemy=\{active\.combat\.enemy\}[\s\S]*?player=\{active\.combat\.player\}/);
  assert.match(live, /<MobileCombatHud[\s\S]*?enemy=\{enemy \|\| controls\?\.enemy\}[\s\S]*?player=\{actor\}/);
});

test("stream ventures, World Events, and raids pass live enemy HP into the quick HUD", () => {
  assert.match(streams, /enemy=\{\{ name: encounter\.monster\?\.name, hp: encounter\.enemy_hp, max_hp: encounter\.enemy_max_hp \}\}/);
  assert.match(streams, /enemy=\{\{ name: event\.name \|\| encounter\.monster\?\.name, hp: encounter\.enemy_hp, max_hp: encounter\.enemy_max_hp \}\}/);
  assert.match(raids, /enemy=\{\{ name: state\?\.boss, hp: state\?\.hp, max_hp: state\?\.max_hp \}\}/);
});

test("mobile hides duplicate core command rows while desktop source remains intact", () => {
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.solo-combat-board > \.solo-command-bar,[\s\S]*?\.expedition-core-actions,[\s\S]*?\.live-stream-core-actions\s*\{[\s\S]*?display:\s*none\s*!important/);
  assert.match(hunts, /aria-label="Solo Venture battle actions"/);
  assert.match(dungeons, /aria-label="Dungeon battle actions"/);
  assert.match(expeditions, /expedition-core-actions/);
  assert.match(live, /live-stream-core-actions/);
});


test("Hotfix 9 cache-busts the Portal and documents the mobile quick bar", () => {
  assert.match(version, /WEB_ASSET_REVISION = "1\.9\.0-world-events-alpha6-hotfix9"/);
  assert.match(guide, /How do mobile battle controls work\?/);
  assert.match(guide, /enemy HP, your HP and MP or AP/);
});
