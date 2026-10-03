import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const PUBLIC = new URL("../public/", import.meta.url);
const FACILITY_MATERIALS = [
  "ancient_coin",
  "hi_potion",
  "mythril_ore",
  "wyvern_scale",
  "elemental_crystal",
  "demon_horn",
];

async function guideData() {
  return JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
}

test("facility materials have multiple monster sources in the published Bestiary", async () => {
  const data = await guideData();
  for (const itemId of FACILITY_MATERIALS) {
    const sources = data.monsters.filter((monster) =>
      (monster.drops || []).some((drop) => drop.item_id === itemId),
    );
    assert.ok(sources.length >= 3, `${itemId} has only ${sources.length} monster sources`);
  }
});

test("facility materials publish an early practical source instead of a late single gate", async () => {
  const data = await guideData();
  for (const itemId of FACILITY_MATERIALS) {
    const sources = data.monsters.flatMap((monster) =>
      (monster.drops || [])
        .filter((drop) => drop.item_id === itemId)
        .map((drop) => ({ level: Number(monster.level || 0), chance: Number(drop.chance || 0), id: monster.id })),
    );
    const earliest = sources.sort((a, b) => a.level - b.level)[0];
    assert.ok(earliest, `${itemId} has no published source`);
    assert.ok(earliest.level <= 11, `${itemId} first appears at Lv.${earliest.level}`);
    assert.ok(earliest.chance >= 0.10, `${itemId} early source rate is only ${earliest.chance}`);
  }
});

test("published facility drop rates stay bounded and match the intended thematic early sources", async () => {
  const data = await guideData();
  const expected = new Map([
    ["ancient_coin", "ossuary_knight"],
    ["hi_potion", "goblin_chieftain"],
    ["mythril_ore", "spriggan"],
    ["wyvern_scale", "cockatrice"],
    ["elemental_crystal", "flan"],
    ["demon_horn", "imp"],
  ]);
  for (const [itemId, monsterId] of expected) {
    const monster = data.monsters.find((row) => row.id === monsterId);
    assert.ok(monster, `${monsterId} missing from Bestiary data`);
    const drop = (monster.drops || []).find((row) => row.item_id === itemId);
    assert.ok(drop, `${monsterId} does not publish ${itemId}`);
    assert.ok(drop.chance > 0 && drop.chance <= 0.80, `${monsterId}:${itemId} has invalid rate ${drop.chance}`);
  }
});
