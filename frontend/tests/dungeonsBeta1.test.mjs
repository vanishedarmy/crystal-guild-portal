import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const board = fs.readFileSync(new URL("../src/player/Dungeons.jsx", import.meta.url), "utf8");
const auth = fs.readFileSync(new URL("../src/api/auth.js", import.meta.url), "utf8");
const version = fs.readFileSync(new URL("../src/version.js", import.meta.url), "utf8");
const whatsNew = fs.readFileSync(new URL("../src/player/whatsNewData.js", import.meta.url), "utf8");

test("Dungeons Beta 1 binds Portal mutations to the exact persisted revision", () => {
  assert.match(auth, /DUNGEON_ACTION[^\n]+revision: Number\(revision\)/);
  assert.match(auth, /DUNGEON_CONTINUE[^\n]+revision: Number\(revision\)/);
  assert.match(auth, /DUNGEON_CHOICE[^\n]+revision: Number\(revision\)/);
  assert.match(auth, /DUNGEON_RETREAT[^\n]+revision: Number\(revision\)/);
  assert.match(board, /submitDungeonAction\(active\.run_id, active\.room\?\.id, active\.revision, "attack"/);
  assert.match(board, /submitDungeonContinue\(active\.run_id, active\.room\?\.id, active\.revision/);
  assert.match(board, /submitDungeonChoice\(active\.run_id, active\.room\?\.id, active\.revision, choice\.id/);
  assert.match(board, /submitDungeonRetreat\(active\.run_id, active\.room\?\.id, active\.revision/);
});

test("Dungeons Beta 1 exposes round pressure and current release identity", () => {
  assert.match(board, /Round \{number\(combat\.round\)\} \/ \{number\(combat\.max_rounds \|\| 12\)\}/);
  assert.match(board, /Dungeons & Delves · v1.4.0/);
  assert.match(version, /1\.6\.0-gold-saucer/);
  assert.match(whatsNew, /Dungeons & Delves/);
  assert.match(whatsNew, /Safe across tabs and retries/);
});
