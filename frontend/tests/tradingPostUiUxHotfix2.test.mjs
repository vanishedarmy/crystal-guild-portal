import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { compareTradingPostItems } from "../src/utils/tradingPostSort.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("Trading Post inventory and listings sort type-first", () => {
  const rows = [
    { item: { name: "Mythril Ore", type: "material" } },
    { item: { name: "Potion", type: "consumable" } },
    { item: { name: "Iron Sword", type: "weapon", level: 5 } },
    { item: { name: "Silver Ring", type: "accessory", level: 12 } },
    { item: { name: "Bronze Armor", type: "armor", level: 8 } },
  ].sort(compareTradingPostItems);
  assert.deepEqual(rows.map((row) => row.item.type), ["weapon", "armor", "accessory", "consumable", "material"]);
});

test("Trading Post equipment keeps higher level first inside each type", () => {
  const rows = [
    { name: "Bronze Sword", type: "weapon", level: 2 },
    { name: "Crystal Sword", type: "weapon", level: 30 },
    { name: "Iron Sword", type: "weapon", level: 10 },
  ].sort(compareTradingPostItems);
  assert.deepEqual(rows.map((row) => row.name), ["Crystal Sword", "Iron Sword", "Bronze Sword"]);
});

test("all three Trading Post surfaces use deterministic type sorting", () => {
  const source = read("../src/player/MoogleEmporium.jsx");
  assert.match(source, /marketListings[\s\S]*sort\(compareTradingPostItems\)/);
  assert.match(source, /marketEligibleItems[\s\S]*sort\(compareTradingPostItems\)/);
  assert.match(source, /ownMarketListings[\s\S]*sort\(compareTradingPostItems\)/);
});

test("Trading Post cards are compact and show three columns on wide screens", () => {
  const css = read("../src/styles/portal.css");
  assert.match(css, /Trading Post UI\/UX Hotfix 2/);
  assert.match(css, /\.trading-post-listing-grid,[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.trading-post-listing-head \{[\s\S]*grid-template-columns: 48px minmax\(0, 1fr\)/);
  assert.match(css, /\.trading-post-list-form input \{[\s\S]*min-height: 36px/);
  assert.match(css, /@media \(max-width: 1180px\)[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*grid-template-columns: 1fr/);
});

test("browse cards consolidate pricing and clamp long descriptions", () => {
  const source = read("../src/player/MoogleEmporium.jsx");
  const css = read("../src/styles/portal.css");
  assert.match(source, /trading-post-market-metrics/);
  assert.match(source, /trading-post-description/);
  assert.match(source, /trading-post-fee-summary/);
  assert.match(css, /-webkit-line-clamp: 2/);
});
