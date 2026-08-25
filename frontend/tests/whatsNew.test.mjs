import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Overview surfaces a reusable player-facing What's New section", async () => {
  const overview = await readFile(new URL("player/Overview.jsx", SRC), "utf8");
  const component = await readFile(new URL("player/WhatsNew.jsx", SRC), "utf8");
  const data = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");

  assert.match(overview, /<WhatsNew onNavigate=\{onNavigate\}/);
  assert.match(component, /What's New/);
  assert.match(component, /Previous major updates/);
  assert.match(component, /onNavigate\?\.\(latest\.action\.tab\)/);
  assert.match(data, /v1\.1\.15/);
  assert.match(data, /Wayfarer/);
});

test("Wayfarer What's New copy explains Solo Venture in player language", async () => {
  const data = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");

  assert.match(data, /Solo Venture is now in your hands/);
  assert.match(data, /Attack, use a Job ability, spend an item, or Defend/);
  assert.match(data, /80% chance of an Encounter and a 20% chance of Treasure/);
  assert.match(data, /three stages/);
  assert.match(data, /There is no Solo battle timer/);
  assert.match(data, /Go to Adventure Board/);

});

test("What's New remains readable and stacks on narrow screens", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /\.whats-new-layout/);
  assert.match(css, /\.whats-new-highlights/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.whats-new-highlights \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /\.whats-new-action \{ width: 100%; justify-self: stretch; \}/);
});

test("Arsenal What's New copy summarizes the combat/content expansion", async () => {
  const data = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  assert.match(data, /v1\.1\.16/);
  assert.match(data, /Arsenal/);
  assert.match(data, /six-ability active Battle foundation/);
  assert.match(data, /Fire, Ice, Lightning, Wind, Water, Holy, and Dark/);
  assert.match(data, /New C-rank marks begin at Lv\.2/);
  assert.match(data, /lower-level raid targets/);
  assert.match(data, /low-level recipes/);
});


test("Arsenal II What's New explains the deeper caster and Portal UX expansion", async () => {
  const data = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  assert.match(data, /v1\.1\.17/);
  assert.match(data, /Arsenal II/);
  assert.match(data, /12-step JLv curve/);
  assert.match(data, /Weapons, Armor, and Items/);
  assert.match(data, /Camp from the Adventure Board/);
  assert.match(data, /suppressed until Twitch is live again/);
});

test("Retro Phase 1 What's New explains the visual-foundation rollout", async () => {
  const data = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  assert.match(data, /v1\.1\.18/);
  assert.match(data, /Retro Phase 1/);
  assert.match(data, /Classic menu windows/);
  assert.match(data, /Retro without tiny text/);
  assert.match(data, /Mobile preserved/);
});
