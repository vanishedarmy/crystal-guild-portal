import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("Title Expansion Alpha 3 publishes the current web identity", () => {
  const version = read("../src/version.js");
  assert.match(version, /WEB_VERSION = "v1\.9\.0 Alpha 3"/);
  assert.match(version, /WEB_BUILD = "Title Expansion"/);
  assert.match(version, /1\.9\.0-title-expansion-alpha3/);
});

test("Gold Saucer separates earned Challenge Titles from MGP purchases", () => {
  const saucer = read("../src/player/GoldSaucer.jsx");
  assert.match(saucer, /challenge_titles/);
  assert.match(saucer, /Earned, Not Purchased/);
  assert.match(saucer, /Purchased \+ Earned/);
  assert.match(saucer, /Spend MGP/);
});

test("Player Guide publishes expanded title counts and secret-title rules", () => {
  const guide = read("../public/guide-body.html");
  assert.match(guide, /89 milestones/);
  assert.match(guide, /121 titles/);
  assert.match(guide, /secret titles remain hidden until earned/i);
  assert.match(guide, /One More Spin \(750 MGP\)/);
  assert.match(guide, /Card Shark \(1,500\)/);
});

test("What's New introduces Alpha 3 without spoiling hidden title conditions", () => {
  const whatsNew = read("../src/player/whatsNewData.js");
  assert.match(whatsNew, /name: "Title Expansion"/);
  assert.match(whatsNew, /Gold Saucer Challenge Titles/);
  assert.match(whatsNew, /Secret achievements stay secret/);
  assert.doesNotMatch(whatsNew, /Oh hi Mark\./);
});
