import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const wave6 = ["iron_giant","iron_giant_exile","ironclad","behemoth","chimera_brain","evil_eye","malboro_great","three_moon_chimera","death_machine","magitek_armor"];

test("Monster Identity Wave 6 maps the next ten authoritative Bestiary ids", () => {
  const src = read("src/utils/monsterPortraits.js");
  const data = JSON.parse(read("public/guide-data.json"));
  const ids = new Set(data.monsters.map((entry) => entry.id));
  for (const id of wave6) {
    assert.ok(ids.has(id), `authoritative monster id missing: ${id}`);
    assert.match(src, new RegExp(`${id}.*monster-portraits-v9`));
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/monster-portraits-v9/${id}.webp`)), id);
  }
});

test("Wave 6 shows enemy portraits in Solo Venture combat while keeping shared lookup", () => {
  const hunts = read("src/player/Hunts.jsx");
  assert.match(hunts, /MonsterPortrait monster=\{expedition\.combat\.enemy\}/);
  assert.match(hunts, /className="solo-enemy-portrait"/);
  const runtime = read("src/guide/guideRuntime.js");
  assert.match(runtime, /monsterPortraitPath\(id\)/);
});

test("Wave 6 retains contain-fit monster presentation for Bestiary, Hunts, and Solo Venture", () => {
  const monsterCss = read("src/styles/monster-identity.css");
  assert.match(monsterCss, /object-fit:contain/);
  assert.match(monsterCss, /solo-enemy-layout/);
});
