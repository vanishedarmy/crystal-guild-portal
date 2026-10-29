import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);

test("recovery quick actions show only the declared restorative effect", async () => {
  const inventory = await readFile(new URL("player/Inventory.jsx", SRC), "utf8");
  assert.match(inventory, /formatItemUse\(catalogItem\.use\)/);
  assert.doesNotMatch(inventory, /Effective now/);
  assert.doesNotMatch(inventory, /potency is fixed/i);
  assert.doesNotMatch(inventory, /item\?\.preview/);
});
