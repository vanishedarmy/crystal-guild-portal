import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ITEM_ART_IDS, itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "public/guide-data.json"), "utf8"));
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("all 33 canonical consumables have packaged Phase 1 artwork", () => {
  const consumables = data.items.filter((item) => item.type === "consumable");
  assert.equal(consumables.length, 33);
  assert.equal(ITEM_ART_IDS.size, 33);
  for (const item of consumables) {
    const art = itemArtworkPath(item);
    assert.ok(art, `missing artwork mapping: ${item.id}`);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing artwork file: ${item.id}`);
  }
});

test("consumable artwork is wired into recovery, inventory, Emporium, details, and Player Guide", () => {
  assert.match(read("src/player/Inventory.jsx"), /recovery-item-artwork/);
  assert.match(read("src/player/Inventory.jsx"), /inventory-item-artwork/);
  assert.match(read("src/player/MoogleEmporium.jsx"), /moogle-item-artwork/);
  assert.match(read("src/components/DetailDialog.jsx"), /detail-item-artwork/);
  assert.match(read("src/guide/guideRuntime.js"), /itemArtworkPath/);
});
