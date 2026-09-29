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

test("Alpha 2 opens Monster Toss with two authoritative actions", () => {
  assert.match(auth, /MONSTER_TOSS_START/);
  assert.match(auth, /MONSTER_TOSS_THROW/);
  assert.match(component, /Monster Toss/);
  assert.match(component, /tossTargets\.map/);
  assert.match(component, /target\.name/);
  assert.match(component, /Safe, Normal, or Power/);
});

test("Monster Toss UI exposes persistent score, throws, daily games and records", () => {
  assert.match(component, /tossGame\.throws_remaining/);
  assert.match(component, /toss\.games_remaining/);
  assert.match(component, /monster_toss_best_score/);
  assert.match(component, /monster_toss_accuracy_pct/);
  assert.match(component, /monster-toss-log/);
  assert.match(css, /monster-toss-target-grid/);
  assert.match(css, /monster-toss-choice\.selected/);
});

test("What's New presents Alpha 2 without claiming Chocobo Racing or Triple Triad are open", () => {
  assert.match(whatsNew, /v1\.6\.0 Alpha 2/);
  assert.match(whatsNew, /Monster Toss joins the floor/);
  assert.match(whatsNew, /schema advances to 12/);
  assert.match(whatsNew, /Portal Action protocol advances to 27/);
});
