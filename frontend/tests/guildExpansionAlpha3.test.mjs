import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("Guild Expansion exposes practical facility services", () => {
  const publicPage = read("src/pages/FellowshipPage.jsx");
  const playerPage = read("src/player/Fellowship.jsx");
  const auth = read("src/api/auth.js");
  const guide = read("public/guide-body.html");
  const whatsNew = read("src/player/whatsNewData.js");
  assert.match(publicPage, /Facility Services/);
  assert.match(publicPage, /Chocobo Stables/);
  assert.match(playerPage, /Workshop Refining/);
  assert.match(playerPage, /WORKSHOP_EXCHANGE/);
  assert.match(auth, /submitWorkshopExchange/);
  assert.match(guide, /Workshop Lv\. 2/);
  assert.match(guide, /!refine/);
  assert.match(whatsNew, /name: "Guild Expansion"/);
});

test("Guild Expansion services remain available under the current Dungeon protocol", () => {
  const version = read("src/version.js");
  const guideData = JSON.parse(read("public/guide-data.json"));
  const hosted = read("../crystal_guild/hosted_portal.py");
  assert.match(version, /WEB_BUILD = "Dungeons & Delves Alpha 2"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.4\.0-dungeons-a2-h1"/);
  assert.equal(guideData.meta.version, "v1.4.0 — Dungeons & Delves Alpha 2");
  assert.equal(guideData.meta.release, "1.4.0-dungeons-a2");
  assert.match(hosted, /ACTION_PROTOCOL_VERSION = 24/);
  assert.match(hosted, /"WORKSHOP_EXCHANGE"/);
});
