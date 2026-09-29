import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const css = fs.readFileSync(path.join(root, "src/styles/button-fit.css"), "utf8");

function hotfix() {
  const marker = "v1.8.1 Hotfix 2 — mobile quick-help corner anchoring";
  const index = css.indexOf(marker);
  assert.ok(index >= 0, "missing v1.8.1 mobile quick-help corner hotfix");
  return css.slice(index);
}

test("standard mobile panel help is anchored to the upper-right corner", () => {
  const source = hotfix();
  assert.match(source, /\.panel-title-row:has\(> \.context-help-actions > \.context-help\)[\s\S]*?padding-right:\s*2\.75rem;/);
  assert.match(source, /\.panel-title-row > \.context-help-actions:not\(:has\(> \.section-collapse-button\)\) > \.context-help,[\s\S]*?position:\s*absolute;[\s\S]*?top:\s*0;[\s\S]*?right:\s*0;/);
});

test("mobile header metadata wraps independently below the anchored help control", () => {
  const source = hotfix();
  assert.match(source, /\.panel-title-row > \.context-help-actions:not\(:has\(> \.section-collapse-button\)\)\s*\{[\s\S]*?flex:\s*1 0 100%;[\s\S]*?justify-content:\s*flex-start;/);
  assert.match(source, /\.context-help-actions:has\(> \.context-help:only-child\)[\s\S]*?height:\s*0;/);
});

test("collapsible mobile boards pin help immediately left of the disclosure control", () => {
  const source = hotfix();
  assert.match(source, /padding-right:\s*4\.85rem;/);
  assert.match(source, /\.section-collapsible-title-row > \.section-collapse-actions > \.context-help,[\s\S]*?right:\s*2\.45rem;/);
  assert.match(source, /\.section-collapsible-title-row > \.section-collapse-actions > \.section-collapse-button,[\s\S]*?right:\s*0;/);
});

test("Dungeon utility wrapper cannot create a phantom mobile title row", () => {
  const source = hotfix();
  assert.match(source, /\.dungeon-board-title-row > \.context-help-actions:has\(> \.dungeon-board-collapse-toggle\)\s*\{[\s\S]*?display:\s*contents;/);
});
