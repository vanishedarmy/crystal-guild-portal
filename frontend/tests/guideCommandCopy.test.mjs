import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const legacyUrl = new URL("../src/guide/guideRuntime.js", import.meta.url);
const cssUrl = new URL("../public/guide.css", import.meta.url);

test("Player Guide command text itself is the clipboard control", async () => {
  const legacy = await readFile(legacyUrl, "utf8");
  const css = await readFile(cssUrl, "utf8");
  assert.match(legacy, /class="command-copy-target"/);
  assert.match(legacy, /title="Click to copy/);
  assert.match(legacy, /closest\('\.command-copy-target'\)/);
  assert.match(legacy, /copyGuideCommand/);
  assert.match(legacy, /is-copied/);
  assert.doesNotMatch(legacy, /<button class="copy"/);
  assert.doesNotMatch(legacy, />Copy<\/button>/);
  assert.match(css, /\.command-copy-target:hover code/);
  assert.match(css, /\.command-copy-target\.is-copied::after/);
});


test("every inline Guide command token is promoted to a keyboard-accessible copy target", async () => {
  const legacy = await readFile(legacyUrl, "utf8");
  const css = await readFile(cssUrl, "utf8");
  assert.match(legacy, /function decorateGuideCommandCode/);
  assert.match(legacy, /text\.startsWith\('!'\)/);
  assert.match(legacy, /classList\.add\('guide-inline-command-copy'\)/);
  assert.match(legacy, /setAttribute\('tabindex','0'\)/);
  assert.match(legacy, /MutationObserver/);
  assert.match(legacy, /e\.key!=='Enter'/);
  assert.match(legacy, /e\.key!==' '/);
  assert.match(css, /\.guide-inline-command-copy:hover/);
  assert.match(css, /\.guide-inline-command-copy\.is-copied::after/);
});
