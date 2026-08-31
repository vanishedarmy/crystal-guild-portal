import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const css=fs.readFileSync(path.join(root,"src/styles/portal.css"),"utf8");
const raids=fs.readFileSync(path.join(root,"src/player/Raids.jsx"),"utf8");
const version=fs.readFileSync(path.join(root,"src/version.js"),"utf8");
for(const asset of ["hunt-active.webp","trial-board-collapsed.webp","trial-board-open.webp"]){
  test(`production scene asset ${asset} ships`,()=>assert.ok(fs.existsSync(path.join(root,"public/trails-raids",asset))));
}
test("Trial Board binds scenic background to disclosure state",()=>{
  assert.match(raids,/boardOpen \? "open" : "collapsed"/);
  assert.match(css,/raid-board-panel\.collapsed[\s\S]*trial-board-collapsed\.webp/);
  assert.match(css,/raid-board-panel\.open[\s\S]*trial-board-open\.webp/);
});
test("active Hunt uses dedicated scenic background",()=>assert.match(css,/timed-hunt-panel[\s\S]*hunt-active\.webp/));
test("production scenic CSS contains real newlines, not escaped newline text",()=>assert.doesNotMatch(css,/\\n/));
test("stable production identity is current",()=>{
  assert.match(version,/WEB_BUILD = "Trails & Raids"/);
  assert.match(version,/WEB_ASSET_REVISION = "1\.5\.0-trails-raids"/);
});
