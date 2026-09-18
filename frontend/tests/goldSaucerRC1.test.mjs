import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { WEB_ASSET_REVISION, WEB_VERSION } from "../src/version.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const component = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const guide = fs.readFileSync(path.join(root, "public/guide-body.html"), "utf8");

test("Gold Saucer freezes the current release identity", () => {
  assert.equal(WEB_VERSION, "v1.8.1");
  assert.equal(WEB_ASSET_REVISION, "1.8.1-merc-recruitment");
  assert.match(component, /className="eyebrow">Gold Saucer/);
  assert.doesNotMatch(component, /v1\.6\.0 · Gold Saucer/);
  assert.match(guide, /Gold Saucer v1\.6\.0 freezes local DB schema <b>13<\/b> and Portal Action protocol <b>29<\/b>/);
});

test("RC1 retains the finished five-attraction floor presentation", () => {
  for (const label of ["Mini Cactpot", "Crystal Slots", "Monster Toss", "Chocobo Racing", "Triple Triad"]) {
    assert.match(component, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(component, /TRIAD_ART_ROOT = "\/gold-saucer\/a5h5\/triple-triad"/);
  assert.doesNotMatch(component, /ui\/opponents\.webp/);
  assert.match(component, /DetailsPointer className="saucer-details-pointer"/);
});
