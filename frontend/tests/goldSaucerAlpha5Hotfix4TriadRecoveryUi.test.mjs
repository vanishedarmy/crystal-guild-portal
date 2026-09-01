import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const component = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const pointer = fs.readFileSync(path.join(root, "src/components/CollapsePointer.jsx"), "utf8");
const version = fs.readFileSync(path.join(root, "src/version.js"), "utf8");
const artRoot = path.join(root, "public/gold-saucer/a5h4/triple-triad");

const cards = ["chocobo","moogle","cactuar","bomb","flan","tonberry","coeurl","ahriman","malboro","ifrit","shiva","ramuh","leviathan","bahamut","odin"];
const opponents = ["saucer_attendant","card_shark","crystal_master"];
const ui = ["hero","board","deck-builder","collection","collection-complete","how-to-play","match-start","new-card","deck-saved","crystal-master-locked","opponents"];

test("Hotfix 4 cache-busts and packages the complete Triple Triad art family", () => {
  assert.match(component, /TRIAD_ART_ROOT = "\/gold-saucer\/a5h4\/triple-triad"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.6\.0-gold-saucer-a5h4"/);
  for (const id of cards) assert.ok(fs.existsSync(path.join(artRoot, `cards/${id}.webp`)), `${id} card art missing`);
  assert.ok(fs.existsSync(path.join(artRoot, "cards/card-back.webp")));
  for (const id of opponents) assert.ok(fs.existsSync(path.join(artRoot, `opponents/${id}.webp`)), `${id} opponent art missing`);
  for (const id of ["win","draw","loss"]) assert.ok(fs.existsSync(path.join(artRoot, `results/${id}.webp`)), `${id} result art missing`);
  for (const id of ui) assert.ok(fs.existsSync(path.join(artRoot, `ui/${id}.webp`)), `${id} UI art missing`);
});

test("Triple Triad card art is above the card background and has a safe fallback", () => {
  assert.match(component, /function ArtImage\(/);
  assert.match(component, /fallbackAttempted/);
  assert.match(component, /fallbackSrc=\{`\$\{TRIAD_ART_ROOT\}\/cards\/card-back\.webp`\}/);
  assert.match(css, /\.triad-card-art\s*\{[\s\S]*?z-index:\s*0/);
  assert.doesNotMatch(css.slice(css.lastIndexOf("Hotfix 4")), /\.triad-card-art\s*\{[^}]*z-index:\s*-[0-9]/);
  assert.match(css, /@media \(max-width: 540px\)[\s\S]*?\.triad-context-banner\s*\{[\s\S]*?display:\s*block/);
});

test("Gold Saucer disclosures use the shared finger pointers", () => {
  assert.match(component, /import \{ DetailsPointer \} from "\.\.\/components\/CollapsePointer\.jsx"/);
  const uses = component.match(/<DetailsPointer className="saucer-details-pointer" \/>/g) || [];
  assert.ok(uses.length >= 9, `expected shared pointers across Gold Saucer disclosures, got ${uses.length}`);
  assert.match(pointer, /collapse-pointer-right-a2\.webp/);
  assert.match(pointer, /collapse-pointer-down-a2\.webp/);
  assert.ok(fs.existsSync(path.join(root, "public/ui/collapse-pointer-right-a2.webp")));
  assert.ok(fs.existsSync(path.join(root, "public/ui/collapse-pointer-down-a2.webp")));
  assert.match(css, /saucer-section-disclosure > \.saucer-section-summary::after[\s\S]*?content:\s*none !important/);
});

test("Hotfix 4 UI uses illustrated opponent and collection context panels", () => {
  assert.match(component, /triad-opponents-banner/);
  assert.match(component, /ui\/opponents\.webp/);
  assert.match(component, /triad-collection-banner/);
  assert.match(component, /ui\/collection\.webp/);
});
