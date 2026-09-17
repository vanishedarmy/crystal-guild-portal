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
test("Trial Board binds scenic image layer to disclosure state",()=>{
  assert.match(raids,/boardOpen \? "open" : "collapsed"/);
  assert.match(raids,/boardOpen \? "\/trails-raids\/h4\/trial-board-open\.webp" : "\/trails-raids\/h4\/trial-board-collapsed\.webp"/);
  assert.match(css,/raid-board-panel>\.raid-board-scenic-art\.collapsed/);
  assert.match(css,/raid-board-panel>\.raid-board-scenic-art\.open/);
});
test("active Hunt uses dedicated scenic image layer",()=>{
  const hunts=fs.readFileSync(path.join(root,"src/player/Hunts.jsx"),"utf8");
  assert.match(hunts,/\/trails-raids\/h4\/hunt-active\.webp/);
  assert.match(css,/timed-hunt-panel>\.timed-hunt-scenic-art/);
});
test("completed Hunt result keeps the scenic image layer",()=>{
  const hunts=fs.readFileSync(path.join(root,"src/player/Hunts.jsx"),"utf8");
  assert.match(hunts,/hunt-result-scenic-art/);
  assert.ok((hunts.match(/hunt-result-scenic-art/g)||[]).length >= 2);
  assert.match(css,/hunt-result-panel>\.hunt-result-scenic-art/);
});
test("production scenic CSS contains real newlines, not escaped newline text",()=>assert.doesNotMatch(css,/\\n/));
test("stable production identity is current",()=>{
  assert.match(version,/WEB_BUILD = "Merc Service"/);
  assert.match(version,/WEB_ASSET_REVISION = "1\.8\.0-merc-final"/);
});
