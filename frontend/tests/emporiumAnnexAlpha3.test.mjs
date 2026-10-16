import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Alpha 3 surfaces the Moogle Emporium Annex in shop and Fellowship UI", async () => {
  const shop = await readFile(new URL("player/MoogleEmporium.jsx", SRC), "utf8");
  const fellowship = await readFile(new URL("pages/FellowshipPage.jsx", SRC), "utf8");
  assert.match(shop, /Moogle Annex/);
  assert.match(shop, /annexUnlocked/);
  assert.match(shop, /stockSlots/);
  assert.match(shop, /10% off regional counter purchases/);
  assert.match(fellowship, /Moogle Emporium Annex/);
  assert.match(fellowship, /emporium_annex/);
  assert.match(fellowship, /facility_count \|\| 7/);
});

test("Alpha 3 Annex status stays fluid on narrow Emporium layouts", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /\.moogle-annex-status/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\) auto/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.moogle-annex-status \{ grid-template-columns: 1fr/);
  assert.match(css, /overflow-wrap: anywhere/);
});

test("Current release identity is visible in the frontend", async () => {
  const version = await readFile(new URL("version.js", SRC), "utf8");
  assert.match(version, /Queen's Blood/);
  assert.match(version, /1\.9\.7-queens-blood/);
});
