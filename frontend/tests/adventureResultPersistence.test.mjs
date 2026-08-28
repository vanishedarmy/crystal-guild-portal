import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const hunts = fs.readFileSync(new URL("../src/player/Hunts.jsx", import.meta.url), "utf8");
const auth = fs.readFileSync(new URL("../src/api/auth.js", import.meta.url), "utf8");

test("Adventure Board keeps durable Solo and Hunt result cards until confirmation", () => {
  assert.match(hunts, /pending_results/);
  assert.match(hunts, /pendingSoloResults/);
  assert.match(hunts, /pendingHuntResults/);
  assert.match(hunts, /Saved until you confirm/);
  assert.match(hunts, /Confirm Result/);
  assert.match(hunts, /ACK_ADVENTURE_RESULT/);
});

test("Adventure result confirmation is a typed Portal action", () => {
  assert.match(auth, /submitAcknowledgeAdventureResult/);
  assert.match(auth, /submitPortalAction\("ACK_ADVENTURE_RESULT", \{ result_id: Number\(resultId\) \}/);
});
