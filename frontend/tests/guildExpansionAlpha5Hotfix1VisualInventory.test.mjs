import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const inventory = fs.readFileSync(new URL("../src/player/Inventory.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");
const manifest = JSON.parse(fs.readFileSync(new URL("../../SCENE_BACKGROUND_MANIFEST.json", import.meta.url), "utf8"));
const version = fs.readFileSync(new URL("../src/version.js", import.meta.url), "utf8");

test("Alpha 5 Hotfix 1 routes the portrait Founding Hall scene", () => {
  const scene = manifest.scene_backgrounds.find((item) => item.file === "founding_hall.webp");
  assert.ok(scene);
  assert.equal(scene.path, "/retro-phase-iii/scene-backgrounds-v4/founding_hall.webp");
  assert.equal(scene.width, 941);
  assert.equal(scene.height, 1672);
  assert.equal(scene.format, "portrait");
  assert.match(css, /\.fellowship-legacy\.legacy-stage-1::after[\s\S]*scene-backgrounds-v4\/founding_hall\.webp/);
  assert.match(css, /center top \/ cover no-repeat/);
});

test("Equipment inventory groups are independently collapsible and remembered", () => {
  assert.match(inventory, /INVENTORY_GROUP_STATE_KEY = "crystal-guild:inventory-groups:v1"/);
  assert.match(inventory, /aria-expanded=\{isOpen\}/);
  assert.match(inventory, /aria-controls=\{contentId\}/);
  assert.match(inventory, /hidden=\{!isOpen\}/);
  assert.match(inventory, /localStorage\?\.setItem\(INVENTORY_GROUP_STATE_KEY/);
  assert.match(inventory, /item: "Consumables"/);
  for (const group of ["weapon", "armor", "accessory", "item", "material"]) assert.match(inventory, new RegExp(`\\b${group}\\b`));
  assert.match(css, /\.inventory-group-toggle/);
  assert.match(css, /min-height: 44px/);
});

test("Alpha 5 Hotfix 1 uses a cache-busted frontend revision", () => {
  assert.match(version, /WEB_ASSET_REVISION = "1\.5\.0-trails-raids-b2"/);
  assert.equal(manifest.frontend_asset_revision, "1.5.0-trails-raids-b2");
});
