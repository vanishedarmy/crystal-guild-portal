import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const hunts = fs.readFileSync(path.join(root,"src/player/Hunts.jsx"),"utf8");
const raids = fs.readFileSync(path.join(root,"src/player/Raids.jsx"),"utf8");
const css = fs.readFileSync(path.join(root,"src/styles/portal.css"),"utf8");
test("active Hunt uses an explicit cache-busted scenic image layer",()=>{
  assert.match(hunts,/panel-scenic-art timed-hunt-scenic-art/);
  assert.match(hunts,/\/trails-raids\/h4\/hunt-active\.webp/);
});
test("Trial & Raid Board explicitly switches cache-busted open and collapsed art",()=>{
  assert.match(raids,/raid-board-scenic-art/);
  assert.match(raids,/\/trails-raids\/h4\/trial-board-open\.webp/);
  assert.match(raids,/\/trails-raids\/h4\/trial-board-collapsed\.webp/);
});
test("scenic layers are positioned above panel backgrounds and behind content",()=>{
  assert.match(css,/\.timed-hunt-panel>\.panel-scenic-art,\.raid-board-panel>\.panel-scenic-art/);
  assert.match(css,/z-index:0/);
  assert.match(css,/>\*:not\(\.panel-scenic-art\).*z-index:2/);
});
for (const file of ["hunt-active.webp","trial-board-collapsed.webp","trial-board-open.webp"]) {
  test(`cache-busted scenic asset ${file} ships`,()=>{
    const p=path.join(root,"public/trails-raids/h4",file);
    assert.ok(fs.existsSync(p),p);
    assert.ok(fs.statSync(p).size>10000,p);
  });
}
