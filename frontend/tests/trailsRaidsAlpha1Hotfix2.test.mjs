import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("Hotfix 2 gives Riftglass Observatory a full Player Guide dossier", () => {
  const guide = read("public/guide-body.html");
  assert.match(guide, /<h3>The Riftglass Observatory<\/h3>/);
  assert.match(guide, /ten-chamber Astral Scar observatory/);
  assert.match(guide, /two Crossroads/);
  assert.match(guide, /weighted Event chamber/);
  assert.match(guide, /Death Machine miniboss/);
  assert.match(guide, /Crystal Wolf finale/);
});

test("Hotfix 2 removes the gold divider asset and every active rendering reference", () => {
  const portalCss = read("src/styles/environment-pass.css");
  const guideCss = read("public/guide.css");
  assert.doesNotMatch(portalCss, /gold-divider|env-gold-divider/);
  assert.doesNotMatch(guideCss, /gold-divider|env-gold-divider/);
  assert.ok(!fs.existsSync(path.join(root, "public/retro-phase-ii/environment-pass/gold-divider.webp")));
});
