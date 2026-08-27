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

function pngSize(file) {
  const b = fs.readFileSync(file);
  assert.deepEqual([...b.subarray(0, 8)], [137,80,78,71,13,10,26,10], `${file} is not PNG`);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

test("Retro Phase III keeps clean typed PNG item and material artwork directories", () => {
  assert.match(source, /item-icons-v1/);
  assert.match(source, /item-materials-v5/);
  const itemDir = path.join(root, "public/retro-phase-iii/item-icons-v1");
  const materialDir = path.join(root, "public/retro-phase-ii/item-materials-v5");
  const itemFiles = fs.readdirSync(itemDir).filter((n) => n.endsWith(".png"));
  const materialFiles = fs.readdirSync(materialDir).filter((n) => n.endsWith(".png"));
  assert.equal(itemFiles.length, 32);
  assert.equal(materialFiles.length, 31);
  for (const file of [...itemFiles.map((n)=>path.join(itemDir,n)), ...materialFiles.map((n)=>path.join(materialDir,n))]) {
    assert.deepEqual(pngSize(file), [512,512], `${file} should be normalized 512x512 PNG`);
  }
});

test("ii37 removes superseded inventory artwork directories", () => {
  for (const name of ["item-icons-v2", "item-icons-v3", "item-materials-v3", "item-materials-v4"]) {
    assert.equal(fs.existsSync(path.join(root, "public/retro-phase-ii", name)), false, `${name} should be removed`);
  }
});

test("Retro Phase III canonical consumables resolve to item-icons-v1 PNG artwork", () => {
  const consumables = data.items.filter((entry) => entry.type === "consumable");
  assert.equal(consumables.length, 32);
  for (const item of consumables) {
    const art = itemArtworkPath(item);
    assert.match(art, /item-icons-v1\/.+\.png$/, `${item.id} should use v4 PNG item art`);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing ${item.id}: ${art}`);
  }
});

test("ii37 R03-R06 material identities resolve to item-materials-v5 PNG artwork", () => {
  for (const id of generatedMaterialIds) {
    const art = itemArtworkPath({ id, type: "material" });
    assert.equal(art, `/retro-phase-ii/item-materials-v5/${id}.png`);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing generated material art ${id}`);
  }
});

test("Retro Phase III shared equipment fallbacks remain packaged after later identity overrides", () => {
  for (const item of data.items.filter((entry) => ["weapon", "armor", "accessory"].includes(entry.type))) {
    const art = itemArtworkPath(item);
    assert.ok(art, `missing art path: ${item.id}`);
    if (item.type === "weapon") {
      assert.match(art, /(?:-v2|weapon-icons-v2|weapon-families-v1|relic-weapons-v1)\//, `unexpected weapon artwork path for ${item.id}: ${art}`);
    } else {
      assert.match(art, /(?:-v2|weapon-icons-v2|weapon-families-v1|equipment-families-v1)\//, `expected packaged equipment art for ${item.id}: ${art}`);
    }
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing packaged art: ${item.id} -> ${art}`);
  }
});
