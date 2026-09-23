import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const bestiary = readFileSync(new URL('../src/player/Bestiary.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/portal.css', import.meta.url), 'utf8');

test('Step 4 replaces the legacy Bestiary table with research cards', () => {
  assert.match(bestiary, /bestiary-card-grid/);
  assert.match(bestiary, /bestiary-card-main/);
  assert.doesNotMatch(bestiary, /<table className="data-table bestiary-table">/);
});

test('Step 4 exposes category family and research status filters', () => {
  assert.match(bestiary, />Category</);
  assert.match(bestiary, />Family</);
  assert.match(bestiary, />Research Status</);
  assert.match(bestiary, /value="mastered"/);
});

test('Step 4 renders progressive server-authoritative dossier fields', () => {
  for (const field of ['monster?.family', 'monster?.habitats', 'monster?.weakness', 'monster?.combat_profile', 'monster?.drops', 'monster?.lore']) {
    assert.ok(bestiary.includes(field), `missing ${field}`);
  }
  assert.match(bestiary, /monster\?\.research\?\.mastered/);
  assert.match(bestiary, /mastery_reward\?\.research_points/);
});

test('Step 4 is responsive without edge-only horizontal table scrolling', () => {
  assert.match(css, /\.bestiary-card-grid/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /\.bestiary-dossier-grid, \.bestiary-drop-list \{ grid-template-columns: 1fr; \}/);
});
