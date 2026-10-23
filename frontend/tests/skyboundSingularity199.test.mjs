import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
const ROOT=new URL('../',import.meta.url);
const AIRSHIP=['shattered_sky_isles','aetherstorm_expanse','forgotten_dominion','emberglass_caldera','frostveil_observatory','gilded_mirage_expanse'];
test('each of the six airship regions has a valid connected original WebP backdrop',async()=>{
 const css=await readFile(new URL('src/styles/portal.css',ROOT),'utf8');
 for(const id of AIRSHIP){
  const name=`airship-${id.replaceAll('_','-')}.webp`;
  const bytes=await readFile(new URL(`public/expeditions/${name}`,ROOT));
  assert.ok(bytes.length>100000,id);
  assert.equal(bytes.subarray(0,4).toString('ascii'),'RIFF',id);
  assert.ok(css.includes(`.expedition-region-card[data-region="${id}"]`),id);
  assert.ok(css.includes(`.expedition-board-panel[data-region="${id}"]`),id);
 }
});
test('the new endgame region has its own World Map artwork and a route label',async()=>{
 const file=new URL('public/retro-phase-ii/regions-hd/eclipsed_singularity_citadel.webp',ROOT);
 await access(file);
 const data=await readFile(file);
 assert.equal(data.subarray(0,4).toString('ascii'),'RIFF');
 const hunts=await readFile(new URL('src/player/Hunts.jsx',ROOT),'utf8');
 assert.match(hunts,/retro-phase-ii\/regions-hd\/\$\{region\.id\}\.webp/);
});
test('Portal identifies the expanded six-region sky atlas',async()=>{
 const ui=await readFile(new URL('src/player/Expeditions.jsx',ROOT),'utf8');
 assert.match(ui,/Guild Airship · 6 Regions/);
 assert.match(ui,/\/ 6 regions mastered/);
});
