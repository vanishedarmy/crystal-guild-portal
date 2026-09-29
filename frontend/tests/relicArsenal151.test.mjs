import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"public/guide-data.json"),"utf8"));
const art=fs.readFileSync(path.join(root,"src/utils/relicArtwork.js"),"utf8");
const items=fs.readFileSync(path.join(root,"src/utils/itemArtwork.js"),"utf8");
test("v1.5.1 gives all 18 jobs one Relic line",()=>{assert.equal(data.jobs.length,18);assert.equal(data.relics.length,18);const jobs=new Set(data.jobs.map(x=>x.id));const relicJobs=data.relics.map(x=>x.job_id);assert.equal(new Set(relicJobs).size,18);assert.deepEqual(new Set(relicJobs),jobs);});
test("v1.5.1 new relics have three stages and routed artwork",()=>{const ids=["bravura","murgleis","yoshimitsu","veil_of_wiyu","almace","chronos","artemis_bow","armageddon","guttler","astral_codex"];for(const id of ids){const r=data.relics.find(x=>x.id===id);assert.ok(r);assert.equal(r.stages.length,3);assert.match(art,new RegExp(`\"${id}\"`));for(const stage of ["dormant","awakened","zenith"]){assert.match(items,new RegExp(`${id}_${stage}\.webp`));}}});
test("Relic Arsenal page shows collection denominator",()=>{const page=fs.readFileSync(path.join(root,"src/player/Relics.jsx"),"utf8");assert.match(page,/relics\.length/);assert.match(page,/relic-overview-stats/);assert.match(page,/18-Job Collection/);});
