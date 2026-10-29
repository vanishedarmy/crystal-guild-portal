import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=(name)=>fs.readFileSync(path.join(ROOT,name),"utf8");

const HEROES=["aerith","tifa","zidane","yuna","balthier","cloud"];

test("Batch 5 dynamically routes available and unavailable Merc card artwork",()=>{
  const page=read("src/player/MercService.jsx");
  const stateHelper=read("src/player/mercServiceState.js");
  assert.match(page,/mercHeroCardArt\(hero, contracts, selectedMission\)/);
  assert.match(stateHelper,/uiState === "available" \? "available" : "unavailable"/);
  assert.match(page,/merc-card-art-frame/);
  for(const hero of HEROES){
    for(const state of ["available","unavailable"]){
      assert.ok(fs.existsSync(path.join(ROOT,`public/merc-service/a1/cards/${hero}-${state}.webp`)),`${hero} ${state} art missing`);
    }
  }
});

test("Batch 5 integrates the approved Merc Service scene artwork",()=>{
  const page=read("src/player/MercService.jsx");
  for(const scene of ["service-hall","contract","roles","hunt","venture","raid","coming-soon"]){
    assert.match(page,new RegExp(`scenes/${scene}\\.webp`));
    assert.ok(fs.existsSync(path.join(ROOT,`public/merc-service/a1/scenes/${scene}.webp`)),`${scene} art missing`);
  }
  assert.match(page,/Mercs in Action/);
  assert.match(page,/More Hero contracts can join the roster/);
});

test("Batch 5 artwork remains web optimized and mobile aware",()=>{
  const css=read("src/styles/portal.css");
  assert.match(css,/Batch 5 artwork integration/);
  assert.match(css,/\.merc-card-art-frame img\{/);
  assert.match(css,/\.merc-action-grid\{display:grid;grid-template-columns:repeat\(3/);
  assert.match(css,/@media\(max-width:820px\)/);
  assert.match(css,/@media\(max-width:620px\)/);
  const dir=path.join(ROOT,"public/merc-service/a1");
  const files=[];
  const walk=(p)=>{for(const name of fs.readdirSync(p)){const full=path.join(p,name);const st=fs.statSync(full);st.isDirectory()?walk(full):files.push(full);}};
  walk(dir);
  assert.equal(files.length,19);
  for(const file of files){
    assert.equal(path.extname(file),".webp");
    assert.ok(fs.statSync(file).size<400_000,`${path.basename(file)} should stay under 400 KB`);
  }
});
