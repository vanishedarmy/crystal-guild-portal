import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const SRC = new URL("../src/", import.meta.url);

test("Fellowship page consolidates the informational coming-soon Expedition board", async () => {
  const page = await readFile(new URL("pages/FellowshipPage.jsx", SRC), "utf8");
  assert.match(page, /Expeditions — Coming Soon/);
  assert.match(page, /<details className="panel fellowship-details fellowship-expedition-board">/);
  assert.match(page, /Expedition Board/);
  assert.match(page, /Registered Chocobo/);
  assert.match(page, /Coming in v1\.2/);
  assert.match(page, /No Expedition action is enabled early/);
});

test("Chocobo Stable and Guide surface Expedition preparation without enabling Expedition actions", async () => {
  const stable = await readFile(new URL("player/ChocoboStable.jsx", SRC), "utf8");
  const guide = await readFile(new URL("../public/guide-body.html", import.meta.url), "utf8");
  assert.match(stable, /Coming Soon · v1\.2/);
  assert.match(stable, /There are no Expedition action buttons in v1\.1\.10/);
  assert.match(stable, /Prepare the Guild Board/);
  assert.match(guide, /Coming Soon — Expeditions:/);
  assert.match(guide, /Expedition destinations, contracts, and launch actions remain intentionally unavailable/);
  assert.doesNotMatch(stable, /submitExpedition|START_EXPEDITION|CLAIM_EXPEDITION/);
});

test("Expedition coming-soon cards remain responsive", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /\.fellowship-expedition-grid[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fellowship-expedition-grid \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /\.chocobo-expedition-notes[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 760px\) \{ \.chocobo-expedition-notes \{ grid-template-columns: 1fr; \} \}/);
});
