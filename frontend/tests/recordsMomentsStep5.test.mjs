import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { momentBadgeSrc } from '../src/utils/recordsMoments.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.resolve(root,'../ARTWORK_STEP5_MANIFEST.json'),'utf8'));

test('Step 5: one independent art file for each of 12 Moments and four trophy states',()=>{
 const badges=manifest.filter(item=>item.badge_id);
 const trophies=manifest.filter(item=>item.id?.startsWith('moment_trophy_')||item.id?.startsWith('locked_'));
 assert.equal(badges.length,12);assert.equal(trophies.length,4);
 const sha=new Set();
 for(const item of manifest){
  const filename=path.join(root,'public',item.web_path.slice(1));
  assert.ok(fs.existsSync(filename),filename);
  const bytes=fs.readFileSync(filename);
  assert.ok(bytes.length>5000,filename);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  sha.add(crypto.createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(sha.size,16,'separate artwork files must be visually distinct');
 assert.equal(new Set(badges.map(item=>item.badge_id)).size,12);
});

test('Step 5: unowned secrets never get their badge URL or a client-side Moment catalog',()=>{
 assert.equal(momentBadgeSrc({ secret:true,unlocked:false,badge_id:null }),null);
 assert.equal(momentBadgeSrc({ secret:true,unlocked:false,badge_id:'moment_badge_technically_alive' }),null);
 assert.equal(momentBadgeSrc({ secret:true,unlocked:true,badge_id:'moment_badge_technically_alive' }),'/moments/a1/technically-alive.webp');
 assert.equal(momentBadgeSrc({ secret:false,unlocked:false,badge_id:'moment_badge_overkill_enthusiast' }),'/moments/a1/overkill-enthusiast.webp');
 assert.equal(momentBadgeSrc({ badge_id:'../../secret',secret:false,unlocked:true }),null);
 assert.ok(!fs.existsSync(path.join(root,'public/moments/a1/ARTWORK_MANIFEST.json')));
});

test('Step 5: Hall appends spoiler-safe server slots and uses individual locked art when revealed',()=>{
 const hall=read('src/player/TrophyHall.jsx');const records=read('src/player/Records.jsx');
 assert.match(hall,/data\.moment_slots/);
 assert.match(hall,/trophy\.locked_art/);
 assert.match(hall,/trophy\.secret && !unlocked \? "\/trophies\/a1\/secret\.webp"/);
 assert.match(records,/momentBadgeSrc\(moment\)/);
 assert.match(records,/badgeSrc \? <img/);
 assert.doesNotMatch(records,/moment_trophy_world_event_close_call|The Close Call|The Last Standing/);
});
