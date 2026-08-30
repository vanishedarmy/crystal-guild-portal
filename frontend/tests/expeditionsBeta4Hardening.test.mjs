import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Expeditions carries forward Beta 4 hardening in player-facing language", async () => {
  const version = await readFile(new URL("version.js", SRC), "utf8");
  const news = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  assert.match(version, /WEB_BUILD = "Trails & Raids Alpha 4"/);
  assert.match(version, /1\.5\.0-trails-raids-a4/);
  assert.match(news, /Journeys stay saved/);
  assert.match(news, /Active Expeditions keep their current stage/);
  const previous = news.slice(news.indexOf('name: "Asset Optimization"'));
  assert.doesNotMatch(previous, /name: "[^"]*(?:Alpha|Beta|RC\d*)[^"]*"/i);
});

test("Player Guide is player-facing and omits release-engineering jargon", async () => {
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  const expeditionStart = guide.indexOf('id="expeditions"');
  const expeditionEnd = guide.indexOf('id="dungeons"', expeditionStart);
  const expedition = guide.slice(expeditionStart, expeditionEnd);
  assert.match(expedition, /Your travel and current stage stay saved/);
  assert.match(expedition, /Route signals:/);
  assert.match(expedition, /Completion stipend:/);
  assert.doesNotMatch(expedition, /Beta [1-4]|Alpha [2-5]|schema|protocol|SQLite|replay receipt|authoritative|simulation|feature freeze|migration/i);
});

test("Guide release metadata matches authoritative H9+ combat timings", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  assert.equal(data.meta.release, "1.5.0-trails-raids-a4");
  assert.equal(data.meta.encounter_rally, 60);
  assert.equal(data.meta.encounter_round, 30);
  assert.equal(data.meta.raid_rally, 90);
  assert.equal(data.meta.raid_round, 60);
});
