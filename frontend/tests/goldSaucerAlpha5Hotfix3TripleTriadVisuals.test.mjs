import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const component = fs.readFileSync(path.join(root, "src/player/GoldSaucer.jsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const version = fs.readFileSync(path.join(root, "src/version.js"), "utf8");
const artRoot = path.join(root, "public/gold-saucer/a5h5/triple-triad");

const cards = ["chocobo","moogle","cactuar","bomb","flan","tonberry","coeurl","ahriman","malboro","ifrit","shiva","ramuh","leviathan","bahamut","odin"];
const opponents = ["saucer_attendant","card_shark","crystal_master"];

test("Hotfix 3 packages the full Triple Triad visual family", () => {
  for (const id of cards) assert.ok(fs.existsSync(path.join(artRoot, `cards/${id}.webp`)), `${id} art missing`);
  assert.ok(fs.existsSync(path.join(artRoot, "cards/card-back.webp")));
  for (const id of opponents) assert.ok(fs.existsSync(path.join(artRoot, `opponents/${id}.webp`)), `${id} opponent art missing`);
  for (const id of ["win","draw","loss"]) assert.ok(fs.existsSync(path.join(artRoot, `results/${id}.webp`)));
});

test("Triple Triad keeps authoritative values accessible while the full card face owns visible presentation", () => {
  assert.match(component, /TRIAD_CARD_ART/);
  assert.match(component, /triad-card-art/);
  assert.match(component, /triadAccessibleLabel/);
  assert.match(component, /card\?\.top/);
  assert.match(component, /card\?\.right/);
  assert.match(component, /card\?\.bottom/);
  assert.match(component, /card\?\.left/);
  assert.match(component, /TRIAD_OPPONENT_ART/);
  assert.match(component, /results\/\$\{triadResultKey\}\.webp/);
});

test("Triple Triad artwork UI remains responsive and retains H2 collapse behavior", () => {
  assert.match(css, /\.triad-hero\{/);
  assert.match(css, /\.triad-opponent-art/);
  assert.match(css, /@media\(max-width:540px\)/);
  assert.match(component, /<details className="panel saucer-triad-panel saucer-section-disclosure"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.8\.0-merc-a1"/);
});
