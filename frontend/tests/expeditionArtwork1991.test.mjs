import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monsterPortraitPath } from '../src/utils/monsterPortraits.js';
import { bossArtworkPath } from '../src/utils/bossArtwork.js';
import { itemArtworkPath } from '../src/utils/itemArtwork.js';
import { equipmentExpansionArtworkPath } from '../src/utils/equipmentExpansionArtwork.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guide = JSON.parse(fs.readFileSync(path.join(root,'public/guide-data.json'),'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root,'../EXPEDITION_MONSTER_MATERIAL_ARTWORK_MANIFEST.json'),'utf8'));
const fileAt = (uri) => path.join(root,'public',uri.replace(/^\//,''));
const monsterIds = ['tempest_roc','aetherstorm_colossus','dominion_sentinel','emberglass_wyrm','frostveil_astrolabe','mirage_pharaoh','eclipse_harbinger','singularity_archon'];
const materialIds = ['skyglass_shard','stormheart_crystal','dominion_relic','emberglass_core','frostveil_prism','mirage_hourglass','singularity_shard','eclipse_core'];

test('all 8 expedition & endgame monsters have valid, distinct portraits', () => {
  assert.equal(manifest.monsters.length,8);
  const seen=new Set();
  for(const id of monsterIds){
    const monster=guide.monsters.find(x=>x.id===id);
    assert.ok(monster,`missing monster catalog entry ${id}`);
    const uri=monsterPortraitPath(monster);
    assert.equal(uri,`/retro-phase-iii/monster-portraits-v1991/${id}.webp`);
    assert.ok(!seen.has(uri),`shared artwork ${id}`);
    seen.add(uri);
    const bytes=fs.readFileSync(fileAt(uri));
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
  }
});
test('Eclipse Sovereign gets its own cinematic illustration in guide and portal boss resolver',()=>{
  const boss=guide.bosses.find(x=>x.id==='eclipse_sovereign');
  assert.ok(boss);
  assert.equal(bossArtworkPath(boss),'/retro-phase-iii/boss-art-v1991/eclipse_sovereign.webp');
  assert.ok(fs.statSync(fileAt(bossArtworkPath(boss))).size>10000);
});
test('all 8 new materials have dedicated transparent WebP artwork',()=>{
  assert.equal(manifest.materials.length,8);
  for(const id of materialIds){
    const item=guide.items.find(x=>x.id===id);
    assert.ok(item,`material missing in guide: ${id}`);
    assert.equal(itemArtworkPath(item),`/retro-phase-iii/material-icons-v1/${id}.webp`);
    const bytes=fs.readFileSync(fileAt(itemArtworkPath(item)));
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
    assert.ok(bytes.length>10000);
  }
});
test('all 173 late-game gear image routes survive integration',()=>{
  const gear=guide.items.filter(i=>i.introduced_in==='1.9.10');
  assert.equal(gear.length,173);
  for(const item of gear){
    const uri=equipmentExpansionArtworkPath(item);
    assert.ok(uri,`missing gear mapping: ${item.id}`);
    assert.ok(fs.existsSync(fileAt(uri)),`missing gear file: ${item.id}`);
  }
});
test('Guide explains new Bestiary threats and salvage identity',()=>{
  const html=fs.readFileSync(path.join(root,'public/guide-body.html'),'utf8');
  assert.match(html,/expedition-monster-art-1991/);
  assert.match(html,/Eclipse Sovereign/);
  assert.match(html,/Skyglass Shard/);
  assert.match(html,/Eclipse Core/);
});
