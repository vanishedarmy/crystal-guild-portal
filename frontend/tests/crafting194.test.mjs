import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { CRAFTING_CATEGORIES, filterCraftingRecipes, readable } from '../src/utils/craftingFilters.js';
import { RESYNTHESIS_CATEGORIES, filterResynthesisItems } from '../src/utils/resynthesisFilters.js';

const recipes = [
  { id: 'potion', category: 'field', subcategory: 'Restoratives', name: 'Potion', min_level: 1, craftable: true, output: { name: 'Potion', allowed_jobs: [] }, materials: [{ name: 'Wolf Fang' }] },
  { id: 'bow', category: 'weapons', subcategory: 'Bows', name: 'Oak Bow', min_level: 12, craftable: false, output: { name: 'Oak Bow', allowed_jobs: ['archer'] }, materials: [{ name: 'Iron Ore' }] },
  { id: 'sword', category: 'weapons', subcategory: 'Swords', name: 'Bronze Sword', min_level: 3, craftable: true, output: { name: 'Bronze Sword', allowed_jobs: ['warrior'] }, materials: [{ name: 'Iron Ore' }] },
];

test('workbench displays all four recipe categories', () => {
  assert.deepEqual(CRAFTING_CATEGORIES.map(c => c.id), ['field', 'weapons', 'armor', 'accessories']);
});

test('craftability, categories, subcategories, favorites and sorting are composable', () => {
  assert.deepEqual(filterCraftingRecipes(recipes, { category: 'weapons', craftableOnly: true }).map(r => r.id), ['sword']);
  assert.deepEqual(filterCraftingRecipes(recipes, { category: 'weapons', subcategory: 'Bows' }).map(r => r.id), ['bow']);
  assert.deepEqual(filterCraftingRecipes(recipes, { category: 'all', favoritesOnly: true, favorites: ['bow'] }).map(r => r.id), ['bow']);
  assert.deepEqual(filterCraftingRecipes(recipes, { category: 'all', sort: 'high' }).map(r => r.id), ['bow', 'sword', 'potion']);
  assert.deepEqual(filterCraftingRecipes(recipes, { category: 'all', sort: 'ready' }).map(r => r.id), ['potion', 'sword', 'bow']);
});

test('search finds recipe name, output, material and compatible job', () => {
  for (const [query, want] of [['oak', 'bow'], ['iron', 'sword'], ['archer', 'bow'], ['potion', 'potion']]) {
    const rows = filterCraftingRecipes(recipes, { category: 'all', search: query });
    assert.ok(rows.some(row => row.id === want), `${query} should find ${want}`);
  }
});

test('equipment formatting is defined for all gear previews', async () => {
  // 1.9.4.1 failed at render time on Weapons/Armor/Accessories because
  // CraftingWorkbench called an undefined readable() function.
  assert.equal(readable('two_handed_sword'), 'Two Handed Sword');
  assert.equal(readable('magic_defense'), 'Magic Defense');
  const ui = await readFile(new URL('../src/player/CraftingWorkbench.jsx', import.meta.url), 'utf8');
  assert.match(ui, /import \{[^}]*readable[^}]*\} from "\.\.\/utils\/craftingFilters\.js"/);
  assert.match(ui, /\["weapon", "armor", "accessory"\]\.includes\(selected\.output\?\.type\)/);
});

const gear = [
  { item_id: 'sword', name: 'Bronze Sword', type: 'weapon', min_level: 3, upgrade_level: 0, resynthesizable: true, available_copies: 2, recovery: [{ name: 'Iron Ore', quantity: 2 }] },
  { item_id: 'staff', name: 'Sage Staff', type: 'weapon', min_level: 20, upgrade_level: 2, resynthesizable: false, available_copies: 0, reason: 'Unequip first', recovery: [{ name: 'Magitek Scrap', quantity: 1 }] },
  { item_id: 'armor', name: 'Bronze Mail', type: 'armor', min_level: 5, upgrade_level: 1, resynthesizable: true, available_copies: 1, recovery: [{ name: 'Iron Ore', quantity: 2 }] },
];

test('resynthesis category, availability, recovered material search and sorting compose safely', () => {
  assert.deepEqual(RESYNTHESIS_CATEGORIES.map((entry) => entry.id), ['all', 'weapon', 'armor']);
  assert.deepEqual(filterResynthesisItems(gear, { category: 'weapon', availableOnly: true }).map((item) => item.item_id), ['sword']);
  assert.deepEqual(filterResynthesisItems(gear, { search: 'Magitek Scrap' }).map((item) => item.item_id), ['staff']);
  assert.deepEqual(filterResynthesisItems(gear, { search: 'iron' }).map((item) => item.item_id), ['sword', 'armor']);
  assert.deepEqual(filterResynthesisItems(gear, { sort: 'upgrade' }).map((item) => item.item_id), ['staff', 'armor', 'sword']);
  assert.equal(filterResynthesisItems(gear, { category: 'accessory' }).length, 0);
  assert.deepEqual(filterResynthesisItems([]), []);
  assert.deepEqual(gear.map((item) => item.item_id), ['sword', 'staff', 'armor'], 'do not mutate live state');
});

test('resynthesis reuses workbench layout and preserves the destructive action confirmation', async () => {
  const ui = await readFile(new URL('../src/player/ResynthesisWorkbench.jsx', import.meta.url), 'utf8');
  const parent = await readFile(new URL('../src/player/Blacksmith.jsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/styles/resynthesis-1942.css', import.meta.url), 'utf8');
  assert.match(ui, /crafting-layout resynthesis-layout/);
  assert.match(ui, /crafting-directory/);
  assert.match(ui, /crafting-detail resynthesis-detail/);
  assert.match(ui, /Back to equipment/);
  assert.match(ui, /Guaranteed material recovery/);
  assert.match(ui, /available_copies/);
  assert.match(ui, /!selected\.resynthesizable \|\| available < 1 \|\| busy/);
  assert.match(ui, /high-contrast/);
  assert.match(css, /max-width: 750px/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(parent, /<ResynthesisWorkbench/);
  assert.match(parent, /handleTabListKeyDown\(event, switchView\)/);
  assert.match(parent, /setQuery\(""\)/);
  assert.match(parent, /window\.confirm\(prompt\)/);
  assert.match(parent, /await loadState\(\{ quiet: true, force: true \}\)/);
});

test('accessible mobile interface includes semantic controls and reduced-motion styles', async () => {
  const ui = await readFile(new URL('../src/player/CraftingWorkbench.jsx', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/styles/crafting-194.css', import.meta.url), 'utf8');
  const parent = await readFile(new URL('../src/player/Blacksmith.jsx', import.meta.url), 'utf8');
  assert.match(ui, /aria-pressed=/);
  assert.match(ui, /aria-live="polite"/);
  assert.match(ui, /aria-label="Recipe results"/);
  assert.match(ui, /High contrast/);
  assert.match(ui, /Comfortable text/);
  assert.match(ui, /Back to recipes/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /prefers-contrast/);
  assert.match(styles, /focus-visible/);
  assert.match(styles, /min-height: 44px/);
  assert.match(styles, /max-width: 750px/);
  assert.match(parent, /submitCraftingState\(csrfToken, actionKey\("crafting-state"\), "reforged"\)/);
  assert.match(parent, /force: true/);
});

test('Blacksmith load failures expose a retry instead of an endless loading placeholder', async () => {
  const parent = await readFile(new URL('../src/player/Blacksmith.jsx', import.meta.url), 'utf8');
  assert.match(parent, /loadStatus === "error"/);
  assert.match(parent, /loadStatus !== "idle"/);
  assert.match(parent, /role="alert"/);
  assert.match(parent, /Retry Blacksmith/);
  assert.match(parent, /stateRequestRef\.current/);
  assert.match(parent, /older Blacksmith catalog/);
});

test('a successful forge or resynthesis refreshes all recipe readiness', async () => {
  const parent = await readFile(new URL('../src/player/Blacksmith.jsx', import.meta.url), 'utf8');
  assert.match(parent, /Every successful operation may change materials or inventory/);
  assert.match(parent, /await loadState\(\{ quiet: true, force: true \}\)/);
  assert.doesNotMatch(parent, /recipes: current\.recipes/);
});
