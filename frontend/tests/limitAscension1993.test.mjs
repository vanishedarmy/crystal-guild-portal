import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MAJOR_UPDATES } from '../src/player/whatsNewData.js';
const src = (p) => new URL(`../src/${p}`, import.meta.url);
test("job abilities and Limit Breaks are both in player-facing What's New", async () => {
  // Historical features must remain discoverable as the latest release advances.
  const limitsUpdate = MAJOR_UPDATES.find((entry) => entry.version === 'v1.9.93');
  const abilitiesUpdate = MAJOR_UPDATES.find((entry) => entry.version === 'v1.9.92');
  assert.ok(limitsUpdate);
  assert.ok(abilitiesUpdate);
  const latest = JSON.stringify(limitsUpdate);
  const ascension = JSON.stringify(abilitiesUpdate);
  for (const word of ['50','75','90','99','gauge','!limit','169','90 passives']) assert.ok(latest.toLowerCase().includes(word.toLowerCase()), word);
  for (const word of ['Curaja','Arise','Firaga','Thundaja','169','90','99']) assert.ok(ascension.includes(word), word);
  const cmp = await readFile(src('player/WhatsNew.jsx'), 'utf8');
  assert.match(cmp, /whats-new-archive-entry/);
  assert.match(cmp, /<UpdateHighlights highlights=\{update.highlights/);
  assert.match(cmp, /onNavigate\?\.\(update.action.tab\)/);
});
test('Limit Gauge actions in Solo Venture, Expedition and Dungeon use selected tier', async () => {
  for (const file of ['player/Hunts.jsx','player/Expeditions.jsx','player/Dungeons.jsx']) {
    const contents = await readFile(src(file),'utf8');
    assert.match(contents, /<LimitGauge limit=/);
    assert.match(contents, /onUse=\{\(level\) =>/);
    assert.match(contents, /`limit:\$\{level\}`/);
    assert.doesNotMatch(contents, /\blvl\b/);
  }
  const gauge = await readFile(src('components/LimitGauge.jsx'),'utf8');
  assert.match(gauge,/role="progressbar"/);
  assert.match(gauge,/UNLEASH/);
  assert.match(gauge,/aria-live="polite"/);
});
