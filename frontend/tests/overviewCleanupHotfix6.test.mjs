import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Hotfix 6 removes the redundant Ready at a glance overview panel", async () => {
  const overview = await readFile(new URL("player/Overview.jsx", SRC), "utf8");
  assert.doesNotMatch(overview, /Ready at a glance/);
  assert.doesNotMatch(overview, /Adventurer Home/);
  assert.doesNotMatch(overview, /overview-quick-actions/);
  assert.doesNotMatch(overview, /Recover & Equip/);
  assert.doesNotMatch(overview, /Guild Blacksmith/);
});

test("Hotfix 6 keeps the functional overview modules directly at the top of the dashboard", async () => {
  const overview = await readFile(new URL("player/Overview.jsx", SRC), "utf8");
  const daily = overview.indexOf("<DailyReward");
  const news = overview.indexOf("<WhatsNew");
  const battle = overview.indexOf("Battle Profile");
  assert.ok(daily > -1);
  assert.ok(news > daily);
  assert.ok(battle > news);
});
