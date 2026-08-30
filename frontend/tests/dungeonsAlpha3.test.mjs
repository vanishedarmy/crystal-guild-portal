import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("Alpha 3 Dungeon UI exposes route consequences and first-clear identity", () => {
  const board = read("../src/player/Dungeons.jsx");
  assert.match(board, /Dungeons & Delves · Alpha 3/);
  assert.match(board, /Route effects ahead/);
  assert.match(board, /First Clear/);
  assert.match(board, /choice\.effects/);
  assert.match(board, /combat\.route_effects/);
});

test("Alpha 3 What's New introduces Whiteglass and forward route effects", () => {
  const news = read("../src/player/whatsNewData.js");
  assert.match(news, /Dungeons & Delves Alpha 3/);
  assert.match(news, /Whiteglass Bastion/);
  assert.match(news, /Choices echo forward/);
  assert.match(news, /First clears matter/);
});

test("Player Guide documents three delves and persistent route consequences", () => {
  const guide = read("../public/guide-body.html");
  assert.match(guide, /The Whiteglass Bastion/);
  assert.match(guide, /45% Frostveil Reach/);
  assert.match(guide, /ward the next hazard/);
  assert.match(guide, /one-time first-clear reward/);
});
