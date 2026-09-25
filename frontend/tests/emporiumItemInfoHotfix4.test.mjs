import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const shop = fs.readFileSync(new URL("../src/player/MoogleEmporium.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");

test("Emporium Hotfix 4 shows compact usable-item purpose copy in Buy and Sell views", () => {
  assert.match(shop, /formatItemUse/);
  assert.match(shop, /function shopItemPurpose\(item\)/);
  assert.match(shop, /className="moogle-item-brief">\{shopItemPurpose\(item\)\}/);
  assert.match(shop, /<small className="moogle-item-brief">\{shopItemPurpose\(item\)\}<\/small>/);
  assert.match(css, /v1\.7\.1 Alpha 2 Hotfix 4 — compact Emporium item-purpose copy/);
  assert.match(css, /-webkit-line-clamp:\s*2/);
});
