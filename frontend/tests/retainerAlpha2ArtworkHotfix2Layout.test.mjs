import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(here, "..");
const css = fs.readFileSync(path.join(frontend, "src/styles/portal.css"), "utf8");
const version = fs.readFileSync(path.join(frontend, "src/version.js"), "utf8");

test("Retainer artwork layout uses the intended 12-column grid", () => {
  assert.match(css, /Retainer Service Alpha 2 — Artwork & UI Hotfix 2/);
  assert.match(css, /\.retainer-service-grid\s*\{\s*display:grid;\s*grid-template-columns:repeat\(12,minmax\(0,1fr\)\)/s);
});

test("Retainer portrait is hard-bounded instead of scaling across a full-width panel", () => {
  assert.match(css, /\.retainer-profile-art\{[^}]*max-height:176px/s);
  assert.match(css, /\.retainer-portrait-art\{[^}]*max-width:min\(72%,210px\)[^}]*max-height:176px/s);
  assert.match(version, /WEB_ASSET_REVISION = "1\.7\.1-resynthesis-a1"/);
});
