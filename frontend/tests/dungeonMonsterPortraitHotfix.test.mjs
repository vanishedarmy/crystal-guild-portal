import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");

test("Dungeon combat sends the full enemy record to MonsterPortrait", () => {
  const board = read("src/player/Dungeons.jsx");
  assert.match(board, /<MonsterPortrait monster=\{combat\.enemy\} name=\{combat\.enemy\?\.name\}/);
  assert.doesNotMatch(board, /MonsterPortrait monsterName=/);
});

test("Dungeon monster IDs resolve through the shared portrait catalog", async () => {
  const { monsterPortraitPath } = await import("../src/utils/monsterPortraits.js");
  assert.equal(monsterPortraitPath({ id: "skeleton", name: "Skeleton" }), "/retro-phase-ii/monster-portraits-v10/skeleton.webp");
  assert.equal(monsterPortraitPath({ id: "goblin_chieftain", name: "Goblin Chieftain" }), "/retro-phase-ii/monster-portraits-v10/goblin_chieftain.webp");
});
