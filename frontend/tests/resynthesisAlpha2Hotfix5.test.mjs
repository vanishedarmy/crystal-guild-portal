import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const inventory = fs.readFileSync(new URL("../src/player/Inventory.jsx", import.meta.url), "utf8");
const overview = fs.readFileSync(new URL("../src/player/Overview.jsx", import.meta.url), "utf8");
const shop = fs.readFileSync(new URL("../src/player/MoogleEmporium.jsx", import.meta.url), "utf8");
const detail = fs.readFileSync(new URL("../src/components/DetailDialog.jsx", import.meta.url), "utf8");
const streamer = fs.readFileSync(new URL("../src/pages/StreamerDashboard.jsx", import.meta.url), "utf8");
const hunts = fs.readFileSync(new URL("../src/player/Hunts.jsx", import.meta.url), "utf8");
const formatters = fs.readFileSync(new URL("../src/utils/formatters.js", import.meta.url), "utf8");
const portalCss = fs.readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");
const streamerCss = fs.readFileSync(new URL("../src/styles/streamer.css", import.meta.url), "utf8");

test("Hotfix 5 adds favorite gear and keeps held gear level-first", () => {
  assert.match(inventory, /GEAR_FAVORITES_KEY_PREFIX/);
  assert.match(inventory, /localStorage/);
  assert.match(inventory, />Favorites /);
  assert.match(inventory, /gear-favorite-button/);
  assert.match(inventory, /favoriteIds/);
  assert.match(inventory, /compareGearByLevel/);
  assert.match(inventory, /itemLevel\(right\) - itemLevel\(left\)/);
  assert.match(inventory, /Lv\. \$\{number\(itemLevel\(item\)\)\}/);
  assert.match(portalCss, /inventory-view-tabs/);
  assert.match(portalCss, /inventory-favorites-panel/);
});

test("Hotfix 5 removes named replacement copy and recommends equipment Jobs best-first", () => {
  assert.doesNotMatch(inventory, /Replaces:/);
  assert.doesNotMatch(shop, /Vs\. \{current\.name\}/);
  assert.match(shop, /Compared with current/);
  assert.match(formatters, /Best:/);
  assert.match(formatters, /Also:/);
  assert.match(inventory, /formatBestUse\(item\)/);
  assert.match(overview, /formatBestUse\(item\)/);
  assert.match(shop, /formatBestUse\(item\)/);
  assert.match(detail, /formatBestUse\(item\)/);
  assert.match(detail, /Best Use/);
  assert.match(detail, /Item Level/);
});

test("Hotfix 5 makes the player and streamer Recent Activity panels collapsible", () => {
  assert.match(overview, /<details className="panel span-12 overview-recent-activity"/);
  assert.match(overview, /<DetailsPointer \/>/);
  assert.match(streamer, /streamer-collapsible-ledger/);
  assert.match(streamer, /<DetailsPointer \/>/);
  assert.match(portalCss, /overview-recent-activity > summary/);
  assert.match(streamerCss, /streamer-collapsible-ledger > summary/);
});


test("Hotfix 5 extends Best use priority to armor across inventory, loadout, detail, and Emporium buy/sell", () => {
  assert.match(formatters, /export function formatBestUse/);
  assert.match(inventory, /\["weapon", "armor"\]\.includes\(rawType\)/);
  assert.match(inventory, /\["weapon", "armor"\]\.includes\(slot\)/);
  assert.match(overview, /\["weapon", "armor"\]\.includes/);
  assert.match(detail, /\["weapon", "armor"\]\.includes\(itemType\)/);
  assert.ok((shop.match(/\["weapon", "armor"\]\.includes/g) || []).length >= 2);
  assert.match(shop, /formatBestUse\(item\)/);
  assert.doesNotMatch(shop, /Jobs: \{item\.allowed_jobs\.join/);
});

test("Hotfix 5 final UI corrections keep gear cards compact, stars icon-only, and Rally odds authoritative", () => {
  assert.match(portalCss, /inventory-equipment-grid/);
  assert.match(portalCss, /minmax\(min\(100%,320px\),1fr\)/);
  assert.match(portalCss, /gear-favorite-button \{ width:38px/);
  assert.match(inventory, /\{isFavorite \? "★" : "☆"\}/);
  assert.doesNotMatch(inventory, /★ Favorited|☆ Favorite/);
  assert.match(hunts, /100% Encounter \/ 0% Treasure Chest/);
  assert.doesNotMatch(hunts, /70 \/ 30/);
  assert.match(hunts, /\{soloEncounterChance\} \/ \{soloTreasureChance\}/);
});
