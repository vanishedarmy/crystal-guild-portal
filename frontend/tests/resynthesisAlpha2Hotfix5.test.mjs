import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const inventory = fs.readFileSync(new URL("../src/player/Inventory.jsx", import.meta.url), "utf8");
const overview = fs.readFileSync(new URL("../src/player/Overview.jsx", import.meta.url), "utf8");
const shop = fs.readFileSync(new URL("../src/player/MoogleEmporium.jsx", import.meta.url), "utf8");
const detail = fs.readFileSync(new URL("../src/components/DetailDialog.jsx", import.meta.url), "utf8");
const streamer = fs.readFileSync(new URL("../src/pages/StreamerDashboard.jsx", import.meta.url), "utf8");
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

test("Hotfix 5 removes named replacement copy and recommends weapon Jobs best-first", () => {
  assert.doesNotMatch(inventory, /Replaces:/);
  assert.doesNotMatch(shop, /Vs\. \{current\.name\}/);
  assert.match(shop, /Compared with current/);
  assert.match(inventory, /Best:/);
  assert.match(inventory, /Also:/);
  assert.match(overview, /Best:/);
  assert.match(shop, /Best:/);
  assert.match(shop, /Also:/);
  assert.match(detail, /Best:/);
  assert.match(detail, /Recommended Jobs/);
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
