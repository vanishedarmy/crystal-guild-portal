import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const bestiary = readFileSync(new URL('../src/player/Bestiary.jsx', import.meta.url), 'utf8');
const portrait = readFileSync(new URL('../src/components/MonsterPortrait.jsx', import.meta.url), 'utf8');
const portraitMap = readFileSync(new URL('../src/utils/monsterPortraits.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/portal.css', import.meta.url), 'utf8');

test('Step 5 adds source-aware unified Bestiary filtering', () => {
  assert.match(bestiary, />Source</);
  assert.match(bestiary, /Raid & Boss Records/);
  assert.match(bestiary, /World Events/);
  assert.match(bestiary, /Seasonal Records/);
  assert.match(bestiary, /Completed special records/);
});

test('Step 5 distinguishes external encounter records from mastery rewards', () => {
  assert.match(bestiary, /mastery_reward\?\.external/);
  assert.match(bestiary, /This victory is saved alongside your other adventures/);
  assert.match(bestiary, /Completed entries/);
  assert.match(bestiary, /external-record/);
});

test('Step 5 supports direct and purpose-built locked art', () => {
  assert.match(portraitMap, /monster\?\.art/);
  assert.match(portrait, /monster\?\.locked_art/);
  assert.match(css, /\.bestiary-card\.external-record/);
});
