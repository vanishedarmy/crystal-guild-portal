import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const wave7 = ["crystal_wolf","mover","tonberry_executioner","tonberry_king","crystal_golem","red_dragon","blue_dragon","elemental_archon","magitek_juggernaut","gold_dragon"];

test("Monster Identity Wave 7 maps the next ten authoritative Bestiary ids", () => {
  const src = read("src/utils/monsterPortraits.js");
  const data = JSON.parse(read("public/guide-data.json"));
  const ids = new Set(data.monsters.map((entry) => entry.id));
  for (const id of wave7) {
    assert.ok(ids.has(id), `authoritative monster id missing: ${id}`);
    assert.match(src, new RegExp(`${id}.*monster-portraits-v10`));
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/monster-portraits-v10/${id}.webp`)), id);
  }
});

test("Wave 7 retains shared portraits in Bestiary, Hunts, Player Guide, and Solo Venture", () => {
  assert.match(read("src/player/Bestiary.jsx"), /MonsterPortrait/);
  const hunts = read("src/player/Hunts.jsx");
  assert.match(hunts, /MonsterPortrait monster=\{expedition\.combat\.enemy\}/);
  const runtime = read("src/guide/guideRuntime.js");
  assert.match(runtime, /monsterPortraitPath\(id\)/);
});

test("Wave 7 keeps non-cropping portrait presentation", () => {
  const css = read("src/styles/monster-identity.css");
  assert.match(css, /object-fit:contain/);
  assert.match(css, /solo-enemy-layout/);
});
