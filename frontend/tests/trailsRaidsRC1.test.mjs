import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=(p)=>fs.readFileSync(path.join(ROOT,p),"utf8");

test("Trails & Raids public identity is current",()=>{
  const version=read("src/version.js");
  assert.match(version,/WEB_BUILD = "Retainer Service Alpha 2"/);
  assert.match(version,/1\.7\.0-retainer-a2/);
  const manifest=read("../UI_SHARED_ASSET_MANIFEST.json");
  assert.match(manifest,/v1\.5\.1 — Relic Arsenal Complete/);
});

test("Stable player-facing copy documents production hardening",()=>{
  const news=read("src/player/whatsNewData.js"), guide=read("public/guide-body.html");
  for(const term of ["v1.5.0","Seven flagship Trials","Reliable shared rounds","Production contract unchanged"]) assert.match(news,new RegExp(term,"i"));
  for(const term of ["v1.5.0 — Production release","exactly-once settlement","Riftglass Observatory"]) assert.match(guide,new RegExp(term,"i"));
});

test("RC1 keeps the roomy collapsible Trial Board presentation",()=>{
  const jsx=read("src/player/Raids.jsx"), css=read("src/styles/portal.css");
  assert.match(jsx,/Trails &amp; Raids/);
  assert.match(jsx,/raid-board-collapse-toggle/);
  assert.match(jsx,/Round Readiness/);
  assert.match(css,/raid-featured-trials/);
});
