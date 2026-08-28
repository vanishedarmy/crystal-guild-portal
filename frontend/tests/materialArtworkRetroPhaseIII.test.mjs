import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "public/guide-data.json"), "utf8"));

const verified = [
  "wolf_fang",
  "cactuar_needle",
  "bone_chip",
  "fish_scale",
  "coeurl_whisker",
  "chimera_scale",
  "malboro_tendril",
  "behemoth_horn",
  "bomb_kings_fuse",
  "morbol_bulb",
  "antlion_mandible",
  "sandworm_fang",
  "garuda_feather",
  "death_claw_pincer",
  "dragon_fang",
  "ultros_tentacle",
  "demon_wall_fragment",
  "deathgaze_plume",
  "earth_harp",
  "desert_rose",
  "triple_chimera_fang",
  "dragon_scale",
  "ancient_cloth",
  "celestial_thread",
  "imp_wing",
  "cockatrice_pinion",
  "ochu_vine",
  "basilisk_eye",
  "lamia_scale",
  "mindflayer_tentacle",
  "nemesis_mark",
  "yiazmat_scale",
  "kaiser_scale",
  "long_gui_plate",
  "ahriman_lens",
  "morbol_spore",
  "magitek_capacitor",
  "behemoth_hide",
  "chocobo_writ",
];

test("Retro Phase III verified material artwork is packaged as 39 normalized PNGs", () => {
  const dir = path.join(root, "public/retro-phase-iii/material-icons-v1");
  const files = fs.readdirSync(dir).filter((n) => n.endsWith(".png"));
  assert.equal(files.length, 39);
  for (const id of verified) {
    const file = path.join(dir, `${id}.png`);
    assert.ok(fs.existsSync(file), `missing ${id}`);
    const b = fs.readFileSync(file);
    assert.deepEqual([...b.subarray(0, 8)], [137,80,78,71,13,10,26,10]);
    assert.equal(b.readUInt32BE(16), 512);
    assert.equal(b.readUInt32BE(20), 512);
    assert.equal(itemArtworkPath({ id, type: "material" }), `/retro-phase-iii/material-icons-v1/${id}.png`);
  }
});

test("Retro Phase III material coverage is complete with no broken paths", () => {
  const materials = data.items.filter((item) => item.type === "material");
  const resolved = materials.filter((item) => itemArtworkPath(item));
  assert.equal(materials.length, 84);
  assert.equal(resolved.length, 84);
  assert.equal(materials.length - resolved.length, 0);
  for (const item of resolved) {
    const art = itemArtworkPath(item);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `${item.id} -> ${art}`);
  }
});
