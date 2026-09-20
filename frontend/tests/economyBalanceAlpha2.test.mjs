import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("Economy Balance Alpha 2 publishes the current web identity", () => {
  const version = read("../src/version.js");
  assert.match(version, /WEB_VERSION = "v1\.9\.0 Alpha 2"/);
  assert.match(version, /WEB_BUILD = "Economy Balance"/);
  assert.match(version, /1\.9\.0-economy-balance-alpha2/);
});

test("Trading Post Level 1 copy uses Ventures rather than late-game Expeditions", () => {
  const emporium = read("../src/player/MoogleEmporium.jsx");
  assert.match(emporium, /25,000 Gil · 3 Mythril Ore · 15 Ventures/);
  assert.doesNotMatch(emporium, /25,000 Gil · 3 Mythril Ore · 15 Expeditions/);
});

test("Economy Balance guidance exposes the Monster Toss payout buff", () => {
  const guide = read("../public/guide-body.html");
  const whatsNew = read("../src/player/whatsNewData.js");
  assert.match(guide, /10 \/ 15 \/ 30 \/ 50 \/ 80 \/ 120 MGP/);
  assert.match(whatsNew, /Monster Toss buff/);
  assert.match(whatsNew, /Press Adamantite now costs 1,600 Gil/);
});
