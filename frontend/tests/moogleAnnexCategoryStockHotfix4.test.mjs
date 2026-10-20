import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shop = fs.readFileSync(new URL("../src/player/MoogleEmporium.jsx", import.meta.url), "utf8");
const fellowship = fs.readFileSync(new URL("../src/pages/FellowshipPage.jsx", import.meta.url), "utf8");

test("Moogle Annex now discounts regional prices without changing authoritative stock slots", () => {
  assert.match(shop, /const stockSlots = Number\(shop\?\.stock_slots \|\| 12\)/);
  assert.match(shop, /annexUnlocked && regionalModel/);
  assert.match(shop, /10% off regional counter purchases/);
  assert.match(fellowship, /emporium_annex\?\.purchase_discount/);
  assert.doesNotMatch(shop, /annexUnlocked \? 21 : 9/);
});
