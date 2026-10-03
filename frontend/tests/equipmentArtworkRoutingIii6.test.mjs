import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "public/guide-data.json"), "utf8"));
const exists = (art) => art && fs.existsSync(path.join(root, "public", art));

test("all live armor and accessories avoid retired Phase II family/tier artwork", () => {
  const items = data.items.filter((item) => ["armor", "accessory"].includes(item.type));
  assert.equal(items.length, 103);
  for (const item of items) {
    const art = itemArtworkPath(item);
    assert.ok(art, `missing art for ${item.id}`);
    assert.ok(exists(art), `missing file for ${item.id} -> ${art}`);
    assert.doesNotMatch(art, /retro-phase-ii\/(?:accessory-families-v2|armor-tiers-v2)/, `${item.id} still uses retired art`);
  }
});

test("refreshed equipment family art uses cache-busting Retro Phase III paths", () => {
  const cases = [
    [{ id: "hermes_sandals", type: "accessory", min_level: 10 }, "/retro-phase-iii/equipment-families-v1/boots_t2.webp"],
    [{ id: "magic_ring", type: "accessory", min_level: 10 }, "/retro-phase-iii/equipment-families-v1/ring_t2.webp"],
    [{ id: "ribbon", type: "accessory", min_level: 25 }, "/retro-phase-iii/equipment-families-v1/belt_t4.webp"],
    [{ id: "chain_mail", type: "armor", gear_family: "heavy", min_level: 1 }, "/retro-phase-iii/equipment-families-v1/armor_style_t2.webp"],
    [{ id: "black_robe", type: "armor", gear_family: "robe", min_level: 25 }, "/retro-phase-iii/equipment-families-v1/armor_style_t5.webp"],
    [{ id: "white_robe", type: "armor", gear_family: "robe", min_level: 25 }, "/retro-phase-iii/equipment-families-v1/armor_style_t4.webp"],
  ];
  for (const [item, expected] of cases) assert.equal(itemArtworkPath(item), expected);
});
