import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const component = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, "../GOLD_SAUCER_ALPHA2_VISUAL_MANIFEST.json"), "utf8"));
const publicRoot = path.join(root, "public");

test("Monster Toss visual hotfix ships seventeen active separate WebP assets", () => {
  assert.equal(manifest.asset_count, 17);
  assert.equal(manifest.frontend_asset_revision, "1.6.0-gold-saucer-a2h2");
  for (const asset of manifest.assets) {
    assert.match(asset.route, /\.webp$/);
    assert.equal(fs.existsSync(path.join(publicRoot, asset.route.replace(/^\//, ""))), true, asset.route);
  }
});

test("Monster Toss component routes each target and throw style to artwork", () => {
  assert.match(component, /TOSS_ART_ROOT = "\/gold-saucer\/a2h2\/monster-toss"/);
  for (const target of ["small_pot", "medium_pot", "large_pot", "golden_cactuar"]) assert.match(component, new RegExp(`${target}:`));
  for (const style of ["safe", "normal", "power"]) assert.match(component, new RegExp(`${style}:`));
  assert.match(component, /monster-toss-background/);
  assert.doesNotMatch(component, /monster-toss-marquee/);
  assert.equal(manifest.assets.some((asset) => asset.route.endsWith("/marquee.webp")), false);
  assert.match(component, /monster-toss-reticle/);
  for (const route of ["results/hit.webp", "results/miss.webp", "results/jackpot.webp", "results/bullseye.webp"]) assert.equal(manifest.assets.some((asset) => asset.route.endsWith(route)), true, route);
  assert.match(component, /results\/\$\{/);
});

test("Monster Toss visual treatment remains responsive and reduced-motion safe", () => {
  assert.match(css, /monster-toss-scenic-panel/);
  assert.match(css, /monster-toss-target-art/);
  assert.match(css, /monster-toss-style-art/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
