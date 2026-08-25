import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

const assets = [
  "region-greenwind.webp", "region-whispering.webp", "region-sable.webp", "region-magitek.webp",
  "region-crystal.webp", "region-riftlands.webp", "region-interdimensional.webp", "region-omega.webp",
  "monster-feature.webp", "chest-1.webp", "chest-2.webp", "chest-3.webp", "chest-4.webp",
  "battle-vignette.webp",
];

test("Retro Phase 2 loads after the Phase 1 foundation", async () => {
  const main = await readFile(new URL("main.jsx", SRC), "utf8");
  const phase1 = main.indexOf('import "./styles/retro.css"');
  const phase2 = main.indexOf('import "./styles/retro-phase2.css"');
  assert.ok(phase1 >= 0 && phase2 > phase1);
});

test("Retro Phase 2 ships optimized interface artwork", async () => {
  for (const name of assets) await access(new URL(`retro-phase2/${name}`, PUBLIC));
  const util = await readFile(new URL("utils/retroAssets.js", SRC), "utf8");
  assert.match(util, /greenwind_plains/);
  assert.match(util, /omega_ruins/);
  assert.match(util, /monsterToken/);
  assert.match(util, /treasureArt/);
  assert.match(util, /jobSigil/);
});

test("Adventure Board integrates region, monster, and treasure artwork without changing action paths", async () => {
  const source = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(source, /regionArt\(region\.id\)/);
  assert.match(source, /monsterToken\(hunt\.monster\)/);
  assert.match(source, /monsterToken\(expedition\.combat\.enemy\)/);
  assert.match(source, /treasureArt\(item\.rarity\)/);
  assert.match(source, /submitTravelRegion/);
  assert.match(source, /submitChallengeHunt/);
  assert.match(source, /submitSoloExpeditionAction/);
});

test("Guild identity and Bestiary use reusable retro presentation components", async () => {
  const directory = await readFile(new URL("pages/GuildDirectory.jsx", SRC), "utf8");
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  const jobs = await readFile(new URL("player/Jobs.jsx", SRC), "utf8");
  const bestiary = await readFile(new URL("player/Bestiary.jsx", SRC), "utf8");
  assert.match(directory, /retro-job-portrait/);
  assert.match(profile, /jobSigil\(overview\.job\)/);
  assert.match(jobs, /job-card-retro-title/);
  assert.match(bestiary, /Retro Field Guide/);
  assert.match(bestiary, /monsterToken\(monster\)/);
});

test("Retro Phase 2 keeps image presentation responsive and reduced-motion safe", async () => {
  const css = await readFile(new URL("styles/retro-phase2.css", SRC), "utf8");
  assert.match(css, /v1\.1\.18 — Retro Phase 2/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(max-width: 520px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /object-fit: cover/);
});

test("hosted raid overlay receives the selective Phase 2 battle treatment", async () => {
  const overlay = await readFile(new URL("raid-overlay.html", PUBLIC), "utf8");
  assert.match(overlay, /battle-vignette\.webp/);
  assert.match(overlay, /steps\(8,end\)/);
  assert.match(overlay, /prefers-reduced-motion/);
});

test("What's New carries the major update moniker lineage through Retro Phase 2", async () => {
  const data = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  for (const moniker of [
    "Retro Phase 2", "Retro Phase 1", "Arsenal II", "Arsenal", "Wayfarer", "Cloud Continuity",
    "Cloud Runtime", "Adventure Board", "Solo Venture", "Chocobo Companions", "Fellowship", "Ultima", "Ultima Web",
  ]) assert.match(data, new RegExp(moniker));
});
