import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(ROOT,'public/raid-overlay.html'),'utf8');
const js=fs.readFileSync(path.join(ROOT,'public/raid-overlay.js'),'utf8');
test('Raid Command is fixed 4:3 and displays roster, action intent and telegraph',()=>{
  for(const id of ['boss','mechanic','roster','action-list','member-page','ready','boss-statuses','round','hpbar'])
    assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/width:1200px;height:900px/);
  assert.match(html,/image-rendering:pixelated/);
  assert.match(html,/prefers-reduced-motion/);
  assert.match(html,/src="\/raid-overlay\.js\?v=1\.9\.4\.4-raid-command"/);
});
test('status icons use fixed local whitelist, not server-controlled URLs',()=>{
  assert.match(js,/const ICONS=Object\.freeze/);
  assert.match(js,/createStatusIcon/);
  assert.match(js,/textContent/);
  assert.match(js,/new EventSource\('\/api\/events'\)/);
  assert.match(js,/streamFresh/);
  assert.doesNotMatch(js,/\.innerHTML\s*=/);
  assert.doesNotMatch(js,/target_id|twitch_id|raid_instance_id/);
  const names=new Set([...js.matchAll(/['"](\d\d_[a-z0-9_]+)['"]/g)].map(match=>match[1]));
  for(const name of names)assert.ok(fs.existsSync(path.join(ROOT,'public/raid-icons',`${name}.png`)),`missing: ${name}`);
});
test('icons are 256px RGBA PNGs with transparent canvas corners',()=>{
  const files=fs.readdirSync(path.join(ROOT,'public/raid-icons')).filter(f=>f.endsWith('.png'));
  assert.equal(files.length,70);
  for(const file of files){
    const buffer=fs.readFileSync(path.join(ROOT,'public/raid-icons',file));
    assert.equal(buffer.subarray(1,4).toString(),'PNG');
    assert.equal(buffer.readUInt32BE(16),256);
    assert.equal(buffer.readUInt32BE(20),256);
    assert.equal(buffer[25],6,'RGBA truecolor PNG expected');
  }
});

import vm from 'node:vm';
test('demo state renders names, queued actions, statuses and responsive 4:3 fit',()=>{
  class Element{
    constructor(id=''){this.id=id;this.children=[];this.style={};this.dataset={};this.attrs={};this.hidden=false;this.textContent='';this.className='';this.classList={toggle:(name,active)=>{this.attrs[`class:${name}`]=active},add:name=>{this.attrs[`class:${name}`]=true},remove:name=>{delete this.attrs[`class:${name}`]}}}
    replaceChildren(...args){this.children=args}
    append(...args){this.children.push(...args)}
    setAttribute(key,value){this.attrs[key]=value}
    getAttribute(key){return this.attrs[key]}
  }
  const elements=new Map();
  const document={
    getElementById:id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)},
    createElement:tag=>new Element(tag),
    addEventListener:()=>{},visibilityState:'visible',
  };
  const sandbox={document,innerWidth:1200,innerHeight:900,location:{search:'?preview=1'},
    URLSearchParams,addEventListener:()=>{},setInterval:()=>{},setTimeout:()=>{},clearTimeout:()=>{},
    Intl,Date,Math,Number,String,Array,Boolean,Object,console};
  vm.createContext(sandbox);
  vm.runInContext(js,sandbox,{filename:'raid-overlay.js'});
  assert.equal(elements.get('wrap').style.display,'grid');
  assert.match(elements.get('boss').textContent,/Ifrit/);
  assert.equal(elements.get('roster').children.length,8);
  assert.equal(elements.get('action-list').children.length,8);
  assert.match(elements.get('mechanic').textContent,/Radiant Plume/);
  assert.equal(elements.get('member-page').textContent,'1–8 / 10 joined · 1/2');
  sandbox.innerWidth=800;sandbox.innerHeight=600;
  vm.runInContext('fitOverlay()',sandbox);
  assert.equal(elements.get('wrap').style.transform,'scale(0.6666666666666666)');
  vm.runInContext('page=1;renderParty(lastState)',sandbox);
  assert.equal(elements.get('roster').children.length,2);
  assert.equal(elements.get('action-list').children.length,2);
});
