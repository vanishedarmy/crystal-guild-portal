import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const assets = ["airship-ambient.webp","crystal-watermark.webp","gold-divider.webp","crystal-row.webp","portal-ambient.webp"];

test("Retro Environment Pass packages transparent decorative assets and imports its layer last", () => {
  for (const asset of assets) assert.ok(fs.existsSync(path.join(root, `public/retro-phase-ii/environment-pass/${asset}`)), asset);
  const main = read("src/main.jsx");
  assert.match(main, /environment-pass\.css/);
  assert.ok(main.lastIndexOf("environment-pass.css") > main.lastIndexOf("monster-identity.css"));
});

test("Retro Environment Pass keeps body text readable while applying fantasy display typography", () => {
  const css = read("src/styles/environment-pass.css");
  const guide = read("public/guide.css");
  assert.match(css, /--font-retro-ui/);
  assert.match(css, /site-nav-link/);
  assert.doesNotMatch(css, /body\s*\{[^}]*font-family:\s*var\(--font-retro-ui\)/s);
  assert.match(guide, /Retro Environment Pass/);
  assert.match(guide, /gold-divider\.webp/);
  assert.match(guide, /airship-ambient\.webp/);
});
