import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=(name)=>fs.readFileSync(path.join(ROOT,name),"utf8");

test("Alpha 6 guide data promotes Leviathan to Tidebreak Expanse",()=>{
  const data=JSON.parse(read("public/guide-data.json"));
  const boss=data.bosses.find((b)=>b.id==="leviathan");
  assert.equal(boss.encounter_type,"Trial");
  assert.equal(boss.encounter_name,"Tidebreak Expanse");
  assert.equal(boss.raid_script,"leviathan_tidebreak_expanse");
  assert.deepEqual(boss.mechanics.map((m)=>m.name),["Tidal Sweep","Undertow","Maelstrom Surge","Tidal Wave"]);
});

test("Alpha 6 Raid Board adds Leviathan without regressing the roomy collapse layout",()=>{
  const jsx=read("src/player/Raids.jsx"),css=read("src/styles/portal.css");
  for(const term of ["Leviathan","Tidebreak Expanse","leviathan.webp","side_sweep","undertow","survival_check","crystal-guild:adventure:trial-raid-board","CollapsePointer"]) assert.match(jsx,new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  assert.match(css,/raid-featured-trials\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/raid-mechanic-callout\.survival_check/);
});

test("Alpha 6 Player Guide documents Tidebreak mechanics",()=>{
  const guide=read("public/guide-body.html");
  for(const term of ["Alpha 6 Trial — Leviathan: Tidebreak Expanse","Tidal Sweep","Undertow","Maelstrom Surge","Tidal Wave"]) assert.match(guide,new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
});

test("Alpha 6 OBS overlay understands tide mechanic kinds",()=>{
  const js=read("public/raid-overlay.js"),html=read("public/raid-overlay.html");
  for(const term of ["side_sweep","undertow","survival_check"]) { assert.match(js,new RegExp(term)); assert.match(html,new RegExp(term)); }
});

test("Alpha 7 carries forward Leviathan and the roomy board baseline",()=>{
  const jsx=read("src/player/Raids.jsx"),guide=read("public/guide-body.html"),news=read("src/player/whatsNewData.js");
  for(const term of ["Leviathan","Tidebreak Expanse","Tidal Sweep","Undertow","Maelstrom Surge"]) assert.match(jsx+guide,new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  assert.match(news,/v1\.5\.0 Alpha 7/);
});
