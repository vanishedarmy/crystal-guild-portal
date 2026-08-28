import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

test("Expeditions Alpha 2 exposes regional milestones, mastery and boss contracts", async () => {
  const component = await readFile(new URL("src/player/Expeditions.jsx", ROOT), "utf8");
  const css = await readFile(new URL("src/styles/portal.css", ROOT), "utf8");
  assert.match(component, /Region Progress/);
  assert.match(component, /BOSS UNLOCKED/);
  assert.match(component, /Regional Boss/);
  assert.match(component, /submitExpeditionStart\(pickedRegion\.id, "boss"/);
  assert.match(component, /25%|objective\.threshold/);
  assert.match(component, /MASTERY_COPY/);
  assert.match(css, /expedition-milestone-grid/);
  assert.match(css, /expedition-boss-contract-row/);
});


test("Expedition Board is independently collapsible and persists its preference", async () => {
  const component = await readFile(new URL("src/player/Expeditions.jsx", ROOT), "utf8");
  assert.match(component, /crystal-guild:adventure:expedition-board/);
  assert.match(component, /collapsible-board-section/);
  assert.match(component, /aria-expanded=\{boardOpen\}/);
  assert.match(component, /boardOpen \? \(!active/);
});
