import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const board = read("../src/player/Dungeons.jsx");
const css = read("../src/styles/portal.css");
const version = read("../src/version.js");
const news = read("../src/player/whatsNewData.js");
const guide = read("../public/guide-body.html");

test("Dungeons Beta 2 consolidates run status and settlement clarity", () => {
  assert.match(board, /dungeon-run-status-grid/);
  assert.match(board, /Clear 100% · Retreat 50% · Defeat 25%/);
  assert.match(board, /Cache Settlement/);
  assert.match(board, /Carried Cache/);
  assert.match(board, /dungeon-route-effect-list/);
});

test("Dungeons Beta 2 has narrow-screen Dungeon layouts", () => {
  assert.match(css, /v1\.4\.0 Dungeons & Delves Beta 2 — Dungeon UX\/mobile consolidation/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /dungeon-combat-panel \.solo-command-bar/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media \(max-width: 390px\)/);
});

test("Dungeons Beta 2 advances only Web identity and player-facing guidance", () => {
  assert.match(version, /1\.5\.0-trails-raids-b1/);
  assert.match(news, /Dungeons & Delves/);
  assert.match(news, /Dungeons & Delves has arrived/);
  assert.match(guide, /Reading an active delve/);
  assert.match(guide, /room progress, delve style, current state/);
});
