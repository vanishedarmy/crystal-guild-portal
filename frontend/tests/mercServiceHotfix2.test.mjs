import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { mercHeroCardArt, mercHeroStatusLabel, mercHeroUiState } from "../src/player/mercServiceState.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=(name)=>fs.readFileSync(path.join(ROOT,name),"utf8");

test("Hotfix 2 gives the hired Hero a distinct contracted state",()=>{
  const hero={id:"tifa",available:true};
  const contract={hero_id:"tifa",mission_type:"hunt"};
  assert.equal(mercHeroUiState(hero,contract),"contracted");
  assert.equal(mercHeroStatusLabel(hero,contract),"CONTRACTED");
  assert.equal(mercHeroCardArt(hero,contract),"/merc-service/a1/cards/tifa-unavailable.webp");
});

test("Hotfix 2 leaves other unlocked Heroes available while the contract slot is occupied",()=>{
  const hero={id:"aerith",available:true};
  const contract={hero_id:"tifa",mission_type:"hunt"};
  assert.equal(mercHeroUiState(hero,contract),"available");
  assert.equal(mercHeroStatusLabel(hero,contract),"AVAILABLE");
  assert.equal(mercHeroCardArt(hero,contract),"/merc-service/a1/cards/aerith-available.webp");
});

test("Hotfix 2 still uses unavailable art for progression-locked Heroes",()=>{
  const hero={id:"cloud",available:false};
  assert.equal(mercHeroUiState(hero,null),"locked");
  assert.equal(mercHeroStatusLabel(hero,null),"LOCKED");
  assert.equal(mercHeroCardArt(hero,null),"/merc-service/a1/cards/cloud-unavailable.webp");
});

test("Merc roster renders contracted copy and disables competing hire controls",()=>{
  const page=read("src/player/MercService.jsx");
  const css=read("src/styles/portal.css");
  assert.match(page,/Currently Hired/);
  assert.match(page,/Contract Slot Occupied/);
  assert.match(page,/merc-contract-reason/);
  assert.match(page,/mercHeroUiState\(hero, contract\)/);
  assert.match(css,/Hotfix 2 contracted roster state/);
  assert.match(css,/\.merc-card\.contracted/);
});
