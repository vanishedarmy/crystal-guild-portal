import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const blacksmith = fs.readFileSync(new URL('../src/player/Blacksmith.jsx', import.meta.url), 'utf8');
const crafting = fs.readFileSync(new URL('../src/player/CraftingWorkbench.jsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/styles/crafting-194.css', import.meta.url), 'utf8');

test('crafting workbench is isolated from the forge and exposes an accessible tab panel', () => {
  assert.match(blacksmith, /<CraftingWorkbench/);
  assert.match(crafting, /role="tabpanel"/);
  assert.match(crafting, /aria-labelledby="blacksmith-tab-recipes"/);
  assert.match(crafting, /comfortable \? "comfortable" : "compact"/);
  assert.match(css, /\.crafting-workbench\.compact \.crafting-pick/);
});

test('crafting rows stay compact while ingredients and descriptions remain legible', () => {
  assert.match(css, /\.crafting-directory/);
  assert.match(css, /\.crafting-ingredient/);
  assert.match(css, /\.crafting-detail/);
  assert.match(crafting, /crafting-item-description/);
  assert.match(crafting, /crafting-ingredient-qty/);
});

test('craft quantity control remains available with responsive mobile workbench layout', () => {
  assert.match(crafting, /Craft quantity<input type="number"/);
  assert.match(crafting, /onFocus=\{\(\) => beginQuantityEdit/);
  assert.match(css, /@media \(max-width: 750px\)/);
  assert.match(css, /\.crafting-layout \{ grid-template-columns: minmax\(0,1fr\)/);
});
