import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const PUBLIC = new URL("../public/", import.meta.url);
const LEGACY = new URL("../src/guide/guideRuntime.js", import.meta.url);

test("item catalog is organized by level and class/job", async () => {
  const markup = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  const script = await readFile(LEGACY, "utf8");
  assert.match(markup, /id="itemLevel"/);
  assert.match(markup, /id="itemJob"/);
  assert.match(markup, /Class \/ Jobs/);
  assert.match(script, /function itemLevelBand\(i\)/);
  assert.match(script, /function compareItemKeys\(a,b\)/);
  assert.match(script, /table-group-row/);
  assert.match(script, /allowed\.includes\(job\)/);
});

test("early-game gear expansion is present in guide data", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  assert.equal(data.items.length, 405);
  assert.ok(data.items.every((item) => typeof item.description === "string" && item.description.trim().length >= 80), "every item should have a full description");
  assert.equal(new Set(data.items.map((item) => item.description)).size, 405, "item descriptions should be individually authored");
  const shopGear = data.items.filter((item) => item.shop && ["weapon", "armor"].includes(item.type));
  for (const level of [1, 5, 8, 12, 16, 20, 25, 30, 35, 40, 45, 50]) {
    assert.ok(shopGear.some((item) => item.type === "weapon" && (item.min_level ?? item.shop_level) === level), `missing weapon tier ${level}`);
    assert.ok(shopGear.some((item) => item.type === "armor" && (item.min_level ?? item.shop_level) === level), `missing armor tier ${level}`);
  }
  assert.ok(shopGear.every((item) => item.gear_family), "shop gear should expose gear family metadata");

  const hpRecovery = Object.fromEntries(
    data.items
      .filter((item) => ["potion", "hi_potion", "mega_potion", "x_potion"].includes(item.id))
      .map((item) => [item.id, item.use.effects.find((effect) => effect.type === "heal_hp").amount]),
  );
  assert.deepEqual(hpRecovery, { potion: 50, hi_potion: 200, x_potion: 1000, mega_potion: 500 });
});


test("Adventurer Portal inventory surfaces consumable effects and descriptions", async () => {
  const inventory = await readFile(new URL("../src/player/Inventory.jsx", import.meta.url), "utf8");
  const detail = await readFile(new URL("../src/components/DetailDialog.jsx", import.meta.url), "utf8");
  assert.match(inventory, /isHeldConsumable/);
  assert.match(inventory, /formatItemUse\(item\.use\)/);
  assert.match(inventory, /Consumable item/);
  assert.match(inventory, /inventoryGroup: group\.key/);
  assert.match(inventory, /group\.key === "item"/);
  assert.match(inventory, /inventory-consumable-description/);
  assert.match(inventory, /\{item\.description\}/);
  assert.match(detail, /itemType === "consumable"/);
  assert.match(detail, /inventoryGroup === "item"/);
  assert.match(detail, /label="Item Effect"/);
  assert.match(detail, /label="Description"/);
  assert.match(detail, /label="Usage"/);
  assert.match(detail, /itemType === "material"/);
  assert.match(detail, /label="Purpose"/);
  assert.match(detail, /itemType === "accessory"/);
  assert.match(detail, /label="Special Effect"/);
  assert.match(detail, /label="Equipment Requirements"/);
  assert.match(detail, /label="Special Traits"/);
  assert.doesNotMatch(detail, />No stat bonuses</);
});

test("Adventurer Portal can enrich legacy inventory snapshots from the bundled item catalog", async () => {
  const { mergeInventoryWithCatalog } = await import("../src/utils/itemCatalog.js");
  const guideData = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  const legacy = {
    player: { username: "legacy_hero" },
    items: [{
      id: "potion",
      name: "Potion",
      type: "consumable",
      rarity: "common",
      quantity: 4,
      bonuses: {},
    }],
  };

  const enriched = mergeInventoryWithCatalog(legacy, guideData);
  const potion = enriched.items[0];
  assert.match(potion.description, /Restores 50 HP/);
  assert.equal(potion.use.effects[0].type, "heal_hp");
  assert.equal(potion.use.effects[0].amount, 50);
});


test("Player Guide keeps item notes compact and avoids duplicate equipment descriptions", async () => {
  const script = await readFile(LEGACY, "utf8");
  assert.match(script, /function compactItemUse\(it\)/);
  assert.match(script, /if\(it\.element\)bits\.push/);
  assert.match(script, /if\(it\.on_hit_status\)/);
  assert.match(script, /else if\(it\.type==='material'\)/);
  assert.doesNotMatch(script, /if\(it\.description\)bits\.push\(it\.description\)/);
});
