import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);
const SRC = new URL("../src/", import.meta.url);

test("v1.7.1 Resynthesis adds a third Blacksmith service without expanding equipment types", async () => {
  const smith = await readFile(new URL("player/Blacksmith.jsx", SRC), "utf8");
  const workbench = await readFile(new URL("player/ResynthesisWorkbench.jsx", SRC), "utf8");
  const filters = await readFile(new URL("utils/resynthesisFilters.js", SRC), "utf8");
  assert.match(smith, /Resynthesize Gear/);
  assert.match(smith, /Recover materials/);
  assert.match(smith, /<ResynthesisWorkbench/);
  assert.match(filters, /id: "weapon"/);
  assert.match(filters, /id: "armor"/);
  assert.doesNotMatch(filters, /id: "accessory"/);
  assert.match(workbench, /Relic and Artifact gear remains protected/);
  assert.match(workbench, /Guaranteed material recovery/);
});

test("resynthesis uses an explicit destructive confirmation and typed Portal action", async () => {
  const smith = await readFile(new URL("player/Blacksmith.jsx", SRC), "utf8");
  const workbench = await readFile(new URL("player/ResynthesisWorkbench.jsx", SRC), "utf8");
  const api = await readFile(new URL("api/auth.js", SRC), "utf8");
  assert.match(smith, /window\.confirm\(prompt\)/);
  assert.match(workbench, /Resynthesis is permanent and cannot be undone/);
  assert.match(smith, /WARNING: This permanently destroys the selected gear/);
  assert.match(smith, /This action cannot be undone/);
  assert.match(api, /RESYNTHESIZE_ITEM/);
  assert.match(api, /submitResynthesizeItem/);
});

test("legacy resynthesis styles remain intact while new workbench is responsive", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  const modern = await readFile(new URL("styles/resynthesis-1942.css", SRC), "utf8");
  assert.match(css, /v1\.7\.1 Resynthesis Alpha 2/);
  assert.match(css, /blacksmith-view-switch \{ grid-template-columns: repeat\(3/);
  assert.match(css, /resynthesis-grid/);
  assert.match(css, /resynthesis-recovery-list/);
  assert.match(modern, /resynthesis-workbench \.crafting-layout/);
  assert.match(modern, /max-width: 750px/);
});
