import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pagePath = new URL("../src/pages/FellowshipPage.jsx", import.meta.url);
const memberPath = new URL("../src/player/Fellowship.jsx", import.meta.url);
const cssPath = new URL("../src/styles/portal.css", import.meta.url);
const guidePath = new URL("../public/guide-body.html", import.meta.url);
const whatsNewPath = new URL("../src/player/whatsNewData.js", import.meta.url);
const versionPath = new URL("../src/version.js", import.meta.url);
const text = (path) => readFile(path, "utf8");

test("Alpha 5 Fellowship page exposes Guild Legacy trophies and progress", async () => {
  const page = await text(pagePath);
  assert.match(page, /Guild Legacy/);
  assert.match(page, /Legacy Goal/);
  assert.match(page, /Trophy Earned/);
  assert.match(page, /Legacy rewards are recognition, trophies, and modest shared Renown/);
});

test("Alpha 5 personal Fellowship tab exposes the Guild Service Record", async () => {
  const member = await text(memberPath);
  assert.match(member, /Guild Service Record/);
  assert.match(member, /Airship Missions/);
  assert.match(member, /Guild Service Distinctions/);
  assert.match(member, /Expeditions/);
});

test("Alpha 5 Legacy UI remains responsive and decorative-only", async () => {
  const css = await text(cssPath);
  assert.match(css, /\.fellowship-legacy-grid/);
  assert.match(css, /legacy-stage-4/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.fellowship-legacy-grid/);
});

test("Player Guide explains Legacy in player-facing terms", async () => {
  const guide = await text(guidePath);
  assert.match(guide, /Guild Legacy/);
  assert.match(guide, /<code>!legacy<\/code>/);
  assert.match(guide, /Guild Service Record/);
  assert.doesNotMatch(guide, /legacy_accomplishment:/);
  assert.doesNotMatch(guide, /fellowship_events/);
});

test("Alpha 5 What's New and public version identity are current", async () => {
  const whatsNew = await text(whatsNewPath);
  const version = await text(versionPath);
  assert.match(whatsNew, /name: "Guild Expansion"/);
  assert.match(version, /WEB_BUILD = "Trails & Raids Alpha 1"/);
  assert.match(version, /1\.5\.0-trails-raids-a1h2/);
});
