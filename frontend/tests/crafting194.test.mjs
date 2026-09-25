import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { CRAFTING_CATEGORIES, filterCraftingRecipes } from '../src/utils/craftingFilters.js';

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
