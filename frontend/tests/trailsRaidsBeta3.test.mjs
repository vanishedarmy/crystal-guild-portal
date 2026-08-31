import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=(p)=>fs.readFileSync(path.join(ROOT,p),"utf8");

test("Beta 3 Trial Board gives readiness its own readable progress strip",()=>{
  const jsx=read("src/player/Raids.jsx"), css=read("src/styles/portal.css");
  for(const term of ["Round Readiness","raid-readiness-strip","All actionable raiders ready","waiting"]) assert.match(jsx,new RegExp(term));
  for(const term of ["raid-readiness-strip","grid-template-columns","max-width:700px"]) assert.match(css,new RegExp(term));
});

test("Beta 3 last-result leaders retain contribution detail",()=>{
  const jsx=read("src/player/Raids.jsx");
  for(const term of ["Last Trial Result","Last Trial contribution leaders","damage","healing","mitigation"]) assert.match(jsx,new RegExp(term));
});

test("Beta 3 player-facing copy documents shared-state and timer hardening",()=>{
  const news=read("src/player/whatsNewData.js"), guide=read("public/guide-body.html");
  for(const term of ["v1.5.0 Beta 3","Authoritative round state","Exact timer ticks","Round-scoped actions","Clearer party readiness"]) assert.match(news,new RegExp(term,"i"));
  for(const term of ["Beta 3","Shared-state hardening","exact Raid run and round","stale second worker","run/round scoped"]) assert.match(guide,new RegExp(term,"i"));
});

test("Beta 3 features remain under RC1 runtime identity",()=>{
  const version=read("src/version.js"), manifest=read("../UI_SHARED_ASSET_MANIFEST.json");
  assert.match(version,/Trails & Raids/);
  assert.match(version,/1\.5\.0-trails-raids/);
  assert.match(manifest,/1\.5\.0-trails-raids/);
});
