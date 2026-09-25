import test from "node:test";
import assert from "node:assert/strict";

import { sortBestiaryByLevel } from "../src/player/bestiarySort.js";

test("Bestiary sorts monsters from lowest level to highest level", () => {
  const monsters = [
    { id: "dragon", name: "Dragon", level: 40 },
    { id: "goblin_b", name: "Goblin B", level: 1 },
    { id: "coeurl", name: "Coeurl", level: 18 },
    { id: "goblin_a", name: "Goblin A", level: 1 },
    { id: "bomb", name: "Bomb", level: 7 },
  ];

  const sorted = sortBestiaryByLevel(monsters);
  assert.deepEqual(
    sorted.map((monster) => [monster.level, monster.name]),
    [
      [1, "Goblin A"],
      [1, "Goblin B"],
      [7, "Bomb"],
      [18, "Coeurl"],
      [40, "Dragon"],
    ],
  );
});

test("Bestiary sorting does not mutate the snapshot array", () => {
  const monsters = [
    { id: "high", name: "High", level: 20 },
    { id: "low", name: "Low", level: 2 },
  ];
  const original = [...monsters];

  const sorted = sortBestiaryByLevel(monsters);
  assert.deepEqual(monsters, original);
  assert.notStrictEqual(sorted, monsters);
  assert.equal(sorted[0].id, "low");
});
