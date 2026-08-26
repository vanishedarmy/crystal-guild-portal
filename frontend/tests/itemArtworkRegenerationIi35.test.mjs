import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "public/guide-data.json"), "utf8"));
const source = fs.readFileSync(path.join(root, "src/utils/itemArtwork.js"), "utf8");

const generatedMaterialIds = [
  "bomb_fragment", "iron_ore", "copper_ore", "bronze_ingot", "iron_ingot", "steel_ingot",
  "silver_ore", "silver_ingot", "gold_ore", "gold_ingot", "mythril_ore", "mythril_ingot",
  "darksteel_ore", "darksteel_ingot", "adamantite", "orichalcum", "crystal_ore", "crystal_ingot",
  "meteorite", "ancient_coin", "elemental_crystal", "wyvern_scale", "demon_horn", "tonberry_lantern",
  "dragon_heart", "holy_scale", "mimic_lock", "archon_shard", "dark_matter", "omega_core", "shinryu_scale",
];

test("ii36 uses individual PNG item and material artwork paths", () => {
  assert.match(source, /item-icons-v3/);
  assert.match(source, /item-materials-v4/);
  assert.match(source, /\$\{direct\}\.png/);
  const itemFiles = fs.readdirSync(path.join(root, "public/retro-phase-ii/item-icons-v3")).filter((n) => n.endsWith(".png"));
  const materialFiles = fs.readdirSync(path.join(root, "public/retro-phase-ii/item-materials-v4")).filter((n) => n.endsWith(".png"));
  assert.equal(itemFiles.length, 32);
  assert.equal(materialFiles.length, 31);
});

test("ii36 canonical consumables resolve to individual PNG artwork", () => {
  const consumables = data.items.filter((entry) => entry.type === "consumable");
  assert.equal(consumables.length, 32);
  for (const item of consumables) {
    const art = itemArtworkPath(item);
    assert.match(art, /item-icons-v3\/.+\.png$/, `${item.id} should use v3 PNG item art`);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing ${item.id}: ${art}`);
  }
});

test("ii36 R03-R06 material identities resolve to packaged individual PNG artwork", () => {
  for (const id of generatedMaterialIds) {
    const art = itemArtworkPath({ id, type: "material" });
    assert.equal(art, `/retro-phase-ii/item-materials-v4/${id}.png`);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing generated material art ${id}`);
  }
});

test("ii36 keeps existing Phase 2 equipment family artwork intact", () => {
  for (const item of data.items.filter((entry) => ["weapon", "armor", "accessory"].includes(entry.type))) {
    const art = itemArtworkPath(item);
    assert.ok(art, `missing art path: ${item.id}`);
    assert.match(art, /-v2\//, `expected existing Phase 2 path for ${item.id}: ${art}`);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing packaged art: ${item.id} -> ${art}`);
  }
});
