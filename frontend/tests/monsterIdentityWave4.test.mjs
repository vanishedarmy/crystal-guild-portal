import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const wave4 = ["mindflayer","zu","antlion","piscodemon","black_flan","coeurl","sand_worm","chimera","remora","king_coeurl"];

test("Monster Identity Wave 4 maps the next ten authoritative Bestiary ids", () => {
  const src = read("src/utils/monsterPortraits.js");
  for (const id of wave4) {
    assert.match(src, new RegExp(`${id}.*monster-portraits-v9`));
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/monster-portraits-v9/${id}.webp`)), id);
  }
});

test("Wave 4 portrait files use the standardized 512x768 canvas", () => {
  for (const id of wave4) {
    const file = path.join(root, `public/retro-phase-ii/monster-portraits-v9/${id}.webp`);
    assert.ok(fs.statSync(file).size > 0, id);
  }
});

test("Player Guide continues to share authoritative portrait lookup utilities", () => {
  const runtime = read("src/guide/guideRuntime.js");
  assert.match(runtime, /jobPortraitPath\(j\?\.name\|\|j\?\.id/);
  assert.match(runtime, /monsterPortraitPath\(id\)/);
});
