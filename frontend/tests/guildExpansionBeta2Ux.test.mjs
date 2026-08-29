import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync(new URL("../src/pages/FellowshipPage.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");
const news = fs.readFileSync(new URL("../src/player/whatsNewData.js", import.meta.url), "utf8");
const version = fs.readFileSync(new URL("../src/version.js", import.meta.url), "utf8");

test("Guild Expansion RC2 prioritizes current Fellowship activity", () => {
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

test("Beta 2 stays feature frozen", () => {
  assert.match(version, /WEB_BUILD = "Guild Expansion RC2"/);
  assert.match(version, /1\.3\.0-guild-expansion-rc2/);
  assert.match(news, /No balance changes/);
  assert.match(news, /No balance changes/);
});
