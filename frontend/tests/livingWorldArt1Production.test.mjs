import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const frontend=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(frontend,'../..');
const src=fs.readFileSync(path.join(frontend,'src/player/LivingWorld.jsx'),'utf8');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'Bot/data/living_world_discoveries.json'),'utf8'));
const IDs=['oldstone_arch','whispering_grove','silverrun_crossing','mossroot_shrine'];
const monsters=['wolf','mandragora','hornet','ochu','spriggan','cockatrice'];
const pub=path.join(frontend,'public/living-world');
const dist=path.join(frontend,'dist/living-world');
function parity(relative){
 const a=path.join(pub,relative),b=path.join(dist,relative);
 assert.ok(fs.existsSync(a),'Missing public '+relative);
 if(fs.existsSync(path.join(frontend,'dist/index.html'))) {
  assert.ok(fs.existsSync(b),'Missing static dist '+relative);
  assert.deepEqual(fs.readFileSync(a),fs.readFileSync(b),'Asset parity '+relative);
 }
}
test('ART-1B assets follow all and only existing Verdant Wilds discovery catalog IDs',()=>{
 const ids=catalog.filter(x=>x.region_id==='verdant_wilds').map(x=>x.id);
 assert.deepEqual(ids,IDs);
 for(const id of IDs){
  const rel=`discoveries/verdant_wilds/${id}.webp`;
  assert.match(src,new RegExp(`${id}:\\s*"/living-world/${rel.replaceAll('/','\\/')}"`));
  parity(rel);
 }
});
test('hidden discovery entries use a generic marker and cannot render an unlocked scene',()=>{
 assert.match(src,/entry\.discovered\s*&&\s*DISCOVERY_IMAGES\[entry\.id\]/);
 assert.match(src,/MARKERS\.discovery/);
 assert.doesNotMatch(src,/style=\{\{[^}]*DISCOVERY_IMAGES/);
});
test('existing six enemies remain separate from Bestiary portraits',()=>{
 for(const id of monsters)parity(`creatures/verdant_wilds/${id}.webp`);
 assert.doesNotMatch(src,/creatures\/verdant_wilds/);
});
test('all ART-0C UI images are WebP with source/static parity',()=>{
 function list(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(d,e.name)):[path.join(d,e.name)]);}
 const ui=list(path.join(pub,'ui'));
 assert.equal(ui.length,56);
 for(const file of ui){assert.ok(file.endsWith('.webp'),file);parity(path.relative(pub,file));}
});
