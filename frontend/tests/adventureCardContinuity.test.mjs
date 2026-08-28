import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");

test("region grid stretches cards into consistent rows", () => {
  assert.match(css, /\.adventure-region-grid\s*\{[\s\S]*?align-items:\s*stretch;[\s\S]*?grid-auto-rows:\s*1fr;/);
});

test("region travel controls have one full-width fixed action height", () => {
  assert.match(css, /\.adventure-region-card \.adventure-card-footer \.equipment-action-button\s*\{[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*none;[\s\S]*?min-height:\s*56px;/);
});

test("region and Hunt action zones stay bottom anchored", () => {
  assert.match(css, /\.adventure-region-card \.adventure-card-footer\s*\{[\s\S]*?margin-top:\s*auto;/);
  assert.match(css, /\.adventure-hunt-card\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-direction:\s*column;/);
  assert.match(css, /\.adventure-hunt-card \.adventure-card-footer\s*\{[\s\S]*?margin-top:\s*auto;/);
});
