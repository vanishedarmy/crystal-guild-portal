import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const component = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const version = fs.readFileSync(path.join(root, "src/version.js"), "utf8");
const artRoot = path.join(root, "public/gold-saucer/a5h5/triple-triad/cards");
const cards = ["chocobo","moogle","cactuar","bomb","flan","tonberry","coeurl","ahriman","malboro","ifrit","shiva","ramuh","leviathan","bahamut","odin"];

test("Hotfix 5 uses the full cache-busted Triple Triad card faces", () => {
  assert.match(component, /TRIAD_ART_ROOT = "\/gold-saucer\/a5h5\/triple-triad"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.7\.0-retainer-a1"/);
  for (const id of cards) {
    const p = path.join(artRoot, `${id}.webp`);
    assert.ok(fs.existsSync(p), `${id} H5 full-face art missing`);
    assert.ok(fs.statSync(p).size > 15000, `${id} H5 full-face art unexpectedly small`);
  }
});

test("Hotfix 5 removes visible duplicate stat overlays and preserves accessible values", () => {
  const triadCard = component.slice(component.indexOf("function triadAccessibleLabel"), component.indexOf("export default function GoldSaucer"));
  assert.match(triadCard, /triadAccessibleLabel/);
  assert.match(triadCard, /Top|top/);
  assert.doesNotMatch(triadCard, /className="triad-card-values"/);
  assert.doesNotMatch(triadCard, /className="triad-card-rarity"/);
  assert.doesNotMatch(triadCard, /className="triad-card-name"/);
  assert.match(css, /\.triad-card\.full-face[\s\S]*?aspect-ratio:\s*5 \/ 7/);
  assert.match(css, /\.triad-card\.full-face \.triad-card-art img[\s\S]*?object-fit:\s*contain/);
});
