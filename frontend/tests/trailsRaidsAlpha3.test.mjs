import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");

test("Alpha 3 guide data promotes Ramuh to Judgment Spire Trial", () => {
  const data=JSON.parse(read("public/guide-data.json"));
  const ramuh=data.bosses.find((boss)=>boss.id==="ramuh");
  assert.equal(ramuh.encounter_type,"Trial");
  assert.equal(ramuh.encounter_name,"Judgment Spire");
  assert.equal(ramuh.raid_script,"ramuh_judgment_spire");
  assert.deepEqual(ramuh.mechanics.map((m)=>m.name),["Rolling Thunder","Levinshare","Judgment Charge","Judgment Bolt"]);
});

test("Alpha 3 Trial and Raid Board is collapsible with canonical pointer behavior", () => {
  const raids=read("src/player/Raids.jsx");
  for (const term of ["CollapsePointer","toggleWithViewportAnchor","crystal-guild:adventure:trial-raid-board","aria-expanded={boardOpen}","Collapse Trial & Raid Board","Expand Trial & Raid Board"]) assert.match(raids,new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  assert.match(raids,/boardOpen \? \(active/);
});

test("Alpha 3 Raid Board explains chain stack and grounding mechanics", () => {
  const raids=read("src/player/Raids.jsx");
  for (const term of ["Judgment Spire","Rolling Thunder","Levinshare","guard_check","Grounding Gauge","shared_hit","chain"]) assert.match(raids,new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
});

test("Alpha 3 Player Guide documents Judgment Spire", () => {
  const guide=read("public/guide-body.html");
  for (const term of ["Alpha 3 Trial — Ramuh: Judgment Spire","Rolling Thunder","Levinshare","Judgment Charge","ground Judgment Bolt"]) assert.match(guide,new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
});

test("Alpha 4 preserves Ramuh and the collapsible Raid Board", () => {
  const raids=read("src/player/Raids.jsx");
  const guide=read("public/guide-body.html");
  for (const term of ["Ramuh", "Judgment Spire", "Rolling Thunder", "Levinshare", "Judgment Charge", "Collapse Trial & Raid Board"]) {
    assert.match(raids + guide,new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  }
});
