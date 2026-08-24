import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);

test("v1.1.15 Wayfarer keeps Rally Venture start/join out of the Portal", async () => {
  const api = await readFile(new URL("api/auth.js", SRC), "utf8");
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  for (const token of [
    "ADVENTURE_STATE", "TRAVEL_REGION", "SOLO_VENTURE", "SOLO_EXPEDITION_ACTION", "SOLO_EXPEDITION_CONTINUE", "SOLO_EXPEDITION_RETURN", "SOLO_EXPEDITION_RETREAT", "CHALLENGE_HUNT",
    "submitAdventureState", "submitTravelRegion", "submitSoloVenture", "submitSoloExpeditionAction", "submitSoloExpeditionContinue", "submitSoloExpeditionReturn", "submitSoloExpeditionRetreat", "submitChallengeHunt",
  ]) assert.match(api, new RegExp(token));
  assert.doesNotMatch(api, /submitVenture|submitJoinEncounter|"VENTURE"|"JOIN_ENCOUNTER"/);
  assert.doesNotMatch(board, /submitVenture|submitJoinEncounter|Join Encounter/);
  assert.match(board, /Rally Venture · Twitch Chat Only/);
  assert.match(board, /!venture/);
  assert.match(board, /!join/);
});

test("Solo Venture is the first actionable section before Rally notice and regions", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  const solo = board.indexOf('Solo Venture · Portal Only');
  const rally = board.indexOf('Rally Venture · Twitch Chat Only');
  const region = board.indexOf('Current Region');
  assert.ok(solo > 0 && rally > solo && region > rally, { solo, rally, region });
  assert.match(board, /60 \/ 40/);
  assert.match(board, /Encounter \/ Treasure/);
  assert.match(board, /3 stages/);
  assert.match(board, /Enemy level ceiling/);
  assert.match(board, /Separate cooldown/);
});

test("Adventure Board uses clearer player-facing wording", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(board, /Adventure Board/);
  assert.match(board, /Choose Your Next Adventure/);
  assert.doesNotMatch(board, /Phase 9 Adventure Board|authoritative rules|Portal action|mutation|protocol/i);
  assert.match(board, /Rally battles use Twitch chat for combat/);
  assert.match(board, /private, player-paced Solo Venture/);
});

test("Adventure Board uses local timers and polls while a live encounter or timed Hunt is active", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(board, /window\.setInterval\(\(\) => setClock\(Date\.now\(\)\), 1000\)/);
  assert.match(board, /if \(!actionsAvailable \|\| \(!state\?\.encounter && !state\?\.active_hunt\)\) return undefined/);
  assert.match(board, /window\.setInterval\(refreshActive, state\?\.active_hunt \? 10000 : 4000\)/);
  assert.match(board, /window\.setTimeout\(\(\) => void loadState\(\{ quiet: true \}\), waitMs\)/);
  assert.match(board, /const ventureRemaining = remainingUntil\(state\?\.venture\?\.available_at, clock\)/);
  assert.match(board, /Number\(state\.active_hunt\?\.resolves_at \|\| 0\)/);
  assert.match(board, /Rally Venture ready in \$\{duration\(ventureRemaining\)\}/);
});

test("Adventure Board styles Solo and Rally cards responsively", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /\.adventure-region-grid/);
  assert.match(css, /\.hunt-board-grid/);
  assert.match(css, /\.solo-venture-rules/);
  assert.match(css, /v1\.1\.12 — Adventure Board rework/);
  assert.match(css, /\.rally-venture-notice/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*\.solo-venture-rules \{ grid-template-columns: 1fr; \}/);
});

test("Solo Venture cooldown participates in the Adventure Board local deadline refresh", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(board, /Number\(state\.solo_venture\?\.available_at \|\| 0\)/);
  assert.match(board, /const soloRemaining = remainingUntil\(state\?\.solo_venture\?\.available_at, clock\)/);
  assert.match(board, /`Solo Venture ready in \$\{duration\(soloRemaining\)\}\.`/);
});

test("Wayfarer Solo Venture is player-paced and keeps combat inside the Solo Venture card", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  for (const label of ["Attack", "Ability", "Use Item", "Defend", "Enemy intent", "Return to Guild — Bank Spoils", "Press On — Stage"]) {
    assert.match(board, new RegExp(label));
  }
  assert.match(board, /Stage \${number\(expedition\.stage\)} of/);
  assert.match(board, /Venture Spoils/);
  assert.match(board, /Secured/);
  assert.match(board, /Retreat — Abandon Venture Spoils/);
  assert.match(board, /current HP\/MP\/AP and consumed items carry forward/);
  assert.match(board, /SoloVentureResult/);
  assert.doesNotMatch(board, /Encounter fights resolve immediately/);
  const soloCard = board.indexOf('className={`panel venture-panel solo-venture-panel');
  const rallyCard = board.indexOf('Rally Venture · Twitch Chat Only');
  assert.ok(soloCard > 0 && rallyCard > soloCard, { soloCard, rallyCard });
  assert.match(css, /v1\.1\.15 — Wayfarer interactive Solo Expedition/);
  assert.match(css, /\.solo-expedition-shell/);
  assert.match(css, /\.solo-command-bar/);
  assert.match(css, /\.solo-enemy-intent/);
});

test("Wayfarer orders the Adventurer Portal around the most-used character actions", async () => {
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  const ordered = [
    '["overview", "Overview"',
    '["hunts", "Adventure Board"',
    '["jobs", "Jobs"',
    '["inventory", "Equipment & Inventory"',
    '["shop", "Moogle Emporium"',
    '["blacksmith", "Blacksmith"',
    '["chocobo", "Chocobo Stable"',
    '["fellowship", "Fellowship"',
    '["bestiary", "Bestiary"',
    '["relics", "Relics"',
    '["achievements", "Achievements & Titles"',
    '["records", "Records"',
    '["trophies", "Trophy Hall"',
  ];
  let previous = -1;
  for (const marker of ordered) {
    const at = profile.indexOf(marker);
    assert.ok(at > previous, `${marker} is out of order`);
    previous = at;
  }
});
