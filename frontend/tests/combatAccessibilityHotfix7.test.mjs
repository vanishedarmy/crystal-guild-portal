import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { battleAbilityPurpose, battleAbilitySummary } from "../src/utils/formatters.js";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

async function source(path) {
  return readFile(new URL(path, SRC), "utf8");
}

test("Hotfix 7 classifies battle abilities by purpose and produces compact effect summaries", () => {
  const fire = { name: "Fire", target: "enemy", element: "Fire", effects: [{ type: "damage", scaling: "magic", power: 1.2 }] };
  const cure = { name: "Cure", target: "ally", effects: [{ type: "heal", power: 1.3 }] };
  const protect = { name: "Protect", target: "ally", effects: [{ type: "status", status: "protect", turns: 3, magnitude: .2 }] };
  assert.equal(battleAbilityPurpose(fire), "offense");
  assert.equal(battleAbilityPurpose(cure), "restoration");
  assert.equal(battleAbilityPurpose(protect), "support");
  assert.equal(battleAbilitySummary(fire), "Fire damage");
  assert.equal(battleAbilitySummary(cure), "Restore HP");
  assert.match(battleAbilitySummary(protect), /Protect/);
});

test("Hotfix 7 applies purpose colors across every player battle control surface", async () => {
  const [hunts, dungeons, expeditions, live] = await Promise.all([
    source("player/Hunts.jsx"),
    source("player/Dungeons.jsx"),
    source("player/Expeditions.jsx"),
    source("components/LiveStreamCombatControls.jsx"),
  ]);
  for (const text of [hunts, dungeons]) {
    assert.match(text, /combat-tone-offense/);
    assert.match(text, /combat-tone-ability/);
    assert.match(text, /combat-tone-item/);
    assert.match(text, /combat-tone-defense/);
    assert.match(text, /combat-purpose-\$\{battleAbilityPurpose\(ability\)\}/);
    assert.match(text, /combat-purpose-\$\{battleItemPurpose\(item\)\}/);
  }
  assert.match(expeditions, /combat-tone-offense/);
  assert.match(expeditions, /combat-tone-defense/);
  assert.match(expeditions, /combat-purpose-\$\{group\.id\}/);
  assert.match(live, /combat-tone-offense/);
  assert.match(live, /combat-tone-defense/);
  assert.match(live, /combat-purpose-\$\{group\}/);
});

test("Hotfix 7 removes redundant or implementation-sounding combat copy", async () => {
  const text = [
    await source("player/Hunts.jsx"),
    await source("player/Dungeons.jsx"),
    await source("player/Expeditions.jsx"),
    await source("components/LiveStreamCombatControls.jsx"),
  ].join("\n");
  for (const phrase of [
    "Always available when your hero can act.",
    "Organized by combat purpose.",
    "Show only the item type you need.",
    "Portal Battle Controls",
    "Selecting an action replaces your previous queued action for this round.",
    "Owned battle items only.",
    "Choose an ability",
    "Battle Inventory",
  ]) assert.doesNotMatch(text, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("Hotfix 7 keeps combat cards dense and mobile commands two-up", async () => {
  const css = await source("styles/portal.css");
  assert.match(css, /Hotfix 7 — combat action accessibility \+ density/);
  assert.match(css, /--combat-rgb: 231, 111, 74/);
  assert.match(css, /--combat-rgb: 169, 112, 235/);
  assert.match(css, /--combat-rgb: 91, 204, 139/);
  assert.match(css, /--combat-rgb: 83, 164, 235/);
  assert.match(css, /\.solo-action-grid \{ grid-template-columns: repeat\(3/);
  assert.match(css, /\.solo-command-bar,\s*\.solo-choice-actions \{ grid-template-columns: repeat\(2/);
  assert.match(css, /\.expedition-action-section \.expedition-option-grid \{\s*grid-template-columns: repeat\(4/);
});

test("Hotfix 7 refreshes the Player Guide FAQ for new systems", async () => {
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  for (const question of [
    "What is a World Event?",
    "What do the combat button colors mean?",
    "How does the Moogle Trading Post work?",
    "What does the Moogle Emporium Annex add?",
    "Do new achievement Titles unlock if I already met the requirement?",
    "What counts as a monster defeat for projects and objectives?",
  ]) assert.match(guide, new RegExp(question.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(guide, /Quick answers to common questions\./);
});
