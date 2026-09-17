import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WEB_ASSET_REVISION, WEB_BUILD } from "../src/version.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read=(name)=>fs.readFileSync(path.join(ROOT,name),"utf8");

test("v1.5.0 Alpha 2 keeps the v1.4 Dungeon catalog frozen", () => {
  assert.equal(WEB_BUILD, "Merc Service");
  assert.equal(WEB_ASSET_REVISION, "1.8.0-merc-a1");
  assert.match(read("src/player/Dungeons.jsx"), /Dungeons & Delves · v1\.4\.0/);
});

test("production keeps the mobile Dungeon disclosure pinned right with stateful pointers", () => {
  const css=read("src/styles/portal.css");
  const pointer=read("src/components/CollapsePointer.jsx");
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.dungeon-board-title-row \{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) 40px/);
  assert.match(css, /\.dungeon-board-collapse-toggle \{[\s\S]*grid-column:\s*2;[\s\S]*justify-self:\s*end/);
  assert.match(pointer, /open \? "\/ui\/collapse-pointer-down-a2\.webp" : "\/ui\/collapse-pointer-right-a2\.webp"/);
});

test("production What's New is stable-release wording", () => {
  const news=read("src/player/whatsNewData.js");
  assert.match(news, /name: "Dungeons & Delves"/);
  const previous=news.slice(news.indexOf('name: "Asset Optimization"'));
  assert.doesNotMatch(previous, /name: "[^"]*(?:Alpha|Beta|RC\d*)[^"]*"/i);
});
