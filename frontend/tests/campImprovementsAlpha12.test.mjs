import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const hunts = read("src/player/Hunts.jsx");
const api = read("src/api/auth.js");
const css = read("src/styles/camp-improvements.css");
const version = read("src/version.js");
const guide = read("public/guide-body.html");
test("Camp offers direct meal, recovery and exactly one free solo preparation", () => {
  assert.match(hunts, /function CampImprovements/);
  assert.match(hunts, /Trail Rations/);
  assert.match(hunts, /Use Tent/);
  assert.match(hunts, /Use Potion/);
  for (const id of ["scout", "sharpen", "supplies"]) assert.match(hunts, new RegExp(`id: "${id}"`));
  assert.match(hunts, /aria-pressed=\{plan\.preparation === choice\.id\}/);
  assert.match(hunts, /<CampImprovements/);
  assert.match(hunts, /submitStartRest/);
});
test("Camp actions use authoritative Portal dispatch and pending-safe idempotency", () => {
  for (const name of ["submitCampMeal", "submitCampPreparation", "submitUseFieldItem"]) assert.match(hunts, new RegExp(name));
  assert.match(api, /"CAMP_EAT_MEAL"/);
  assert.match(api, /"CAMP_SET_PREPARATION"/);
  assert.match(hunts, /runRequest\("camp:meal"/);
  assert.match(hunts, /runRequest\(`camp:prep:\$\{id\}`/);
});
test("Camp panel remains phone-friendly and release/guide identify Alpha 12", () => {
  assert.match(css, /@media \(max-width:600px\)/);
  assert.match(css, /grid-template-columns:minmax\(0,1fr\)/);
  assert.match(version, /Alpha 13/);
  assert.match(guide, /Trail Rations/);
});
