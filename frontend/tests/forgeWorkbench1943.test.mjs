import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { FORGE_CATEGORIES, filterForgeItems, forgeUnavailableReasons } from "../src/utils/forgeFilters.js";

const sample = [
  { item_id: "a", name: "Silver Sword", type: "weapon", equipped: true, inventory_order: 0, min_level: 22, current_upgrade: 0, forgeable: true, effective_gil: 300, materials: [{ name: "Iron Ore", quantity: 2, owned: 3 }] },
  { item_id: "b", name: "Bronze Armor", type: "armor", equipped: true, inventory_order: 1, min_level: 4, current_upgrade: 2, forgeable: false, maxed: true, materials: [] },
  { item_id: "c", name: "Adamantine Ring", type: "accessory", equipped: false, min_level: 45, current_upgrade: 3, forgeable: true, effective_gil: 800, materials: [{ name: "Mythril Ore", quantity: 4, owned: 4 }] },
  { item_id: "d", name: "Bronze Sword", type: "weapon", equipped: false, min_level: 2, current_upgrade: 0, forgeable: false, effective_gil: 300, materials: [{ name: "Iron Ore", quantity: 3, owned: 1 }] },
];

test("forge exposes All Gear, Weapons, Armor and Accessories", () => {
  assert.deepEqual(FORGE_CATEGORIES.map(({ id }) => id), ["all", "weapon", "armor", "accessory"]);
});

test("equipped items stay first in inventory order for every sorting option", () => {
  for (const sort of ["type", "high", "name", "upgrade", "ready"]) {
    const { equipped, ordered } = filterForgeItems(sample, { sort });
    assert.deepEqual(equipped.map((item) => item.item_id), ["a", "b"], sort);
    assert.deepEqual(ordered.slice(0, 2).map((item) => item.item_id), ["a", "b"], sort);
  }
  assert.deepEqual(sample.map((item) => item.item_id), ["a", "b", "c", "d"], "never sort server inventory in place");
});

test("forged and unforged sections retain type-before-level sorting by default", () => {
  const { forged, unforged } = filterForgeItems(sample);
  assert.deepEqual(forged.map((item) => item.item_id), ["c"]);
  assert.deepEqual(unforged.map((item) => item.item_id), ["d"]);
});

test("categories, readiness, favorites and material/name search compose", () => {
  assert.deepEqual(filterForgeItems(sample, { category: "weapon" }).ordered.map((item) => item.item_id), ["a", "d"]);
  assert.deepEqual(filterForgeItems(sample, { category: "armor" }).ordered.map((item) => item.item_id), ["b"]);
  assert.deepEqual(filterForgeItems(sample, { category: "accessory" }).ordered.map((item) => item.item_id), ["c"]);
  assert.deepEqual(filterForgeItems(sample, { search: "mythril" }).ordered.map((item) => item.item_id), ["c"]);
  assert.deepEqual(filterForgeItems(sample, { search: "bronze" }).ordered.map((item) => item.item_id), ["b", "d"]);
  assert.deepEqual(filterForgeItems(sample, { forgeableOnly: true }).ordered.map((item) => item.item_id), ["a", "c"]);
  assert.deepEqual(filterForgeItems(sample, { favoritesOnly: true, favorites: ["c"] }).ordered.map((item) => item.item_id), ["c"]);
  assert.deepEqual(filterForgeItems(sample, { category: "weapon", search: "none" }).ordered, []);
  assert.deepEqual(filterForgeItems([], {}).ordered, []);
});

test("unavailability messages distinguish combat, currency, missing materials and max level", () => {
  assert.deepEqual(forgeUnavailableReasons(sample[1], { gil: 100 }), ["Maximum forge level reached."]);
  assert.deepEqual(forgeUnavailableReasons(sample[3], { gil: 20, combatLocked: true }), [
    "Finish your active encounter or raid before forging.", "Need 280 more Gil.", "Need 2 more Iron Ore.",
  ]);
  assert.deepEqual(forgeUnavailableReasons(sample[0], { gil: 300 }), []);
});

test("new workbench has accessible detail actions, pinned equipped section and mobile back navigation", async () => {
  const ui = await readFile(new URL("../src/player/ForgeWorkbench.jsx", import.meta.url), "utf8");
  const parent = await readFile(new URL("../src/player/Blacksmith.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/styles/forge-1943.css", import.meta.url), "utf8");
  assert.match(parent, /<ForgeWorkbench/);
  assert.match(parent, /submitForgeItem\(item\.item_id/);
  assert.match(parent, /await loadState\(\{ quiet: true, force: true \}\)/);
  assert.match(parent, /combatLocked=\{Boolean\(state\.combat_locked\)\}/);
  assert.match(ui, /Currently Equipped/);
  assert.match(ui, /grouped\.equipped\.map\(renderRow\)/);
  assert.match(ui, /Forged Gear/);
  assert.match(ui, /Unforged Gear/);
  assert.match(ui, /forge-directory-disclosure/);
  assert.match(ui, /crafting-layout forge-layout/);
  assert.match(ui, /Back to equipment/);
  assert.match(ui, /<DisplayPreferenceControls/);
  const display = await readFile(new URL('../src/components/DisplayPreferenceControls.jsx', import.meta.url), 'utf8');
  assert.match(display, /High contrast/);
  assert.match(ui, /!actionsAvailable \|\| !selected\.forgeable \|\| busy/);
  assert.match(ui, /Workshop saves/);
  assert.match(css, /max-width: 750px/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /focus-visible/);
});
