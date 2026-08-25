import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const wave11 = ["cosmic_crystal_colossus", "violet_crystal_archangel", "crimson_crystal_demon", "void_knight", "stormforged_thunderwing", "toxic_hydra", "glacial_runebound_mammoth", "abyssal_kraken_king", "infernal_phoenix", "obsidian_scorpion_king"];

test("Monster Identity Wave 11 maps all generated portraits to authoritative Bestiary ids", () => {
  const src = read("src/utils/monsterPortraits.js");
  const data = JSON.parse(read("public/guide-data.json"));
  const ids = new Set(data.monsters.map((entry) => entry.id));
  for (const id of wave11) {
    assert.ok(ids.has(id), `authoritative monster id missing: ${id}`);
    assert.match(src, new RegExp(`${id}.*monster-portraits-v10`));
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/monster-portraits-v10/${id}.webp`)), id);
  }
});

test("Wave 11 keeps the image-fit hotfix active across all portrait surfaces", () => {
  const monsterCss = read("src/styles/monster-identity.css");
  const guideCss = read("public/guide.css");
  assert.match(monsterCss, /aspect-ratio:2\/3/);
  assert.match(monsterCss, /object-fit:contain/);
  assert.match(guideCss, /\.guide-hunt-art\{aspect-ratio:2\/3\}/);
  assert.match(read("src/player/Hunts.jsx"), /MonsterPortrait monster=\{expedition\.combat\.enemy\}/);
});
