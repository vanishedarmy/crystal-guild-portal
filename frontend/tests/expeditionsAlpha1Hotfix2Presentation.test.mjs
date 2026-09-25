import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

test("Alpha 1 Hotfix 2 packages expedition board and five region backdrops", () => {
  for (const name of [
    "expedition-board.webp",
    "emerald-wilds.webp",
    "ashen-highlands.webp",
    "mistfen-marshes.webp",
    "frostveil-reach.webp",
    "astral-scar.webp",
  ]) {
    const file = path.join(root, "public/expeditions", name);
    assert.ok(fs.existsSync(file), `${name} missing`);
    assert.ok(fs.statSync(file).size > 100_000, `${name} unexpectedly small`);
  }
  const css = src("src/styles/portal.css");
  assert.match(css, /url\('\/expeditions\/expedition-board\.webp'\)/);
  assert.match(css, /data-region="emerald_wilds"/);
  assert.match(css, /data-region="astral_scar"/);
});

test("Travel Regions and Hunt Board are collapsible and remember their state", () => {
  const hunts = src("src/player/Hunts.jsx");
  assert.match(hunts, /<h2>Travel Regions<\/h2>/);
  assert.match(hunts, /huntBoardOpen/);
  assert.match(hunts, /regionsOpen/);
  assert.match(hunts, /aria-expanded=\{regionsOpen\}/);
  assert.match(hunts, /aria-expanded=\{huntBoardOpen\}/);
  assert.match(hunts, /window\.localStorage/);
});

test("Expedition cards favor actionable status over redundant prose", () => {
  const expeditions = src("src/player/Expeditions.jsx");
  assert.doesNotMatch(expeditions, /<p>\{region\.description\}<\/p>/);
  assert.match(expeditions, /Choose a region and route/);
  assert.match(expeditions, /Progress is saved if you leave the Portal/);
});
