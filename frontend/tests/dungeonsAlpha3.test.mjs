import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("Alpha 3 Dungeon UI exposes route consequences and first-clear identity", () => {
  const board = read("../src/player/Dungeons.jsx");
  assert.match(board, /Dungeons & Delves · Beta 2/);
  assert.match(board, /Route effects ahead/);
  assert.match(board, /First Clear/);
  assert.match(board, /choice\.effects/);
  assert.match(board, /combat\.route_effects/);
});

test("Alpha 3 route-depth features remain under the Beta 1 feature freeze", () => {
  const news = read("../src/player/whatsNewData.js");
  const guide = read("../public/guide-body.html");
  assert.match(news, /Dungeons & Delves Beta 2/);
  assert.match(news, /freezes Dungeon content at four delves/);
  assert.match(guide, /The Whiteglass Bastion/);
  assert.match(guide, /one-time first-clear reward/);
});

test("Player Guide documents three delves and persistent route consequences", () => {
  const guide = read("../public/guide-body.html");
  assert.match(guide, /The Whiteglass Bastion/);
  assert.match(guide, /45% Frostveil Reach/);
  assert.match(guide, /ward the next hazard/);
  assert.match(guide, /one-time first-clear reward/);
});
