import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const artDir = path.join(root, "public/retro-phase-iii/weapon-icons-v2");

const waves = {
  r11: [
    "leather_whip", "spiked_chain", "thorn_whip", "flame_whip", "frost_whip",
    "lightning_whip", "venom_whip", "royal_flail", "morning_star", "dragonfire_whip",
  ],
  r12: [
    "copper_pistol", "iron_pistol", "flintlock_pistol", "steel_revolver", "mythril_revolver",
    "mythril_musket", "magitek_pistol", "cerulean_rifle", "machina_repeater", "magitek_hand_cannon",
  ],
  r13: [
    "arcane_grimoire", "enchanted_grimoire", "rubybound_grimoire", "frostbound_grimoire", "inferno_grimoire",
    "stormbound_grimoire", "holy_grimoire", "shadow_grimoire", "starfall_grimoire", "astral_grimoire",
  ],
};

function webpInfo(file) {
  const b = fs.readFileSync(file);
  assert.equal(b.subarray(0, 4).toString("ascii"), "RIFF", `${file} RIFF signature`);
  assert.equal(b.subarray(8, 12).toString("ascii"), "WEBP", `${file} WebP signature`);
  assert.equal(b.subarray(12, 16).toString("ascii"), "VP8L", `${file} lossless WebP chunk`);
  assert.equal(b[20], 0x2f, `${file} VP8L signature`);
  const bits = b.readUInt32LE(21);
  return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1, alpha: (bits >>> 28) & 1 };
}

test("Retro Phase III consolidates CG-GEAR-R01 through R18 into one 180-file gear library", () => {
  const files = fs.readdirSync(artDir).filter((name) => name.endsWith(".webp")).sort();
  assert.equal(files.length, 180);
  for (const ids of Object.values(waves)) {
    for (const id of ids) assert.ok(files.includes(`${id}.webp`), `${id}.webp present`);
  }
  assert.ok(files.includes("iron_sword.webp"));
  assert.ok(files.includes("apollo_harp.webp"));
});

test("CG-GEAR-R11 through R13 are separate 512x512 lossless WebP assets", () => {
  for (const ids of Object.values(waves)) {
    for (const id of ids) {
      const info = webpInfo(path.join(artDir, `${id}.webp`));
      assert.equal(info.width, 512, `${id} width`);
      assert.equal(info.height, 512, `${id} height`);
      assert.equal(info.alpha, 1, `${id} alpha`);
    }
  }
});

test("Retro Phase III maps R11 live and future identities to named artwork", () => {
  assert.equal(itemArtworkPath({ id:"morbol_lash", type:"weapon" }), "/retro-phase-iii/weapon-icons-v2/venom_whip.webp");
  assert.equal(itemArtworkPath({ id:"dragonfire_whip", type:"weapon" }), "/retro-phase-iii/weapon-icons-v2/dragonfire_whip.webp");
});

test("Retro Phase III replaces shared firearm placeholders with exact R12 artwork", () => {
  const cases = new Map([
    ["copper_pistol","copper_pistol.webp"],
    ["iron_pistol","iron_pistol.webp"],
    ["flintlock_pistol","flintlock_pistol.webp"],
    ["steel_revolver","steel_revolver.webp"],
    ["mythril_revolver","mythril_revolver.webp"],
    ["mythril_musket","mythril_musket.webp"],
    ["magitek_pistol","magitek_pistol.webp"],
    ["cerulean_rifle","cerulean_rifle.webp"],
    ["machina_repeater","machina_repeater.webp"],
    ["magitek_cannon","magitek_hand_cannon.webp"],
  ]);
  for (const [id,file] of cases) {
    assert.equal(itemArtworkPath({ id, type:"weapon" }), `/retro-phase-iii/weapon-icons-v2/${file}`, id);
  }
});

test("Retro Phase III packages direct R13 grimoire identities for caster expansion", () => {
  for (const id of waves.r13) {
    assert.equal(itemArtworkPath({ id, type:"weapon" }), `/retro-phase-iii/weapon-icons-v2/${id}.webp`);
  }
});

test("unmapped weapon identities use the regenerated Retro Phase III family WebP fallbacks", () => {
  const axe = itemArtworkPath({ id:"adamant_axe", name:"Adamant Axe", type:"weapon", min_level:30, gear_family:"axe" });
  const wand = itemArtworkPath({ id:"unknown_wand", name:"Unknown Wand", type:"weapon", min_level:30, gear_family:"wand" });
  assert.equal(axe, "/retro-phase-iii/weapon-families-v1/axe.webp");
  assert.equal(wand, "/retro-phase-iii/weapon-families-v1/wand.webp");
  assert.ok(fs.existsSync(path.join(root, "public", axe)));
  assert.ok(fs.existsSync(path.join(root, "public", wand)));
  assert.equal(fs.existsSync(path.join(root, "public/retro-phase-ii/weapon-families-v2")), false);
  assert.equal(fs.existsSync(path.join(root, "public/retro-phase-ii/weapon-tiers-v2")), false);
});
