import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const component = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const auth = fs.readFileSync(path.join(root, "src/api/auth.js"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const whatsNew = fs.readFileSync(path.join(root, "src/player/whatsNewData.js"), "utf8");
const guide = fs.readFileSync(path.join(root, "public/guide-body.html"), "utf8");


test("Alpha 4 opens authoritative Chocobo Racing", () => {
  assert.match(auth, /CHOCOBO_RACE/);
  assert.match(auth, /submitChocoboRace/);
  assert.match(component, /Chocobo Racing/);
  assert.match(component, /racing\.courses/);
  assert.match(component, /racing\.strategies/);
  assert.match(component, /CHOCOBO_PORTRAIT_ROOT/);
});

test("Racing UI exposes course gates, pace choices, daily entries and records", () => {
  assert.match(component, /races_remaining/);
  assert.match(component, /selectedRaceCourse\?\.can_enter/);
  assert.match(component, /raceStrategy/);
  assert.match(component, /chocobo_race_wins/);
  assert.match(component, /chocobo_race_podiums/);
  assert.match(component, /chocobo_race_best_payout/);
  assert.match(css, /saucer-race-course-grid/);
  assert.match(css, /saucer-race-companion/);
});

test("Alpha 4 player copy and Guide present Racing as live", () => {
  assert.match(whatsNew, /v1\.6\.0 Alpha 4/);
  assert.match(whatsNew, /Chocobo Racing/);
  assert.match(whatsNew, /Portal Action protocol advances to 28/);
  assert.match(guide, /Chocobo Racing/);
  assert.match(guide, /three races per UTC day/i);
  assert.match(guide, /Triple Triad.*Coming Soon/i);
});
