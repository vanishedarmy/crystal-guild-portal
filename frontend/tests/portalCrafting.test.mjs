import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);

test("Portal Phase 7 exposes typed Blacksmith and Daily actions without arbitrary command relay", async () => {
  const api = await readFile(new URL("api/auth.js", SRC), "utf8");
  for (const token of [
    "CRAFTING_STATE", "CRAFT_RECIPE", "FORGE_ITEM", "RESYNTHESIZE_ITEM", "DAILY_STATE", "CLAIM_DAILY",
    "submitCraftingState", "submitCraftRecipe", "submitForgeItem", "submitResynthesizeItem", "submitDailyState", "submitClaimDaily",
  ]) assert.match(api, new RegExp(token));
  assert.doesNotMatch(api, /submit(?:ReadyAll|Attack|Raid)|submitPortalAction\(.*(?:READYALL|ATTACK|RAID_ACTION)/);
});

test("signed-in owners get a visual Blacksmith workspace with recipe, forge, and resynthesis comparisons", async () => {
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  const smith = await readFile(new URL("player/Blacksmith.jsx", SRC), "utf8");
  const recovery = await readFile(new URL("player/ResynthesisWorkbench.jsx", SRC), "utf8");
  assert.match(profile, /blacksmith: lazy/);
  assert.match(profile, /\["blacksmith", "Blacksmith"/);
  assert.match(smith, /Guild Blacksmith/);
  assert.match(smith, /submitCraftingState/);
  assert.match(smith, /submitCraftRecipe/);
  assert.match(smith, /submitForgeItem/);
  assert.match(smith, /submitResynthesizeItem/);
  assert.match(smith, /Resynthesize Gear/);
  assert.match(smith, /<ResynthesisWorkbench/);
  assert.match(recovery, /Guaranteed material recovery/);
  assert.match(smith, /window\.confirm/);
  assert.match(smith, /<ForgeWorkbench/);
  const forge = await readFile(new URL("player/ForgeWorkbench.jsx", SRC), "utf8");
  assert.match(forge, /Workshop saves/);
  assert.match(forge, /material\.owned/);
  assert.match(smith, /current_upgrade/);
  assert.match(smith, /combat_locked/);
  assert.doesNotMatch(smith, /COMMAND|READYALL|VENTURE|RAID_ACTION/);
});

test("Overview adds Daily Guild Provisions with a local 24-hour countdown", async () => {
  const overview = await readFile(new URL("player/Overview.jsx", SRC), "utf8");
  const daily = await readFile(new URL("player/DailyReward.jsx", SRC), "utf8");
  assert.match(overview, /DailyReward/);
  assert.match(daily, /Daily Guild Provisions/);
  assert.match(daily, /Claim Daily Reward/);
  assert.match(daily, /submitDailyState/);
  assert.match(daily, /submitClaimDaily/);
  assert.match(daily, /window\.setInterval\(tick, 1000\)/);
  assert.match(daily, /pageshow/);
  assert.match(daily, /visibilitychange/);
  assert.doesNotMatch(daily, /setInterval[\s\S]{0,200}submitDailyState/);
});

test("Phase 7 Blacksmith and Daily layouts collapse without horizontal-scrolling rails", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  const phase = css.slice(css.indexOf("v1.1.7 Portal Actions Phase 7"));
  assert.match(phase, /blacksmith-grid[\s\S]*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(phase, /@media \(max-width: 1180px\)[\s\S]*blacksmith-grid[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(phase, /@media \(max-width: 720px\)[\s\S]*blacksmith-grid[\s\S]*grid-template-columns: 1fr/);
  assert.match(phase, /@media \(max-width: 560px\)/);
  assert.doesNotMatch(phase, /overflow-x:\s*(auto|scroll)/);
});


test("Forge Gear keeps equipped first in its new workbench", async () => {
  const smith = await readFile(new URL("player/Blacksmith.jsx", SRC), "utf8");
  const ui = await readFile(new URL("player/ForgeWorkbench.jsx", SRC), "utf8");
  const filters = await readFile(new URL("utils/forgeFilters.js", SRC), "utf8");
  assert.match(smith, /<ForgeWorkbench/);
  assert.match(filters, /inventory_order/);
  assert.match(filters, /ordered: \[\.\.\.equipped, \.\.\.forged, \.\.\.unforged\]/);
  assert.match(ui, /Currently Equipped/);
  assert.match(ui, /Forged Gear/);
  assert.match(ui, /Unforged Gear/);
  assert.match(ui, /forge-directory-disclosure/);
  assert.match(ui, /Lv\. \{number\(item\.min_level\)\}/);
});

test("Forged and unforged Blacksmith sections use shared collapsible pointer styling", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /forge-group-disclosure > \.forge-group-heading/);
  assert.match(css, /forge-type-heading/);
  assert.match(css, /forge-group-heading-meta \.details-collapse-pointer/);
});
