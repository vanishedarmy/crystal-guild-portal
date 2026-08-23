import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Equipment & Inventory surfaces a dedicated current-loadout summary and prioritizes equipped gear", async () => {
  const inventory = await readFile(new URL("player/Inventory.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(inventory, /Current Loadout/);
  assert.match(inventory, /Equipped right now/);
  assert.match(inventory, /current-loadout-grid/);
  assert.match(inventory, /inventory-equipped-chip/);
  assert.match(inventory, /Number\(Boolean\(right\?\.equipped\)\) - Number\(Boolean\(left\?\.equipped\)\)/);
  assert.match(css, /\.current-loadout-summary\s*\{/);
  assert.match(css, /\.inventory-action-card\.is-equipped/);
});

test("mobile site header hides on downward scroll and reliably returns on upward scroll", async () => {
  const header = await readFile(new URL("components/SiteHeader.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.ok(header.includes('window.matchMedia("(max-width: 720px)")'));
  assert.match(header, /delta > 8/);
  assert.match(header, /delta < 0/);
  assert.match(header, /nextY <= 72/);
  assert.match(header, /mobile-header-collapsed/);
  assert.match(css, /\.site-header\.mobile-header-collapsed\s*\{/);
  assert.match(css, /translateY\(calc\(-100% - 2px\)\)/);
});
