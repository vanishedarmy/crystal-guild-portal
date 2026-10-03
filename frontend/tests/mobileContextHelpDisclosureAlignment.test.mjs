import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const css = fs.readFileSync(path.join(root, "src/styles/button-fit.css"), "utf8");

function mobileTail() {
  const marker = "Hotfix 5 — mobile contextual-help/disclosure alignment";
  const index = css.indexOf(marker);
  assert.ok(index >= 0, "missing mobile help/disclosure alignment block");
  return css.slice(index);
}

test("mobile help and collapse controls use the same compact 34px visual size", () => {
  const source = mobileTail();
  assert.match(source, /\.context-help-button\s*\{[\s\S]*?width:\s*34px;[\s\S]*?height:\s*34px;/);
  assert.match(source, /\.section-collapse-button,[\s\S]*?\.dungeon-board-collapse-toggle,[\s\S]*?\.raid-board-collapse-toggle[\s\S]*?width:\s*34px\s*!important;/);
  assert.match(source, /\.collapse-pointer-icon\s*\{[\s\S]*?width:\s*1\.28rem;[\s\S]*?height:\s*1\.28rem;/);
});

test("collapsible mobile headers order help immediately before the pointer", () => {
  const source = mobileTail();
  assert.match(source, /> \.context-help\s*\{[\s\S]*?order:\s*20;/);
  assert.match(source, /> \.section-collapse-button\s*\{[\s\S]*?order:\s*30;/);
  assert.match(source, /gap:\s*\.32rem;/);
});

test("status content stays left while the help/pointer utility pair stays right", () => {
  const source = mobileTail();
  assert.match(source, /\.section-collapse-actions:has\(> \.section-collapse-button\)[\s\S]*?> :not\(\.context-help\):not\(\.section-collapse-button\)[\s\S]*?order:\s*10;/);
  assert.match(source, /margin-right:\s*auto;/);
});

test("Dungeon and Raid board title layouts explicitly keep the utility pair together", () => {
  const source = mobileTail();
  assert.match(source, /\.dungeon-board-title-row > \.context-help-actions:has\(> \.dungeon-board-collapse-toggle\)/);
  assert.match(source, /\.raid-board-title-actions:has\(> \.raid-board-collapse-toggle\)/);
});
