import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);
const SRC = new URL("src/", ROOT);

const page = await readFile(new URL("pages/FellowshipPage.jsx", SRC), "utf8");
const guide = await readFile(new URL("../public/guide-body.html", SRC), "utf8");
const whatsNew = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
const version = await readFile(new URL("version.js", SRC), "utf8");

test("Guild Expansion presents the five-facility Guild Board", () => {
  assert.match(page, /Guild Hall Foundation/);
  assert.match(page, /Guild Facilities/);
  assert.match(page, /Lv\. 0–3/);
  assert.match(page, /Future Construction/);
  assert.match(page, /facility\.locked/);
});

test("Player Guide explains facility play without backend implementation jargon", () => {
  const start = guide.indexOf('id="fellowship-guide"');
  const end = guide.indexOf('id="chocobo', start);
  const chapter = guide.slice(start, end > start ? end : undefined);
  assert.match(chapter, /Guild Hall, Workshop, Chocobo Stables, Guild Archive/);
  assert.match(chapter, /Airship Dock/);
  assert.match(chapter, /Gil, materials, and gameplay milestones/);
  assert.doesNotMatch(chapter, /schema|protocol|SQLite|migration|transaction ledger|sync payload/i);
});

test("Final release identity and launch summary are current", () => {
  assert.match(version, /WEB_VERSION = "v1\.5\.0"/);
  assert.match(version, /WEB_BUILD = "Trails & Raids Alpha 6"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.5\.0-trails-raids-a6"/);
  assert.match(whatsNew, /name: "Guild Expansion"/);
  assert.match(whatsNew, /Build the Guild together/);
  assert.match(whatsNew, /The Crystal Guild Airship/);
  assert.match(css, /v1\.3 Guild Expansion/);
});
