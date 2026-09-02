import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Expeditions Beta 1 route balance remains active under the final v1.3 release", async () => {
  const version = await readFile(new URL("version.js", SRC), "utf8");
  const board = await readFile(new URL("player/Expeditions.jsx", SRC), "utf8");
  const news = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");

  assert.match(version, /WEB_BUILD = "Moogle Emporium Annex Alpha 3"/);
  assert.match(version, /1\.7\.0-emporium-annex-a3h1/);
  assert.match(board, /Lower combat damage and softer hazards/);
  assert.match(board, /Harder combat and hazards for stronger rewards/);
  assert.match(board, /Harder enemy pressure/);
  assert.doesNotMatch(guide, /Beta 1 Balance Pass/);
  assert.match(guide, /Route signals:/);
  assert.match(guide, /Safe<\/b> lowers combat and hazard pressure/);
  assert.match(guide, /Push Deeper<\/b> increases combat, hazards, rewards/);
  assert.match(news, /Choose the risk/);
  assert.match(news, /Your Chocobo matters/);
  assert.doesNotMatch(news, /name: "Expeditions (?:Alpha|Beta)/);
});
