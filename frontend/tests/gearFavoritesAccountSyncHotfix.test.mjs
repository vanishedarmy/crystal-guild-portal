import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const inventory = fs.readFileSync(path.join(root, "src/player/Inventory.jsx"), "utf8");
const auth = fs.readFileSync(path.join(root, "src/api/auth.js"), "utf8");
const whatsNew = fs.readFileSync(path.join(root, "src/player/whatsNewData.js"), "utf8");
const hosted = fs.readFileSync(path.resolve(root, "../crystal_guild/hosted_portal.py"), "utf8");

test("gear Favorites queue an authoritative Crystal Guild player-state write", () => {
  assert.match(auth, /fetchGearFavorites/);
  assert.match(auth, /saveGearFavorites/);
  assert.match(auth, /Idempotency-Key/);
  assert.match(inventory, /waitForPortalAction/);
  assert.match(hosted, /SET_GEAR_FAVORITES/);
  assert.match(hosted, /def _authoritative_gear_favorites\(/);
  assert.match(hosted, /favorite_item_ids/);
});

test("hosted Favorites are only migration or pending state while Bot snapshot is authority", () => {
  assert.match(hosted, /Transitional hosted mirror only/);
  assert.match(hosted, /needs_authoritative_save/);
  assert.match(hosted, /source = "bot"/);
  assert.match(hosted, /value\.pop\("favorite_item_ids", None\)/);
  assert.match(inventory, /needs_authoritative_save/);
  assert.match(inventory, /LEGACY_GEAR_FAVORITES_KEY_PREFIX/);
  assert.match(inventory, /LEGACY_PENDING_GEAR_FAVORITES_KEY_PREFIX/);
  assert.match(inventory, /gear-favorites-pending:v3/);
  assert.match(inventory, /new Set\(\[\.\.\.legacyBrowser, \.\.\.legacyPending\]\)/);
});

test("cross-device refresh and rapid favorite toggles preserve latest player choice", () => {
  assert.match(inventory, /window\.setInterval\(refreshSyncedFavorites, 120000\)/);
  assert.match(inventory, /window\.addEventListener\("focus", refreshSyncedFavorites\)/);
  assert.match(inventory, /crystal-guild-live-revision/);
  assert.match(inventory, /setFavoriteIds\(\(current\) =>/);
  assert.match(inventory, /queueFavoriteSave\(next\)/);
});

test("player-facing copy documents authoritative Favorites migration", () => {
  assert.match(whatsNew, /Favorites now live in your authoritative Crystal Guild player profile/);
  assert.match(whatsNew, /schema advances to 16/);
  assert.match(whatsNew, /Portal Action protocol to 33/);
  assert.match(whatsNew, /verified pre-migration backup/);
});
