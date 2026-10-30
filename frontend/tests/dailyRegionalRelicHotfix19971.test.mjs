import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
test('Relic Arsenal has authenticated start quest button and pending-action handling', () => {
  const relics = read('src/player/Relics.jsx');
  const api = read('src/api/auth.js');
  assert.match(relics, /submitRelicBegin\(relic\.id/);
  assert.match(relics, /Begin \$\{relic\.job\} Relic Quest/);
  assert.match(relics, /relic\.quest_started/);
  assert.match(relics, /waitForPortalAction/);
  assert.match(api, /"RELIC_BEGIN", \{ relic_id: relicId \}/);
});
test('Daily and regional shop instructions are in current Portal and Guide', () => {
  assert.match(read('src/player/whatsNewData.js'), /midnight UTC/);
  assert.match(read('src/player/MoogleEmporium.jsx'), /regional consumables are listed without a slot cap/);
  assert.match(read('public/guide-body.html'), /Begin Relic Quest/);
  assert.match(read('src/guide/guideRuntime.js'), /!relicquest/);
});
