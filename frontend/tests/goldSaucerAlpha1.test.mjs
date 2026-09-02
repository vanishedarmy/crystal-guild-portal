import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { WEB_ASSET_REVISION, WEB_BUILD, WEB_VERSION } from "../src/version.js";

const read = (relative) => fs.readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");

test("Gold Saucer Alpha 1 public identity and tab are wired", () => {
  assert.equal(WEB_VERSION, "v1.7.0");
  assert.equal(WEB_BUILD, "Moogle Emporium Annex Alpha 3");
  assert.equal(WEB_ASSET_REVISION, "1.7.0-emporium-annex-a3h4");
  const profile = read("src/pages/PlayerProfile.jsx");
  assert.match(profile, /gold_saucer.*Gold Saucer/s);
  assert.match(profile, /\.\.\/player\/GoldSaucer\.jsx/);
});

test("Gold Saucer client exposes the bounded Alpha 1 actions", () => {
  const api = read("src/api/auth.js");
  for (const action of ["GOLD_SAUCER_STATE", "CACTPOT_START", "CACTPOT_REVEAL", "CACTPOT_LINE", "SLOTS_SPIN", "SAUCER_BUY"]) {
    assert.match(api, new RegExp(`submitPortalAction\\(\\\"${action}\\\"`));
  }
  const saucer = read("src/player/GoldSaucer.jsx");
  assert.match(saucer, /500 MGP|welcome/i);
  assert.match(saucer, /Mini Cactpot/);
  assert.match(saucer, /Crystal Slots/);
  assert.match(saucer, /Future Attractions/);
  assert.match(saucer, /Prize Counter/);
  assert.match(saucer, /daily floor allowance/i);
  assert.match(saucer, /Recent Activity/);
});

test("Player Guide documents Alpha 1 and no longer says only eight relic questlines", () => {
  const guide = read("public/guide-body.html");
  assert.match(guide, /id="gold-saucer"/);
  assert.match(guide, /500 MGP/);
  assert.match(guide, /Mini Cactpot/);
  assert.match(guide, /Crystal Slots/);
  assert.match(guide, /Monster Toss/);
  assert.match(guide, /Chocobo Racing/);
  assert.match(guide, /Triple Triad/);
  assert.match(guide, /Prize Counter/);
  assert.match(guide, /daily.*50 MGP/i);
  assert.doesNotMatch(guide, /Eight three-stage endgame weapon questlines/);
});
