import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { filterAndSortRelics, nextRelicObjective, relicStatus } from "../src/player/relicViewModel.js";

const SRC = new URL("../src/", import.meta.url);

const ready = {
  id: "bravura", name: "Bravura", job: "Warrior", stage: 1, total_stages: 3,
  ready: true, next_stage: "Awakening", stages: ["Dormant Relic", "Awakening", "Zenith"],
  final_reward: { name: "Bravura — Zenith" },
  path: [null, { name: "Awakening", ready: true }],
};
const locked = {
  id: "excalibur", name: "Excalibur", job: "Paladin", stage: 0, total_stages: 3,
  path: [{ name: "Dormant Relic", requirements: [
    { label: "Paladin Job level", current: 42, required: 50, met: false },
  ], cost: {} }],
};
const mastered = { id: "nirvana", name: "Nirvana", job: "White Mage", stage: 3, completed: true };

test("Relic filters use the player's current state, not stale status labels", () => {
  assert.equal(relicStatus(ready), "ready");
  assert.equal(relicStatus(locked), "not_started");
  assert.equal(relicStatus(mastered), "complete");
  assert.deepEqual(filterAndSortRelics([mastered, locked, ready], { filter: "ready" }).map((r) => r.id), ["bravura"]);
  assert.deepEqual(filterAndSortRelics([mastered, locked, ready], { sort: "ready" }).map((r) => r.id), ["bravura", "excalibur", "nirvana"]);
});

test("search matches Jobs, next stage, final form, and case-insensitive names", () => {
  assert.deepEqual(filterAndSortRelics([ready, locked], { query: "warrior" }).map((r) => r.id), ["bravura"]);
  assert.deepEqual(filterAndSortRelics([ready, locked], { query: "ZENITH" }).map((r) => r.id), ["bravura"]);
  assert.deepEqual(filterAndSortRelics([ready, locked], { query: "Paladin", filter: "ready" }), []);
});

test("next objective prefers missing requirements, then materials and currency", () => {
  assert.match(nextRelicObjective(ready), /ready for Awakening/);
  assert.match(nextRelicObjective(locked), /42 \/ 50/);
  const materials = { stage: 0, path: [{ name: "Dormant Relic", requirements: [],
    cost: { materials: [{ name: "Mythril Ore", owned: 3, required: 8, met: false }] } }] };
  assert.match(nextRelicObjective(materials), /Mythril Ore: 3 \/ 8 owned/);
  assert.match(nextRelicObjective(mastered), /All three stages/);
});

test("Relic UI opens a detail dialog with three stage accordions and resource breakdowns", async () => {
  const [page, dialog, detail, styles] = await Promise.all([
    readFile(new URL("player/Relics.jsx", SRC), "utf8"),
    readFile(new URL("components/DetailDialog.jsx", SRC), "utf8"),
    readFile(new URL("components/RelicDetail.jsx", SRC), "utf8"),
    readFile(new URL("styles/relic-overhaul.css", SRC), "utf8"),
  ]);
  assert.match(page, /filterAndSortRelics/);
  assert.match(page, /View all stages/);
  assert.match(dialog, /<RelicDetail relic=\{detail.relic\}/);
  assert.match(detail, /<details className=/);
  assert.match(detail, /RequirementRows/);
  assert.match(detail, /CostRows/);
  assert.match(detail, /WeaponReward/);
  assert.match(detail, /preview_missing/);
  assert.match(styles, /@media \(max-width: 430px\)/);
  assert.match(styles, /:focus-visible/);
});
