import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("Gold Saucer H1 uses explicit scenic image layers and individual slot art", () => {
  const source = read("src/player/GoldSaucer.jsx");
  for (const route of ["saucer-lobby.webp", "mini-cactpot.webp", "crystal-slots.webp", "prize-counter.webp"]) {
    assert.match(source, new RegExp(route.replace(".", "\\.")));
  }
  for (const symbol of ["crystal", "moogle", "chocobo", "cactuar", "bomb", "potion"]) {
    assert.match(source, new RegExp(`slots/${symbol}\\.webp`));
    assert.ok(fs.existsSync(path.join(root, `public/gold-saucer/a1h1/slots/${symbol}.webp`)));
  }
  assert.doesNotMatch(source, /SLOT_GLYPHS/);
  assert.match(source, /saucer-slot-symbol/);
  assert.match(source, /saucer-scenic-art/);
});

test("Gold Saucer H1 scenic WebP assets exist", () => {
  for (const name of ["saucer-lobby.webp", "mini-cactpot.webp", "crystal-slots.webp", "prize-counter.webp"]) {
    const file = path.join(root, `public/gold-saucer/a1h1/${name}`);
    assert.ok(fs.existsSync(file), name);
    assert.ok(fs.statSync(file).size > 10000, name);
  }
});

test("Gold Saucer H1 CSS keeps scenic art behind readable content", () => {
  const css = read("src/styles/portal.css");
  assert.match(css, /saucer-scenic-panel>\.saucer-scenic-art/);
  assert.match(css, /saucer-scenic-panel>\*:not\(\.saucer-scenic-art\)/);
  assert.match(css, /saucer-slot-symbol/);
});
