import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);

test("Arsenal Hotfix 3 resumes Daily requests instead of flooding the Portal queue", async () => {
  const daily = await readFile(new URL("player/DailyReward.jsx", SRC), "utf8");
  assert.match(daily, /sessionStorage/);
  assert.match(daily, /stateInflight/);
  assert.match(daily, /same request instead of adding another one/);
  assert.match(daily, /stateRetryTimer/);
  assert.match(daily, /loadDaily\(\{ quiet: true \}\)/);
});

test("Arsenal Hotfix 3 makes Solo Venture requests resumable and keeps active runs refreshing", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(board, /volatileAdventureActionKeys/);
  assert.match(board, /sessionStorage/);
  assert.match(board, /stateInflight/);
  assert.match(board, /expeditionActive = Boolean\(state\?\.solo_venture\?\.expedition\)/);
  assert.match(board, /expeditionActive \? 30000 : dungeonActive \? 30000 : 30000/);
  assert.match(board, /Retry or refresh safely resumes the same request/);
  assert.match(board, /submitSoloExpeditionAction\("attack", csrfToken, idem\)/);
  assert.match(board, /submitSoloExpeditionContinue\(csrfToken, idem\)/);
  assert.match(board, /submitSoloExpeditionReturn\(csrfToken, idem\)/);
});


test("Arsenal Hotfix 3 retries initial Adventure Board recovery instead of showing a false READY state", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(board, /retryBootstrap/);
  assert.match(board, /window\.setInterval\(retryBootstrap, 30000\)/);
  assert.match(board, /const boardStateReady = Boolean\(state\)/);
  assert.match(board, /Checking your venture/);
  assert.match(board, /!boardStateReady \|\| !state\?\.solo_venture\?\.ready/);
});
