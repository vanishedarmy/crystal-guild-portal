import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";
import { relicArtworkPath } from "../src/utils/relicArtwork.js";
import { EQUIPMENT_EXPANSION_IDS } from "../src/utils/equipmentExpansionArtwork.js";

const publicDir = new URL("../public/", import.meta.url);
const root = new URL("../../", import.meta.url);

test("every new endgame item has a dedicated and physically present WebP asset", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", publicDir), "utf8"));
  const novel = data.items.filter((item) => item.introduced_in === "1.9.10");
  assert.equal(novel.length, 173);
  assert.equal(new Set(novel.map((item) => item.id)).size, 173);
  assert.equal(EQUIPMENT_EXPANSION_IDS.length, 173);
  assert.deepEqual([...EQUIPMENT_EXPANSION_IDS].sort(), novel.map((item) => item.id).sort());
  const names = await readdir(new URL("equipment-expansion-1991/", publicDir));
  assert.equal(names.filter((name) => name.endsWith(".webp")).length, 173);
  for (const item of novel) {
    assert.equal(itemArtworkPath(item), `/equipment-expansion-1991/${item.id}.webp`);
    assert.ok(names.includes(`${item.id}.webp`), `missing art: ${item.id}`);
  }
});

test("all 54 Ultimate Relic forms have stage-accurate artwork", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", publicDir), "utf8"));
  const lines = data.relics.filter((row) => row.tier === "ultimate");
  assert.equal(lines.length, 18);
  for (const line of lines) {
    assert.equal(line.stages.length, 3);
    for (let stage = 1; stage <= 3; stage++) {
      const expectedId = line.stages[stage - 1].reward_item;
      assert.equal(relicArtworkPath(line, stage), `/equipment-expansion-1991/${expectedId}.webp`, `${line.id} stage ${stage}`);
    }
  }
  assert.equal(relicArtworkPath({id: "bravura", stage:3}), "/retro-phase-iii/relic-weapons-v2/bravura_zenith.webp");
});

test("Player Guide release and core catalog are complete", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", publicDir), "utf8"));
  const markup = await readFile(new URL("guide-body.html", publicDir), "utf8");
  const guideRuntime = await readFile(new URL("../src/guide/guideRuntime.js", import.meta.url), "utf8");
  assert.equal(data.meta.version, "v1.9.91 — Equipment Expansion");
  assert.equal(data.items.length, 618);
  assert.equal(data.recipes.length, 302);
  assert.equal(data.relics.length, 36);
  assert.match(markup, /equipment-expansion-1991/);
  assert.match(markup, /ultimate-relic-guide/);
  assert.match(markup, /relicTier/);
  assert.match(guideRuntime, /#relicTier/);
  assert.match(markup, /!buyweapon/);
  assert.match(markup, /!buyarmor/);
  assert.match(markup, /!buyaccessory/);
  assert.match(markup, /!relics ultimate/);
  for (const name of ["guide.css", "guide-ux-1947.css"]) {
    assert.ok((await readFile(new URL(name, publicDir))).length > 1000);
  }
});
