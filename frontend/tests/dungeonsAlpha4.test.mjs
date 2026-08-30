import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("Alpha 4 Dungeon UI exposes event count and encounter rules", () => {
  const board = read("../src/player/Dungeons.jsx");
  assert.match(board, /Dungeons & Delves · Alpha 4/);
  assert.match(board, /Events/);
  assert.match(board, /Encounter Rules/);
  assert.match(board, /opening_effects/);
  assert.match(board, /combat\.mechanics/);
});

test("Alpha 4 What's New introduces events and encounter depth", () => {
  const news = read("../src/player/whatsNewData.js");
  assert.match(news, /Dungeons & Delves Alpha 4/);
  assert.match(news, /Riftglass Observatory/);
  assert.match(news, /Dungeon events arrive/);
  assert.match(news, /Encounter rules deepen/);
});

test("Player Guide documents Riftglass and event encounter rules", () => {
  const guide = read("../public/guide-body.html");
  assert.match(guide, /The Riftglass Observatory/);
  assert.match(guide, /55% of The Astral Scar/);
  assert.match(guide, /Events &amp; encounter rules/);
  assert.match(guide, /tighter round limits/);
});
