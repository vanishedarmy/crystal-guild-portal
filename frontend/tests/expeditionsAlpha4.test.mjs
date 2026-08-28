import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

test("Expeditions Alpha 4 exposes landmarks, journal, and route signals", async () => {
  const component = await readFile(new URL("src/player/Expeditions.jsx", ROOT), "utf8");
  const css = await readFile(new URL("src/styles/portal.css", ROOT), "utf8");
  const guide = await readFile(new URL("public/guide-body.html", ROOT), "utf8");
  assert.match(component, /Regional Landmarks/);
  assert.match(component, /Expedition Journal/);
  assert.match(component, /Rare event chance/);
  assert.match(component, /ROUTE_SIGNALS/);
  assert.match(component, /landmarks_found/);
  assert.match(css, /expedition-landmark-grid/);
  assert.match(css, /expedition-journal-entry\.rare/);
  assert.match(css, /expedition-route-signals/);
  assert.match(guide, /Regional Discovery · Alpha 4/);
  assert.match(guide, /Rare Regional Events/);
  assert.match(guide, /Push Deeper/);
});
