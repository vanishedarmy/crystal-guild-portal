import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const ROOT = new URL('../../',import.meta.url);
const READ = async (p)=>readFile(new URL(p, ROOT),'utf8');
const MONSTERS=['mark_the_hollow_sun','mark_pharaohs_last_hour','mark_blight_of_omega','mark_omega_final_protocol','mark_eclipse_verdict','mark_the_last_singularity'];
const EVENTS=['frostveil_tempest','mirage_sovereign','singularity_cataclysm'];
test('all nine elite bosses have real optimized artwork and source PNGs',async()=>{
  const manifest=JSON.parse(await READ('ELITE_HUNTS_ARTWORK_1997_MANIFEST.json'));
  assert.equal(manifest.assets.length,13);
  for(const id of [...MONSTERS,...EVENTS]){
    const a=manifest.assets.find(x=>x.id===id);
    assert.ok(a,id);
    const web=await stat(new URL(`frontend/public/elite-hunts-197/bosses/${id}.webp`,ROOT));
    assert.ok(web.size>2000,`${id} webp size`);
    const master=await stat(new URL(`ARTWORK_MASTERS/elite-hunts-197/bosses/${id}.png`,ROOT));
    assert.ok(master.size>2000,`${id} png size`);
  }
});
test('6 Hunt portraits are routed to their dedicated WebPs',async()=>{
  const file=await READ('frontend/src/utils/monsterPortraits.js');
  for(const id of MONSTERS) assert.ok(file.includes(`${id}: "/elite-hunts-197/bosses/${id}.webp"`),id);
});
test('3 Elite World Events have the same artwork route in Bot and Web',async()=>{
  const frontend=await READ('frontend/src/player/StreamActivities.jsx');
  const backend=await readFile(new URL('../Bot/crystal_guild/world_events.py',ROOT),'utf8');
  for(const id of EVENTS){
    const path=`/elite-hunts-197/bosses/${id}.webp`;
    assert.ok(frontend.includes(path),id);
    assert.ok(backend.includes(path),id);
  }
  assert.match(frontend,/ELITE_WORLD_EVENT_BANNER/);
  assert.match(frontend,/ELITE_EVENT_MARKER/);
  assert.match(frontend,/worldEventArtwork\(event\)/);
});
test('S+ SS and Elite event UI files exist, badges visible on Hunt cards',async()=>{
  const hunts=await READ('frontend/src/player/Hunts.jsx');
  assert.match(hunts,/rank_s_plus/);
  assert.match(hunts,/rank_ss/);
  for(const id of ['rank_s_plus','rank_ss','elite_world_event_banner','elite_event_marker']){
    const a=await stat(new URL(`frontend/public/elite-hunts-197/ui/${id}.webp`,ROOT));
    assert.ok(a.size>500, id);
  }
});
