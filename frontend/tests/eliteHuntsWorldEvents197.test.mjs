import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
const SRC = new URL('../src/', import.meta.url);
const PUB = new URL('../public/', import.meta.url);
test('Elite Hunt ranks are discoverable and filterable in Portal', async () => {
 const s=await readFile(new URL('player/Hunts.jsx',SRC),'utf8');
 assert.match(s,/\["S\+", "SS"\]/);
 assert.match(s,/aria-label="Filter Hunts by rank"/);
 assert.match(s,/hunt\.first_clear_rewards/);
 const portraits=await readFile(new URL('utils/monsterPortraits.js',SRC),'utf8');
 for (const id of ['mark_the_hollow_sun','mark_pharaohs_last_hour','mark_blight_of_omega','mark_omega_final_protocol','mark_eclipse_verdict','mark_the_last_singularity']) assert.ok(portraits.includes(id),id);
});
test('Elite World Events show a distinct level tier and remain stream-only', async () => {
 const s=await readFile(new URL('player/StreamActivities.jsx',SRC),'utf8');
 assert.match(s,/event\.tier === "elite"/);
 assert.match(s,/worldEventCatalog\.length/);
 assert.match(s,/World Events · Stream Only/);
 assert.match(s,/Join World Event/);
});
test('Release feed, guide and Guild Town continuity', async () => {
 const notes=await readFile(new URL('player/whatsNewData.js',SRC),'utf8');
 assert.match(notes,/v1\.9\.97/);
 assert.match(notes,/action: \{ tab: "hunts", label: "Explore Elite Hunts" \}/);
 assert.match(notes,/Guild Town Navigation/);
 const guide=await readFile(new URL('guide-body.html',PUB),'utf8');
 assert.match(guide,/elite-hunts-world-events-1997/);
 const data=JSON.parse(await readFile(new URL('guide-data.json',PUB),'utf8'));
 assert.equal(data.hunts.filter(x=>x.rank==='SS').length,3);
 assert.equal(data.hunts.filter(x=>x.rank==='S+').length,3);
 assert.equal(data.elite_world_events.length,3);
});
