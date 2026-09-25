import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

test("Expeditions Alpha 3 exposes Atlas ranks and Legendary Contracts", async () => {
  const component = await readFile(new URL("src/player/Expeditions.jsx", ROOT), "utf8");
  const css = await readFile(new URL("src/styles/portal.css", ROOT), "utf8");
  const guide = await readFile(new URL("public/guide-body.html", ROOT), "utf8");
  assert.match(component, /Expedition Atlas/);
  assert.match(component, /data\.atlas\?\.rank_name/);
  assert.match(component, /Legendary routes/);
  assert.match(component, /submitExpeditionStart\(pickedRegion\.id, "legendary"/);
  assert.match(component, /Clear Boss to Unlock/);
  assert.match(css, /expedition-atlas-panel/);
  assert.match(css, /legendary-contract-button/);
  assert.match(guide, /Expedition Atlas &amp; Legendary Contracts/);
  assert.match(guide, /Master Cartographer/);
});
