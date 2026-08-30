import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("Dungeons Alpha 2 adds typed route-choice Portal actions", () => {
  const api = read("src/api/auth.js");
  const board = read("src/player/Dungeons.jsx");
  assert.match(api, /DUNGEON_CHOICE/);
  assert.match(api, /choice_id: choiceId/);
  assert.match(board, /submitDungeonChoice/);
  assert.match(board, /Choose Route/);
  assert.match(board, /dungeon-route-option/);
  assert.match(board, /Discoveries this delve/);
});

test("Alpha 2 Dungeon Board presents multiple delves and route metadata", () => {
  const board = read("src/player/Dungeons.jsx");
  assert.match(board, /Recommended/);
  assert.match(board, /Route Choices/);
  assert.match(board, /dungeon-card-art/);
  assert.match(board, /dungeon-run-art/);
  assert.match(board, /Dungeons & Delves · v1.4.0/);
});

test("collapse hands use one canonical rendered size and state-select the correct asset", () => {
  const pointer = read("src/components/CollapsePointer.jsx");
  const css = read("src/styles/portal.css");
  assert.match(pointer, /open \? "\/ui\/collapse-pointer-down-a2\.webp" : "\/ui\/collapse-pointer-right-a2\.webp"/);
  assert.match(css, /--cg-collapse-pointer-size:\s*1\.35rem/);
  assert.match(css, /section-collapse-button \.collapse-pointer-icon[\s\S]*var\(--cg-collapse-pointer-size\)/);
  assert.match(css, /details-collapse-pointer[\s\S]*var\(--cg-collapse-pointer-size\)/);
});

test("Player Guide describes both Alpha 2 dungeons and crossroads", () => {
  const guide = read("public/guide-body.html");
  assert.match(guide, /The Forgotten Ossuary/);
  assert.match(guide, /The Emberglass Foundry/);
  assert.match(guide, /Crossroads/);
  assert.match(guide, /35% of Ashen Highlands/);
});
