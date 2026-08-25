import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const wave1 = ["goblin","wolf","mandragora","goblin_chieftain","goblin_guard","hornet","flan","imp","dire_wolf_alpha","bomb"];
const wave2 = ["cockatrice","bat","queen_hornet","ochu","skeleton","cactuar","ossuary_knight","spriggan","basilisk","crimson_detonator"];
const wave3 = ["gigas","lamia","mimic","gargoyle","sahagin","sahagin_prince","tonberry","killer_fish","cactuar_jack","gigantoad"];

test("Monster portrait v3 contains Waves 1-3 authoritative ids", () => {
  const src = read("src/utils/monsterPortraits.js");
  for (const id of [...wave1, ...wave2, ...wave3]) {
    assert.match(src, new RegExp(`${id}.*monster-portraits-v9`));
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/monster-portraits-v9/${id}.webp`)), id);
  }
});

test("Player Guide job portrait assets referenced by lookup map exist", () => {
  const src = read("src/utils/jobPortraits.js");
  const matches = [...src.matchAll(/job-portraits-v2\/([a-z_]+\.webp)/g)].map((m) => m[1]);
  const unique = [...new Set(matches)];
  for (const file of unique) {
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/job-portraits-v2/${file}`)), file);
  }
});
