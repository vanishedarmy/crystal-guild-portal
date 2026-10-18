import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const verifier=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../RELEASE_TOOLS/verify_compiled.mjs');
const names=['wolf','mandragora','hornet','ochu','spriggan','cockatrice'];
const digs=['oldstone_arch','whispering_grove','silverrun_crossing','mossroot_shrine'];
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'crystal-lw1-gate-'));
 const pub=path.join(root,'Web/frontend/public/living-world');
 const dist=path.join(root,'Web/frontend/dist');
 function write(p,text){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);}
 function pair(rel){write(path.join(pub,rel),'WEBPDATA');write(path.join(dist,'living-world',rel),'WEBPDATA');}
 for(const rel of ['card-hall/card-hall-snes.css','card-hall/queens-blood-snes-board.svg','raid-overlay.html','crystal-guild-portal-roundel.webp']) {
  write(path.join(root,'Web/frontend/public',rel),'STATICDATA');
  write(path.join(dist,rel),'STATICDATA');
 }
 for(const f of ['regions/verdant_wilds/banner.webp','regions/verdant_wilds/thumbnail.webp',...names.map(n=>`creatures/verdant_wilds/${n}.webp`),...digs.map(n=>`discoveries/verdant_wilds/${n}.webp`)])pair(f);
 for(let n=0;n<56;n++)pair(`ui/icons/test-${n}.webp`);
 write(path.join(dist,'index.html'),`<html><head><link rel="stylesheet" href="/assets/main.css"></head><body><script type="module" src="/assets/main.js"></script></body></html>`);
 write(path.join(dist,'assets/main.css'),'.a{background:url("/living-world/regions/verdant_wilds/banner.webp")}');
 write(path.join(dist,'assets/main.js'),'import("./world.js");');
 write(path.join(dist,'assets/world.js'),'console.log("Atlas of the Eight Frontiers", "living-world/regions");');
 return {root,dist,write,pub,run(){return spawnSync(process.execPath,[verifier,'--root',root],{encoding:'utf8'});}};
}
function withFixture(fn){const f=fixture();try{fn(f);}finally{fs.rmSync(f.root,{recursive:true,force:true});}}
test('valid compiled entry and reachable lazy Living World chunk passes',()=>withFixture(f=>{
 const out=f.run();assert.equal(out.status,0,out.stderr);assert.match(out.stdout,/PASS: Vite HTML entry/);
}));
test('orphaned LW-1 JS cannot substitute for reachable compiled LW-1 code',()=>withFixture(f=>{
 f.write(path.join(f.dist,'assets/world.js'),'console.log("not LW1");');
 f.write(path.join(f.dist,'assets/orphan.js'),'console.log("Atlas of the Eight Frontiers", "living-world/regions");');
 const out=f.run();assert.notEqual(out.status,0);assert.match(out.stderr,/Reachable compiled JS lacks/);
}));
test('missing dynamic chunk is rejected',()=>withFixture(f=>{
 fs.rmSync(path.join(f.dist,'assets/world.js'));
 const out=f.run();assert.notEqual(out.status,0);assert.match(out.stderr,/Missing JS-referenced resource/);
}));
test('missing linked stylesheet is rejected',()=>withFixture(f=>{
 fs.rmSync(path.join(f.dist,'assets/main.css'));
 const out=f.run();assert.notEqual(out.status,0);assert.match(out.stderr,/Missing HTML link/);
}));
test('missing image referenced by CSS is rejected',()=>withFixture(f=>{
 f.write(path.join(f.dist,'assets/main.css'),'.a{background:url("/living-world/regions/verdant_wilds/MISSING.webp")}');
 const out=f.run();assert.notEqual(out.status,0);assert.match(out.stderr,/Missing CSS resource/);
}));
test('public/dist artwork mismatch is rejected',()=>withFixture(f=>{
 f.write(path.join(f.pub,'regions/verdant_wilds/banner.webp'),'altered');
 const out=f.run();assert.notEqual(out.status,0);assert.match(out.stderr,/artwork mismatch/);
}));

test('missing standalone Card Hall, Raid, or portal icon static files are rejected',()=>withFixture(f=>{
 fs.rmSync(path.join(f.dist,'card-hall/queens-blood-snes-board.svg'));
 const out=f.run(); assert.notEqual(out.status,0); assert.match(out.stderr,/Missing deployed static resource/);
}));
test('stale Raid overlay static HTML is rejected after rebuild',()=>withFixture(f=>{
 f.write(path.join(f.dist,'raid-overlay.html'),'STALE');
 const out=f.run(); assert.notEqual(out.status,0); assert.match(out.stderr,/Public\/dist static mismatch: raid-overlay.html/);
}));


test('dynamic public sprite filenames resolve to the actual mirrored family',()=>withFixture(f=>{
 const url='/retro-phase-ii/boss-art-v1/${t}.webp';
 f.write(path.join(f.dist,'assets/world.js'),'console.log("Atlas of the Eight Frontiers", "living-world/regions");const art=`'+url+'`;');
 f.write(path.join(f.root,'Web/frontend/public/retro-phase-ii/boss-art-v1/ifrit.webp'),'BOSS');
 f.write(path.join(f.dist,'retro-phase-ii/boss-art-v1/ifrit.webp'),'BOSS');
 const out=f.run();assert.equal(out.status,0,out.stderr);
}));
test('missing dynamic sprite family is still rejected',()=>withFixture(f=>{
 f.write(path.join(f.dist,'assets/world.js'),'console.log("Atlas of the Eight Frontiers", "living-world/regions");const art=`/retro-phase-ii/boss-art-v1/${t}.webp`;');
 const out=f.run();assert.notEqual(out.status,0);assert.match(out.stderr,/Missing dynamic JS resource directory/);
}));
test('missing sprite from a dynamic public family is rejected',()=>withFixture(f=>{
 f.write(path.join(f.dist,'assets/world.js'),'console.log("Atlas of the Eight Frontiers", "living-world/regions");const art=`/retro-phase-ii/boss-art-v1/${t}.webp`;');
 f.write(path.join(f.root,'Web/frontend/public/retro-phase-ii/boss-art-v1/ifrit.webp'),'A');
 f.write(path.join(f.root,'Web/frontend/public/retro-phase-ii/boss-art-v1/garuda_prime.webp'),'B');
 f.write(path.join(f.dist,'retro-phase-ii/boss-art-v1/ifrit.webp'),'A');
 const out=f.run();assert.notEqual(out.status,0);assert.match(out.stderr,/Missing deployed dynamic JS resource/);
}));
test('compiled dynamic public sprite differing from source is rejected',()=>withFixture(f=>{
 f.write(path.join(f.dist,'assets/world.js'),'console.log("Atlas of the Eight Frontiers", "living-world/regions");const art=`/retro-phase-ii/boss-art-v1/${t}.webp`;');
 f.write(path.join(f.root,'Web/frontend/public/retro-phase-ii/boss-art-v1/ifrit.webp'),'A');
 f.write(path.join(f.dist,'retro-phase-ii/boss-art-v1/ifrit.webp'),'NOT-A');
 const out=f.run();assert.notEqual(out.status,0);assert.match(out.stderr,/Source\/dist dynamic JS resource mismatch/);
}));

test('all seven dynamic artwork URL forms reported by Windows are validated as asset families',()=>withFixture(f=>{
 const values=[
  ['/retro-phase-ii/boss-art-v1/${t}.webp','retro-phase-ii/boss-art-v1/ifrit.webp'],
  ['/retro-phase-iii/item-icons-v1/${t}.webp','retro-phase-iii/item-icons-v1/potion.webp'],
  ['/retro-phase-iii/chocobo-portraits-v1/${e}.webp','retro-phase-iii/chocobo-portraits-v1/ember_red.webp'],
  ['/gold-saucer/rc2h1/triple-triad/cards/${e.id}.webp','gold-saucer/rc2h1/triple-triad/cards/cactuar.webp'],
  ['/retro-phase-ii/regions-hd/${q.id}.webp','retro-phase-ii/regions-hd/crystal_expanse.webp'],
  ['/retro-phase-ii/regions-hd/${e.id}.webp','retro-phase-ii/regions-hd/riftlands.webp'],
  ['/retro-phase-ii/regions-hd/${l(e.id)}.webp','retro-phase-ii/regions-hd/interdimensional_rift.webp']
 ];
 f.write(path.join(f.dist,'assets/world.js'),'console.log("Atlas of the Eight Frontiers", "living-world/regions");'+values.map(([url],i)=>'const art'+i+'=`'+url+'`;').join(''));
 for(const [,rel] of values){
  f.write(path.join(f.root,'Web/frontend/public',rel),'ART:'+rel);
  f.write(path.join(f.dist,rel),'ART:'+rel);
 }
 const out=f.run();assert.equal(out.status,0,out.stderr);
}));
