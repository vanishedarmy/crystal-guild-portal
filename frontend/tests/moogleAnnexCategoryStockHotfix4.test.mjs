import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shop = fs.readFileSync(new URL("../src/player/MoogleEmporium.jsx", import.meta.url), "utf8");
const fellowship = fs.readFileSync(new URL("../src/pages/FellowshipPage.jsx", import.meta.url), "utf8");

test("Moogle Annex exposes fixed category stock bonuses", () => {
  assert.match(shop, /annexUnlocked \? 21 : 9/);
  assert.match(shop, /\+2 Weapons · \+4 Armor & Accessories · \+6 Items/);
  assert.match(fellowship, /\+2 Weapons, \+4 Armor & Accessories, \+6 Items per rotation/);
});
