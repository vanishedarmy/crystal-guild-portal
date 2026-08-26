import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Retro Phase 1 is loaded after the existing Portal and Streamer styles", async () => {
  const main = await readFile(new URL("main.jsx", SRC), "utf8");
  const portalAt = main.indexOf('styles/portal.css');
  const streamerAt = main.indexOf('styles/streamer.css');
  const retroAt = main.indexOf('styles/retro.css');
  assert.ok(portalAt >= 0 && streamerAt > portalAt && retroAt > streamerAt);
});

test("Retro Phase 1 supplies crisp shared menu-window and accessibility rules", async () => {
  const css = await readFile(new URL("styles/retro.css", SRC), "utf8");
  assert.match(css, /SNES-era visual foundation/);
  assert.match(css, /--retro-edge:/);
  assert.match(css, /\.panel,[\s\S]*?\.streamer-panel/);
  assert.match(css, /\.site-nav-link\.active::before/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /outline: 2px solid var\(--gold\)/);
});

test("Player Guide receives the matching Retro Phase 1 window layer", async () => {
  const css = await readFile(new URL("guide.css", PUBLIC), "utf8");
  assert.match(css, /v1\.1\.18 — Retro Phase 1/);
  assert.match(css, /\.info-panel\{border:2px solid #dce8ff/);
  assert.match(css, /\.card,.command-group,.command/);
});
