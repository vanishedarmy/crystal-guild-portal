import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");

test("Alpha 4 guide data promotes Titan to Heart of the Crag Trial", () => {
  const data=JSON.parse(read("public/guide-data.json"));
  const titan=data.bosses.find((boss)=>boss.id==="titan");
  assert.equal(titan.tier,"Primal Boss");
  assert.equal(titan.encounter_type,"Trial");
  assert.equal(titan.encounter_name,"Heart of the Crag");
  assert.equal(titan.raid_script,"titan_heart_of_crag");
  assert.deepEqual(titan.mechanics.map((m)=>m.name),["Landslide","Granite Gaol","Heart of the Crag","Earthen Fury"]);
});

test("Alpha 4 Raid Board features Titan without regressing collapse state", () => {
  const raids=read("src/player/Raids.jsx");
  for (const term of ["Titan","Heart of the Crag","Landslide","Granite Gaol","heart_check","restraint","knockback","crystal-guild:adventure:trial-raid-board","CollapsePointer"]) {
    assert.match(raids,new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,"\$&")));
  }
});

test("Alpha 4 Player Guide documents Titan rescue and Heart check", () => {
  const guide=read("public/guide-body.html");
  for (const term of ["Alpha 4 Trial — Titan: Heart of the Crag","Landslide","Granite Gaol","two-round damage check","Earthen Fury"]) {
    assert.match(guide,new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  }
});

test("Alpha 4 hosted OBS overlay understands Titan mechanic kinds", () => {
  const html=read("public/raid-overlay.html");
  const js=read("public/raid-overlay.js");
  for (const term of ["knockback","restraint","heart_check"]) {
    assert.match(html,new RegExp(term));
    assert.match(js,new RegExp(term));
  }
  assert.match(js,/RESCUE/);
  assert.match(js,/DEFEND/);
});

test("Alpha 5 carries forward Titan and the collapsible Raid Board", () => {
  const raids=read("src/player/Raids.jsx");
  const news=read("src/player/whatsNewData.js");
  for (const term of ["Titan","Heart of the Crag","Landslide","Granite Gaol","crystal-guild:adventure:trial-raid-board"]) {
    assert.match(raids,new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,"\$&")));
  }
  assert.match(news,/v1\.5\.0 Beta 3/);
});
