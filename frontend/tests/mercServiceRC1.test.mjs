import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { mercHeroAvailabilityReason, mercHeroCardArt, mercHeroStatusLabel, mercHeroUiState } from "../src/player/mercServiceState.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");

test("RC1 keeps deployed Heroes unavailable until assignment resolution", () => {
  const hero = { id: "tifa", available: true, mission_types: ["hunt", "raid"] };
  const contracts = [{ hero_id: "tifa", hero_name: "Tifa Lockhart", mission_type: "hunt", state: "deployed", deployed: true, cancelable: false }];
  assert.equal(mercHeroUiState(hero, contracts, "hunt"), "deployed");
  assert.equal(mercHeroStatusLabel(hero, contracts, "hunt"), "HUNT DEPLOYED");
  assert.equal(mercHeroAvailabilityReason(hero, contracts, "hunt"), "Deployed — Hunt in progress");
  assert.equal(mercHeroCardArt(hero, contracts, "hunt"), "/merc-service/a1/cards/tifa-unavailable.webp");
});

test("RC1 blocks the occupied deployed slot for other Heroes", () => {
  const hero = { id: "aerith", available: true, mission_types: ["hunt", "venture", "raid"] };
  const contracts = [{ hero_id: "tifa", hero_name: "Tifa Lockhart", mission_type: "hunt", state: "deployed", deployed: true }];
  assert.equal(mercHeroUiState(hero, contracts, "hunt"), "unavailable");
  assert.equal(mercHeroStatusLabel(hero, contracts, "hunt"), "HUNT FULL");
});

test("RC1 Portal distinguishes reserved and deployed contracts", () => {
  const page = read("src/player/MercService.jsx");
  const css = read("src/styles/portal.css");
  const help = read("src/utils/contextHelp.js");
  const guide = read("public/guide-body.html");
  assert.match(page, /DEPLOYED/);
  assert.match(page, /Assignment In Progress/);
  assert.match(page, /contract && !deployed/);
  assert.match(css, /Merc Service RC1 — deployed-state and lifecycle hardening/);
  assert.match(css, /\.merc-contract-slot\.deployed/);
  assert.match(help, /remains Deployed and unavailable/);
  assert.match(guide, /Deployment lifecycle/);
  assert.match(guide, /Deployed contracts cannot be cancelled|cannot be cancelled/);
});
