import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.join(frontend, "public/seasonal/halloween-2026");
const groups = {
  monsters: ["jack-o-bomb", "graveyard-coeurl", "lantern-tonberry", "wraith-ahriman"],
  boss: ["hollow-warden"],
  shop: ["moonlit-token", "spooky-supply-cache", "nightwatcher", "haunted-candle", "hollow-crystal-display"],
  trophies: ["trophy-light-in-dark", "trophy-things-go-bump", "trophy-warden-seal", "trophy-keeper-hollow"],
  banners: ["event-banner", "seasonal-header", "emporium-header", "bestiary-header"],
  places: ["haunted-ruins", "graveyard", "eerie-forest", "hollow-crystal-spire"],
};
const names = [
  ...groups.monsters.flatMap((name) => [name, `${name}-locked`]),
  ...groups.boss.flatMap((name) => [name, `${name}-locked`]),
  ...groups.shop,
  ...groups.trophies.flatMap((name) => [name, `${name}-locked`]),
  ...groups.banners,
  ...groups.places,
];

test("all eight Halloween art batches ship as exactly 31 independent optimized images", () => {
  assert.equal(names.length, 31);
  assert.equal(new Set(names).size, 31);
  const actual = fs.readdirSync(root).filter((f) => f.endsWith(".webp")).sort();
  assert.deepEqual(actual, names.map((name) => `${name}.webp`).sort());
  for (const name of names) {
    const buffer = fs.readFileSync(path.join(root, `${name}.webp`));
    assert.ok(buffer.byteLength > 5000, `${name}: missing or suspiciously tiny artwork`);
    assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
    assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  }
});

test("seasonal cards contain the complete illustration, not a clipped sprite-sheet tile", () => {
  const css = fs.readFileSync(path.join(frontend, "src/styles/portal.css"), "utf8");
  const seasonal = fs.readFileSync(path.join(frontend, "src/player/SeasonalEvent.jsx"), "utf8");
  assert.match(css, /\.seasonal-art-hotfix3 \.seasonal-monster-card img[^{]*\{[^}]*object-fit:contain/);
  assert.match(css, /\.seasonal-art-hotfix3 \.seasonal-shop-card img[^{]*\{[^}]*object-fit:contain/);
  assert.match(css, /\.seasonal-art-hotfix3 \.seasonal-trophy-card img[^{]*\{[^}]*object-fit:contain/);
  assert.match(seasonal, /halloween-art-hotfix3/); // cache bust for replaced files
  assert.match(seasonal, /wardenDiscovered \? event\.world_event\.art : \(event\.world_event\.locked_art/);
});

test("all support banners, Moonlit Token, and four stand-alone backgrounds are wired", () => {
  const seasonal = fs.readFileSync(path.join(frontend, "src/player/SeasonalEvent.jsx"), "utf8");
  for (const image of [...groups.banners.filter((name) => name !== "event-banner"), ...groups.places, "moonlit-token"]) {
    assert.ok(seasonal.includes(`${image}.webp`), `${image} not rendered`);
  }
  assert.match(seasonal, /event\.art\?\.banner/);
  assert.match(seasonal, /<details className="seasonal-scenery-details">/);
  assert.match(seasonal, /reward\.owned && !reward\.repeatable/);
});
