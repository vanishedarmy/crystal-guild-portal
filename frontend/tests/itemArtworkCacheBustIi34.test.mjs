import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "public/guide-data.json"), "utf8"));
const source = fs.readFileSync(path.join(root, "src/utils/itemArtwork.js"), "utf8");

const phase2Folders = [
  ["material-metals-v2", 20],
  ["elemental-crystals-v2", 8],
  ["weapon-families-v2", 12],
  ["weapon-tiers-v2", 36],
  ["armor-tiers-v2", 36],
  ["accessory-families-v2", 24],
];

test("ii34 cache-bust uses new Phase 2 artwork URLs", () => {
  for (const [folder, count] of phase2Folders) {
    assert.match(source, new RegExp(folder.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")));
    const files = fs.readdirSync(path.join(root, "public/retro-phase-ii", folder)).filter((name) => name.endsWith(".webp"));
    assert.equal(files.length, count, `${folder} count`);
  }
  for (const oldFolder of ["material-metals-v1", "elemental-crystals-v1", "weapon-families-v1", "weapon-tiers-v1", "armor-tiers-v1", "accessory-families-v1"]) {
    assert.doesNotMatch(source, new RegExp(oldFolder));
  }
  assert.match(source, /item-icons-v1/);
});

test("ii34 canonical equipment resolves to v2 artwork", () => {
  for (const item of data.items.filter((entry) => ["weapon", "armor", "accessory"].includes(entry.type))) {
    const art = itemArtworkPath(item);
    assert.ok(art, `missing art path: ${item.id}`);
    assert.match(art, /-(?:v2)\//, `expected v2 shared art path for ${item.id}: ${art}`);
    assert.ok(fs.existsSync(path.join(root, "public", art)), `missing packaged art: ${item.id} -> ${art}`);
  }
});
