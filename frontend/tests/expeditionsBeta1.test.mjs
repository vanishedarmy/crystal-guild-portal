import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Expeditions Beta 1 route balance remains active under RC1", async () => {
  const version = await readFile(new URL("version.js", SRC), "utf8");
  const board = await readFile(new URL("player/Expeditions.jsx", SRC), "utf8");
  const news = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");

  assert.match(version, /WEB_BUILD = "Guild Expansion Beta 1"/);
  assert.match(version, /1\.3\.0-guild-expansion-b1/);
  assert.match(board, /Lower combat damage and softer hazards/);
  assert.match(board, /Harder combat and hazards for stronger rewards/);
  assert.match(board, /Harder enemy pressure/);
  assert.doesNotMatch(guide, /Beta 1 Balance Pass/);
  assert.match(guide, /Route signals:/);
  assert.match(guide, /Safe<\/b> lowers combat and hazard pressure/);
  assert.match(guide, /Push Deeper<\/b> increases combat, hazards, rewards/);
  assert.match(news, /Route choices have a purpose/);
  assert.match(news, /Expeditions Alpha 5/);
});
