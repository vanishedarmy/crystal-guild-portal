import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Cloud Continuity adds a keyboard skip path and grouped profile navigation", async () => {
  const header = await readFile(new URL("components/SiteHeader.jsx", SRC), "utf8");
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(header, /Skip to main content/);
  assert.match(profile, /TAB_GROUPS/);
  assert.match(profile, /<optgroup label=\{group\}/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /prefers-contrast:\s*more/);
});

test("level-oriented Portal lists are explicitly ascending", async () => {
  const inventory = await readFile(new URL("player/Inventory.jsx", SRC), "utf8");
  const hunts = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  const shop = await readFile(new URL("player/MoogleEmporium.jsx", SRC), "utf8");
  const blacksmith = await readFile(new URL("player/Blacksmith.jsx", SRC), "utf8");
  assert.match(inventory, /sort\(compareItemsByLevel\)/);
  assert.match(hunts, /\.sort\(compareByLevel\)/);
  assert.match(hunts, /regions = \[\.\.\.\(state\?\.regions \|\| \[\]\)\]\.sort/);
  assert.match(shop, /sort\(compareShopItems\)/);
  assert.match(blacksmith, /a\.min_level - b\.min_level/);
});

test("Player Guide level catalogs use ascending level order", async () => {
  const runtime = await readFile(new URL("guide/guideRuntime.js", SRC), "utf8");
  const body = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(runtime, /D\.monsters\.filter[\s\S]*?sort\(\(a,b\)=>Number\(a\.level\|\|0\)-Number\(b\.level\|\|0\)/);
  assert.match(runtime, /D\.hunts\.filter[\s\S]*?sort\(\(a,b\)=>Number\(a\.min_level\|\|0\)-Number\(b\.min_level\|\|0\)/);
  assert.match(runtime, /\[\.\.\.D\.regions\]\.sort\(\(a,b\)=>Number\(a\.min_level\|\|0\)-Number\(b\.min_level\|\|0\)/);
  assert.match(body, /aria-label="Search the entire Player Guide"/);
});

test("Streamer Dashboard exposes the hosted OBS overlay and shared roundel", async () => {
  const page = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/streamer.css", SRC), "utf8");
  const header = await readFile(new URL("components/SiteHeader.jsx", SRC), "utf8");
  const overlay = await readFile(new URL("raid-overlay.html", PUBLIC), "utf8");
  const overlayJs = await readFile(new URL("raid-overlay.js", PUBLIC), "utf8");
  assert.match(page, /Hosted Raid Overlay/);
  assert.match(page, /href="\/overlay"/);
  assert.match(page, /SiteHeader/);
  assert.match(header, /crystal-guild-portal-roundel\.webp/);
  assert.match(css, /streamer-overlay-card/);
  assert.match(overlay, /src="\/raid-overlay\.js(?:\?v=[^"]+)?"/);
  assert.doesNotMatch(overlay, /<script>(?:.|\n)*?<\/script>/);
  assert.match(overlayJs, /\/api\/overlay\/state/);
  assert.match(overlay, /class="art-panel"/);
  assert.match(overlay, /class="hp-track"/);
  assert.match(overlay, /Damage Leaders/);
  assert.match(overlay, /prefers-reduced-motion/);
  assert.match(overlayJs, /renderLeaders/);
  assert.match(overlayJs, /classList\.toggle\('critical'/);
  assert.match(overlayJs, /Victory/);
  assert.match(overlayJs, /if\(!s\.active\)\{hide\(\);return\}/);
});
