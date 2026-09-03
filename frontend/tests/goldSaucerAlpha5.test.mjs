import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const component = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const auth = fs.readFileSync(path.join(root, "src/api/auth.js"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const whatsNew = fs.readFileSync(path.join(root, "src/player/whatsNewData.js"), "utf8");
const guide = fs.readFileSync(path.join(root, "public/guide-body.html"), "utf8");
const version = fs.readFileSync(path.join(root, "src/version.js"), "utf8");


test("Alpha 5 opens the authoritative Triple Triad loop", () => {
  assert.match(auth, /TRIAD_SET_DECK/);
  assert.match(auth, /TRIAD_START/);
  assert.match(auth, /TRIAD_PLAY/);
  assert.match(component, /Alpha 5 Attraction/);
  assert.match(component, /Triple Triad/);
  assert.match(component, /triad-board/);
  assert.match(component, /triad-opponent-grid/);
  assert.match(component, /triad-collection-grid/);
  assert.match(component, /submitTriadPlay/);
});

test("Gold Saucer floor collapses every content section except Cactpot and Slots", () => {
  assert.match(component, /<section className="panel saucer-game-card cactpot-card saucer-scenic-panel">/);
  assert.match(component, /<section className="panel saucer-game-card slots-card saucer-scenic-panel">/);
  assert.doesNotMatch(component, /<details className="panel saucer-game-card cactpot-card/);
  assert.doesNotMatch(component, /<details className="panel saucer-game-card slots-card/);
  assert.match(component, /<details className="panel saucer-game-card monster-toss-card[^\n]*saucer-section-disclosure/);
  assert.match(component, /<details className="panel saucer-racing-panel saucer-section-disclosure/);
  assert.match(component, /<details className="panel saucer-triad-panel saucer-section-disclosure/);
  assert.match(component, /<details className="panel saucer-prize-panel[^\n]*saucer-section-disclosure/);
  assert.match(component, /<details className="panel saucer-records-panel saucer-section-disclosure/);
  assert.match(component, /<details className="panel saucer-history-panel[^\n]*saucer-section-disclosure/);
  assert.match(css, /\.saucer-section-disclosure>\.saucer-section-summary/);
});

test("Triple Triad remains readable and responsive", () => {
  assert.match(css, /\.triad-board\{/);
  assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /\.triad-card-values/);
  assert.match(css, /\.triad-opponent-grid/);
  assert.match(css, /@media\(max-width:540px\)/);
  assert.match(component, /\/ 5 selected/);
  assert.match(component, /Open rule only/);
});

test("Alpha 5 player copy, Guide, and compatibility contract are current", () => {
  assert.match(version, /1\.7\.1-resynthesis-a2/);
  assert.match(whatsNew, /v1\.6\.0/);
  assert.match(whatsNew, /Triple Triad opens the card hall/);
  assert.match(whatsNew, /schema advances to 13/);
  assert.match(whatsNew, /Portal Action protocol advances to 29/);
  assert.match(guide, /Gold Saucer — v1\.7\.1 Alpha 2 balance/);
  assert.match(guide, /five matches per UTC day/i);
  assert.match(guide, /Mini Cactpot and Crystal Slots remain permanently open/);
});
