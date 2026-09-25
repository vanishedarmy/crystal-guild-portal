import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const component = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const artRoot = path.join(root, "public/gold-saucer/a4h1/chocobo-racing");

const assets = [
  "hero.webp",
  "race-arena.webp",
  "courses/manderville-sprint.webp",
  "courses/crystal-circuit.webp",
  "courses/golden-gauntlet.webp",
  "pace/steady.webp",
  "pace/balanced.webp",
  "pace/sprint.webp",
  "results/victory.webp",
];

test("Alpha 4 Hotfix 1 ships the complete Chocobo Racing art family", () => {
  for (const asset of assets) assert.ok(fs.existsSync(path.join(artRoot, asset)), `missing ${asset}`);
  assert.match(component, /RACE_ART_ROOT = "\/gold-saucer\/a4h1\/chocobo-racing"/);
  assert.match(component, /RACE_COURSE_ART/);
  assert.match(component, /RACE_STRATEGY_ART/);
});

test("Racing artwork is wired into hero, course, pace, and result states", () => {
  assert.match(component, /saucer-race-hero/);
  assert.match(component, /saucer-race-course-art/);
  assert.match(component, /saucer-race-strategy-art/);
  assert.match(component, /results\/victory\.webp/);
  assert.match(component, /race-arena\.webp/);
});

test("course and pace cards retain explicit selection semantics", () => {
  assert.match(component, /aria-pressed=\{raceCourse === course\.id\}/);
  assert.match(component, /aria-pressed=\{raceStrategy === strategy\.id\}/);
  assert.match(component, /SELECTED/);
  assert.match(component, /Selected Entry/);
});

test("Racing UI remains responsive and motion-safe", () => {
  assert.match(css, /@media\(max-width:800px\)/);
  assert.match(css, /@media\(max-width:560px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /saucer-race-strategy-grid/);
  assert.match(css, /saucer-race-entry-strip/);
});
