import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {selectNewMomentNotices, momentBadgeSrc} from '../src/utils/recordsMoments.js';

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.resolve(frontend, '..', '..');
const read = (rel) => fs.readFileSync(path.join(frontend, rel), 'utf8');
const catalog = JSON.parse(fs.readFileSync(path.join(workspace, 'Bot/data/moments.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(workspace, 'Web/ARTWORK_STEP5_MANIFEST.json'), 'utf8'));
const now = Date.parse('2026-09-23T05:00:00Z');
const moment = (id, date, extra={}) => ({id, unlocked:true, name:'A Moment', reward_title:'A Title', unlocked_at:date, ...extra});

test('Step 7: 12 Moment rules, seven sealed secrets, and 16 individual game art files survive', () => {
 assert.equal(catalog.length,12);
 assert.equal(catalog.filter((m)=>m.secret).length,7);
 assert.equal(manifest.length,16);
 assert.equal(manifest.filter((a)=>a.badge_id).length,12);
 assert.equal(manifest.filter((a)=>a.web_path.includes('/trophies/')).length,4);
 const hashes = new Set();
 for (const entry of manifest) {
   assert.ok(fs.existsSync(path.join(frontend,'public',entry.web_path.slice(1))));
   hashes.add(entry.webp_sha256);
 }
 assert.equal(hashes.size,16);
});

test('Step 7: discovery notice never announces sealed, historical or malformed entries', () => {
 const entries = [
  moment('recent','2026-09-23 04:30:00'),
  moment('historical','2026-09-23 04:30:00',{historical:true}),
  {id:'sealed_slot_02',secret:true,unlocked:false,name:'???',unlocked_at:'2026-09-23 04:20:00'},
  moment('missing-title','2026-09-23 04:30:00',{reward_title:undefined}),
  moment('old','2026-09-20 04:30:00'),
  moment('future','2026-09-23 06:00:00'),
  moment('invalid','never'),
 ];
 assert.deepEqual(selectNewMomentNotices(entries,[],now).map((m)=>m.id),['recent']);
 assert.deepEqual(selectNewMomentNotices(entries,['recent'],now),[]);
});

test('Step 7: recent notices are chronological and guarded against repeat browser reads', () => {
 const entries = [moment('earlier','2026-09-23 01:00:00'),moment('newer','2026-09-23T04:58:00Z')];
 assert.deepEqual(selectNewMomentNotices(entries,[],now).map((m)=>m.id),['newer','earlier']);
 assert.equal(selectNewMomentNotices(entries,['newer','earlier'],now).length,0);
 assert.equal(momentBadgeSrc({secret:true,unlocked:false,badge_id:'moment_badge_technically_alive'}),null);
});

test('Step 7: Records notice uses only earned server slots and player-keyed presentation history', () => {
 const cards = read('src/player/Records.jsx');
 for (const key of ['selectNewMomentNotices(moments.entries, seen)','localStorage.setItem(storageKey','momentBadgeSrc(entry)','setNewDiscoveries([])','aria-live="polite"','player={data.player}']) assert.ok(cards.includes(key),key);
 assert.doesNotMatch(cards,/moment_title_technically_alive|moment_badge_technically_alive|Too Stubborn to Die/);
 assert.doesNotMatch(cards,/award_settlement|reconcile_verified_history/);
});

test('Step 7: Guide points to existing Records page without leaking seven secret conditions', () => {
 const markup=read('public/guide-body.html');
 assert.match(markup,/<a href="#records-moments">/);
 assert.match(markup,/id="records-moments"/);
 assert.match(markup,/seven undiscovered Moments/i);
 assert.match(markup,/five consecutive paid Mini Cactpot losses/i);
 assert.doesNotMatch(markup,/Too Stubborn to Die|Financially Irresponsible|MGP Donor/);
 assert.match(read('src/player/whatsNewData.js'),/version: "v1.9.0 Alpha 10"/);
});

test('Step 7: responsive cards, keyboard close and reduced-motion behavior are explicit', () => {
 const css=read('src/styles/portal.css');
 for (const clause of ['.moment-discovery-notice','.moment-discovery-item','max-width: 560px','prefers-reduced-motion','overflow-wrap: anywhere','focus-visible']) assert.ok(css.includes(clause),clause);
 assert.match(read('src/player/Records.jsx'),/aria-label="Dismiss Moment discoveries"/);
});

test('Step 7: matching release identity is stamped into Bot, hosted Web and frontend', () => {
 const stamp='1.9.0-camp-recovery-alpha12';
 assert.equal(fs.readFileSync(path.join(workspace,'Bot/VERSION.txt'),'utf8').trim(),stamp);
 for (const name of ['Bot/crystal_guild/__init__.py','Web/crystal_guild/__init__.py','Web/crystal_guild/hosted_portal.py']) assert.ok(fs.readFileSync(path.join(workspace,name),'utf8').includes(stamp),name);
 assert.match(read('src/version.js'),/1\.9\.0-camp-recovery-alpha12/);
 assert.equal(JSON.parse(read('package.json')).version,'1.9.0-alpha.12');
});
