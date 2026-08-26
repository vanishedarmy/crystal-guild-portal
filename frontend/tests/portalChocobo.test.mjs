import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("v1.1.10 adds Chocobo Stable profile navigation and Overview shortcut", async () => {
  const [profile, overview] = await Promise.all([
    read("src/pages/PlayerProfile.jsx"), read("src/player/Overview.jsx"),
  ]);
  assert.match(profile, /chocobo: lazy\(\(\) => import\("\.\.\/player\/ChocoboStable\.jsx"\)\)/);
  assert.match(profile, /\["chocobo", "Chocobo Stable", "♞"\]/);
  assert.match(profile, /activeTab === "chocobo"/);
  assert.match(overview, /\["chocobo", "Chocobo Stable"/);
});

test("Chocobo Stable exposes quest, one-hour Writ, registration, Bond and Expedition readiness", async () => {
  const source = await read("src/player/ChocoboStable.jsx");
  for (const token of ["CHOCOBO_STATE", "Complete Quest", "Chocobo Registration Writ", "one hour", "Register Chocobo", "Bond XP", "Expedition Preparation", "RENAME_CHOCOBO"]) {
    assert.match(source, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
  assert.match(source, /ready_at/);
  assert.match(source, /setInterval\(tick, 1000\)/);
  assert.match(source, /No combat bonuses are added in v1\.1\.10/);
});

test("Portal auth exports strict Chocobo action helpers", async () => {
  const source = await read("src/api/auth.js");
  for (const action of ["CHOCOBO_STATE", "COMPLETE_CHOCOBO_QUEST", "PURCHASE_CHOCOBO_WRIT", "REGISTER_CHOCOBO", "RENAME_CHOCOBO"]) {
    assert.match(source, new RegExp(action));
  }
});

test("Chocobo Stable keeps responsive Phase 8 touch-friendly layout", async () => {
  const css = await read("src/styles/portal.css");
  assert.match(css, /v1\.1\.10 — Chocobo Companions/);
  assert.match(css, /\.chocobo-acquisition-grid/);
  assert.match(css, /@media\(max-width:900px\)/);
  assert.match(css, /\.chocobo-name-field input\{[^}]*min-height:44px/);
});
