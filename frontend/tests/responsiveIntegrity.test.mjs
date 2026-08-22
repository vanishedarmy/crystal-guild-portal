import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const PUBLIC = new URL("../public/", import.meta.url);
const STYLES = new URL("../src/styles/", import.meta.url);

test("Guide authored punctuation cannot wrap as a detached token", async () => {
  const body = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.doesNotMatch(body, /<\/(?:code|b|strong|span|a|em|i)>\s+[,.;:!?]/);
});

test("Guide uses one responsive gutter and never truncates section lead copy", async () => {
  const css = await readFile(new URL("guide.css", PUBLIC), "utf8");
  assert.match(css, /--guide-gutter:\s*clamp\(/);
  assert.match(css, /\.hero,[\s\S]*?\.topsearch,[\s\S]*?\.content\s*\{[\s\S]*?padding-left:\s*var\(--guide-gutter\)[\s\S]*?padding-right:\s*var\(--guide-gutter\)/);
  assert.match(css, /guide-section-lead-full[\s\S]*?white-space:\s*normal !important[\s\S]*?text-overflow:\s*clip !important/);
  assert.doesNotMatch(css, /text-overflow:\s*ellipsis/);
  assert.doesNotMatch(css, /-webkit-line-clamp:\s*[1-9]/);
  assert.doesNotMatch(css, /contain-intrinsic-size:\s*auto 900px/);
  assert.match(css, /contain-intrinsic-inline-size:\s*auto 0px/);
  assert.match(css, /contain-intrinsic-block-size:\s*auto 900px/);
});

test("Portal control rails wrap and share a continuous page gutter", async () => {
  const css = await readFile(new URL("portal.css", STYLES), "utf8");
  assert.match(css, /--hub-gutter:\s*clamp\(/);
  assert.match(css, /\.shell\s*\{[\s\S]*?width:\s*min\(var\(--hub-page-max\),\s*calc\(100% - \(2 \* var\(--hub-gutter\)\)\)\)/);
  assert.match(css, /\.site-nav,[\s\S]*?\.profile-tabs\s*\{[\s\S]*?flex-wrap:\s*wrap[\s\S]*?overflow-x:\s*visible/);
  assert.doesNotMatch(css, /text-overflow:\s*ellipsis/);
});

test("Streamer dashboard narrows without horizontal summary rails or text ellipsis", async () => {
  const css = await readFile(new URL("streamer.css", STYLES), "utf8");
  assert.match(css, /\.streamer-shell\s*\{[\s\S]*?var\(--hub-gutter/);
  assert.match(css, /@media \(max-width: 1180px\)[\s\S]*?\.streamer-summary-grid\s*\{[\s\S]*?repeat\(3, minmax\(0, 1fr\)\)[\s\S]*?overflow:\s*visible/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*?\.streamer-summary-grid\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /\.streamer-jumpbar\s*\{[\s\S]*?display:\s*grid[\s\S]*?repeat\(4, minmax\(0, 1fr\)\)[\s\S]*?overflow-x:\s*visible/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*?\.streamer-jumpbar\s*\{\s*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(css, /text-overflow:\s*ellipsis/);
});
