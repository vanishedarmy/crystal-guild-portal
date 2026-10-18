import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { mercHeroCardArt, mercRegistryCardArt } from "../src/player/mercServiceState.js";
import { WEB_ASSET_REVISION, WEB_BUILD, WEB_VERSION } from "../src/version.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const HEROES = ["auron", "vivi", "cecil", "terra", "tidus", "ramza"];

test("v1.8.1 Merc Recruitment release identity is current", () => {
  assert.equal(WEB_VERSION, "v1.9.7");
  assert.equal(WEB_BUILD, "Queen's Blood");
  assert.equal(WEB_ASSET_REVISION, "1.9.7-queens-blood");
  const guide = JSON.parse(read("public/guide-data.json"));
  assert.equal(guide.meta.release, "1.9.7-queens-blood");
});

test("six expansion Heroes ship all three optimized card states", () => {
  for (const hero of HEROES) {
    for (const state of ["available", "locked", "unavailable"]) {
      const file = path.join(ROOT, `public/merc-service/a2/cards/${hero}-${state}.webp`);
      assert.ok(fs.existsSync(file), `${hero} ${state} card missing`);
      assert.ok(fs.statSync(file).size < 400_000, `${hero} ${state} should remain web optimized`);
    }
  }
});

test("expansion artwork routes locked silhouettes and full-color unavailable states correctly", () => {
  const locked = { id: "auron", art_set: "a2", available: false, recruitment: { required: true, recruited: false } };
  assert.equal(mercHeroCardArt(locked, [], "hunt"), "/merc-service/a2/cards/auron-locked.webp");
  assert.equal(mercRegistryCardArt(locked), "/merc-service/a2/cards/auron-locked.webp");

  const recruitedUnsupported = { id: "auron", art_set: "a2", available: true, mission_types: ["hunt", "raid"], recruitment: { required: true, recruited: true } };
  assert.equal(mercHeroCardArt(recruitedUnsupported, [], "venture"), "/merc-service/a2/cards/auron-unavailable.webp");
  assert.equal(mercHeroCardArt(recruitedUnsupported, [], "hunt"), "/merc-service/a2/cards/auron-available.webp");
});

test("Merc Portal exposes recruitment and permanent registry views", () => {
  const page = read("src/player/MercService.jsx");
  const api = read("src/api/auth.js");
  assert.match(page, /Hire Heroes/);
  assert.match(page, /Recruitment/);
  assert.match(page, /Merc Registry/);
  assert.match(page, /submitMercRecruit/);
  assert.match(page, /Elite Contracts/);
  assert.match(api, /"MERC_RECRUIT"/);
});

test("Dungeon Portal requests preserve room revision for mutation actions", () => {
  const api = read("src/api/auth.js");
  assert.match(api, /submitDungeonAction[\s\S]*revision/);
  assert.match(api, /submitDungeonChoice[\s\S]*revision/);
  assert.match(api, /submitDungeonContinue[\s\S]*revision/);
  assert.match(api, /submitDungeonRetreat[\s\S]*revision/);
});
