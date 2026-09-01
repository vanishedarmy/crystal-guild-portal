import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const saucer = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const profile = fs.readFileSync(path.join(root, "src/pages/PlayerProfile.jsx"), "utf8");
const version = fs.readFileSync(path.join(root, "src/version.js"), "utf8");

test("Alpha 5 Hotfix 1 keeps Gold Saucer out of the lazy split-chunk path", () => {
  assert.match(profile, /import GoldSaucer from "\.\.\/player\/GoldSaucer\.jsx";/);
  assert.match(profile, /gold_saucer:\s*GoldSaucer/);
  assert.doesNotMatch(profile, /gold_saucer:\s*lazy\(/);
});

test("Alpha 5 Hotfix 1 normalizes partial Gold Saucer payloads before render", () => {
  assert.match(saucer, /function asRecord\(value\)/);
  assert.match(saucer, /function asObjectArray\(value\)/);
  assert.match(saucer, /const saucerState = asRecord\(state\)/);
  assert.match(saucer, /const futureAttractions = asObjectArray\(saucerState\.attractions\)/);
  assert.match(saucer, /const triadHand = asObjectArray\(triadMatch\?\.player_hand\)/);
  assert.match(saucer, /const tossThrows = asObjectArray\(tossGame\?\.throws\)/);
});

test("Alpha 5 Hotfix 1 preserves the requested collapsible Gold Saucer contract", () => {
  assert.match(saucer, /<section className="panel saucer-game-card cactpot-card saucer-scenic-panel">/);
  assert.match(saucer, /<section className="panel saucer-game-card slots-card saucer-scenic-panel">/);
  for (const section of ["monster-toss-card", "saucer-racing-panel", "saucer-triad-panel", "saucer-prize-panel", "saucer-records-panel", "saucer-history-panel"]) {
    assert.match(saucer, new RegExp(`<details className="[^"\\n]*${section}[^"\\n]*saucer-section-disclosure`));
  }
});

test("Alpha 5 Hotfix 1 behavior remains under the current frontend revision", () => {
  assert.match(version, /WEB_ASSET_REVISION = "1\.6\.0-gold-saucer-a5h6"/);
  assert.match(version, /WEB_VERSION = "v1\.6\.0 Alpha 5"/);
});
