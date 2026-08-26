import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "public/guide-data.json"), "utf8"));
const source = fs.readFileSync(path.join(root, "src/utils/itemArtwork.js"), "utf8");

const generatedMaterialIds = [
  "bomb_fragment", "iron_ore", "mythril_ore", "adamantite", "ancient_coin", "elemental_crystal",
  "wyvern_scale", "demon_horn", "tonberry_lantern", "dragon_heart", "holy_scale", "mimic_lock",
  "archon_shard", "dark_matter", "omega_core", "shinryu_scale",
];

test("ii35 uses regenerated item and material artwork paths", () => {
  assert.match(source, /item-icons-v2/);
  assert.match(source, /item-materials-v3/);
  assert.doesNotMatch(source, /item-icons-v1/);
  const itemFiles = fs.readdirSync(path.join(root, "public/retro-phase-ii/item-icons-v2")).filter((n) => n.endsWith(".webp"));
  const materialFiles = fs.readdirSync(path.join(root, "public/retro-phase-ii/item-materials-v3")).filter((n) => n.endsWith(".webp"));
  assert.equal(itemFiles.length, 32);
  assert.equal(materialFiles.length, 31);
});

test("ii35 canonical consumables resolve to regenerated item artwork", () => {
  const consumables = data.items.filter((entry) => entry.type === "consumable");
  assert.equal(consumables.length, 32);
  for (const item of consumables) {
    const art = itemArtworkPath(item);
    assert.match(art, /item-icons-v2\//, `${item.id} should use v2 item art`);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing ${item.id}: ${art}`);
  }
});

test("ii35 dedicated generated material identities override generic material families", () => {
  for (const id of generatedMaterialIds) {
    const item = data.items.find((entry) => entry.id === id);
    assert.ok(item, `missing live material ${id}`);
    const art = itemArtworkPath(item);
    assert.equal(art, `/retro-phase-ii/item-materials-v3/${id}.webp`);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing generated material art ${id}`);
  }
});

test("ii35 keeps existing Phase 2 equipment family artwork intact", () => {
  for (const item of data.items.filter((entry) => ["weapon", "armor", "accessory"].includes(entry.type))) {
    const art = itemArtworkPath(item);
    assert.ok(art, `missing art path: ${item.id}`);
    assert.match(art, /-v2\//, `expected existing Phase 2 path for ${item.id}: ${art}`);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing packaged art: ${item.id} -> ${art}`);
  }
});
