import test from "node:test";
import assert from "node:assert/strict";
import {
  filterGuideAchievements,
  filterGuideTitles,
} from "../src/guide/guideCompletionUtils.js";

const achievements = [
  {
    name: "First Blood",
    description: "Defeat your first monster.",
    category: "Combat",
    tier: "bronze",
    points: 10,
    secret: false,
  },
  {
    name: "Grudge Magnet",
    description: "Be KO'd by Tonberry 10 times.",
    category: "Secret",
    tier: "gold",
    points: 50,
    secret: true,
  },
];

test("achievement guide filters visible metadata", () => {
  assert.equal(filterGuideAchievements(achievements, { query: "first" }).length, 1);
  assert.equal(filterGuideAchievements(achievements, { tier: "gold" }).length, 1);
  assert.equal(filterGuideAchievements(achievements, { category: "combat" }).length, 1);
});

test("secret achievement search does not leak concealed text", () => {
  assert.equal(filterGuideAchievements(achievements, { query: "grudge" }).length, 0);
  assert.equal(filterGuideAchievements(achievements, { query: "tonberry" }).length, 0);
  assert.equal(filterGuideAchievements(achievements, { query: "secret" }).length, 1);
});

test("title guide filters title metadata", () => {
  const titles = [
    {
      name: "Fresh Meat",
      description: "Newly recruited.",
      category: "Guild",
      rarity: "common",
      source: "Recruitment",
    },
    {
      name: "World Saver",
      description: "Saved something important.",
      category: "Raids",
      rarity: "legendary",
      source: "Achievement",
    },
  ];
  assert.equal(filterGuideTitles(titles, { query: "saved" }).length, 1);
  assert.equal(filterGuideTitles(titles, { category: "guild" }).length, 1);
  assert.equal(filterGuideTitles(titles, { rarity: "legendary" }).length, 1);
});
