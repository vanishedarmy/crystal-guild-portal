import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { mercHeroCardArt, mercHeroStatusLabel, mercHeroUiState } from "../src/player/mercServiceState.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=(name)=>fs.readFileSync(path.join(ROOT,name),"utf8");
const contracts=[{hero_id:"tifa",mission_type:"hunt"}];

test("Hotfix 3 keeps contracted heroes unavailable across every job type",()=>{
  const hero={id:"tifa",available:true,mission_types:["hunt","raid"]};
  assert.equal(mercHeroUiState(hero,contracts,"raid"),"contracted");
  assert.equal(mercHeroStatusLabel(hero,contracts,"raid"),"CONTRACTED");
  assert.equal(mercHeroCardArt(hero,contracts,"raid"),"/merc-service/a1/cards/tifa-unavailable.webp");
});

test("Hotfix 3 makes every other hero unavailable when the selected job slot is occupied",()=>{
  const hero={id:"aerith",available:true,mission_types:["hunt","venture","raid"]};
  assert.equal(mercHeroUiState(hero,contracts,"hunt"),"unavailable");
  assert.equal(mercHeroStatusLabel(hero,contracts,"hunt"),"UNAVAILABLE");
  assert.equal(mercHeroCardArt(hero,contracts,"hunt"),"/merc-service/a1/cards/aerith-unavailable.webp");
});

test("Hotfix 3 filters heroes that do not accept the selected job type",()=>{
  const hero={id:"zidane",available:true,mission_types:["hunt","venture"]};
  assert.equal(mercHeroUiState(hero,[],"raid"),"unavailable");
  assert.equal(mercHeroUiState(hero,[],"venture"),"available");
});

test("Hotfix 3 Portal exposes three contract slots and mission selector",()=>{
  const page=read("src/player/MercService.jsx");
  const css=read("src/styles/portal.css");
  assert.match(page,/up to three Heroes at once/i);
  assert.match(page,/merc-contract-slots/);
  assert.match(page,/merc-job-picker/);
  assert.match(page,/contracts\.length >= 3/);
  assert.match(page,/submitMercCancel\(mission,/);
  assert.match(css,/Hotfix 3 mission-scoped contract slots/);
});
