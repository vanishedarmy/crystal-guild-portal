import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const bossIds = ["elder_ochu", "inferno_drake", "malboro_sovereign", "frost_behemoth", "rift_wyrm"];

test("Step 2 maps all five Expedition bosses to individual portrait assets", () => {
  const portraits = read("src/utils/monsterPortraits.js");
  for (const id of bossIds) {
    assert.match(portraits, new RegExp(`\\b${id}: \"/retro-phase-ii/monster-portraits-v10/${id}\\.webp\"`));
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/monster-portraits-v10/${id}.webp`)), id);
  }
});

test("Step 2 has one distinct portrait mapping for each of the 112 base monsters", () => {
  const portraits = read("src/utils/monsterPortraits.js");
  const registry = JSON.parse(read("public/guide-data.json"));
  const rows = [...portraits.matchAll(/^\s*([a-z0-9_]+):\s*"(\/retro-phase-ii\/monster-portraits-v10\/[^"\n]+)"/gm)];
  const ids = rows.map((row) => row[1]);
  assert.equal(ids.length, 112);
  assert.equal(new Set(ids).size, 112);
  for (const row of registry.monsters) assert.ok(ids.includes(row.id), row.id);
  for (const id of bossIds) assert.ok(ids.includes(id), id);
  for (const [, id, url] of rows) assert.ok(fs.existsSync(path.join(root, "public", url.slice(1))), id);
});

test("Step 2 renders matching darkened images for undiscovered monsters, without identity in alt text", () => {
  const portrait = read("src/components/MonsterPortrait.jsx");
  const css = read("src/styles/monster-identity.css");
  assert.match(portrait, /monster\?\.locked_art/);
  assert.match(portrait, /monsterPortraitPath\(monster\)/);
  assert.match(portrait, /"Undiscovered monster portrait"/);
  assert.match(portrait, /src \? "has-art" : "fallback"/);
  assert.match(css, /\.monster-portrait\.undiscovered\.has-art img/);
  assert.match(css, /filter:grayscale\(1\) brightness/);
  assert.match(css, /object-fit:contain/);
});

test("Step 2 does not change seasonal purpose-built locked artwork", () => {
  const seasonal = read("src/player/SeasonalEvent.jsx");
  assert.match(seasonal, /locked|silhouette/i);
});
