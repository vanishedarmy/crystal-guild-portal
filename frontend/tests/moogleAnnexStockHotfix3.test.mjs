import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Moogle Annex stock contract follows the current fixed category expansion", async () => {
  const shop = await readFile(new URL("player/MoogleEmporium.jsx", SRC), "utf8");
  const fellowship = await readFile(new URL("pages/FellowshipPage.jsx", SRC), "utf8");
  assert.match(shop, /annexUnlocked \? 21 : 9/);
  assert.match(shop, /Fixed Annex stock bonus: \+2 Weapons · \+4 Armor & Accessories · \+6 Items/);
  assert.match(shop, /Construct the Annex to add \+2 Weapons, \+4 Armor & Accessories, and \+6 Items/);
  assert.match(fellowship, /\+2 Weapons, \+4 Armor & Accessories, \+6 Items per rotation/);
  assert.match(fellowship, /fixed \+2 Weapons, \+4 Armor & Accessories, \+6 Items stock bonuses/);
});
