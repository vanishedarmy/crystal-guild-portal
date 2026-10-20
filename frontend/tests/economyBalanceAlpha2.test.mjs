import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("Economy Balance Alpha 2 remains in the release history", () => {
  const whatsNew = read("../src/player/whatsNewData.js");
  assert.match(whatsNew, /version: "v1\.9\.0 Alpha 2"/);
  assert.match(whatsNew, /name: "Economy Balance"/);
  assert.match(whatsNew, /A fairer economy without turning progression into a grind/);
});

test("historical Trading Post gate used Ventures; current Trading Post is open with Guild perks", () => {
  const news = read("../src/player/whatsNewData.js");
  const emporium = read("../src/player/MoogleEmporium.jsx");
  const guide = read("../public/guide-body.html");
  assert.match(news, /15 completed Ventures instead of Expeditions/);
  assert.match(emporium, /The market starts open with 2% listing fees, 5% sale tax, and 6 active listings/);
  assert.match(guide, /The Moogle Trading Post is open to players before construction/);
  assert.doesNotMatch(guide, /Fellowship Level 1 service built with 25,000 Gil/);
});

test("Economy Balance guidance exposes the Monster Toss payout buff", () => {
  const guide = read("../public/guide-body.html");
  const whatsNew = read("../src/player/whatsNewData.js");
  assert.match(guide, /10 \/ 15 \/ 30 \/ 50 \/ 80 \/ 120 MGP/);
  assert.match(whatsNew, /Monster Toss buff/);
  assert.match(whatsNew, /Press Adamantite now costs 1,600 Gil/);
});
