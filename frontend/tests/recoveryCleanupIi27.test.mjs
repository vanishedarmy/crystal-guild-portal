import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);

test("ii27 keeps Cinzel profile names on one line at all viewport widths", async () => {
  const css = await readFile(new URL("styles/character-identity.css", SRC), "utf8");
  assert.match(css, /ii27 — Cinzel profile-name fit \/ no-wrap hotfix/);
  assert.match(css, /\.profile-identity \.display-name[\s\S]*?white-space:\s*nowrap/);
  assert.match(css, /\.profile-identity \.display-name[\s\S]*?text-overflow:\s*ellipsis/);
  assert.match(css, /font-size:\s*clamp\(2rem,\s*4\.2vw,\s*4rem\)/);
});

test("ii27 recovery area renders only currently usable field-item buttons", async () => {
  const inventory = await readFile(new URL("player/Inventory.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(inventory, /filter\(\(item\) => item\.usable_now && item\.field_usable\)/);
  assert.match(inventory, /quickRecoveryText/);
  assert.match(inventory, /recovery-quick-action/);
  assert.doesNotMatch(inventory, /Show usable now/);
  assert.match(css, /\.recovery-quick-grid/);
});
