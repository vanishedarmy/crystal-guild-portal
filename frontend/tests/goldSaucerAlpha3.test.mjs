import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { WEB_ASSET_REVISION, WEB_VERSION } from "../src/version.js";

const read = (relative) => fs.readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");

test("Production Web publishes the canonical MGP identity", () => {
  assert.equal(WEB_VERSION, "v1.8.1");
  assert.equal(WEB_ASSET_REVISION, "1.8.1-merc-recruitment");
});

test("Gold Saucer prefers canonical MGP fields and keeps compatibility fallbacks", () => {
  const source = read("src/player/GoldSaucer.jsx");
  assert.match(source, /saucerState\.mgp \?\? saucerState\.points/);
  assert.match(source, /saucerState\.daily_allowance_mgp \?\? saucerState\.daily_allowance_points/);
  assert.match(source, /records\.net_mgp \?\? records\.net_points/);
  assert.match(source, /Manderville Gold Saucer Points \(MGP\)/);
  assert.match(source, /Current Net MGP/);
  assert.doesNotMatch(source, /Not Enough SP|Current Net SP|Saucer Points cannot/);
});

test("Guide and streamer controls use MGP", () => {
  const guide = read("public/guide-body.html");
  const dashboard = read("src/pages/StreamerDashboard.jsx");
  assert.match(guide, /Manderville Gold Saucer Points \(MGP\)/);
  assert.match(guide, /500 MGP/);
  assert.match(guide, /50 MGP daily reward/);
  assert.match(dashboard, /Grant MGP/);
  assert.doesNotMatch(guide, /Saucer Points \(SP\)|10 SP|15 SP|20 SP/);
});
