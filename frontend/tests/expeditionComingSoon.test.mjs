import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const SRC = new URL("../src/", import.meta.url);

test("Fellowship page presents the active Expedition Board gate", async () => {
  const page = await readFile(new URL("pages/FellowshipPage.jsx", SRC), "utf8");
  assert.match(page, /Expeditions — Guild Board/);
  assert.match(page, /<details className="panel fellowship-details fellowship-expedition-board">/);
  assert.match(page, /Registered Chocobo/);
  assert.match(page, /Active in v1\.2/);
  assert.match(page, /Five regions and Scout, Journey, and Deep Expedition/);
  assert.match(page, /Unlock at Guild Hall Tier 1 and Fellowship LVL 6/);
  assert.match(page, /Expedition launch project/);
});

test("Chocobo Stable presents live Expedition readiness and active trait effects", async () => {
  const stable = await readFile(new URL("player/ChocoboStable.jsx", SRC), "utf8");
  const guide = await readFile(new URL("../public/guide-body.html", import.meta.url), "utf8");
  assert.match(stable, /v1\.2 · Active/);
  assert.match(stable, /EXPEDITIONS OPEN/);
  assert.match(stable, /Adventure Board/);
  assert.match(stable, /persistent trait now modifies travel|persistent trait becomes a Guardian/);
  assert.match(guide, /Expeditions — v1\.2 Beta 3/);
  assert.match(guide, /Emerald Wilds, Ashen Highlands, Mistfen Marshes, Frostveil Reach, or the Astral Scar/);
});

test("Expedition readiness cards remain responsive", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /\.fellowship-expedition-grid[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.chocobo-expedition-notes[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.expedition-region-grid/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.expedition-region-grid/);
});
