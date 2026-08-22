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
