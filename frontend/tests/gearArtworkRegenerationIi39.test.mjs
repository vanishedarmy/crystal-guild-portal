import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const artDir = path.join(root, "public/retro-phase-ii/weapon-icons-v4");

const r03 = [
  "battle_axe", "ornate_battle_axe", "froststeel_greataxe", "mythril_crescent_axe", "ogrekiller",
  "runic_frostfire_axe", "steel_warhammer", "mythril_hammer", "earthshaker_hammer", "crescent_greataxe",
];
const r04 = [
  "spear", "javelin", "mythril_spear", "trident", "partisan",
  "ice_lance", "holy_lance", "dragon_lance", "gungnir", "longinus",
];

function pngInfo(file) {
  const b = fs.readFileSync(file);
  assert.deepEqual([...b.subarray(0, 8)], [137,80,78,71,13,10,26,10], `${file} PNG signature`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), colorType: b[25] };
}

test("ii39 packages CG-GEAR-R03 and R04 into the 40-file named weapon library", () => {
  const files = fs.readdirSync(artDir).filter((name) => name.endsWith(".png")).sort();
  assert.equal(files.length, 40);
  for (const id of [...r03, ...r04]) assert.ok(files.includes(`${id}.png`), `${id}.png present`);
});

test("ii39 R03/R04 files are 512x512 RGBA PNG assets", () => {
  for (const id of [...r03, ...r04]) {
    const info = pngInfo(path.join(artDir, `${id}.png`));
    assert.equal(info.width, 512, `${id} width`);
    assert.equal(info.height, 512, `${id} height`);
    assert.equal(info.colorType, 6, `${id} RGBA`);
  }
});

test("ii39 maps current axe catalog equivalents to R03 identities", () => {
  const cases = new Map([
    ["hunters_axe", "battle_axe.png"],
    ["bronze_waraxe", "ornate_battle_axe.png"],
    ["iron_waraxe", "froststeel_greataxe.png"],
    ["steel_greataxe", "crescent_greataxe.png"],
    ["mythril_greataxe", "mythril_crescent_axe.png"],
    ["rune_axe", "runic_frostfire_axe.png"],
    ["ogre_cleaver", "ogrekiller.png"],
  ]);
  for (const [id, file] of cases) {
    assert.equal(itemArtworkPath({ id, type: "weapon" }), `/retro-phase-ii/weapon-icons-v4/${file}`, id);
  }
});

test("ii39 maps current spear catalog equivalents to R04 identities", () => {
  const cases = new Map([
    ["training_spear", "spear.png"],
    ["mythril_lance", "mythril_spear.png"],
    ["coral_trident", "trident.png"],
    ["partisan", "partisan.png"],
    ["holy_lance", "holy_lance.png"],
    ["dragon_lance", "dragon_lance.png"],
    ["gungnir_fragment", "gungnir.png"],
  ]);
  for (const [id, file] of cases) {
    assert.equal(itemArtworkPath({ id, type: "weapon" }), `/retro-phase-ii/weapon-icons-v4/${file}`, id);
  }
});
