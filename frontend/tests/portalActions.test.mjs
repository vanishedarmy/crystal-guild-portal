import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Portal header exposes Twitch sign-in only when hosted auth is configured", async () => {
  const header = await readFile(new URL("components/SiteHeader.jsx", SRC), "utf8");
  assert.match(header, /auth\.configured/);
  assert.match(header, /Sign in with Twitch/);
  assert.match(header, /Sign out/);
  assert.match(header, /loginUrl\(`/);
});

test("Portal Phase 4 action client exposes character management plus equipment and Moogle mutations", async () => {
  const api = await readFile(new URL("api/auth.js", SRC), "utf8");
  for (const token of ["submitPortalPing", "EQUIP_ITEM", "UNEQUIP_SLOT", "CHARACTER_STATE", "CHANGE_JOB", "SET_STANCE", "SET_MASTERY", "CLEAR_MASTERY", "SHOP_STATE", "BUY_ITEM", "SELL_ITEM"]) {
    assert.match(api, new RegExp(token));
  }
  assert.match(api, /X-Crystal-Guild-CSRF/);
  assert.match(api, /Idempotency-Key/);
  assert.doesNotMatch(api, /COMMAND|READYALL|ATTACK|RAID_ACTION/);
});

test("Portal action controls render only on the signed-in player's own profile", async () => {
  const panel = await readFile(new URL("components/PortalLinkPanel.jsx", SRC), "utf8");
  const inventory = await readFile(new URL("player/Inventory.jsx", SRC), "utf8");
  const shop = await readFile(new URL("player/MoogleEmporium.jsx", SRC), "utf8");
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  assert.match(panel, /isOwnProfile/);
  assert.match(panel, /if \(!isOwnProfile\) return null/);
  assert.match(panel, /Crystal Guild Connection/);
  assert.match(panel, /ONLINE/);
  assert.match(panel, /OFFLINE/);
  assert.match(panel, /Check connection/);
  assert.match(panel, /action\.type === "PING"/);
  assert.doesNotMatch(panel, /Phase 3 is active|secure relay|authoritative Bot|Test secure link|Moogle Emporium stock ready|Portal link verified/);
  assert.match(inventory, /isOwnProfile/);
  assert.match(inventory, /equipmentActionsAvailable/);
  assert.match(shop, /isOwnProfile/);
  assert.match(shop, /shopActionsAvailable/);
  assert.match(profile, /<PortalLinkPanel username=\{username\}/);
});

test("Portal Phase 2 inventory retains equip, unequip, eligibility, and comparison UI", async () => {
  const inventory = await readFile(new URL("player/Inventory.jsx", SRC), "utf8");
  assert.match(inventory, /Equip/);
  assert.match(inventory, /Unequip/);
  assert.match(inventory, /equipmentDelta/);
  assert.match(inventory, /Requires Lv\./);
  assert.match(inventory, /Not usable by/);
  assert.match(inventory, /Replaces:/);
  assert.match(inventory, /Accessories/);
  assert.match(inventory, /waitForPortalAction/);
  assert.doesNotMatch(inventory, /Bot re-checks|action relay|Waiting for the Bot|still queued/);
});

test("Portal Phase 3 adds a dedicated Moogle Emporium tab with buy and collapsed sell UI", async () => {
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  const shop = await readFile(new URL("player/MoogleEmporium.jsx", SRC), "utf8");
  assert.match(profile, /Moogle Emporium/);
  assert.match(profile, /MoogleEmporium\.jsx/);
  assert.match(shop, /submitShopState/);
  assert.match(shop, /submitBuyItem/);
  assert.match(shop, /submitSellItem/);
  assert.match(shop, /Sell from Inventory/);
  assert.match(shop, /<details className="moogle-sell-disclosure">/);
  assert.match(shop, /current stock/);
  assert.match(shop, /Prices and availability are checked again before every transaction/);
  assert.doesNotMatch(shop, /authoritative Crystal Guild Bot|local Bot|action relay|still queued|synchronized with the Bot/);
  assert.doesNotMatch(shop, /!readyall|!venture|JOIN_ENCOUNTER/);
});

test("Moogle Emporium styles remain responsive without fixed-width shop grids", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /\.moogle-stock-grid/);
  assert.match(css, /repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 980px\)/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /grid-template-columns: 1fr/);
  assert.match(css, /overflow-wrap: anywhere/);
});

test("Player Guide describes Portal Moogle management without exposing internal action names", async () => {
  const body = await readFile(new URL("../public/guide-body.html", import.meta.url), "utf8");
  assert.match(body, /Portal character controls:/);
  assert.match(body, /Equipment &amp; Inventory/);
  assert.match(body, /Moogle Emporium/);
  assert.doesNotMatch(body, /EQUIP_ITEM|UNEQUIP_SLOT|CHARACTER_STATE|CHANGE_JOB|SET_STANCE|SET_MASTERY|CLEAR_MASTERY|SHOP_STATE|BUY_ITEM|SELL_ITEM|!fellowshipproject/);
});


test("Portal Phase 4 turns the Jobs tab into compact Job, stance, and Mastery management", async () => {
  const jobs = await readFile(new URL("player/Jobs.jsx", SRC), "utf8");
  for (const token of ["submitCharacterState", "submitChangeJob", "submitSetStance", "submitSetMastery", "submitClearMastery"]) {
    assert.match(jobs, new RegExp(token));
  }
  assert.match(jobs, /Jobs & Battle Style/);
  assert.match(jobs, /Character controls ready/);
  assert.match(jobs, /How to unlock/);
  assert.match(jobs, /Changing Jobs can temporarily deactivate incompatible gear/);
  assert.match(jobs, /Balanced/);
  assert.match(jobs, /Aggressive/);
  assert.match(jobs, /Defensive/);
  assert.match(jobs, /Magical/);
  assert.match(jobs, /Cautious/);
  assert.match(jobs, /Mastery Slot/);
  assert.match(jobs, /Choose a mastered Job/);
  assert.doesNotMatch(jobs, /action relay|authoritative Bot|Phase 4 is active|COMMAND|READYALL/);
});

test("Portal Phase 4 character-management layout remains fluid at narrow widths", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /\.character-summary-strip/);
  assert.match(css, /\.character-management-tabs/);
  assert.match(css, /\.stance-grid/);
  assert.match(css, /\.mastery-management-grid/);
  assert.match(css, /@media \(max-width:520px\)/);
  assert.match(css, /grid-template-columns:1fr/);
  assert.match(css, /overflow-wrap:anywhere/);
});
