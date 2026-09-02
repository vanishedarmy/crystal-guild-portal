import assert from "node:assert/strict";
import test from "node:test";
import { duration, formatEquipmentRequirements, formatItemAvailability, formatItemTraits, formatItemUse, formatMaterialPurpose, formatMonsterSpecial } from "../src/utils/formatters.js";

test("formats structured Bestiary specials without rendering objects", () => {
  assert.equal(
    formatMonsterSpecial({ name: "Everyone's Grudge", chance: 0.2, multiplier: 1.9 }),
    "Everyone's Grudge · 20% chance · ×1.9",
  );
});

test("supports legacy string and empty Bestiary special values", () => {
  assert.equal(formatMonsterSpecial("1000 Needles"), "1000 Needles");
  assert.equal(formatMonsterSpecial(null), "—");
});


test("formats Portal consumable effects into player-readable summaries", () => {
  assert.equal(
    formatItemUse({ effects: [{ type: "heal_hp", amount: 50 }] }),
    "Restores 50 HP",
  );
  assert.equal(
    formatItemUse({ effects: [{ type: "restore_mp", fraction: 0.4 }] }),
    "Restores 40% max MP",
  );
  assert.equal(
    formatItemUse({ effects: [{ type: "cleanse", statuses: ["poison", "silence"] }] }),
    "Removes Poison / Silence",
  );
  assert.equal(
    formatItemUse({ effects: [{ type: "damage", amount: 220, element: "Fire" }] }),
    "Deals 220 Fire damage",
  );
});

test("formats Portal item usage availability", () => {
  assert.equal(formatItemAvailability({ target: "ally", field: true }), "Ally target · Field & Active Battle");
  assert.equal(formatItemAvailability({ target: "enemy", field: false }), "Enemy target · Active Battle");
});


test("formats Portal equipment traits and requirements", () => {
  assert.equal(
    formatItemTraits({
      element: "Fire",
      on_hit_status: { status: "silence", chance: 0.15, turns: 2 },
      lifesteal: 0.1,
      status_immune: ["poison"],
      status_resist: { slow: 0.75 },
    }),
    "Fire-aspected basic attacks · 15% chance to inflict Silence for 2 rounds · 10% lifesteal · Immune to Poison · 75% Slow resistance",
  );
  assert.equal(formatEquipmentRequirements({ min_level: 24, allowed_jobs: ["Warrior", "Paladin"] }), "Lv. 24 · Warrior / Paladin");
  assert.equal(formatEquipmentRequirements({ min_level: 10, allowed_jobs: [] }), "Lv. 10 · All Jobs");
});

test("formats material purpose without equipment-stat language", () => {
  assert.equal(formatMaterialPurpose({ use: { effects: [{ type: "damage", amount: 220 }] } }), "Usable combat material");
  assert.equal(formatMaterialPurpose({}), "Progression / crafting / trade material");
});


test("formats every countdown with bounded week/day/hour/minute/second units", () => {
  assert.equal(duration(0), "0s");
  assert.equal(duration(62), "1m 2s");
  assert.equal(duration(3602), "1h 0m 2s");
  assert.equal(duration(90061), "1d 1h 1m 1s");
  assert.equal(duration(788645), "1w 2d 3h 4m 5s");
  assert.equal(duration(69842), "19h 24m 2s");
});
