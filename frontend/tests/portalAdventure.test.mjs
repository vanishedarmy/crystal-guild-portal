import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);

test("Stream Venture keeps Twitch start commands and adds authenticated Portal live controls", async () => {
  const api = await readFile(new URL("api/auth.js", SRC), "utf8");
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  const stream = await readFile(new URL("player/StreamActivities.jsx", SRC), "utf8");
  for (const token of [
    "ADVENTURE_STATE", "LIVE_EVENT_JOIN", "LIVE_EVENT_ACTION", "TRAVEL_REGION", "SOLO_VENTURE", "SOLO_EXPEDITION_ACTION", "SOLO_EXPEDITION_CONTINUE", "SOLO_EXPEDITION_RETURN", "SOLO_EXPEDITION_RETREAT", "CHALLENGE_HUNT",
    "submitAdventureState", "submitLiveEventJoin", "submitLiveEventAction", "submitTravelRegion", "submitSoloVenture", "submitSoloExpeditionAction", "submitSoloExpeditionContinue", "submitSoloExpeditionReturn", "submitSoloExpeditionRetreat", "submitChallengeHunt",
  ]) assert.match(api, new RegExp(token));
  assert.doesNotMatch(api, /submitVenture|submitJoinEncounter|"VENTURE"|"JOIN_ENCOUNTER"/);
  assert.doesNotMatch(board, /submitVenture|submitJoinEncounter|Join Encounter/);
  assert.doesNotMatch(board, /Stream Venture · Twitch Chat Only|Rally Venture · Twitch Chat Only|<Raids/);
  assert.match(stream, /Stream Venture · Live Stream/);
  assert.match(stream, /!venture/);
  assert.match(stream, /Join Stream Venture/);
  assert.match(stream, /runLiveAction/);
});

test("Solo Venture stays on Adventure Board while Stream Venture is separated", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  const stream = await readFile(new URL("player/StreamActivities.jsx", SRC), "utf8");
  const solo = board.indexOf('Solo Venture · Portal Only');
  const region = board.indexOf('<h2>Travel Regions</h2>');
  assert.ok(solo > 0 && region > solo, { solo, region });
  assert.doesNotMatch(board, /Rally Venture · Twitch Chat Only|Stream Venture · Twitch Chat Only/);
  assert.match(stream, /Stream Venture · Live Stream/);
  assert.match(board, /encounter_chance_percent \?\? 80/);
  assert.match(board, /treasure_chance_percent \?\? 20/);
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
  assert.doesNotMatch(board, /Rally battles use Twitch chat for combat|Stream Venture|<Raids/);
  assert.match(board, /Up to three private stages/);
});

test("Adventure Board uses Bot-synchronized local timers and uses live revisions, exact deadlines, and slow fallback refreshes for active adventures", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(board, /window\.setInterval\(\(\) => setClock\(Date\.now\(\)\), 1000\)/);
  assert.match(board, /const expeditionActive = Boolean\(state\?\.solo_venture\?\.expedition\)/);
  assert.match(board, /!state\?\.encounter && !state\?\.active_hunt && !expeditionActive && !fieldExpeditionActive && !dungeonActive/);
  assert.match(board, /fieldExpeditionActive \? 30000 : expeditionActive \? 30000 : dungeonActive \? 30000 : 30000/);
  assert.match(board, /crystal-guild-live-revision/);
  assert.match(board, /window\.setTimeout\(\(\) => void loadState\(\{ quiet: true \}\), waitMs\)/);
  assert.match(board, /const authoritativeClock = clock \+ serverOffsetMs/);
  assert.match(board, /setServerOffsetMs\(Number\(next\.server_now \|\| 0\) > 0/);
  assert.match(board, /Number\(state\.active_hunt\?\.resolves_at \|\| 0\)/);
  const stream = await readFile(new URL("player/StreamActivities.jsx", SRC), "utf8");
  assert.match(stream, /const ventureRemaining = remainingUntil\(state\?\.venture\?\.available_at, authoritativeClock\)/);
  assert.match(stream, /crystal-guild-live-revision/);
  assert.match(stream, /`Ready in \$\{duration\(ventureRemaining\)\}`/);
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
  assert.match(board, /const soloRemaining = remainingUntil\(state\?\.solo_venture\?\.available_at, authoritativeClock\)/);
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
  assert.ok(soloCard > 0, { soloCard });
  assert.doesNotMatch(board, /Stream Venture · Twitch Chat Only|Rally Venture · Twitch Chat Only/);
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
    '["stream", "Stream Activities"',
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

test("Solo Venture abilities stay compact while showing concise effect summaries", async () => {
  const board = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  const retro = await readFile(new URL("styles/retro.css", SRC), "utf8");
  assert.match(board, /const availableSoloAbilities = \(expedition\?\.combat\?\.abilities \|\| \[\]\)\.filter\(\(ability\) => ability\.usable\)/);
  assert.match(board, /solo-action-option solo-ability-option combat-purpose-\$\{battleAbilityPurpose\(ability\)\}/);
  assert.match(board, /<strong>\{ability\.name\}<\/strong>/);
  assert.match(board, /\{number\(ability\.cost\)\} \{String\(ability\.resource \|\| "MP"\)\.toUpperCase\(\)\}/);
  assert.match(board, /No abilities available\./);
  assert.match(board, /battleAbilitySummary\(ability\)/);
  assert.doesNotMatch(board, /ability\.traits/);
  assert.match(retro, /Retro Phase 1 Hotfix 1 — compact Solo Venture abilities/);
  assert.match(retro, /\.solo-action-option\.solo-ability-option[\s\S]*min-height: 42px/);
});
