import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync(new URL("../src/pages/FellowshipPage.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");
const news = fs.readFileSync(new URL("../src/player/whatsNewData.js", import.meta.url), "utf8");
const version = fs.readFileSync(new URL("../src/version.js", import.meta.url), "utf8");

test("Guild Expansion prioritizes current Fellowship activity", () => {
  assert.match(page, /Current Guild priorities/);
  assert.match(page, /Current Project/);
  assert.match(page, /Guild Airship/);
  assert.match(page, /Weekly Orders/);
  assert.match(page, /Guild Legacy/);
  assert.match(css, /\.fellowship-airship \{ order: 3; \}/);
  assert.match(css, /\.fellowship-orders \{ order: 4; \}/);
});

test("secondary Fellowship detail is persistent and mobile friendly", () => {
  assert.match(page, /crystal-guild:fellowship-disclosures:v1/);
  assert.match(page, /disclosures\.facilities/);
  assert.match(page, /disclosures\.services/);
  assert.match(page, /disclosures\.airshipDetails/);
  assert.match(page, /disclosures\.legacyGoals/);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /@media \(pointer: coarse\)/);
  assert.match(css, /\.fellowship-priority-grid \{ grid-template-columns: 1fr; \}/);
});

test("Fellowship UX remains present in the final release", () => {
  assert.match(version, /WEB_BUILD = "Trails & Raids Alpha 6"/);
  assert.match(version, /1\.5\.0-trails-raids-a6/);
  assert.match(news, /Guild Expansion has arrived/);
  const previous = news.slice(news.indexOf('name: "Asset Optimization"'));
  assert.doesNotMatch(previous, /name: "[^"]*(?:Alpha|Beta|RC\d*)[^"]*"/i);
});
