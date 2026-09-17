import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { WEB_ASSET_REVISION, WEB_RELEASE, WEB_VERSION } from "../src/version.js";

const css = await readFile(new URL("../src/styles/portal.css", import.meta.url), "utf8");
const profile = await readFile(new URL("../src/pages/PlayerProfile.jsx", import.meta.url), "utf8");

test("RC2 advances the visible release identity without changing the Merc build family", () => {
  assert.equal(WEB_VERSION, "v1.8.0 RC2");
  assert.equal(WEB_RELEASE, "v1.8.0 RC2 — Merc Service");
  assert.equal(WEB_ASSET_REVISION, "1.8.0-merc-rc2");
});

test("profile navigation uses deterministic balanced desktop grids", () => {
  assert.match(css, /v1\.8\.0 RC2 — Portal-wide desktop\/mobile consistency pass/);
  assert.match(css, /\.profile-tabs\s*\{[\s\S]*grid-template-columns:\s*repeat\(8,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media \(max-width: 1279px\)[\s\S]*\.profile-tabs\s*\{[\s\S]*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
});

test("phones use the polished section selector instead of the full tab grid", () => {
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.profile-tabs\s*\{\s*display:\s*none;/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.profile-tab-select\s*\{[\s\S]*display:\s*grid/);
  assert.match(profile, /<span>Crystal Guild section<\/span>/);
});

test("shared UI containment prevents text and artwork from widening the Portal", () => {
  assert.match(css, /Universal shrink\/containment guardrails/);
  assert.match(css, /\.profile-content video,[\s\S]*\.profile-content canvas\s*\{\s*max-width:\s*100%/);
  assert.match(css, /\.profile-content figure,[\s\S]*\.profile-content picture\s*\{[\s\S]*max-width:\s*100%/);
  assert.match(css, /Narrative copy can wrap naturally/);
  assert.match(css, /overflow-wrap:\s*break-word/);
});
