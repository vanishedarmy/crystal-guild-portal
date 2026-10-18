import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Moogle Annex preserves regional stock and adds a discount", async () => {
  const shop = await readFile(new URL("player/MoogleEmporium.jsx", SRC), "utf8");
  const fellowship = await readFile(new URL("pages/FellowshipPage.jsx", SRC), "utf8");
  assert.match(shop, /annexUnlocked && regionalModel/);
  assert.match(shop, /10% off regional counter purchases/);
  assert.match(shop, /Regional stock is available before construction/);
  assert.match(fellowship, /Moogle Emporium Annex/);
  assert.match(fellowship, /discount/i);
});
