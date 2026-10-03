import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const component = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const publicRoot = path.join(root, "public");

test("Monster Toss ships the complete active WebP asset set", () => {
  const assetRoot = path.join(publicRoot, "gold-saucer/a2h2/monster-toss");
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
  const webp = walk(assetRoot).filter((file) => file.endsWith(".webp"));
  assert.equal(webp.length, 17);
  for (const route of [
    "background.webp",
    "targets/small-pot.webp",
    "targets/medium-pot.webp",
    "targets/large-pot.webp",
    "targets/golden-cactuar.webp",
    "results/hit.webp",
    "results/miss.webp",
    "results/jackpot.webp",
    "results/bullseye.webp",
  ]) assert.equal(fs.existsSync(path.join(assetRoot, route)), true, route);
});

test("Monster Toss component routes each target and throw style to artwork", () => {
  assert.match(component, /TOSS_ART_ROOT = "\/gold-saucer\/a2h2\/monster-toss"/);
  for (const target of ["small_pot", "medium_pot", "large_pot", "golden_cactuar"]) assert.match(component, new RegExp(`${target}:`));
  for (const style of ["safe", "normal", "power"]) assert.match(component, new RegExp(`${style}:`));
  assert.match(component, /monster-toss-background/);
  assert.doesNotMatch(component, /monster-toss-marquee/);
  assert.equal(fs.existsSync(path.join(publicRoot, "gold-saucer/a2h2/monster-toss/marquee.webp")), false);
  assert.match(component, /monster-toss-reticle/);
  for (const route of ["results/hit.webp", "results/miss.webp", "results/jackpot.webp", "results/bullseye.webp"]) assert.equal(fs.existsSync(path.join(publicRoot, `gold-saucer/a2h2/monster-toss/${route}`)), true, route);
  assert.match(component, /results\/\$\{/);
});

test("Monster Toss visual treatment remains responsive and reduced-motion safe", () => {
  assert.match(css, /monster-toss-scenic-panel/);
  assert.match(css, /monster-toss-target-art/);
  assert.match(css, /monster-toss-style-art/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
