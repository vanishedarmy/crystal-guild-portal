import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { WEB_VERSION, WEB_BUILD } from "../src/version.js";
import { MAJOR_UPDATES } from "../src/player/whatsNewData.js";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read=(f)=>fs.readFileSync(path.join(root,f),"utf8");
const guide=JSON.parse(read("public/guide-data.json"));

test("v1.9.95 features all Job milestone trial paths and a new release entry",()=>{
 assert.equal(WEB_VERSION,"v1.9.96");
 assert.equal(WEB_BUILD,"Sovereign Encounters");
 assert.ok(MAJOR_UPDATES.some(row=>row.version==="v1.9.95"));
 assert.equal(guide.ascension_trials.length,72);
 assert.equal(guide.ascension_dungeons.length,6);
 assert.equal(new Set(guide.ascension_trials.map(x=>x.id)).size,72);
 for(const job of guide.jobs){
   assert.deepEqual(guide.ascension_trials.filter(x=>x.job_id===job.id).map(x=>x.level),[60,75,90,99]);
 }
 assert.ok(guide.commands.some(x=>x.command==='!ascension'));
});

test("Portal trial board uses the existing authenticated Dungeon action and shows goals",()=>{
 const board=read("src/player/Dungeons.jsx");
 assert.match(board, /Trials of Ascension/);
 assert.match(board, /ascension\.trials/);
 assert.match(board, /trial\.unlocked/);
 assert.match(board, /submitDungeonStart\(trial\.id, csrfToken, idem\)/);
 assert.match(board, /active\.trial_objective/);
 assert.match(board, /active\.ascension_trial/);
 const css=read("src/styles/portal.css");
 assert.match(css, /\.ascension-objective-list/);
 assert.match(css, /@media\(max-width:720px\)/);
});

test("Guide and What's New retain earlier expansion and Limit Break details",()=>{
 const versions=MAJOR_UPDATES.slice(0,5).map(x=>x.version);
 assert.deepEqual(versions,['v1.9.96','v1.9.95','v1.9.94','v1.9.93','v1.9.92']);
 const guideHtml=read("public/guide-body.html");
 assert.match(guideHtml,/trials-of-ascension-1995/);
 assert.match(guideHtml,/battle-rewards-1994/);
});
