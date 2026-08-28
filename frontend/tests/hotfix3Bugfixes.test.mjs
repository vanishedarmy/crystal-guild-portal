import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hunts = fs.readFileSync(path.join(root, "src/player/Hunts.jsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const inventory = fs.readFileSync(path.join(root, "src/player/Inventory.jsx"), "utf8");
const jobs = fs.readFileSync(path.join(root, "src/player/Jobs.jsx"), "utf8");

test("active live Rally Venture status is embedded in the Rally Venture panel", () => {
  const rallyStart = hunts.indexOf('className="panel rally-venture-notice"');
  const regionStart = hunts.indexOf('className="panel adventure-region-panel"');
  const embedded = hunts.indexOf('encounter?.kind === "venture" ? renderActiveEncounter(true)');
  assert.ok(rallyStart >= 0 && embedded > rallyStart && embedded < regionStart);
  assert.match(hunts, /encounter && encounter\.kind !== "venture" \? renderActiveEncounter\(false\)/);
  assert.match(css, /\.active-adventure-embedded\s*\{/);
});

test("selectable controls expose stronger active states and descriptive action labels", () => {
  assert.match(css, /\.equipment-action-button:disabled\s*\{[\s\S]*?opacity:\s*\.72/);
  assert.match(css, /hunt-rank-filters button\[aria-pressed="true"\]/);
  assert.match(hunts, /`Travel to \$\{region\.name\}`/);
  assert.match(hunts, /"All Hunts"/);
  assert.match(inventory, /aria-label=\{`Use \$\{item\.name\}\$\{target \? ` on \$\{target\}` : ""\}`\}/);
  assert.match(inventory, /`Equip \$\{item\.name\}`/);
  assert.match(jobs, /`View \$\{job\.name\} Details`/);
  assert.match(jobs, /"Apply Mastery"/);
});
