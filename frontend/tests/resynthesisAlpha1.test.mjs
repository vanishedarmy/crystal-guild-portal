import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);
const SRC = new URL("../src/", import.meta.url);

test("v1.7.1 Resynthesis adds a third Blacksmith service without expanding equipment types", async () => {
  const smith = await readFile(new URL("player/Blacksmith.jsx", SRC), "utf8");
  assert.match(smith, /Resynthesize Gear/);
  assert.match(smith, /Recover materials/);
  assert.match(smith, /\["weapon", "armor"\]/);
  assert.match(smith, /Relic and Artifact gear protected/);
  assert.match(smith, /Materials Recovered/);
  assert.doesNotMatch(smith.slice(smith.indexOf("resynthesisGroups"), smith.indexOf("if \(!isOwnProfile\)")), /accessory/);
});

test("resynthesis uses an explicit destructive confirmation and typed Portal action", async () => {
  const smith = await readFile(new URL("player/Blacksmith.jsx", SRC), "utf8");
  const api = await readFile(new URL("api/auth.js", SRC), "utf8");
  assert.match(smith, /window\.confirm\(prompt\)/);
  assert.match(smith, /Resynthesizing permanently destroys the selected gear/);
  assert.match(smith, /WARNING: This permanently destroys the selected gear/);
  assert.match(smith, /This action cannot be undone/);
  assert.match(api, /RESYNTHESIZE_ITEM/);
  assert.match(api, /submitResynthesizeItem/);
});

test("resynthesis cards retain the compact three-column Blacksmith layout", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /v1\.7\.1 Resynthesis Alpha 1/);
  assert.match(css, /blacksmith-view-switch \{ grid-template-columns: repeat\(3/);
  assert.match(css, /resynthesis-grid/);
  assert.match(css, /resynthesis-recovery-list/);
});
