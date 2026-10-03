import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TROPHY_CATALOG, TROPHY_CATEGORIES } from "../src/player/trophyCatalog.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

test("Alpha 7 trophy catalog has the sealed 30-trophy category split and packaged art", () => {
  assert.equal(TROPHY_CATALOG.length, 30);
  assert.equal(new Set(TROPHY_CATALOG.map((t) => t.id)).size, 30);
  assert.deepEqual(
    Object.fromEntries(["world_events","raids","hunts","triple_triad","fellowship"].map((category) => [category, TROPHY_CATALOG.filter((t) => t.category === category).length])),
    { world_events: 11, raids: 5, hunts: 4, triple_triad: 4, fellowship: 6 },
  );
  for (const trophy of TROPHY_CATALOG) {
    assert.ok(fs.existsSync(path.join(root, "public", trophy.art)), `missing ${trophy.art}`);
    assert.equal(trophy.secret, false);
  }
  assert.equal(TROPHY_CATEGORIES[0].id, "all");
});

test("Hall UI includes responsive filters, NEW handling, detail focus return, and locked/secret assets", () => {
  const hall = read("src/player/TrophyHall.jsx");
  const css = read("src/styles/portal.css");
  const profile = read("src/pages/PlayerProfile.jsx");
  assert.match(profile, /Hall of Trophies/);
  assert.match(hall, /Hall Order/);
  assert.match(hall, /Recently Earned/);
  assert.match(hall, /trophy-new-badge/);
  assert.match(hall, /localStorage/);
  assert.match(hall, /selectedTrigger\.current\?\.focus/);
  assert.match(hall, /\/trophies\/a1\/locked\.webp/);
  assert.match(hall, /\/trophies\/a1\/secret\.webp/);
  assert.match(hall, /hall-complete\.webp/);
  assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /max-height:90dvh/);
  assert.match(css, /prefers-reduced-motion/);
});
