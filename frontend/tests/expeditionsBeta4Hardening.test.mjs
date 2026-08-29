import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Expeditions Beta 4 publishes the release-hardening identity", async () => {
  const version = await readFile(new URL("version.js", SRC), "utf8");
  const news = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  assert.match(version, /WEB_BUILD = "Expeditions Beta 4"/);
  assert.match(version, /1\.2\.0-expeditions-b4/);
  assert.match(news, /Release hardening before RC1/);
  assert.match(news, /Rewards and replay receipts commit together/);
  assert.match(news, /Feature freeze remains in force/);
});

test("Player Guide carries Beta 4 persistence and upgrade-hardening guidance", async () => {
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(guide, /Beta 4 Release Hardening/);
  assert.match(guide, /Long Rest and stream-start refreshes do not restore HP, MP, or AP through an active Wayfarer or distant Expedition/);
  assert.match(guide, /gameplay change and replay receipt together/);
  assert.match(guide, /pre-v1\.2 schema-7 path is validated into schema 8/);
});

test("Guide release metadata matches authoritative H9+ combat timings", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  assert.equal(data.meta.release, "1.2.0-expeditions-b4");
  assert.equal(data.meta.encounter_rally, 60);
  assert.equal(data.meta.encounter_round, 30);
  assert.equal(data.meta.raid_rally, 90);
  assert.equal(data.meta.raid_round, 60);
});
