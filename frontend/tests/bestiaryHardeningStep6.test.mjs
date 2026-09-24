import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {monsterPortraitEntries} from '../src/utils/monsterPortraits.js';

const load = (name) => readFileSync(new URL(name, import.meta.url),'utf8');

test('Step 6 synchronizes release identity and keeps protocol/schema contract', () => {
  const version = load('../src/version.js');
  const news = load('../src/player/whatsNewData.js');
  assert.match(version, /v1\.9\.0 Alpha 11/);
  assert.match(version, /1\.9\.0-mobile-combat-hud-alpha11/);
  assert.match(news, /name: "Bestiary Discovery"/);
  assert.doesNotMatch(news.slice(0, news.indexOf("version: \"v1.9.0 Alpha 8\"")), /schema 22|Portal Action protocol/);
});

test('Step 6 Guide now covers all 112 base monsters and its current metadata', () => {
  const guide = JSON.parse(load('../public/guide-data.json'));
  assert.equal(guide.monsters.length,112);
  assert.equal(new Set(guide.monsters.map(x=>x.id)).size,112);
  assert.equal(guide.meta.release,'1.9.0-mobile-combat-hud-alpha11');
  for(const id of ['elder_ochu','inferno_drake','malboro_sovereign','frost_behemoth','rift_wyrm']){
    assert.ok(guide.monsters.find(x=>x.id===id),id);
  }
});

test('Step 6 retains complete, unique base portrait mapping', () => {
  const list=monsterPortraitEntries();
  assert.equal(list.length,112);
  assert.equal(new Set(list.map(([id])=>id)).size,112);
  for(const [id,url] of list){
    assert.ok(url.endsWith(`/${id}.webp`),id);
    const raw=readFileSync(new URL('../public'+url,import.meta.url));
    assert.equal(raw.toString('ascii',0,4),'RIFF',id);
    assert.equal(raw.toString('ascii',8,12),'WEBP',id);
  }
  // Seal the five regenerated *standalone* portraits, not the earlier board
  // extracts that briefly survived in an intermediate development checkpoint.
  const approved=JSON.parse(load('../../BESTIARY_APPROVED_STANDALONE_ART_MANIFEST.json'));
  assert.equal(approved.files.length,5);
  for(const item of approved.files){
    const raw=readFileSync(new URL('../public'+item.path,import.meta.url));
    assert.equal(createHash('sha256').update(raw).digest('hex'),item.sha256,item.id);
  }
});

test('Step 6 keeps player-facing dossier expansion and mobile containment',()=>{
  const code=load('../src/player/Bestiary.jsx');
  const styles=load('../src/styles/portal.css');
  assert.match(code, /bestiary-filter-panel/);
  assert.match(code, /bestiary-card-grid/);
  assert.match(code, /bestiary-dossier/);
  assert.match(styles, /@media\s*\(max-width:\s*560px\)/);
  assert.match(styles, /\.bestiary-card-grid\s*\{\s*grid-template-columns:\s*1fr/);
});

test('Step 6 keeps special locked art and original-portrait silhouettes distinct',()=>{
  const portrait=load('../src/components/MonsterPortrait.jsx');
  const styles=load('../src/styles/monster-identity.css');
  assert.match(portrait,/!discovered && monster\?\.locked_art/);
  assert.match(styles,/\.monster-portrait\.undiscovered/);
  assert.match(portrait,/Undiscovered monster portrait/);
});
