import test from "node:test";
import assert from "node:assert/strict";
import { battleItemPurpose, sortBattleItems } from "../src/utils/formatters.js";

test("battle items sort restorative then cures then support then damage", () => {
  const items = [
    { id: "bomb_fragment", name: "Bomb Fragment", target: "enemy", description: "Deals 220 Fire damage to the enemy." },
    { id: "war_horn", name: "War Horn", target: "ally", description: "Grants Power Up for 2 rounds." },
    { id: "antidote", name: "Antidote", target: "ally", description: "Removes Poison during Active Battle." },
    { id: "ether", name: "Ether", target: "ally", description: "Restores 40% of maximum MP." },
    { id: "potion", name: "Potion", target: "ally", description: "Restores 50 HP to one conscious hero." },
    { id: "earth_drum", name: "Earth Drum", target: "enemy", description: "Deals 450 Earth damage to the enemy." },
  ];
  assert.deepEqual(sortBattleItems(items).map((item) => item.id), [
    "ether", "potion", "antidote", "war_horn", "bomb_fragment", "earth_drum",
  ]);
});

test("disabled resource restoratives keep their restorative purpose", () => {
  const item = {
    id: "stamina_draught",
    name: "Stamina Draught",
    target: "ally",
    usable: false,
    reason: "Your current Job does not use AP.",
    description: "Restores 40% of maximum AP and can be used in or out of Active Battle.",
  };
  assert.equal(battleItemPurpose(item), "restorative");
});

test("structured effects take priority without requiring name-specific rules", () => {
  assert.equal(battleItemPurpose({ name: "Future Draught", use: { effects: [{ type: "restore_mp", fraction: 0.5 }] } }), "restorative");
  assert.equal(battleItemPurpose({ name: "Future Cleanser", use: { effects: [{ type: "cleanse", statuses: ["blind"] }] } }), "cure");
  assert.equal(battleItemPurpose({ name: "Future Grenade", use: { effects: [{ type: "damage", amount: 500 }] } }), "damage");
});

test("same-purpose items remain alphabetical for predictable scanning", () => {
  const items = [
    { id: "x_potion", name: "X-Potion", description: "Restores 1,000 HP." },
    { id: "hi_potion", name: "Hi-Potion", description: "Restores 200 HP." },
    { id: "potion", name: "Potion", description: "Restores 50 HP." },
  ];
  assert.deepEqual(sortBattleItems(items).map((item) => item.name), ["Hi-Potion", "Potion", "X-Potion"]);
});

test("sorting returns a copy and does not mutate combat payload order", () => {
  const items = [
    { id: "bomb_fragment", name: "Bomb Fragment", target: "enemy" },
    { id: "potion", name: "Potion", description: "Restores 50 HP." },
  ];
  const original = items.map((item) => item.id);
  const sorted = sortBattleItems(items);
  assert.notEqual(sorted, items);
  assert.deepEqual(items.map((item) => item.id), original);
  assert.deepEqual(sorted.map((item) => item.id), ["potion", "bomb_fragment"]);
});
