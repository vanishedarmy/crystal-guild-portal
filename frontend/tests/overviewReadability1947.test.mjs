import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Overview readability rework consolidates battle, journey, guild, and loadout information", async () => {
  const overview = await readFile(new URL("player/Overview.jsx", SRC), "utf8");
  assert.match(overview, /overview-summary-panel/);
  assert.match(overview, /Character Overview/);
  assert.match(overview, /Battle Profile/);
  assert.match(overview, /Standing & Masteries/);
  assert.match(overview, /Current Loadout/);
  assert.match(overview, /Manage Equipment/);
  assert.doesNotMatch(overview, /<section className="panel span-7">/);
  assert.doesNotMatch(overview, /<section className="panel span-5">/);
});

test("Recent Activity starts collapsed to keep the Overview first screen readable", async () => {
  const overview = await readFile(new URL("player/Overview.jsx", SRC), "utf8");
  const activityDisclosure = overview.match(/<details className="panel span-12 overview-recent-activity"[^>]*>/)?.[0] || "";
  assert.ok(activityDisclosure);
  assert.doesNotMatch(activityDisclosure, /\sopen(?:\s|>)/);
});

test("What’s New defaults collapsed for first-time visitors", async () => {
  const whatsNew = await readFile(new URL("player/WhatsNew.jsx", SRC), "utf8");
  assert.match(whatsNew, /return false;/);
});

test("Overview rework includes dedicated responsive styling", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /Overview Readability Rework/);
  assert.match(css, /\.overview-summary-layout/);
  assert.match(css, /\.overview-equipment-grid/);
  assert.match(css, /@media \(max-width: 760px\)/);
});
