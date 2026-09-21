import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Moogle Annex Hotfix 3 raises completed Annex rotations to fifteen items", async () => {
  const shop = await readFile(new URL("player/MoogleEmporium.jsx", SRC), "utf8");
  const fellowship = await readFile(new URL("pages/FellowshipPage.jsx", SRC), "utf8");
  assert.match(shop, /annexUnlocked \? 15 : 9/);
  assert.match(shop, /adds six extra choices/);
  assert.match(shop, /from 9 to 15 items/);
  assert.match(fellowship, /six additional shop choices/);
  assert.match(fellowship, /from 9 to 15 items/);
});
