import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WEB_ASSET_REVISION, WEB_BUILD } from "../src/version.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read=(name)=>fs.readFileSync(path.join(ROOT,name),"utf8");

test("RC1 identity and Dungeon catalog remain feature frozen", () => {
  assert.equal(WEB_BUILD, "Trails & Raids Beta 3");
  assert.equal(WEB_ASSET_REVISION, "1.5.0-trails-raids-b3");
  const board=read("src/player/Dungeons.jsx");
  assert.match(board,/Dungeons & Delves · v1.4.0/);
});

test("RC1 keeps the mobile Dungeon disclosure pinned right with stateful pointers", () => {
  const css=read("src/styles/portal.css");
  const pointer=read("src/components/CollapsePointer.jsx");
  assert.match(css,/@media \(max-width: 620px\)[\s\S]*\.dungeon-board-title-row \{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) 40px/);
  assert.match(css,/\.dungeon-board-collapse-toggle \{[\s\S]*grid-column:\s*2;[\s\S]*justify-self:\s*end/);
  assert.match(pointer,/open \? "\/ui\/collapse-pointer-down-a2\.webp" : "\/ui\/collapse-pointer-right-a2\.webp"/);
});

test("RC1 player-facing history keeps prerelease milestones out of Previous major updates", () => {
  const news=read("src/player/whatsNewData.js");
  assert.match(news,/name: "Dungeons & Delves"/);
  const previous=news.slice(news.indexOf('name: "Asset Optimization"'));
  assert.doesNotMatch(previous,/name: "[^"]*(?:Alpha|Beta|RC\d*)[^"]*"/i);
});
