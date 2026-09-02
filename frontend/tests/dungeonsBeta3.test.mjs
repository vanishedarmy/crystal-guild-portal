import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");

test("Beta 3 keeps Dungeon Board pointer on the right edge on mobile", () => {
  const css = read("src/styles/portal.css");
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.dungeon-board-title-row \{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) 40px/);
  assert.match(css, /\.dungeon-board-collapse-toggle \{[\s\S]*grid-column:\s*2;[\s\S]*justify-self:\s*end;[\s\S]*min-width:\s*40px !important/);
});

test("Beta 3 Dungeon disclosure still switches right closed to down open", () => {
  const board = read("src/player/Dungeons.jsx");
  const pointer = read("src/components/CollapsePointer.jsx");
  assert.match(board, /<CollapsePointer open=\{open\}/);
  assert.match(pointer, /open \? "\/ui\/collapse-pointer-down-a2\.webp" : "\/ui\/collapse-pointer-right-a2\.webp"/);
});

test("Beta 3 identity is exposed by the Dungeon Board and frontend revision", () => {
  const board = read("src/player/Dungeons.jsx");
  const version = read("src/version.js");
  assert.match(board, /Dungeons & Delves · v1.4.0/);
  assert.match(version, /1\.7\.0-emporium-annex-a3h1/);
});


test("Player Guide explains stale-tab recovery without exposing implementation detail", () => {
  const guide = read("public/guide-body.html");
  assert.match(guide, /Dungeons &amp; Delves — v1\.4\.0/);
  assert.match(guide, /older tab fails closed/);
  assert.match(guide, /refresh that tab to continue from the latest Dungeon state/);
  assert.match(guide, /Retrying the same pending action is safe/);
});
