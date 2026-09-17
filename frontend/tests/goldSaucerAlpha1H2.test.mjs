import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { WEB_ASSET_REVISION, WEB_VERSION } from "../src/version.js";

const read = (relative) => fs.readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");

test("Gold Saucer H2 identity and authoritative presentation contract are wired", () => {
  assert.equal(WEB_VERSION, "v1.8.0 Alpha 1");
  assert.equal(WEB_ASSET_REVISION, "1.8.0-merc-a1");
  const source = read("src/player/GoldSaucer.jsx");
  assert.match(source, /const spinSlots = async/);
  assert.match(source, /finishedAction\(response\)/);
  assert.match(source, /setSlotAnimating\(true\)/);
  assert.match(source, /Reels are stopping/);
  assert.match(source, /highlightedCells\.has\(index\)/);
  assert.match(source, /00:00 UTC/);
});

test("Gold Saucer H2 records and compact roadmap are player-facing", () => {
  const source = read("src/player/GoldSaucer.jsx");
  for (const label of ["Current Net MGP", "Games Played", "Cactpot High Rolls", "Slot Win Rate", "Triple Matches", "Balance details"]) {
    assert.match(source, new RegExp(label));
  }
  assert.match(source, /filter\(\(attraction\) => attraction\.status !== "open"\)/);
  assert.match(source, /saucer-history-panel saucer-disclosure/);
});

test("Gold Saucer H2 CSS supports animation, line preview and reduced motion", () => {
  const css = read("src/styles/portal.css");
  assert.match(css, /cactpot-cell\.line-highlight/);
  assert.match(css, /saucer-reels\.is-spinning/);
  assert.match(css, /@keyframes saucerReelPulse/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
