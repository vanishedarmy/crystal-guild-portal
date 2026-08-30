import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WEB_ASSET_REVISION, WEB_BUILD, WEB_RELEASE, WEB_VERSION } from "../src/version.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");

test("Trails & Raids Alpha 1 identity is current", () => {
  assert.equal(WEB_VERSION, "v1.5.0");
  assert.equal(WEB_BUILD, "Trails & Raids Alpha 1");
  assert.equal(WEB_RELEASE, "v1.5.0 — Trails & Raids Alpha 1");
  assert.equal(WEB_ASSET_REVISION, "1.5.0-trails-raids-a1h2");
  assert.equal(JSON.parse(read("package.json")).version, "1.5.0");
});

test("Ifrit guide data declares Inferno Crucible and the four Alpha 1 mechanics", () => {
  const data = JSON.parse(read("public/guide-data.json"));
  const ifrit = data.bosses.find((boss) => boss.id === "ifrit");
  assert.equal(data.meta.release, "1.5.0-trails-raids-a1h2");
  assert.equal(ifrit.encounter_type, "Trial");
  assert.equal(ifrit.encounter_name, "Inferno Crucible");
  assert.equal(ifrit.raid_script, "ifrit_inferno_crucible");
  assert.deepEqual(ifrit.mechanics.map((m) => m.name), ["Incinerate", "Radiant Plume", "Infernal Nails", "Hellfire"]);
});

test("Adventure Board Raid panel is read-only live mechanic and contribution UI", () => {
  const raids = read("src/player/Raids.jsx");
  const hunts = read("src/player/Hunts.jsx");
  assert.match(raids, /\/api\/overlay\/state/);
  assert.match(raids, /mechanic/);
  assert.match(raids, /contribution/i);
  assert.match(raids, /Inferno Crucible/);
  assert.doesNotMatch(raids, /portal\/action|fetch\([^)]*method:\s*["']POST/i);
  assert.match(hunts, /<Raids\s*\/>/);
});

test("hosted raid overlay renders telegraphs and weighted contribution without private ids", () => {
  const html = read("public/raid-overlay.html");
  const js = read("public/raid-overlay.js");
  assert.match(html, /mechanic-box/);
  assert.match(html, /Contribution/);
  assert.match(html, /raid-overlay\.js\?v=1\.5\.0-trails-raids-a1h2/);
  assert.match(js, /mechanic/);
  assert.match(js, /score/);
  assert.doesNotMatch(js, /twitch_id|target_id/);
});

test("guide and What's New explain the Alpha 1 Trial loop", () => {
  const body = read("public/guide-body.html");
  const runtime = read("src/guide/guideRuntime.js");
  const news = read("src/player/whatsNewData.js");
  for (const term of ["Inferno Crucible", "Incinerate", "Radiant Plume", "Infernal Nails", "Hellfire"]) {
    assert.match(body + runtime + news, new RegExp(term));
  }
  assert.match(news, /v1\.5\.0 Alpha 1/);
  assert.match(news, /Trails & Raids/);
});
