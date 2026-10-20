import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { BOSS_ART_IDS, bossArtworkPath } from "../src/utils/bossArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "public/guide-data.json"), "utf8"));
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("all canonical world and raid bosses have packaged artwork", () => {
  assert.equal(data.bosses.length, 37);
  assert.equal(BOSS_ART_IDS.size, 37);
  for (const boss of data.bosses) {
    const art = bossArtworkPath(boss);
    assert.ok(art, `missing artwork mapping: ${boss.id}`);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing artwork file: ${boss.id}`);
  }
});

test("boss artwork is wired into guide, portal records, detail dialog, and OBS overlay", () => {
  assert.match(read("src/guide/guideRuntime.js"), /bossArtworkPath/);
  assert.match(read("src/player/Records.jsx"), /BossArtwork boss=\{boss\}/);
  assert.match(read("src/components/DetailDialog.jsx"), /detail-boss-artwork/);
  assert.match(read("public/raid-overlay.js"), /bossArtPath/);
  assert.match(read("public/raid-overlay.html"), /id="boss-art"/);
});
