import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pagePath = new URL("../src/pages/FellowshipPage.jsx", import.meta.url);
const portalCssPath = new URL("../src/styles/portal.css", import.meta.url);
const guidePath = new URL("../public/guide-body.html", import.meta.url);
const streamerPath = new URL("../src/pages/StreamerDashboard.jsx", import.meta.url);
const versionPath = new URL("../src/version.js", import.meta.url);

async function text(path) { return readFile(path, "utf8"); }

test("Alpha 4 Fellowship page exposes the shared Airship mission surface", async () => {
  const page = await text(pagePath);
  assert.match(page, /Guild Airship/);
  assert.match(page, /Crystal Guild Airship/);
  assert.match(page, /Current Mission/);
  assert.match(page, /Airship Upgrades/);
  assert.match(page, /Recent Airship Missions/);
  assert.match(page, /Crystal Core Tier/);
});

test("Alpha 4 Airship UI is responsive and reuses the established ambient Airship art", async () => {
  const css = await text(portalCssPath);
  assert.match(css, /\.fellowship-airship::after[\s\S]*var\(--env-airship\)/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.fellowship-airship-grid/);
  assert.match(css, /\.fellowship-airship-upgrade-grid/);
});

test("Player Guide explains Airship play without streamer-only controls", async () => {
  const guide = await text(guidePath);
  assert.match(guide, /<h3>Guild Airship<\/h3>/);
  assert.match(guide, /<code>!airship<\/code>/);
  assert.match(guide, /Hull/);
  assert.match(guide, /Crystal Core/);
  assert.doesNotMatch(guide, /!airshipmission/);
});

test("Streamer dashboard can launch an Airship mission through the existing secure command path", async () => {
  const streamer = await text(streamerPath);
  assert.match(streamer, /airshipmission/);
  assert.match(streamer, /Launch Airship Mission/);
});

test("Alpha 4 public version identity is current", async () => {
  const version = await text(versionPath);
  assert.match(version, /Dungeons & Delves Beta 2/);
  assert.match(version, /1\.4\.0-dungeons-b2/);
});
