import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Expedition combat separates core actions, abilities, and consumables", async () => {
  const component = await readFile(new URL("player/Expeditions.jsx", SRC), "utf8");
  assert.match(component, /Core Actions/);
  assert.match(component, /className="expedition-action-section expedition-abilities-section"/);
  assert.match(component, /className="expedition-action-section expedition-consumables-section"/);
  assert.match(component, /ABILITY_GROUPS/);
  assert.match(component, /Offense/);
  assert.match(component, /Restoration/);
  assert.match(component, /Support/);
});

test("Expedition consumables are filtered into healing support and damage categories", async () => {
  const component = await readFile(new URL("player/Expeditions.jsx", SRC), "utf8");
  assert.match(component, /id: "healing", label: "Healing"/);
  assert.match(component, /id: "support", label: "Support"/);
  assert.match(component, /id: "damage", label: "Damage"/);
  assert.match(component, /battleItemPurpose\(item\)/);
  assert.match(component, /setConsumableCategory\(group\.id\)/);
  assert.match(component, /consumableGroups\[activeConsumableCategory\]/);
});

test("Expedition route selection is a two-step select then travel interaction", async () => {
  const component = await readFile(new URL("player/Expeditions.jsx", SRC), "utf8");
  assert.match(component, /setSelectedRoute\(route\.id\)/);
  assert.match(component, /aria-pressed=\{selected\}/);
  assert.match(component, /Select a Route to Travel/);
  assert.match(component, /Travel · \$\{selectedRouteDef\.name\}/);
  assert.match(component, /submitExpeditionContinue\(selectedRouteDef\.id/);
});

test("Expedition UI polish strengthens readability and actionable states", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /v1\.8\.0 Expedition UI Polish/);
  assert.match(css, /\.expedition-active-meta \{[\s\S]*grid-template-columns: repeat\(5/);
  assert.match(css, /\.expedition-route-option\.selected/);
  assert.match(css, /\.expedition-route-travel-button/);
  assert.match(css, /\.expedition-consumable-tabs/);
  assert.match(css, /\.expedition-action-section/);
});
