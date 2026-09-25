import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");
const hunts = readFileSync(new URL("../src/player/Hunts.jsx", import.meta.url), "utf8");
const dungeons = readFileSync(new URL("../src/player/Dungeons.jsx", import.meta.url), "utf8");
const expeditions = readFileSync(new URL("../src/player/Expeditions.jsx", import.meta.url), "utf8");
const live = readFileSync(new URL("../src/components/LiveStreamCombatControls.jsx", import.meta.url), "utf8");

test("combat cards enforce a top-first name hierarchy", () => {
  assert.match(css, /Combat Card Hierarchy Hotfix 8/);
  assert.match(css, /display:\s*flex\s*!important;[\s\S]*?flex-direction:\s*column/);
  assert.match(css, /white-space:\s*normal;[\s\S]*?overflow-wrap:\s*normal;[\s\S]*?word-break:\s*normal/);
});

test("solo and dungeon item names stack above quantity and detail", () => {
  assert.match(css, /\.solo-action-option > span:first-child\s*\{[\s\S]*?flex-direction:\s*column/);
  assert.match(hunts, /<span><strong>\{item\.name\}<\/strong><small>Qty/);
  assert.match(dungeons, /<span><strong>\{item\.name\}<\/strong><small>Qty/);
});

test("ability cards keep name before cost and effect in every combat surface", () => {
  assert.match(hunts, /<strong>\{ability\.name\}<\/strong>[\s\S]*?<span>\{number\(ability\.cost\)/);
  assert.match(dungeons, /<strong>\{ability\.name\}<\/strong><span>\{number\(ability\.cost\)/);
  assert.match(expeditions, /<strong>\{ability\.name\}<\/strong>[\s\S]*?<small>\{abilityCostLabel\(ability\)\}<\/small>[\s\S]*?<span>/);
  assert.match(live, /<strong>\{ability\.name\}<\/strong><small>\{number\(ability\.cost\)/);
});
