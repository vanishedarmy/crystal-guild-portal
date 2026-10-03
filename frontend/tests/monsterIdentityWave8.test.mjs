import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const wave8 = ["floating_death","storm_dragon","adamant_golem","varuna","astral_construct","death_rider","demonolith","spirit","crystal_dragon","machea"];

test("Monster Identity Wave 8 maps all generated portraits to authoritative Bestiary ids", () => {
  const src = read("src/utils/monsterPortraits.js");
  const data = JSON.parse(read("public/guide-data.json"));
  const ids = new Set(data.monsters.map((entry) => entry.id));
  for (const id of wave8) {
    assert.ok(ids.has(id), `authoritative monster id missing: ${id}`);
    assert.match(src, new RegExp(`${id}.*monster-portraits-v10`));
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/monster-portraits-v10/${id}.webp`)), id);
  }
});

test("Wave 8 preserves the normalized 2:3 portrait library", () => {
  const css = read("src/styles/monster-identity.css");
  assert.match(css, /aspect-ratio:2\/3/);
  assert.match(css, /object-fit:contain/);
});

test("Wave 8 remains shared across Bestiary, Hunts, Guide, and Solo Venture", () => {
  assert.match(read("src/player/Bestiary.jsx"), /MonsterPortrait/);
  const hunts = read("src/player/Hunts.jsx");
  assert.match(hunts, /MonsterPortrait monster=\{expedition\.combat\.enemy\}/);
  const runtime = read("src/guide/guideRuntime.js");
  assert.match(runtime, /monsterPortraitPath\(id\)/);
});
