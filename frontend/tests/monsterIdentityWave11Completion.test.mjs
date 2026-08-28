import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const finalWave = ["ancient_mimic", "skull_dragon", "brachosaur", "master_tonberry", "land_worm", "void_tonberry", "mimic_king"];

test("Monster Identity Wave 11 completes every existing Bestiary portrait", () => {
  const src = read("src/utils/monsterPortraits.js");
  const data = JSON.parse(read("public/guide-data.json"));
  const monsterIds = new Set(data.monsters.map((entry) => entry.id));
  const mapped = [...src.matchAll(/^\s*([a-z0-9_]+):\s*"\/retro-phase-ii\/monster-portraits-v10\//gm)].map((m) => m[1]);
  assert.equal(data.monsters.length, 107);
  assert.equal(mapped.length, 107);
  for (const id of finalWave) {
    assert.ok(monsterIds.has(id), `existing Bestiary monster missing: ${id}`);
    assert.ok(mapped.includes(id), `portrait mapping missing: ${id}`);
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/monster-portraits-v10/${id}.webp`)), id);
  }
  for (const id of monsterIds) assert.ok(mapped.includes(id), `unillustrated Bestiary monster remains: ${id}`);
});

test("Wave 11 completion keeps the established monster image-fit rules", () => {
  const monsterCss = read("src/styles/monster-identity.css");
  const guideCss = read("public/guide.css");
  assert.match(monsterCss, /aspect-ratio:2\/3/);
  assert.match(monsterCss, /object-fit:contain/);
  assert.match(guideCss, /\.guide-hunt-art\{aspect-ratio:2\/3\}/);
});
