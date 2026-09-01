import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { WEB_ASSET_REVISION, WEB_VERSION } from "../src/version.js";

const read = (relative) => fs.readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");

test("Alpha 3 publishes the MGP Web identity without advancing protocol", () => {
  assert.equal(WEB_VERSION, "v1.6.0 Alpha 5");
  assert.equal(WEB_ASSET_REVISION, "1.6.0-gold-saucer-a5h3");
  const manifest = JSON.parse(read("../GOLD_SAUCER_ALPHA3_MGP_MANIFEST.json"));
  assert.equal(manifest.currency.code, "MGP");
  assert.equal(manifest.portal_action_protocol, 27);
  assert.equal(manifest.local_db_schema, 12);
});

test("Gold Saucer prefers canonical MGP fields and keeps Alpha 2 fallbacks", () => {
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
  assert.match(guide, /daily 50 MGP/);
  assert.match(dashboard, /Grant MGP/);
  assert.doesNotMatch(guide, /Saucer Points \(SP\)|10 SP|15 SP|20 SP/);
});
