import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const wave1 = ["goblin","wolf","mandragora","goblin_chieftain","goblin_guard","hornet","flan","imp","dire_wolf_alpha","bomb"];
const wave2 = ["cockatrice","bat","queen_hornet","ochu","skeleton","cactuar","ossuary_knight","spriggan","basilisk","crimson_detonator"];

test("Monster portrait system contains Wave 1 and Wave 2 authoritative ids", () => {
  const src = read("src/utils/monsterPortraits.js");
  const baseDir = "monster-portraits-v5";
  for (const id of [...wave1, ...wave2]) {
    assert.match(src, new RegExp(`${id}.*${baseDir}`));
    assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/${baseDir}/${id}.webp`)), id);
  }
});

test("Player Guide uses the same Job and Monster portrait utilities as the Portal", () => {
  const runtime = read("src/guide/guideRuntime.js");
  assert.match(runtime, /import \{ jobPortraitPath \} from "\.\.\/utils\/jobPortraits\.js"/);
  assert.match(runtime, /import \{ monsterPortraitPath \} from "\.\.\/utils\/monsterPortraits\.js"/);
  assert.match(runtime, /jobPortraitPath\(j\?\.name\|\|j\?\.id/);
  assert.match(runtime, /monsterPortraitPath\(id\)/);
  assert.doesNotMatch(runtime, /guideJobPortraitIds/);
  assert.doesNotMatch(runtime, /guideMonsterPortraitIds/);
});

test("Guide Job names with compact ids still resolve through display names", () => {
  const data = JSON.parse(read("public/guide-data.json"));
  const portraitMap = read("src/utils/jobPortraits.js");
  for (const id of ["blackmage","whitemage","redmage","darkknight","bluemage","timemage"]) {
    const job = data.jobs.find((entry) => entry.id === id);
    assert.ok(job, id);
    const normalized = job.name.toLowerCase();
    assert.match(portraitMap, new RegExp(`"?${normalized}"?.*job-portraits-v2`));
  }
});

test("Guide and Portal preserve portrait aspect ratios without crop or distortion", () => {
  const monsterCss = read("src/styles/monster-identity.css");
  const guideCss = read("public/guide.css");
  assert.match(monsterCss, /object-fit:contain/);
  assert.match(guideCss, /guide-job-art img,.guide-hunt-art img\{[^}]*object-fit:contain/s);
  assert.match(guideCss, /guide-monster-thumb img\{[^}]*object-fit:contain/s);
});
