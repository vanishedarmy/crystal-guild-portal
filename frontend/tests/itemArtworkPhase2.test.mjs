import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "public/guide-data.json"), "utf8"));
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (art) => art && fs.existsSync(path.join(root, "public", art));

test("all canonical weapons and armor resolve to packaged family/tier artwork", () => {
  for (const type of ["weapon", "armor"]) {
    const items = data.items.filter((item) => item.type === type);
    assert.ok(items.length > 0);
    for (const item of items) {
      const art = itemArtworkPath(item);
      assert.ok(art, `missing ${type} artwork mapping: ${item.id}`);
      assert.ok(exists(art), `missing ${type} artwork file: ${item.id} -> ${art}`);
    }
  }
});

test("accessories use the generated shared accessory families", () => {
  const items = data.items.filter((item) => item.type === "accessory");
  assert.equal(items.length, 38);
  for (const item of items) {
    const art = itemArtworkPath(item);
    assert.ok(exists(art), `missing accessory artwork: ${item.id} -> ${art}`);
  }
});

test("ores, metals, cores, and elemental crystal materials use Phase 2 material artwork", () => {
  const materials = data.items.filter((item) => item.type === "material");
  const illustrated = materials.filter((item) => exists(itemArtworkPath(item)));
  assert.ok(illustrated.length >= 35, `expected at least 35 illustrated materials, got ${illustrated.length}`);
  for (const id of ["iron_ore", "mythril_ore", "adamantite", "crystal_shard", "glacial_crystal", "rift_crystal", "warmech_component"]) {
    const item = materials.find((entry) => entry.id === id);
    assert.ok(item && exists(itemArtworkPath(item)), `missing representative material art: ${id}`);
  }
});

test("generated shared equipment sets are packaged and Blacksmith consumes shared ItemArtwork", () => {
  const phase2Counts = new Map([
    ["material-metals-v2", 20],
    ["elemental-crystals-v2", 8],
  ]);
  for (const [folder, count] of phase2Counts) {
    const files = fs.readdirSync(path.join(root, "public/retro-phase-ii", folder)).filter((name) => name.endsWith(".webp"));
    assert.equal(files.length, count, `${folder} count`);
  }
  const equipmentDir = path.join(root, "public/retro-phase-iii/equipment-families-v1");
  const equipment = fs.readdirSync(equipmentDir).filter((name) => name.endsWith(".webp"));
  assert.equal(equipment.length, 22, "Retro Phase III equipment family PNG count");
  assert.equal(fs.existsSync(path.join(root, "public/retro-phase-ii/accessory-families-v2")), false);
  assert.equal(fs.existsSync(path.join(root, "public/retro-phase-ii/armor-tiers-v2")), false);
  const familyDir = path.join(root, "public/retro-phase-iii/weapon-families-v1");
  const families = fs.readdirSync(familyDir).filter((name) => name.endsWith(".webp"));
  assert.equal(families.length, 11, "Retro Phase III weapon family PNG count");
  assert.equal(fs.existsSync(path.join(root, "public/retro-phase-ii/weapon-families-v2")), false);
  assert.equal(fs.existsSync(path.join(root, "public/retro-phase-ii/weapon-tiers-v2")), false);
  const smith = read("src/player/Blacksmith.jsx");
  const crafting = read("src/player/CraftingWorkbench.jsx");
  const forge = read("src/player/ForgeWorkbench.jsx");
  assert.match(smith, /CraftingWorkbench/);
  assert.match(crafting, /ItemArtwork/);
  assert.match(forge, /ItemArtwork/);
  assert.match(crafting, /blacksmith-material-artwork/);
});
