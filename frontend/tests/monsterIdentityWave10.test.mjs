import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const wave10 = ["behemoth_tyrant", "master_coeurl", "rift_drake", "catoblepas", "rift_behemoth", "malboro_menace", "omega_sentinel", "wyrm", "great_malboro_omega", "dark_element"];

test("Monster Identity Wave 10 maps all generated portraits to authoritative Bestiary ids", () => {
  const src = read("src/utils/monsterPortraits.js");
  const data = JSON.parse(read("public/guide-data.json"));
  const ids = new Set(data.monsters.map((entry) => entry.id));
  for (const id of wave10) {
    assert.ok(ids.has(id), `authoritative monster id missing: ${id}`);
    assert.match(src, new RegExp(`${id}.*monster-portraits-v10`));
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/monster-portraits-v10/${id}.webp`)), id);
  }
});

test("Wave 10 keeps the image-fit hotfix active across all portrait surfaces", () => {
  const monsterCss = read("src/styles/monster-identity.css");
  const guideCss = read("public/guide.css");
  assert.match(monsterCss, /aspect-ratio:2\/3/);
  assert.match(monsterCss, /object-fit:contain/);
  assert.match(guideCss, /\.guide-hunt-art\{aspect-ratio:2\/3\}/);
  assert.match(read("src/player/Hunts.jsx"), /MonsterPortrait monster=\{expedition\.combat\.enemy\}/);
});

test("Wave 10 uses the cache-busted v10 portrait library", () => {
  const src = read("src/utils/monsterPortraits.js");
  assert.match(src, /monster-portraits-v10/);
  assert.doesNotMatch(src, /monster-portraits-v9\//);
});
