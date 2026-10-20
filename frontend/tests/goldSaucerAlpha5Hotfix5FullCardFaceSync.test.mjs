import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const component = fs.readFileSync(path.join(root, "src/player/TripleTriad.jsx"), "utf8") + "\n" + fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const version = fs.readFileSync(path.join(root, "src/version.js"), "utf8");
const artRoot = path.join(root, "public/gold-saucer/a5h5/triple-triad/cards");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "../crystal_guild/triple_triad_catalog.json"), "utf8"));
const cards = ["chocobo","moogle","cactuar","bomb","flan","tonberry","coeurl","ahriman","malboro","ifrit","shiva","ramuh","leviathan","bahamut","odin"];

test("Current Triple Triad faces follow the backend catalog and ship with full-size artwork", () => {
  assert.match(component, /TRIAD_ART_ROOT = "\/gold-saucer\/a5h5\/triple-triad"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.9\.7-queens-blood"/);
  assert.equal(catalog.cards.length, 45);
  for (const card of catalog.cards) {
    const p = path.join(root, "public", card.art);
    assert.ok(fs.existsSync(p), `${card.id} face missing`);
    assert.ok(fs.statSync(p).size > 15000, `${card.id} face unexpectedly small`);
  }
});

test("Hotfix 5 removes visible duplicate stat overlays and preserves accessible values", () => {
  const triadCard = component.slice(component.indexOf("const triadAccessibleLabel"), component.indexOf("export default function GoldSaucer"));
  assert.match(triadCard, /triadAccessibleLabel/);
  assert.match(triadCard, /Top|top/);
  assert.doesNotMatch(triadCard, /className="triad-card-values"/);
  assert.doesNotMatch(triadCard, /className="triad-card-rarity"/);
  assert.doesNotMatch(triadCard, /className="triad-card-name"/);
  assert.match(css, /\.triad-card\.full-face[\s\S]*?aspect-ratio:\s*5 \/ 7/);
  assert.match(css, /\.triad-card\.full-face \.triad-card-art img[\s\S]*?object-fit:\s*contain/);
});
