import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "public", "guide-data.json"), "utf8"));
const monsters = new Map(data.monsters.map((monster) => [monster.id, monster]));

const expected = {
  ancient_coin: ["ossuary_knight", "mimic", "magic_pot", "ancient_mimic"],
  hi_potion: ["goblin_chieftain", "mimic", "tonberry"],
  mythril_ore: ["spriggan", "gigas", "mimic", "iron_giant", "ancient_adamantoise"],
  wyvern_scale: ["cockatrice", "basilisk", "sea_serpent", "red_dragon", "blue_dragon", "wyrm"],
  elemental_crystal: ["flan", "bomb", "black_flan", "magic_pot", "crystal_wolf", "crystal_golem", "elemental_archon", "dark_element"],
  demon_horn: ["imp", "gargoyle", "piscodemon", "abaddon", "archeodemon", "demonolith"],
};

function sources(itemId) {
  return data.monsters
    .flatMap((monster) => (monster.drops || [])
      .filter((drop) => drop.item_id === itemId)
      .map((drop) => ({ id: monster.id, level: Number(monster.level || 0), chance: Number(drop.chance || 0) })))
    .sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
}

test("facility project materials are no longer single-monster gated", () => {
  for (const [itemId, monsterIds] of Object.entries(expected)) {
    const rows = sources(itemId);
    assert.ok(rows.length >= 3, `${itemId} needs multiple monster sources`);
    for (const monsterId of monsterIds) {
      assert.ok(rows.some((row) => row.id === monsterId), `${itemId} missing ${monsterId}`);
    }
  }
});

test("every facility material has an early practical drop source", () => {
  for (const itemId of Object.keys(expected)) {
    const [earliest] = sources(itemId);
    assert.ok(earliest.level <= 11, `${itemId} earliest source is level ${earliest.level}`);
    assert.ok(earliest.chance >= 0.10, `${itemId} early drop rate is ${earliest.chance}`);
  }
});
