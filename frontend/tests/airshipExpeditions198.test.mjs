import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');
test('release identity and new route switch are visible', () => {
  const version = read('src/version.js');
  const expeditions = read('src/player/Expeditions.jsx');
  assert.match(version, /v1\.9\.8/);
  assert.match(version, /Airship Expedition/);
  assert.match(expeditions, /selectedTransport === "airship"/);
  assert.match(expeditions, /Guild Airship · 3 Regions/);
  assert.match(expeditions, /airship_atlas/);
  assert.match(expeditions, /submitExpeditionStart/);
});
test('fellowship shows regions and preserved historical missions, not old launch', () => {
  const fellowship = read('src/pages/FellowshipPage.jsx');
  assert.match(fellowship, /shattered_sky_isles/);
  assert.match(fellowship, /aetherstorm_expanse/);
  assert.match(fellowship, /forgotten_dominion/);
  assert.match(fellowship, /Historic Airship Missions/);
  assert.doesNotMatch(fellowship, /The streamer can launch any unlocked mission/);
});
test('streamer controls do not offer retired mission dispatch', () => {
  const dashboard = read('src/pages/StreamerDashboard.jsx');
  assert.doesNotMatch(dashboard, /id: "airshipmission"/);
  assert.match(dashboard, /!airshipregions/);
  assert.match(dashboard, /!airshipexpedition/);
});
