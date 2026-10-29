import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {relicArtworkPath} from '../src/utils/relicArtwork.js';
import {filterAndSortRelics} from '../src/player/relicViewModel.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const relicUI=fs.readFileSync(path.join(root,'src/player/Relics.jsx'),'utf8');
const detailUI=fs.readFileSync(path.join(root,'src/components/RelicDetail.jsx'),'utf8');
test('Ultimate Relic list has an explicit filter and level 90 description',()=>{
  assert.match(relicUI,/Ultimate Relics · Lv\.90\+/);
  assert.match(relicUI,/\(relic\.tier \|\| "classic"\) === tier/);
  assert.match(relicUI,/character Lv\.90/);
  assert.match(detailUI,/Ultimate Lv\.90\+/);
});
test('Ultimate Relic art uses the dedicated Awakening image and keeps Classic Zenith support',()=>{
  assert.equal(relicArtworkPath({id:'ultimate_warrior',tier:'ultimate',artwork_relic_id:'bravura',stage:0}),'/equipment-expansion-1991/ultimate_warrior_awakened.webp');
  assert.equal(relicArtworkPath({id:'ultimate_warrior',tier:'ultimate',stage:1},2),'/equipment-expansion-1991/ultimate_warrior_transcendent.webp');
  assert.equal(relicArtworkPath({id:'ultimate_warrior',tier:'ultimate',completed:true}),'/equipment-expansion-1991/ultimate_warrior_eternal.webp');
  assert.equal(relicArtworkPath({id:'bravura',tier:'classic',stage:1}),'/retro-phase-iii/relic-weapons-v2/bravura_dormant.webp');
});
test('Collection filter never accidentally loses classic and ultimate same-Job lines',()=>{
  const rows=[{id:'bravura',job:'Warrior',name:'Bravura',tier:'classic'},{id:'ultimate_warrior',job:'Warrior',name:'Worldbreaker Bravura',tier:'ultimate'}];
  assert.equal(filterAndSortRelics(rows,{query:'warrior'}).length,2);
  assert.equal(filterAndSortRelics(rows.filter(x=>x.tier==='ultimate'),{}).length,1);
});
