import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=(p)=>fs.readFileSync(path.join(ROOT,p),"utf8");

test("Beta 2 Trial Board keeps a visible last-result recap",()=>{
  const jsx=read("src/player/Raids.jsx");
  for(const term of ["Last Trial Result","recentResult","VICTORY","WIPE","raid-last-result-leaders"]) assert.match(jsx,new RegExp(term));
});

test("Beta 2 shows live raid action readiness",()=>{
  const jsx=read("src/player/Raids.jsx");
  for(const term of ["ready_actions","actionable_raiders","Actions .* queued"]) assert.match(jsx,new RegExp(term));
});

test("Beta 2 adds repeat-clear mastery to Board and Records",()=>{
  const raids=read("src/player/Raids.jsx"), records=read("src/player/Records.jsx");
  for(const term of ["repeatMastery","Repeat Mastery","Mastered","10\+ clears"]) assert.match(raids,new RegExp(term));
  for(const term of ["Mastered Trials","repeat_mastery","next_clear_goal","repeat milestone"]) assert.match(records,new RegExp(term));
});

test("Beta 2 includes result and mastery responsive styling",()=>{
  const css=read("src/styles/portal.css");
  for(const term of ["raid-last-result","raid-last-result-leaders","raid-repeat-mastery","trial-repeat-mastery"]) assert.match(css,new RegExp(term));
});

test("Beta 2 repeat mastery and settlement hardening remain documented",()=>{
  const guide=read("public/guide-body.html"), raids=read("src/player/Raids.jsx");
  for(const term of ["Beta 2","repeat-clear","Last Trial Result","settlement"]) assert.match(guide,new RegExp(term,"i"));
  for(const term of ["repeatMastery","Last Trial Result","ready_actions","actionable_raiders"]) assert.match(raids,new RegExp(term,"i"));
});
