import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const body = readFileSync(new URL("../public/guide-body.html", import.meta.url), "utf8");
const runtime = readFileSync(new URL("../src/guide/guideRuntime.js", import.meta.url), "utf8");

test("guide includes a beginner stat quick reference", () => {
  assert.match(body, /id="stats"/);
  assert.match(body, /Stats, Combat Values &amp; Status Effects — Quick Guide/);
  for (const label of ["STR — Strength", "VIT — Vitality", "MAG — Magic", "SPR — Spirit", "DEX — Dexterity", "LCK — Luck"]) {
    assert.match(body, new RegExp(label));
  }
  for (const label of ["ATK — Attack", "M\.PWR — Magic Power", "HP — Hit Points", "MP — Magic Points", "AP — Action Points"]) {
    assert.match(body, new RegExp(label));
  }
  assert.match(body, /does not refill automatically after battle/);
});

test("stat reference participates in the Begin guide group", () => {
  assert.match(runtime, /stats:'Begin'/);
});


test("guide documents every active combat status", () => {
  for (const label of [
    "Protect", "Taunt", "Evasion", "Power Up", "Focus", "Haste", "Regen",
    "Vulnerable", "Weaken", "Slow", "Stun", "Poison", "Silence", "Blind",
  ]) {
    assert.match(body, new RegExp(`<h3>${label}</h3>`));
  }
  assert.match(body, /MP-based abilities/);
  assert.match(body, /AP techniques, Attack, Defend/);
  assert.match(body, /remaining rounds/);
  assert.match(body, /Remedy/);
  assert.match(body, /Panacea/);
});
