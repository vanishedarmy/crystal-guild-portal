import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {WEB_VERSION, WEB_BUILD} from '../src/version.js';
import {MAJOR_UPDATES} from '../src/player/whatsNewData.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const catalog=JSON.parse(read('public/guide-data.json'));

test('Sovereign Encounters remains archived and previous 50-99 news remains',()=>{
 assert.equal(WEB_VERSION,'v1.9.97');assert.equal(WEB_BUILD,'Elite Hunts & World Events');
 assert.ok(MAJOR_UPDATES.some(x=>x.version==='v1.9.96' && x.name==='Sovereign Encounters')); 
 assert.ok(MAJOR_UPDATES.some(x=>x.version==='v1.9.92'));
 assert.ok(MAJOR_UPDATES.some(x=>x.version==='v1.9.95'));
 assert.match(read('public/guide-body.html'),/sovereign-encounters-1996/);
});
test('all six advanced dungeons published, plus higher trial phases',()=>{
 assert.equal(catalog.ascension_dungeons.length,6);
 assert.deepEqual(catalog.ascension_dungeons.map(x=>x.min_level),[55,65,75,85,95,99]);
 assert.equal(catalog.ascension_trials.filter(x=>x.level>=75&&x.advanced_combat).length,54);
 assert.ok(catalog.commands.some(x=>x.command==='!dungeonaction <action>'));
});
test('Portal announces current phase/elemental matchups and visible heavy attack warning',()=>{
 const ui=read('src/player/Dungeons.jsx');
 for(const phrase of ['combat.advanced.phase','combat.advanced.weak','combat.advanced.resist','combat.advanced.warning','DEFEND now!','aria-live="polite"']) assert.ok(ui.includes(phrase),phrase);
 const css=read('src/styles/portal.css');
 assert.match(css,/ascension-attack-warning/);
 assert.match(css,/max-width:680px/);
});
