import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const component = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const version = fs.readFileSync(path.join(root, "src/version.js"), "utf8");

test("Hotfix 6 removes the wide Choose Opponent header image", () => {
  assert.doesNotMatch(component, /triad-opponents-banner/);
  assert.doesNotMatch(component, /TRIAD_ART_ROOT\}\/ui\/opponents\.webp/);
  assert.match(component, /triad-opponent-heading/);
  assert.match(component, /cards collected/);
});

test("Hotfix 6 makes opponent selection compact and explicit", () => {
  assert.match(component, /triad-opponent-status/);
  assert.match(component, /SELECTED/);
  assert.match(css, /Hotfix 6/);
  assert.match(css, /\.triad-opponent-art\s*\{[\s\S]*?aspect-ratio:\s*16 \/ 7/);
  assert.match(css, /@media\(max-width:760px\)[\s\S]*?\.triad-opponent\s*\{[\s\S]*?grid-template-columns:/);
});

test("Hotfix 6 is a Web-only asset revision", () => {
  assert.match(version, /WEB_ASSET_REVISION = "1\.6\.0-gold-saucer-rc2"/);
  assert.match(component, /TRIAD_ART_ROOT = "\/gold-saucer\/a5h5\/triple-triad"/);
});
