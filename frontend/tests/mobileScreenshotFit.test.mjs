import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const portal = read("src/styles/portal.css");
const fit = read("src/styles/button-fit.css");

test("equipment favorite mobile placement is scoped to equipment cards only", () => {
  assert.ok(portal.includes(".equipment-card-actions .equipment-action-button { grid-column:2; width:100%; }"));
  assert.ok(!portal.includes(".equipment-compare { grid-column:1/-1; } .equipment-action-button { grid-column:2; width:100%; }"));
});

test("Mini Cactpot payout choices use a compact two-column mobile grid", () => {
  assert.match(fit, /\.cactpot-line-buttons \{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(fit, /\.cactpot-line-buttons \.equipment-action-button \{[\s\S]*grid-column: auto;[\s\S]*min-height: 44px/);
});

test("mobile combat actions use a balanced 2x2 grid and picker close stays attached", () => {
  assert.match(fit, /\.solo-command-bar,[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(fit, /\.solo-action-picker > \.panel-title-row \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto/);
});

test("mobile Job and Daily action groups occupy intentional rows", () => {
  assert.match(fit, /\.character-job-card \.management-job-actions \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(fit, /\.daily-reward-actions \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
});

test("mobile Hunts keep status in the identity row and use a full-width footer action", () => {
  assert.match(fit, /\.adventure-hunt-card \.adventure-hunt-head \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto/);
  assert.match(fit, /\.adventure-hunt-card \.adventure-card-footer \.equipment-action-button \{[\s\S]*width: 100%/);
});

test("mobile Blacksmith toolbar stacks cleanly and keeps service tabs usable", () => {
  assert.match(fit, /\.blacksmith-toolbar \{[\s\S]*grid-template-columns: 1fr;[\s\S]*width: 100%/);
  assert.match(fit, /\.blacksmith-view-switch \{[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(fit, /@media \(max-width: 430px\)[\s\S]*\.blacksmith-view-switch button:nth-child\(3\) \{[\s\S]*grid-column: 1 \/ -1/);
});
