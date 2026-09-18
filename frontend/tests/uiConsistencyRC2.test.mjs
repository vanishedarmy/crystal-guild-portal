import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { WEB_ASSET_REVISION, WEB_RELEASE, WEB_VERSION } from "../src/version.js";

const css = await readFile(new URL("../src/styles/portal.css", import.meta.url), "utf8");
const profile = await readFile(new URL("../src/pages/PlayerProfile.jsx", import.meta.url), "utf8");

test("current release identity remains in the Merc build family", () => {
  assert.equal(WEB_VERSION, "v1.8.1");
  assert.equal(WEB_RELEASE, "v1.8.1 — Merc Recruitment");
  assert.equal(WEB_ASSET_REVISION, "1.8.1-merc-recruitment");
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
