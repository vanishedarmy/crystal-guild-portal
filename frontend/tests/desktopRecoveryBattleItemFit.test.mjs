import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.resolve(here, "../src/styles/button-fit.css"), "utf8");

test("desktop recovery controls use wider columns instead of squeezed five-up cards", () => {
  assert.match(css, /\.recovery-quick-grid\s*\{[^}]*minmax\(270px, 1fr\)/s);
});

test("desktop recovery command artwork is reduced to a compact 40px footprint", () => {
  assert.match(css, /\.recovery-quick-action \.recovery-item-artwork\s*\{[^}]*width:\s*40px;[^}]*height:\s*40px;/s);
});

test("desktop recovery command metadata moves beneath the item copy instead of consuming a third column", () => {
  assert.match(css, /grid-template-areas:\s*\n\s*"art copy"\s*\n\s*"art meta";/);
  assert.match(css, /\.recovery-quick-action \.recovery-quick-meta\s*\{[^}]*grid-area:\s*meta;/s);
});

test("battle inventory item buttons are compact while ability buttons remain outside the selector", () => {
  assert.match(css, /\.solo-action-picker \.solo-action-grid:not\(\.solo-ability-grid\) \.solo-action-option\s*\{[^}]*min-height:\s*70px;[^}]*padding:\s*\.52rem \.62rem;/s);
});

test("large desktop battle inventory uses three columns", () => {
  assert.match(css, /@media \(min-width:\s*1120px\)[\s\S]*\.solo-action-picker \.solo-action-grid:not\(\.solo-ability-grid\)\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
});

test("battle item descriptions retain context with a two-line clamp", () => {
  assert.match(css, /\.solo-action-picker \.solo-action-grid:not\(\.solo-ability-grid\) \.solo-action-option > small:last-child\s*\{[^}]*-webkit-line-clamp:\s*2;/s);
});
