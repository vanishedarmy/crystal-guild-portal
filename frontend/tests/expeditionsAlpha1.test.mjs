import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const SRC = new URL("../src/", import.meta.url);

test("Expedition Board exposes five-region launch, depths, persistent travel, combat, routes and cache return", async () => {
  const component = await readFile(new URL("player/Expeditions.jsx", SRC), "utf8");
  for (const token of ["Distant Expedition Board", "3 stages", "5 stages", "8 stages", "Expedition Cache", "Resolve Stage", "Attack", "Defend", "Make Camp", "Return to Guild", "Chocobo Rescue"]) assert.match(component, new RegExp(token));
  assert.match(component, /submitExpeditionStart/);
  assert.match(component, /submitExpeditionResolveStage/);
  assert.match(component, /submitExpeditionAction/);
  assert.match(component, /submitExpeditionContinue/);
  assert.match(component, /submitExpeditionCamp/);
  assert.match(component, /submitExpeditionReturn/);
  assert.match(component, /submitExpeditionRetreat/);
});

test("Adventure Board requires typed Expedition capabilities and polls the authoritative travel deadline", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(board, /EXPEDITION_START/);
  assert.match(board, /EXPEDITION_RESOLVE_STAGE/);
  assert.match(board, /state\?\.expeditions\?\.active/);
  assert.match(board, /Number\(state\.expeditions\?\.active\?\.travel_ready_at \|\| 0\)/);
  assert.match(board, /<Expeditions/);
});

test("v1.2 Expedition styles collapse five-region and battle layouts for smaller screens", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /v1\.2 Expeditions Alpha 1/);
  assert.match(css, /\.expedition-region-grid[\s\S]*repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.expedition-combatants/);
});
