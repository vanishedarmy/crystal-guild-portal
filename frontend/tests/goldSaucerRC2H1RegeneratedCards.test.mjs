import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "src/player/GoldSaucer.jsx"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "src/styles/portal.css"), "utf8");
const version = fs.readFileSync(path.join(ROOT, "src/version.js"), "utf8");
const cards = ["chocobo","moogle","cactuar","bomb","flan","tonberry","coeurl","ahriman","malboro","ifrit","shiva","ramuh","leviathan","bahamut","odin"];

test("RC2 H1 routes Triple Triad to regenerated uniform card family", () => {
  assert.match(source, /TRIAD_CARD_ART_ROOT = "\/gold-saucer\/rc2h1\/triple-triad\/cards"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.8\.0-merc-rc2"/);
  assert.match(css, /\.triad-card\.full-face[\s\S]*?aspect-ratio:\s*5\s*\/\s*7/);
});

test("RC2 H1 ships all fifteen regenerated card faces", () => {
  const dir = path.join(ROOT, "public/gold-saucer/rc2h1/triple-triad/cards");
  for (const id of cards) {
    const p = path.join(dir, `${id}.webp`);
    assert.ok(fs.existsSync(p), `${id} card is missing`);
    assert.ok(fs.statSync(p).size > 100_000, `${id} card is unexpectedly small`);
  }
});
