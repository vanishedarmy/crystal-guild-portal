import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const web = path.resolve(root, '..');
const pub = path.join(root, 'public');
test('retired Triple Triad art families are gone without touching current card art', () => {
  for (const old of ['a5h3', 'a5h4']) assert.ok(!fs.existsSync(path.join(pub, 'gold-saucer', old)));
  for (const name of ['ifrit.webp','shiva.webp','ramuh.webp','card-back.webp']) assert.ok(fs.existsSync(path.join(pub, 'gold-saucer/a5h5/triple-triad/cards',name)));
});
test('only active Hunt/Raid backgrounds ship and scene manifest points to them', () => {
  const m = JSON.parse(fs.readFileSync(path.join(web,'SCENE_BACKGROUND_MANIFEST.json'),'utf8'));
  for (const name of ['hunt-active.webp','trial-board-collapsed.webp','trial-board-open.webp']) {
    assert.ok(!fs.existsSync(path.join(pub,'trails-raids',name)));
    assert.ok(fs.existsSync(path.join(pub,'trails-raids/h4',name)));
    assert.ok(m.scene_backgrounds.some(s=>s.path==='/trails-raids/h4/'+name));
  }
});
test('obsolete per-hotfix documentation is not included in Web package', () => {
  assert.ok(fs.existsSync(path.join(web,'CHANGELOG.md')));
  assert.ok(!fs.existsSync(path.join(web,'MERC_SERVICE_HOTFIX3.md')));
  assert.ok(!fs.existsSync(path.join(web,'FINALIZATION_AUDIT.md')));
});
