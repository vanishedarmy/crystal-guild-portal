import test from "node:test";
import assert from "node:assert/strict";
import { activitySourceLabel, humanizeLabel, metricLabel } from "../src/utils/displayLabels.js";

test("internal identifiers become player-facing labels", () => {
  assert.equal(humanizeLabel("bestiary_unique"), "Bestiary Entries");
  assert.equal(humanizeLabel("party_encounters"), "Party Encounters");
  assert.equal(humanizeLabel("ultimate_superboss"), "Ultimate Superboss");
  assert.equal(humanizeLabel("magic_power"), "Magic Power");
  assert.equal(humanizeLabel("starter"), "Starter");
});

test("record metrics use intentional display names", () => {
  assert.equal(metricLabel("best_hit"), "Best Single Hit");
  assert.equal(metricLabel("raid_wins"), "Raid Wins");
  assert.equal(metricLabel("healing_done"), "Healing Done");
});

test("activity sources hide storage-style identifiers", () => {
  assert.equal(activitySourceLabel("seal_shop"), "Seal Shop");
  assert.equal(activitySourceLabel("monster:iron_giant"), "Monster · Iron Giant");
  assert.equal(activitySourceLabel("boss:ultima_weapon"), "Boss · Ultima Weapon");
});
