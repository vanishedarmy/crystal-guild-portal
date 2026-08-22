import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);

test("v1.1.14 Cloud Continuity keeps Rally Venture start/join out of the Portal", async () => {
  const api = await readFile(new URL("api/auth.js", SRC), "utf8");
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  for (const token of [
    "ADVENTURE_STATE", "TRAVEL_REGION", "SOLO_VENTURE", "CHALLENGE_HUNT",
    "submitAdventureState", "submitTravelRegion", "submitSoloVenture", "submitChallengeHunt",
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
  assert.match(board, /50 \/ 50/);
  assert.match(board, /50%/);
  assert.match(board, /Enemy level cap/);
  assert.match(board, /Separate cooldown/);
});

test("Adventure Board uses clearer player-facing wording", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(board, /Adventure Board/);
  assert.match(board, /Choose Your Next Adventure/);
  assert.doesNotMatch(board, /Phase 9 Adventure Board|authoritative rules|Portal action|mutation|protocol/i);
  assert.match(board, /Rally battles use Twitch chat for combat/);
  assert.match(board, /private one-click adventure that stays on the website/);
});

test("Adventure Board uses local timers and polls only while an encounter is active", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(board, /window\.setInterval\(\(\) => setClock\(Date\.now\(\)\), 1000\)/);
  assert.match(board, /if \(!actionsAvailable \|\| !state\?\.encounter\) return undefined/);
  assert.match(board, /window\.setInterval\(refreshActive, 4000\)/);
  assert.match(board, /window\.setTimeout\(\(\) => void loadState\(\{ quiet: true \}\), waitMs\)/);
  assert.match(board, /const ventureRemaining = remainingUntil\(state\?\.venture\?\.available_at, clock\)/);
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

test("Solo Venture resolves immediately and keeps its readable result inside the Solo Venture card", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(board, /Encounter fights resolve immediately/);
  assert.match(board, /<strong>Instant<\/strong>Encounter resolution/);
  assert.match(board, /SoloVentureResult/);
  assert.match(board, /Last Solo Venture/);
  assert.match(board, /Won in/);
  assert.match(board, /Damage dealt/);
  assert.match(board, /Next Solo Venture in/);
  assert.doesNotMatch(board, /Solo Venture resolved\./);
  assert.match(board, /Solo Venture: Victory over/);
  assert.match(board, /Solo Venture: Found/);
  assert.match(board, /Solo Venture: Defeated by/);
  const soloCard = board.indexOf('className="panel venture-panel solo-venture-panel"');
  const embeddedResult = board.indexOf('<SoloVentureResult summary={recentSoloResult}');
  const rallyCard = board.indexOf('Rally Venture · Twitch Chat Only');
  assert.ok(soloCard > 0 && embeddedResult > soloCard && rallyCard > embeddedResult, { soloCard, embeddedResult, rallyCard });
  assert.match(css, /v1\.1\.12 Hotfix 1 — instant Solo Venture result summary/);
  assert.match(css, /v1\.1\.12 Hotfix 2 — embedded Solo result \+ mobile connection token/);
  assert.match(css, /\.solo-result-grid/);
  assert.match(css, /\.solo-result-wrap/);
});
