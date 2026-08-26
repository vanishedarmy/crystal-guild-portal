import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const artDir = path.join(root, "public/retro-phase-ii/weapon-icons-v5");

const waves = {
  r05: [
    "oak_staff", "elm_staff", "rune_staff", "silver_staff", "priests_staff",
    "fire_rod", "frost_rod", "thunder_rod", "elemental_staff", "astral_staff",
  ],
  r06: [
    "shortbow", "longbow", "great_bow", "killer_bow", "elven_bow",
    "rune_bow", "yoichi_bow", "hunting_rifle", "magitek_rifle", "artemis_bow",
  ],
  r07: [
    "ashigaru_katana", "iron_katana", "steel_katana", "osafune", "kogarasu",
    "kotetsu", "kiyomori", "genji_katana", "kiku_ichimonji", "heavens_cloud",
  ],
  r08: [
    "leather_knuckles", "brass_knuckles", "iron_knuckles", "steel_cesti", "tiger_cesti",
    "mythril_claws", "wyvern_claws", "diamond_knuckles", "demon_claws", "godhand",
  ],
  r09: [
    "ash_wand", "willow_wand", "yew_wand", "silver_wand", "rune_wand",
    "mythril_wand", "sages_wand", "crystal_wand", "starfall_wand", "stardust_wand",
  ],
  r10: [
    "travelers_harp", "maple_harp", "silver_harp", "rosewood_harp", "faerie_harp",
    "dream_harp", "siren_harp", "rune_harp", "lamia_harp", "apollo_harp",
  ],
};

function pngInfo(file) {
  const b = fs.readFileSync(file);
  assert.deepEqual([...b.subarray(0, 8)], [137,80,78,71,13,10,26,10], `${file} PNG signature`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), colorType: b[25] };
}

test("ii40 packages CG-GEAR-R05 through R10 into the 100-file named weapon library", () => {
  const files = fs.readdirSync(artDir).filter((name) => name.endsWith(".png")).sort();
  assert.equal(files.length, 100);
  for (const ids of Object.values(waves)) {
    for (const id of ids) assert.ok(files.includes(`${id}.png`), `${id}.png present`);
  }
});

test("ii40 R05-R10 assets are separate 512x512 RGBA PNGs", () => {
  for (const ids of Object.values(waves)) {
    for (const id of ids) {
      const info = pngInfo(path.join(artDir, `${id}.png`));
      assert.equal(info.width, 512, `${id} width`);
      assert.equal(info.height, 512, `${id} height`);
      assert.equal(info.colorType, 6, `${id} RGBA`);
    }
  }
});

test("ii40 maps R05 staff catalog identities to regenerated PNG artwork", () => {
  const cases = new Map([
    ["oak_staff", "oak_staff.png"], ["elm_staff", "elm_staff.png"],
    ["rune_staff", "rune_staff.png"], ["priests_staff", "priests_staff.png"],
    ["fire_rod", "fire_rod.png"], ["frost_rod", "frost_rod.png"],
    ["thunder_rod", "thunder_rod.png"], ["astral_staff", "astral_staff.png"],
  ]);
  for (const [id,file] of cases) {
    assert.equal(itemArtworkPath({ id, type:"weapon" }), `/retro-phase-ii/weapon-icons-v5/${file}`, id);
  }
});

test("ii40 maps R06-R10 live catalog equivalents to regenerated PNG artwork", () => {
  const cases = new Map([
    ["magitek_rifle", "magitek_rifle.png"], ["cerulean_rifle", "hunting_rifle.png"],
    ["ashigaru_katana", "ashigaru_katana.png"], ["kiku_ichimonji", "kiku_ichimonji.png"],
    ["heavens_cloud", "heavens_cloud.png"], ["leather_knuckles", "leather_knuckles.png"],
    ["godhand_zenith", "godhand.png"], ["ash_wand", "ash_wand.png"],
    ["crystal_wand", "crystal_wand.png"], ["travelers_harp", "travelers_harp.png"],
    ["siren_harp", "siren_harp.png"], ["apollo_harp", "apollo_harp.png"],
  ]);
  for (const [id,file] of cases) {
    assert.equal(itemArtworkPath({ id, type:"weapon" }), `/retro-phase-ii/weapon-icons-v5/${file}`, id);
  }
});
