import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const artDir = path.join(root, "public/retro-phase-ii/weapon-icons-v5");
const expected = [
  "iron_sword", "steel_sword", "mythril_sword", "flametongue", "icebrand",
  "coral_sword", "blood_sword", "defender", "excalibur", "ragnarok",
  "knife", "dagger", "mythril_knife", "mage_masher", "poison_fang",
  "main_gauche", "assassins_dagger", "rapier", "rune_blade", "ultima_blade",
];

function pngInfo(file) {
  const b = fs.readFileSync(file);
  assert.deepEqual([...b.subarray(0, 8)], [137,80,78,71,13,10,26,10], `${file} PNG signature`);
  return {
    width: b.readUInt32BE(16),
    height: b.readUInt32BE(20),
    colorType: b[25],
  };
}

test("ii40 preserves CG-GEAR-R01 and R02 as separate 512x512 RGBA PNGs", () => {
  const files = fs.readdirSync(artDir).filter((name) => name.endsWith(".png")).sort();
  assert.ok(files.length >= 20);
  for (const file of expected.map((id) => `${id}.png`)) {
    assert.ok(files.includes(file), `${file} preserved in v5`);
  }
  for (const file of expected.map((id) => `${id}.png`)) {
    const info = pngInfo(path.join(artDir, file));
    assert.equal(info.width, 512, `${file} width`);
    assert.equal(info.height, 512, `${file} height`);
    assert.equal(info.colorType, 6, `${file} must retain RGBA transparency`);
  }
});

test("ii40 preserves direct R01/R02 weapon identities", () => {
  const cases = new Map([
    ["iron_blade", "iron_sword.png"],
    ["steel_longsword", "steel_sword.png"],
    ["mythril_sword", "mythril_sword.png"],
    ["flame_tongue", "flametongue.png"],
    ["icebrand", "icebrand.png"],
    ["coral_sword", "coral_sword.png"],
    ["blood_sword", "blood_sword.png"],
    ["defender_blade", "defender.png"],
    ["excalibur_dormant", "excalibur.png"],
    ["excalibur_awakened", "excalibur.png"],
    ["excalibur_zenith", "excalibur.png"],
    ["bronze_dagger", "dagger.png"],
    ["mythril_dagger", "mythril_knife.png"],
    ["mage_masher", "mage_masher.png"],
    ["poison_fang", "poison_fang.png"],
    ["assassins_dagger", "assassins_dagger.png"],
    ["copper_rapier", "rapier.png"],
    ["rune_blade", "rune_blade.png"],
  ]);
  for (const [id, file] of cases) {
    assert.equal(itemArtworkPath({ id, type: "weapon" }), `/retro-phase-ii/weapon-icons-v5/${file}`, id);
  }
});

test("ii40 preserves planned R01/R02 direct artwork identities", () => {
  for (const id of ["iron_sword", "steel_sword", "excalibur", "ragnarok", "knife", "main_gauche", "ultima_blade"]) {
    const art = itemArtworkPath({ id, type: "weapon" });
    assert.match(art, /^\/retro-phase-ii\/weapon-icons-v5\/.+\.png$/);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `${id} asset exists`);
  }
});

test("unregenerated weapons continue using the existing shared equipment art", () => {
  const art = itemArtworkPath({ id: "adamant_axe", name: "Adamant Axe", type: "weapon", min_level: 30, gear_family: "axe" });
  assert.equal(art, "/retro-phase-ii/weapon-tiers-v2/axe_t4.webp");
  assert.ok(fs.existsSync(path.join(root, "public", art)));
});
