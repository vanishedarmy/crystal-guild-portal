import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("Monster Identity Wave 1 maps all ten authoritative monster ids", () => {
  const src = read("src/utils/monsterPortraits.js");
  for (const id of ["goblin","wolf","mandragora","goblin_chieftain","goblin_guard","hornet","flan","imp","dire_wolf_alpha","bomb"]) {
    assert.match(src, new RegExp(`${id}.*monster-portraits-v10`));
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/monster-portraits-v10/${id}.webp`)));
  }
});

test("Bestiary and Hunts use the shared MonsterPortrait component", () => {
  assert.match(read("src/player/Bestiary.jsx"), /MonsterPortrait/);
  const hunts = read("src/player/Hunts.jsx");
  assert.match(hunts, /MonsterPortrait/);
  assert.match(hunts, /hunt-card-portrait/);
  assert.match(hunts, /timed-hunt-portrait/);
  assert.match(hunts, /hunt-result-portrait/);
});

test("Monster art and Guide art preserve aspect ratio without cover cropping", () => {
  const css = read("src/styles/monster-identity.css");
  assert.match(css, /aspect-ratio:2\/3/);
  assert.match(css, /object-fit:contain/);
  const guideCss = fs.readFileSync(path.join(root, "public/guide.css"), "utf8");
  assert.match(guideCss, /guide-job-art/);
  assert.match(guideCss, /guide-hunt-art/);
  assert.match(guideCss, /guide-monster-thumb/);
  assert.match(guideCss, /object-fit:contain/);
});

test("Player Guide reuses shared Job and Monster portrait libraries", () => {
  const runtime = read("src/guide/guideRuntime.js");
  assert.match(runtime, /import \{ jobPortraitPath \}/);
  assert.match(runtime, /import \{ monsterPortraitPath \}/);
  assert.match(runtime, /guideMonsterPortraitPath/);
  assert.match(runtime, /guideJobPortraitPath/);
});
