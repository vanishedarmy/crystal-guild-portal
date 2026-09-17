import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { mercHeroAvailabilityReason, mercHeroStatusLabel, mercHeroUiState } from "../src/player/mercServiceState.js";
import { WEB_ASSET_REVISION, WEB_RELEASE, WEB_VERSION } from "../src/version.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");

test("Alpha 2 release identity is current", () => {
  assert.equal(WEB_VERSION, "v1.8.0 Final");
  assert.equal(WEB_RELEASE, "v1.8.0 Final — Merc Service");
  assert.equal(WEB_ASSET_REVISION, "1.8.0-merc-final");
});

test("Alpha 2 exposes exact availability reasons", () => {
  const openHero = { id: "aerith", available: true, fee_seals: 5, mission_types: ["hunt", "venture", "raid"], mission_availability: { hunt: { status: "available", reason: "Available for Hunt · 5 Hunt Seals" } } };
  assert.equal(mercHeroUiState(openHero, [], "hunt"), "available");
  assert.equal(mercHeroAvailabilityReason(openHero, [], "hunt"), "Available for Hunt · 5 Hunt Seals");

  const occupied = [{ hero_id: "tifa", hero_name: "Tifa Lockhart", mission_type: "hunt" }];
  const blockedHero = { id: "aerith", available: true, mission_types: ["hunt", "venture", "raid"], mission_availability: { hunt: { status: "unavailable", reason: "Hunt slot occupied by Tifa Lockhart" } } };
  assert.equal(mercHeroUiState(blockedHero, occupied, "hunt"), "unavailable");
  assert.equal(mercHeroAvailabilityReason(blockedHero, occupied, "hunt"), "Hunt slot occupied by Tifa Lockhart");
  assert.equal(mercHeroStatusLabel(blockedHero, occupied, "hunt"), "HUNT FULL");
});

test("Alpha 2 deployment board and balance copy are present", () => {
  const page = read("src/player/MercService.jsx");
  const css = read("src/styles/portal.css");
  const guide = read("public/guide-body.html");
  assert.match(page, /merc-deployment-board/);
  assert.match(page, /merc-slot-visual/);
  assert.match(page, /mercHeroAvailabilityReason/);
  assert.doesNotMatch(page, /setSelectedMission\(openMissions\[0\]\)/);
  assert.match(css, /Merc Service Alpha 2 — deployment board/);
  assert.match(guide, /Aerith[\s\S]*5 Hunt Seals/);
  assert.match(guide, /Tifa[\s\S]*6 Hunt Seals/);
  assert.match(guide, /Balthier[\s\S]*9 Hunt Seals/);
  assert.match(guide, /Cloud[\s\S]*12 Hunt Seals/);
  assert.match(guide, /Availability clarity/);
});
