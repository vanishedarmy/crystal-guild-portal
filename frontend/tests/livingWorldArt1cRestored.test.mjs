import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const front = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(front, '..', '..');
const config = JSON.parse(fs.readFileSync(path.join(root,'Bot/data/living_world_config.json'),'utf8'));
const art = JSON.parse(fs.readFileSync(path.join(root,'Bot/data/living_world_art_slots.json'),'utf8'));
for (const [name,id] of [['event_placeholder.webp','event_placeholder'],['aftermath_placeholder.webp','aftermath_placeholder']]) {
  test(`ART-1C ${id} is an actual source WEBP at the reserved path`,()=>{
    const slot=art.slots.find(s=>s.id===id);
    assert.equal(slot?.path,`living-world/${name}`);
    const a=fs.readFileSync(path.join(front,'public',slot.path));
    assert.ok(a.length>1000,`${id} is not an image placeholder stub`);
    assert.equal(a.subarray(0,4).toString('ascii'),'RIFF');
    assert.equal(a.subarray(8,12).toString('ascii'),'WEBP');
    // Post-build source/dist content parity is enforced by verify_compiled.mjs.
    // Source-only tests must pass BEFORE npm/Vite produces dist/.
  });
}
test('ART-1C static art does not enable unimplemented World Events or aftermath rewards',()=>{
  assert.equal(config.world_event_hooks_enabled,false);
  assert.equal(config.feature_flags.world_events,false);
  assert.equal(config.feature_flags.aftermaths,false);
});
