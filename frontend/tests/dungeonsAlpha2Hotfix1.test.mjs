import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("Dungeon Board uses the same compact disclosure button and state-selected pointer as other boards", () => {
  const board = read("src/player/Dungeons.jsx");
  const pointer = read("src/components/CollapsePointer.jsx");
  const css = read("src/styles/portal.css");
  assert.match(board, /className="section-collapse-button dungeon-board-collapse-toggle"/);
  assert.doesNotMatch(board, /adventure-collapse-toggle icon-only/);
  assert.match(pointer, /open \? "\/ui\/collapse-pointer-down-a2\.webp" : "\/ui\/collapse-pointer-right-a2\.webp"/);
  assert.match(css, /\.section-collapse-button \{[\s\S]*width: 38px;[\s\S]*min-height: 38px;/);
});

test("Dungeon Board background is a real DOM image layer and ships as optimized WebP", () => {
  const board = read("src/player/Dungeons.jsx");
  const css = read("src/styles/portal.css");
  const art = path.join(root, "public/retro-phase-iii/scene-backgrounds-v4/dungeon_board.webp");
  assert.ok(fs.existsSync(art));
  assert.ok(fs.statSync(art).size < 400000);
  assert.match(board, /className="dungeon-board-background-art" src="\/retro-phase-iii\/scene-backgrounds-v4\/dungeon_board\.webp"/);
  assert.match(css, /\.dungeon-board-background-art \{[\s\S]*position: absolute;[\s\S]*object-fit: cover;/);
  assert.match(css, /\.dungeon-board-panel > :not\(\.dungeon-board-background-art\)[\s\S]*z-index: 2/);
});
