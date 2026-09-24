import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const hud = read("src/components/MobileCombatHud.jsx");
const drawer = read("src/components/MobileCombatDrawer.jsx");
const viewport = read("src/components/useMobileCombatViewport.js");
const css = read("src/styles/portal.css");
const hunts = read("src/player/Hunts.jsx");
const dungeons = read("src/player/Dungeons.jsx");
const expeditions = read("src/player/Expeditions.jsx");
const live = read("src/components/LiveStreamCombatControls.jsx");
const version = read("src/version.js");
const guide = read("public/guide-body.html");

// Keep this file distinct from the historical Hotfix 9/10 tests: those assert
// the earlier sticky design, whereas Alpha 11 must fix its viewport behavior.
test("Alpha 11 HUD is mounted at document.body, survives nested scroll and reserves page space", () => {
  assert.match(hud, /createPortal\(/);
  assert.match(hud, /document\.body/);
  assert.match(hud, /getBoundingClientRect\(\)\.height/);
  assert.match(hud, /ResizeObserver/);
  assert.match(hud, /mobile-combat-hud-present/);
  assert.match(css, /v1\.9\.0 Alpha 11 — viewport-anchored mobile combat/);
  assert.match(css, /body\.mobile-combat-hud-present #root\s*\{[\s\S]*?padding-bottom:\s*calc\(var\(--mobile-combat-hud-height/);
  assert.match(css, /\.mobile-combat-hud\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?bottom:\s*max\(8px, env\(safe-area-inset-bottom\)\)/);
});

test("HUD keeps two resource types and four real, busy-aware combat actions", () => {
  assert.match(hud, /max_mp/);
  assert.match(hud, /max_ap/);
  assert.match(hud, /resources\.map/);
  assert.match(hud, /MiniVital label="You"/);
  assert.match(hud, /MiniVital label="Enemy"/);
  assert.match(hud, /disabled=\{disabled\}/);
  assert.match(hud, /disabled=\{disabled \|\| !hasAbilities\}/);
  assert.match(hud, /disabled=\{disabled \|\| !hasItems\}/);
  assert.match(hud, /onAttack\?\.\(\)/);
  assert.match(hud, /onDefend\?\.\(\)/);
  assert.match(hud, /aria-haspopup="dialog"/);
});

test("drawers portal only on mobile, above the measured HUD, and support escape", () => {
  assert.match(drawer, /createPortal\(cloneElement\(children/);
  assert.match(drawer, /if \(!mobile\) return children/);
  assert.match(drawer, /if \(!open/);
  assert.match(drawer, /event\.key !== "Escape"/);
  assert.match(drawer, /aria-label/);
  assert.match(drawer, /aria-modal": "false"/);
  assert.match(css, /\.mobile-combat-drawer\s*\{[\s\S]*?bottom:\s*calc\(var\(--mobile-combat-hud-height/);
  assert.match(css, /max-height:\s*min\(55dvh/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(viewport, /\(max-width: 760px\)/);
});

test("all six combat experiences share the overlay with existing backend callbacks", () => {
  for (const [file, state] of [
    [hunts, "soloPicker"], [dungeons, "picker"],
    [expeditions, "mobileCombatPicker"], [live, "mobilePicker"],
  ]) {
    assert.match(file, /MobileCombatHud/);
    assert.match(file, /MobileCombatDrawer/);
    assert.match(file, /kind="ability"/);
    assert.match(file, /kind="item"/);
    assert.match(file, /onDismissPicker/);
    assert.ok(file.includes(`open={${state} === "ability"}`));
    assert.ok(file.includes(`open={${state} === "item"}`));
  }
  assert.match(live, /targetFor\(ability, selectedTarget\)/);
  assert.match(live, /targetFor\(item, selectedTarget\)/);
  assert.match(live, /onAction\?\.\("ability", ability\.id, target\)/);
  assert.match(live, /onAction\?\.\("item", item\.id, target\)/);
  assert.match(version, /1\.9\.0-trading-post-qol-alpha13/);
  assert.match(guide, /drawer just above the bar/);
});
