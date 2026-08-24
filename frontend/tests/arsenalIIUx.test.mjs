import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Arsenal II publishes the expanded ability curve to the shared Guide catalog", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  assert.equal(data.meta.version, "v1.1.17 — Arsenal II");
  assert.equal(data.active_abilities.blackmage.length, 12);
  assert.equal(data.active_abilities.whitemage.length, 12);
  assert.equal(data.active_abilities.warrior.length, 8);
  assert.ok(data.active_abilities.blackmage.some((ability) => ability.id === "ultima" && ability.level === 45));
});

test("Moogle Emporium separates Buy and Sell into Weapons Armor and Items", async () => {
  const source = await readFile(new URL("player/MoogleEmporium.jsx", SRC), "utf8");
  assert.match(source, /moogle-commerce-tabs/);
  assert.match(source, /moogle-category-tabs/);
  assert.match(source, /\[\["weapons", "Weapons"\], \["armor", "Armor"\], \["items", "Items"\]\]/);
  assert.match(source, /mode === "buy"/);
  assert.match(source, /mode === "sell"/);
});

test("Blacksmith has an explicit active Recipes Forge Gear switch", async () => {
  const source = await readFile(new URL("player/Blacksmith.jsx", SRC), "utf8");
  assert.match(source, /blacksmith-view-switch/);
  assert.match(source, /aria-selected=\{view === "recipes"\}/);
  assert.match(source, /aria-selected=\{view === "forge"\}/);
  assert.match(source, /Active · Craft items/);
  assert.match(source, /Active · Upgrade equipment/);
});

test("Adventure Board exposes Camp through the existing START_REST Portal action", async () => {
  const source = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(source, /submitStartRest/);
  assert.match(source, /"START_REST"/);
  assert.match(source, /Camp & Recovery/);
  assert.match(source, /Set Up Camp/);
});

test("mobile header is compact while preserving scroll-away behavior", async () => {
  const header = await readFile(new URL("components/SiteHeader.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(header, /mobile-header-collapsed/);
  assert.match(css, /v1\.1\.17 Arsenal II/);
  assert.match(css, /\.brand-mark \{ width: 40px; height: 40px/);
  assert.match(css, /\.build-badge strong \{ display: none; \}/);
});

test("Hosted Raid Overlay is rendered after the dashboard frame", async () => {
  const source = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  const frame = source.indexOf("streamer-dashboard-frame");
  const overlay = source.lastIndexOf("<HostedOverlayCard />");
  assert.ok(frame >= 0 && overlay > frame);
});
