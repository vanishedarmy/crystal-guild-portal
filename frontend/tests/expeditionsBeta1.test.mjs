import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Expeditions Beta 1 balance remains documented under the Beta 2 UX release", async () => {
  const version = await readFile(new URL("version.js", SRC), "utf8");
  const board = await readFile(new URL("player/Expeditions.jsx", SRC), "utf8");
  const news = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");

  assert.match(version, /WEB_BUILD = "Expeditions Beta 3"/);
  assert.match(version, /1\.2\.0-expeditions-b3/);
  assert.match(board, /Lower combat damage and softer hazards/);
  assert.match(board, /Harder combat and hazards for stronger rewards/);
  assert.match(board, /Harder enemy pressure/);
  assert.match(guide, /Beta 1 Balance Pass/);
  assert.match(guide, /Safe Means Safer/);
  assert.match(guide, /Push Deeper Means Risk/);
  assert.match(news, /3,000-run balance matrix/);
  assert.match(news, /Expeditions Alpha 5/);
});
