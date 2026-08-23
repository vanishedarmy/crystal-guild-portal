import test from "node:test";
import assert from "node:assert/strict";
import {
  achievementCategories,
  filterAchievements,
  filterTitles,
  progressText,
} from "../src/utils/achievementUtils.js";

const achievements = [
  { id: "a", category: "Combat", unlocked: true },
  { id: "b", category: "Combat", unlocked: false },
  { id: "c", category: "Hunts", unlocked: true },
];

test("achievement filters respect category and state", () => {
  assert.deepEqual(achievementCategories(achievements), ["All", "Combat", "Hunts"]);
  assert.deepEqual(filterAchievements(achievements, "Combat", "unlocked").map((a) => a.id), ["a"]);
  assert.deepEqual(filterAchievements(achievements, "All", "locked").map((a) => a.id), ["b"]);
});

test("title filtering and progress formatting are stable", () => {
  const titles = [
    { id: "one", unlocked: true, rarity: "legendary" },
    { id: "two", unlocked: false, rarity: "rare" },
  ];
  assert.deepEqual(filterTitles(titles, "unlocked", "Legendary").map((t) => t.id), ["one"]);
  assert.equal(progressText({ value: 12345, target: 100000 }), "12,345 / 100,000");
});

test("achievement ordering prioritizes attainment then progress then ascending requirements", async () => {
  const { achievementAttainmentState, sortAchievements } = await import("../src/utils/achievementUtils.js");
  const rows = [
    { id: "hidden", unlocked: false, tier: "gold", category: "Secret", progress: { hidden: true, value: 0, target: 0, percent: 0 } },
    { id: "not_started_50", unlocked: false, tier: "silver", category: "Combat", progress: { value: 0, raw_value: 0, target: 50, percent: 0 } },
    { id: "progress_50", unlocked: false, tier: "silver", category: "Combat", progress: { value: 35, raw_value: 35, target: 50, percent: 70 } },
    { id: "earned_25", unlocked: true, tier: "silver", category: "Combat", progress: { value: 25, raw_value: 25, target: 25, percent: 100 } },
    { id: "progress_10", unlocked: false, tier: "bronze", category: "Combat", progress: { value: 9, raw_value: 9, target: 10, percent: 90 } },
    { id: "earned_10", unlocked: true, tier: "bronze", category: "Combat", progress: { value: 10, raw_value: 10, target: 10, percent: 100 } },
    { id: "not_started_10", unlocked: false, tier: "bronze", category: "Combat", progress: { value: 0, raw_value: 0, target: 10, percent: 0 } },
  ];

  assert.equal(achievementAttainmentState(rows[0]), "hidden");
  assert.equal(achievementAttainmentState(rows[4]), "progress");
  assert.equal(achievementAttainmentState(rows[6]), "not_started");
  assert.deepEqual(
    sortAchievements(rows).map((row) => row.id),
    ["earned_10", "earned_25", "progress_10", "progress_50", "not_started_10", "not_started_50", "hidden"],
  );
});

test("locked achievement filter keeps closest active goals ahead of untouched goals", () => {
  const rows = [
    { id: "zero_5", category: "Combat", unlocked: false, tier: "bronze", progress: { value: 0, target: 5, percent: 0 } },
    { id: "half", category: "Combat", unlocked: false, tier: "silver", progress: { value: 25, target: 50, percent: 50 } },
    { id: "near", category: "Combat", unlocked: false, tier: "gold", progress: { value: 9, target: 10, percent: 90 } },
    { id: "earned", category: "Combat", unlocked: true, tier: "bronze", progress: { value: 1, target: 1, percent: 100 } },
  ];
  assert.deepEqual(filterAchievements(rows, "Combat", "locked").map((row) => row.id), ["near", "half", "zero_5"]);
});
