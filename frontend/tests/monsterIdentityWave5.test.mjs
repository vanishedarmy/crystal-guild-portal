import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const wave5 = ["magic_pot","malboro","sea_serpent","riven_ronin","adamantoise","magitek_drone","ahriman","garuda","malboro_overlord","death_claw"];

test("Monster Identity Wave 5 maps the next ten authoritative Bestiary ids", () => {
  const src = read("src/utils/monsterPortraits.js");
  const data = JSON.parse(read("public/guide-data.json"));
  const ids = new Set(data.monsters.map((entry) => entry.id));
  for (const id of wave5) {
    assert.ok(ids.has(id), `authoritative monster id missing: ${id}`);
    assert.match(src, new RegExp(`${id}.*monster-portraits-v5`));
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/monster-portraits-v5/${id}.webp`)), id);
  }
});

test("Wave 5 keeps Bestiary, Hunts, and Guide on the shared monster portrait lookup", () => {
  assert.match(read("src/player/Bestiary.jsx"), /MonsterPortrait/);
  assert.match(read("src/player/Hunts.jsx"), /MonsterPortrait/);
  const runtime = read("src/guide/guideRuntime.js");
  assert.match(runtime, /monsterPortraitPath\(id\)/);
  assert.match(runtime, /jobPortraitPath\(j\?\.name\|\|j\?\.id/);
});

test("Wave 5 retains non-cropping portrait presentation", () => {
  const monsterCss = read("src/styles/monster-identity.css");
  const guideCss = read("public/guide.css");
  assert.match(monsterCss, /object-fit:contain/);
  assert.match(guideCss, /object-fit:contain/);
});
