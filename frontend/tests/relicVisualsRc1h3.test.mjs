import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { relicArtworkPath } from "../src/utils/relicArtwork.js";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(here, "..");
const publicRoot = path.join(frontend, "public");
const data = JSON.parse(fs.readFileSync(path.join(publicRoot, "guide-data.json"), "utf8"));
const relicIds = ["gae_bolg", "excalibur", "apocalypse", "godhand", "masamune", "stardust_rod", "nirvana", "last_knife"];
const stageNames = ["dormant", "awakened", "zenith"];

test("RC1H3 packages all eight Relics across all three visual stages", () => {
  for (const id of relicIds) {
    for (let stage = 1; stage <= 3; stage += 1) {
      const art = relicArtworkPath({ id, stage });
      assert.equal(art, `/retro-phase-iii/relic-weapons-v2/${id}_${stageNames[stage - 1]}.webp`);
      assert.ok(fs.existsSync(path.join(publicRoot, art)), `missing ${art}`);
    }
  }
});

test("Relic stage reward items route to dedicated Relic artwork", () => {
  for (const relic of data.relics) {
    for (const stage of relic.stages) {
      const item = data.items.find((entry) => entry.id === stage.reward_item);
      assert.ok(item, `missing stage reward item ${stage.reward_item}`);
      assert.equal(itemArtworkPath(item), `/retro-phase-iii/relic-weapons-v2/${stage.reward_item}.webp`);
    }
  }
});

test("Relic visuals are surfaced in Portal cards, details, and the Player Guide", () => {
  const files = {
    relics: fs.readFileSync(path.join(frontend, "src/player/Relics.jsx"), "utf8"),
    detail: fs.readFileSync(path.join(frontend, "src/components/RelicDetail.jsx"), "utf8"),
    dialog: fs.readFileSync(path.join(frontend, "src/components/DetailDialog.jsx"), "utf8"),
    guide: fs.readFileSync(path.join(frontend, "src/guide/guideRuntime.js"), "utf8"),
    portalCss: fs.readFileSync(path.join(frontend, "src/styles/portal.css"), "utf8"),
    guideCss: fs.readFileSync(path.join(frontend, "public/guide.css"), "utf8"),
  };
  assert.match(files.relics, /RelicArtwork/);
  assert.match(files.dialog, /RelicDetail/);
  assert.match(files.detail, /detail-relic-artwork/);
  assert.match(files.detail, /relic-stage-artwork/);
  assert.match(files.guide, /relic-art-frame/);
  assert.match(files.guide, /info-stage-art/);
  assert.match(files.portalCss, /RC1 Hotfix 3 — Relic Visuals/);
  assert.match(files.guideCss, /RC1 Hotfix 3 — Relic Visuals/);
});
