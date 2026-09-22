import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const exists = (path) => fs.existsSync(new URL(path, import.meta.url));

test("Alpha 6 publishes World Events as the current web identity", () => {
  const version = read("../src/version.js");
  assert.match(version, /WEB_VERSION = "v1\.9\.0 Alpha 7"/);
  assert.match(version, /WEB_BUILD = "Hall of Trophies"/);
  assert.match(version, /1\.9\.0-hall-of-trophies-alpha7/);
});

test("Stream Activities exposes World Events separately from Raids", () => {
  const source = read("../src/player/StreamActivities.jsx");
  assert.match(source, /World Events · Stream Only/);
  assert.match(source, /Notorious Monsters/);
  assert.match(source, /never start a Raid/);
  assert.match(source, /\+10 Max/);
  assert.match(source, /WorldEventEncounter/);
  assert.match(source, /onJoin\?\.\("world_event"/);
  assert.match(source, /onAction\?\.\("world_event"/);
  assert.match(source, /Initial roster · 10 notorious variants/);
});

test("World Event portal artwork includes bosses and live state presentation", () => {
  for (const name of [
    "notorious_behemoth.webp", "tainted_malboro.webp", "dark_iron_giant.webp",
    "elder_adamantoise.webp", "cursed_tonberry_king.webp", "savage_coeurl.webp",
    "dread_bomb_king.webp", "twisted_ahriman.webp", "ravenous_dragon.webp",
    "bloodied_deathclaw.webp", "world_events_header.webp", "world_event_active.webp",
    "world_event_idle.webp", "world_event_defeated.webp",
  ]) assert.equal(exists(`../public/world-events/a1/${name}`), true, `${name} should be packaged`);
});

test("World Events layout remains responsive and accessible", () => {
  const css = read("../src/styles/portal.css");
  assert.match(css, /v1\.9\.0 Alpha 6 — World Events/);
  assert.match(css, /\.world-event-roster[\s\S]*repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.world-event-roster \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /@media \(prefers-contrast: more\)/);
});

test("What's New documents the non-Raid World Event contract", () => {
  const whatsNew = read("../src/player/whatsNewData.js");
  for (const phrase of [
    "v1.9.0 Alpha 6", "World Events", "Random live appearances", "Highest hero +10 ceiling",
    "Not a Raid", "Ten opening threats", "Enhanced rewards", "Dedicated Portal presentation",
  ]) assert.match(whatsNew, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
