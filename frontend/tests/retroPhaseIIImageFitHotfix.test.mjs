import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("portrait families use their intended UI aspect ratios", () => {
  const monsterCss = read("src/styles/monster-identity.css");
  const jobCss = read("src/styles/character-identity.css");
  const guideCss = read("public/guide.css");
  assert.match(monsterCss, /aspect-ratio:2\/3/);
  assert.match(jobCss, /aspect-ratio:\s*3\s*\/\s*4/);
  assert.match(guideCss, /\.guide-job-art\{aspect-ratio:3\/4\}/);
  assert.match(guideCss, /\.guide-hunt-art\{aspect-ratio:2\/3\}/);
  assert.doesNotMatch(guideCss, /guide-job-art,.guide-hunt-art\{aspect-ratio:16\/10/);
});

test("all mapped monsters use the cache-busted normalized portrait library", () => {
  const map = read("src/utils/monsterPortraits.js");
  assert.match(map, /monster-portraits-v9/);
  assert.doesNotMatch(map, /monster-portraits-v7\//);
});
