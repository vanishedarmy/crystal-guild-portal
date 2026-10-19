import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { locationLabel, locationList, LOCATION_NAMES, humanizeLabel } from '../src/utils/displayLabels.js';

const load = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('Every canonical region and Expedition name has a clean player-facing display label', () => {
  const botData = '../../' + 'Bot/data/'; // Registry is verified against a copy alongside frontend below.
  const guide = JSON.parse(load('../public/guide-data.json'));
  for (const region of guide.regions) {
    assert.equal(LOCATION_NAMES[region.id], region.name, region.id);
    assert.equal(locationLabel(region.id), region.name, region.id);
  }
  for (const [id, name] of Object.entries(LOCATION_NAMES)) {
    assert.equal(locationLabel(id), name);
    assert.doesNotMatch(locationLabel(id), /_/);
  }
  assert.equal(locationLabel('sable_coast'), 'Sable Coast');
  assert.equal(locationLabel('astral_scar'), 'The Astral Scar');
  assert.equal(locationList(['sable_coast', 'astral_scar']), 'Sable Coast · The Astral Scar');
  assert.equal(locationLabel('new_region_of_wonder'), 'New Region Of Wonder');
});

test('Bestiary uses revealed display names rather than rendering machine IDs', () => {
  const ui = load('../src/player/Bestiary.jsx');
  const snapshot = load('../../../Bot/crystal_guild/player_snapshot.py');
  assert.match(ui, /monster\?\.habitat_names\?\.length/);
  assert.match(ui, /locationLabel\(value\)/);
  assert.doesNotMatch(ui, /habitats\.join\(/);
  assert.match(snapshot, /"habitat_names": \[location_names\.get\(region_id/);
  assert.match(snapshot, /if "habitats" in visible else \[\]/);
  assert.match(snapshot, /"family_description":/);
});

test('Bestiary player copy avoids technical system phrases and search recognizes friendly locations', () => {
  const ui = load('../src/player/Bestiary.jsx');
  assert.doesNotMatch(ui, /source of truth|edition-scoped|No drop catalogue is published/);
  assert.match(ui, /Every battle has a story/);
  assert.match(ui, /Your most familiar foe/);
  assert.match(ui, /\.\.\.\(monster\?\.habitats \|\| \[\]\)\.map\(\(value\) => locationLabel\(value\)\)/);
});

test('What’s New and the Guide speak to players, not migration developers', () => {
  const whatsNew = load('../src/player/whatsNewData.js');
  const latest = whatsNew.slice(0, whatsNew.indexOf('version: "v1.9.0 Alpha 8"'));
  assert.match(latest, /Your field guide has grown/);
  assert.doesNotMatch(latest, /schema 22|Portal Action protocol/);
  const guide = load('../public/guide-body.html');
  assert.match(guide, /Every monster you bring down teaches the Guild something new/);
});

test('Common activity labels and combat outcomes never show raw snake_case', () => {
  assert.equal(humanizeLabel('raid_revives'), 'Raid Revives');
  assert.equal(humanizeLabel('double_strike'), 'Double Strike');
  const saucer = load('../src/player/GoldSaucer.jsx');
  assert.match(saucer, /humanizeLabel\(lastTossTier\)/);
  assert.match(saucer, /humanizeLabel\(entry\.outcome/);
});
