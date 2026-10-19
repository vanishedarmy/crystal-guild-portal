import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const blacksmith = fs.readFileSync(new URL('../src/player/Blacksmith.jsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/styles/portal.css', import.meta.url), 'utf8');

test('recipe grid has a dedicated compactness hook without changing forge grids', () => {
  assert.match(blacksmith, /className="blacksmith-grid blacksmith-recipe-grid"[\s\S]*aria-labelledby="blacksmith-tab-recipes"/);
  assert.match(css, /\.blacksmith-recipe-grid \.blacksmith-card \{[\s\S]*padding: 10px;[\s\S]*gap: 6px;/);
});

test('recipe cards clamp long descriptions and shrink artwork/material rows', () => {
  assert.match(css, /\.blacksmith-recipe-grid \.blacksmith-description \{[\s\S]*-webkit-line-clamp: 2;[\s\S]*overflow: hidden;/);
  assert.match(css, /\.blacksmith-recipe-grid \.blacksmith-output-artwork \{[\s\S]*width: 38px;[\s\S]*height: 38px;/);
  assert.match(css, /\.blacksmith-recipe-grid \.blacksmith-material-list > div \{[\s\S]*min-height: 28px;/);
});

test('desktop quantity control stays inline and mobile remains compatible', () => {
  assert.match(css, /@media \(min-width: 561px\) \{[\s\S]*\.blacksmith-recipe-grid \.blacksmith-card-actions \.moogle-quantity \{[\s\S]*grid-template-columns: auto 58px;/);
  assert.match(css, /@media \(max-width: 560px\) \{[\s\S]*\.blacksmith-recipe-grid \.blacksmith-output/);
});
