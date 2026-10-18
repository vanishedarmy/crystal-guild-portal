import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shop = fs.readFileSync(new URL("../src/player/MoogleEmporium.jsx", import.meta.url), "utf8");
const fellowship = fs.readFileSync(new URL("../src/pages/FellowshipPage.jsx", import.meta.url), "utf8");

test("Moogle Annex applies the regional-counter purchase discount", () => {
  assert.match(shop, /annexUnlocked && regionalModel/);
  assert.match(shop, /10% off regional counter purchases/);
  assert.match(fellowship, /Moogle Emporium Annex/);
});
