import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const artDir = path.join(root, "public/retro-phase-iii/weapon-icons-v1");

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

function pngInfo(file) {
  const b = fs.readFileSync(file);
  assert.deepEqual([...b.subarray(0, 8)], [137,80,78,71,13,10,26,10], `${file} PNG signature`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), colorType: b[25] };
}

test("Retro Phase III consolidates CG-GEAR-R01 through R18 into one 180-file gear library", () => {
  const files = fs.readdirSync(artDir).filter((name) => name.endsWith(".png")).sort();
  assert.equal(files.length, 180);
  for (const ids of Object.values(waves)) {
    for (const id of ids) assert.ok(files.includes(`${id}.png`), `${id}.png present`);
  }
  assert.ok(files.includes("iron_sword.png"));
  assert.ok(files.includes("apollo_harp.png"));
});

test("CG-GEAR-R11 through R13 are separate 512x512 RGBA PNG assets", () => {
  for (const ids of Object.values(waves)) {
    for (const id of ids) {
      const info = pngInfo(path.join(artDir, `${id}.png`));
      assert.equal(info.width, 512, `${id} width`);
      assert.equal(info.height, 512, `${id} height`);
      assert.equal(info.colorType, 6, `${id} RGBA`);
    }
  }
});

test("Retro Phase III maps R11 live and future identities to named artwork", () => {
  assert.equal(itemArtworkPath({ id:"morbol_lash", type:"weapon" }), "/retro-phase-iii/weapon-icons-v1/venom_whip.png");
  assert.equal(itemArtworkPath({ id:"dragonfire_whip", type:"weapon" }), "/retro-phase-iii/weapon-icons-v1/dragonfire_whip.png");
});

test("Retro Phase III replaces shared firearm placeholders with exact R12 artwork", () => {
  const cases = new Map([
    ["copper_pistol","copper_pistol.png"],
    ["iron_pistol","iron_pistol.png"],
    ["flintlock_pistol","flintlock_pistol.png"],
    ["steel_revolver","steel_revolver.png"],
    ["mythril_revolver","mythril_revolver.png"],
    ["mythril_musket","mythril_musket.png"],
    ["magitek_pistol","magitek_pistol.png"],
    ["cerulean_rifle","cerulean_rifle.png"],
    ["machina_repeater","machina_repeater.png"],
    ["magitek_cannon","magitek_hand_cannon.png"],
  ]);
  for (const [id,file] of cases) {
    assert.equal(itemArtworkPath({ id, type:"weapon" }), `/retro-phase-iii/weapon-icons-v1/${file}`, id);
  }
});

test("Retro Phase III packages direct R13 grimoire identities for caster expansion", () => {
  for (const id of waves.r13) {
    assert.equal(itemArtworkPath({ id, type:"weapon" }), `/retro-phase-iii/weapon-icons-v1/${id}.png`);
  }
});

test("unmapped weapon identities use the regenerated Retro Phase III family PNG fallbacks", () => {
  const axe = itemArtworkPath({ id:"adamant_axe", name:"Adamant Axe", type:"weapon", min_level:30, gear_family:"axe" });
  const wand = itemArtworkPath({ id:"unknown_wand", name:"Unknown Wand", type:"weapon", min_level:30, gear_family:"wand" });
  assert.equal(axe, "/retro-phase-iii/weapon-families-v1/axe.png");
  assert.equal(wand, "/retro-phase-iii/weapon-families-v1/wand.png");
  assert.ok(fs.existsSync(path.join(root, "public", axe)));
  assert.ok(fs.existsSync(path.join(root, "public", wand)));
  assert.equal(fs.existsSync(path.join(root, "public/retro-phase-ii/weapon-families-v2")), false);
  assert.equal(fs.existsSync(path.join(root, "public/retro-phase-ii/weapon-tiers-v2")), false);
});
