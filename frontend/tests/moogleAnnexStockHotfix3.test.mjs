import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Moogle counter uses Bot-provided regional stock and Guild price discount", async () => {
  const shop = await readFile(new URL("player/MoogleEmporium.jsx", SRC), "utf8");
  const fellowship = await readFile(new URL("pages/FellowshipPage.jsx", SRC), "utf8");
  const guide = await readFile(new URL("guide-body.html", new URL("../public/", import.meta.url)), "utf8");
  assert.match(shop, /const stockSlots = Number\(shop\?\.stock_slots \|\| 12\)/);
  assert.match(shop, /displayedStock\.length/);
  assert.match(shop, /discount/);
  assert.match(fellowship, /Construction grants 10% off every regional counter/);
  assert.match(guide, /stock capacity depends on the region/);
});
