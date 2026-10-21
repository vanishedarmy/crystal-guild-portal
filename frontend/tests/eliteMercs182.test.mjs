import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { mercHeroCardArt, mercRegistryCardArt } from "../src/player/mercServiceState.js";
import { WEB_ASSET_REVISION, WEB_BUILD, WEB_RELEASE, WEB_VERSION } from "../src/version.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ELITE = ["lightning", "sephiroth", "rikku", "yshtola", "noctis", "cid"];

test("v1.8.2 Elite Mercs release identity is current", () => {
  assert.equal(WEB_VERSION, "v1.8.2");
  assert.equal(WEB_BUILD, "Elite Mercs");
  assert.equal(WEB_RELEASE, "v1.8.2 — Elite Mercs");
  assert.equal(WEB_ASSET_REVISION, "1.8.2-elite-mercs");
});

test("six elite Heroes ship Locked, Unavailable, and Available art", () => {
  for (const hero of ELITE) {
    for (const state of ["locked", "unavailable", "available"]) {
      const file = path.join(ROOT, `public/merc-service/a3/cards/${hero}-${state}.webp`);
      assert.ok(fs.existsSync(file), `${hero} ${state} missing`);
      assert.ok(fs.statSync(file).size < 400_000, `${hero} ${state} is not web optimized`);
    }
  }
});

test("elite art routing honors recruitment and hire state", () => {
  const locked = { id: "lightning", art_set: "a3", available: false, recruitment: { required: true, recruited: false } };
  assert.equal(mercHeroCardArt(locked, [], "hunt"), "/merc-service/a3/cards/lightning-locked.webp");
  assert.equal(mercRegistryCardArt(locked), "/merc-service/a3/cards/lightning-locked.webp");

  const recruited = { id: "lightning", art_set: "a3", available: true, mission_types: ["hunt", "venture", "raid"], recruitment: { required: true, recruited: true } };
  assert.equal(mercHeroCardArt(recruited, [], "hunt"), "/merc-service/a3/cards/lightning-available.webp");
  const hired = [{ hero_id: "lightning", mission_type: "hunt", state: "reserved" }];
  assert.equal(mercHeroCardArt(recruited, hired, "hunt"), "/merc-service/a3/cards/lightning-unavailable.webp");
});

test("Merc Service surfaces Elite Contract labeling and recruitment copy", () => {
  const source = fs.readFileSync(path.join(ROOT, "src/player/MercService.jsx"), "utf8");
  assert.match(source, /Elite Contract/);
  assert.match(source, /Elite Mercs/);
  assert.match(source, /substantially stronger/);
});
