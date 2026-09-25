import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=(p)=>fs.readFileSync(path.join(ROOT,p),"utf8");

test("Beta 1 Trial Board loads persistent Trial Chronicle records",()=>{
  const jsx=read("src/player/Raids.jsx");
  for(const term of ["Trial Chronicle","trial_summary","recordData","/records","Adventurer Record","tracked wipe"]) assert.match(jsx,new RegExp(term));
});

test("Beta 1 Records page exposes the Trial Chronicle",()=>{
  const jsx=read("src/player/Records.jsx");
  for(const term of ["Trial Chronicle","Unique Trials","Trial Clears","Tracked Wipes","Best Contribution","fastest_clear_rounds","best_mitigation"]) assert.match(jsx,new RegExp(term));
});

test("Beta 1 Trial Chronicle has responsive board styling",()=>{
  const css=read("src/styles/portal.css");
  for(const term of ["raid-trial-chronicle","raid-trial-record","trial-record-grid","trial-record-card"]) assert.match(css,new RegExp(term));
});

test("Beta 1 Player Guide explains record continuity",()=>{
  const guide=read("public/guide-body.html");
  for(const term of ["Beta 1 — Trial Chronicle","existing Trial clears","Tracked wipes","fastest clear","contribution bests"]) assert.match(guide,new RegExp(term,"i"));
});

test("Beta 3 carries the Beta 1 Trial Chronicle forward",()=>{
  const news=read("src/player/whatsNewData.js"), guide=read("public/guide-body.html");
  for(const term of ["v1.5.0 Beta 3","Trial Chronicle","No progression churn"]) assert.match(news,new RegExp(term));
  for(const term of ["Beta 1 — Trial Chronicle","fastest clear","contribution bests"]) assert.match(guide,new RegExp(term,"i"));
});
