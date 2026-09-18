import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("Alpha 4 Dungeon UI exposes event count and encounter rules", () => {
  const board = read("../src/player/Dungeons.jsx");
  assert.match(board, /Dungeons &amp; Delves/);
  assert.match(board, /Events/);
  assert.match(board, /Encounter Rules/);
  assert.match(board, /opening_effects/);
  assert.match(board, /combat\.mechanics/);
});

test("Alpha 4 event and encounter depth remains under the Beta 1 feature freeze", () => {
  const news = read("../src/player/whatsNewData.js");
  const guide = read("../public/guide-body.html");
  assert.match(news, /Dungeons & Delves/);
  assert.match(news, /Four persistent delves/);
  assert.match(guide, /The Riftglass Observatory/);
  assert.match(guide, /Events &amp; encounter rules/);
});

test("Player Guide documents Riftglass and event encounter rules", () => {
  const guide = read("../public/guide-body.html");
  assert.match(guide, /<h3>The Riftglass Observatory<\/h3>/);
  assert.match(guide, /55% of The Astral Scar/);
  assert.match(guide, /ten-chamber Astral Scar observatory/);
  assert.match(guide, /Death Machine miniboss/);
  assert.match(guide, /Crystal Wolf finale/);
  assert.match(guide, /Events &amp; encounter rules/);
  assert.match(guide, /do not impose a round-count defeat limit/);
  assert.match(guide, /Round count itself is never a defeat condition/);
});
