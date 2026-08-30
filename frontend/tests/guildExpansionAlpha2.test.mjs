import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("Guild Expansion exposes Supply Drives, Guild Objectives, and Order rewards", () => {
  const page = read("src/pages/FellowshipPage.jsx");
  const guide = read("public/guide-body.html");
  const whatsNew = read("src/player/whatsNewData.js");

  assert.match(page, /Supply Drive/);
  assert.match(page, /Guild Objective/);
  assert.match(page, /Help the Guild, get paid too/);
  assert.match(page, /personal Renown/);
  assert.match(page, /weekly_bonus/);

  assert.match(guide, /Supply Drives/);
  assert.match(guide, /Guild Objectives/);
  assert.match(guide, /personal Gil and Fellowship Renown reward/);
  assert.match(whatsNew, /name: "Guild Expansion"/);
});

test("Alpha 2 public identity is current", () => {
  const version = read("src/version.js");
  const guideData = JSON.parse(read("public/guide-data.json"));
  assert.match(version, /WEB_BUILD = "Trails & Raids Alpha 1"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.5\.0-trails-raids-a1"/);
  assert.equal(guideData.meta.version, "v1.5.0 — Trails & Raids Alpha 1");
  assert.equal(guideData.meta.release, "1.5.0-trails-raids-a1");
});
