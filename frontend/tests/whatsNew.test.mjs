import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Overview surfaces a reusable player-facing What's New section", async () => {
  const overview = await readFile(new URL("player/Overview.jsx", SRC), "utf8");
  const component = await readFile(new URL("player/WhatsNew.jsx", SRC), "utf8");
  const data = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");

  assert.match(overview, /<WhatsNew onNavigate=\{onNavigate\}/);
  assert.ok(overview.indexOf("<DailyReward") < overview.indexOf("<WhatsNew"), "Daily Guild Provisions should appear before What's New");
  assert.match(component, /What's New/);
  assert.match(component, /Previous major updates/);
  assert.match(component, /crystal-guild:overview:whats-new/);
  assert.match(component, /section-collapse-button/);
  assert.match(component, /aria-expanded=\{open\}/);
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

  const wayfarerEntry = data.slice(data.indexOf('name: "Wayfarer"'), data.indexOf('name: "Cloud Continuity"'));
  assert.doesNotMatch(wayfarerEntry, /protocol|schema|migration|runtime|relay/i);
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

test("Retro Phase III What's New explains the consolidated gear-art rollout", async () => {
  const data = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  assert.match(data, /v1\.1\.19/);
  assert.match(data, /Retro Phase III/);
  assert.match(data, /180 standalone gear sprites/);
  assert.match(data, /Whips through headgear/);
  assert.match(data, /Expanded late-wave coverage/);
  assert.match(data, /Library stays consolidated/);
  assert.match(data, /Facility supplies rebalanced/);
});


test("What's New lists only shipped releases in public history", async () => {
  const data = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  assert.match(data, /name: "Dungeons & Delves Beta 2"/);
  assert.match(data, /name: "Guild Expansion"/);
  assert.match(data, /Guild Expansion has arrived/);
  assert.match(data, /name: "Expeditions"/);
  assert.match(data, /Expeditions has arrived/);
  assert.match(data, /Safe favors survival/);
  assert.match(data, /Push Deeper accepts greater danger/);
  assert.match(data, /Your Chocobo matters/);
  const previous = data.slice(data.indexOf('name: "Asset Optimization"'));
  assert.doesNotMatch(previous, /name: "[^"]*(?:Alpha|Beta|RC\d*)[^"]*"/i);
});

