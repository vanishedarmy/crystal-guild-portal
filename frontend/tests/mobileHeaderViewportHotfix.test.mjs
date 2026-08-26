import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("mobile header logic includes coarse-pointer phone landscape", async () => {
  const header = await readFile(new URL("components/SiteHeader.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(header, /max-width: 1180px[\s\S]*max-height: 620px[\s\S]*orientation: landscape[\s\S]*pointer: coarse/);
  assert.match(css, /Mobile Header Viewport Hotfix/);
  assert.match(css, /\.site-header\.mobile-header-collapsed[\s\S]*translateY/);
});

test("Guide mobile section controls and search scroll with content", async () => {
  const css = await readFile(new URL("guide.css", PUBLIC), "utf8");
  assert.match(css, /Mobile Guide Viewport Hotfix/);
  assert.match(css, /\.mobile-top\s*\{[\s\S]*?position:relative;[\s\S]*?top:auto;/);
  assert.match(css, /\.topsearch\s*\{[\s\S]*?position:relative;[\s\S]*?top:auto;/);
  assert.match(css, /Phone landscape gets the same content-density treatment/);
});
