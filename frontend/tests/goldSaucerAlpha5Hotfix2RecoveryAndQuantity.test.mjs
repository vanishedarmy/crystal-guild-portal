import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const saucer = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const emporium = fs.readFileSync(path.join(root, "src/player/MoogleEmporium.jsx"), "utf8");
const blacksmith = fs.readFileSync(path.join(root, "src/player/Blacksmith.jsx"), "utf8");
const fellowship = fs.readFileSync(path.join(root, "src/player/Fellowship.jsx"), "utf8");
const quantity = fs.readFileSync(path.join(root, "src/utils/quantityInput.js"), "utf8");
const boundary = fs.readFileSync(path.join(root, "src/components/SectionErrorBoundary.jsx"), "utf8");
const version = fs.readFileSync(path.join(root, "src/version.js"), "utf8");

test("Alpha 5 Hotfix 2 sanitizes live Gold Saucer display scalars", () => {
  assert.match(saucer, /function displayText\(value, fallback = "—"\)/);
  assert.match(saucer, /function triadRarity\(value\)/);
  assert.match(saucer, /displayText\(card\?\.name, "Unknown Card"\)/);
  assert.match(saucer, /displayText\(course\.description, "Gold Saucer race course\."\)/);
  assert.match(saucer, /displayText\(opponent\.description, "Triple Triad challenger\."\)/);
  assert.match(saucer, /const details = asRecord\(entry\.details\)/);
});

test("Alpha 5 Hotfix 2 keeps Mini Cactpot and Crystal Slots open while the other Saucer sections stay collapsible", () => {
  assert.match(saucer, /<section className="panel saucer-game-card cactpot-card saucer-scenic-panel">/);
  assert.match(saucer, /<section className="panel saucer-game-card slots-card saucer-scenic-panel">/);
  for (const section of ["monster-toss-card", "saucer-racing-panel", "saucer-triad-panel", "saucer-prize-panel", "saucer-records-panel", "saucer-history-panel"]) {
    assert.match(saucer, new RegExp(`<details className="[^"\\n]*${section}[^"\\n]*saucer-section-disclosure`));
  }
});

test("Alpha 5 Hotfix 2 quantity entry replaces the starter one instead of appending to it everywhere the shared quantity pattern is used", () => {
  assert.match(quantity, /function quantityInputValue\(values, itemId\)/);
  assert.match(quantity, /function beginQuantityEdit\(setter, values, itemId\)/);
  assert.match(quantity, /String\(currentValue \|\| "1"\) === "1"/);
  assert.match(quantity, /\[itemId\]: ""/);
  assert.match(quantity, /function finishQuantityEdit/);
  assert.match(emporium, /inputMode="numeric"/);
  assert.match(emporium, /onFocus=\{\(\) => beginQuantityEdit\(setBuyQty, buyQty, item\.id\)\}/);
  assert.match(emporium, /onFocus=\{\(\) => beginQuantityEdit\(setSellQty, sellQty, item\.id\)\}/);
  assert.match(blacksmith, /onFocus=\{\(\) => beginQuantityEdit\(setQuantities, quantities, recipe\.id\)\}/);
  assert.match(fellowship, /onFocus=\{\(\) => beginQuantityEdit\(setWorkshopBatches, workshopBatches, exchange\.id\)\}/);
});

test("Alpha 5 Hotfix 2 error boundary is retryable and logs the captured exception", () => {
  assert.match(boundary, /componentDidCatch\(error, info\)/);
  assert.match(boundary, /profile section render failure/);
  assert.match(boundary, /Retry Section/);
  assert.match(boundary, /this\.setState\(\{ hasError: false \}\)/);
});

test("Alpha 5 Hotfix 2 advances only the frontend cache revision", () => {
  assert.match(version, /WEB_ASSET_REVISION = "1\.6\.0-gold-saucer-rc2h1"/);
  assert.match(version, /WEB_VERSION = "v1\.6\.0 RC2"/);
});
