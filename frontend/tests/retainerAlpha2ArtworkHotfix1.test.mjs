import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(here, "..");
const component = fs.readFileSync(path.join(frontend, "src/player/RetainerService.jsx"), "utf8");
const css = fs.readFileSync(path.join(frontend, "src/styles/portal.css"), "utf8");
const version = fs.readFileSync(path.join(frontend, "src/version.js"), "utf8");

const expected = [
  "retainer-office.webp",
  "retainers/scout-moogle.webp",
  "retainers/pack-moogle.webp",
  "retainers/expert-moogle.webp",
  "status/ready.webp",
  "status/in-progress.webp",
  "status/completed.webp",
  "badges/rank-i.webp",
  "badges/rank-ii.webp",
  "badges/rank-iii.webp",
  "assignments/field-gathering.webp",
  "assignments/monster-salvage.webp",
  "assignments/mineral-survey.webp",
  "assignments/regional-procurement.webp",
  "assignments/specialist-acquisition.webp",
];

test("Retainer artwork hotfix ships routed WebP assets", () => {
  for (const rel of expected) {
    assert.ok(fs.existsSync(path.join(frontend, "public/retainer/a2h1", rel)), rel);
  }
  assert.match(component, /RETAINER_ART_ROOT = "\/retainer\/a2h1"/);
  assert.match(component, /retainerPortrait/);
  assert.match(component, /retainerCrest/);
  assert.match(css, /Retainer Service Alpha 2 — Artwork & UI Hotfix 1/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.7\.1-resynthesis-a1h1"/);
});
