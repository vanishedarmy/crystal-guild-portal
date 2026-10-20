import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WEB_VERSION, WEB_BUILD, WEB_RELEASE, WEB_ASSET_REVISION } from "../src/version.js";
import { MAJOR_UPDATES } from "../src/player/whatsNewData.js";

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspace = path.resolve(frontend, "../..");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(frontend, name), "utf8"));
const publicFile = (name) => path.join(frontend, "public", name.replace(/^\//, ""));

// These checks cover *current* release contracts. Earlier milestone tests retain
// the historical feature checks without assuming their versions remain current.
test("Queen's Blood v1.9.7 identity agrees across Bot, Web, and frontend", () => {
  assert.equal(WEB_VERSION, "v1.9.7");
  assert.equal(WEB_BUILD, "Queen's Blood");
  assert.equal(WEB_RELEASE, "v1.9.7 — Queen's Blood");
  assert.equal(WEB_ASSET_REVISION, "1.9.7-queens-blood");
  for (const name of ["Bot/VERSION.txt", "Web/VERSION.txt"]) {
    assert.equal(fs.readFileSync(path.join(workspace, name), "utf8").trim(), WEB_ASSET_REVISION, name);
  }
  const pkg = readJson("package.json");
  const lock = readJson("package-lock.json");
  assert.equal(pkg.version, "1.9.7");
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[""].version, pkg.version);
});

test("current What's New entry points to Card Hall without erasing older updates", () => {
  assert.equal(MAJOR_UPDATES[0].version, WEB_VERSION);
  assert.equal(MAJOR_UPDATES[0].action.tab, "card_hall");
  assert.equal(MAJOR_UPDATES.find((entry) => entry.version === "v1.9.3")?.action.tab, "guild_board");
  assert.equal(MAJOR_UPDATES.find((entry) => entry.version === "v1.9.2")?.name, "Relic Arsenal Overhaul");
});

test("Queen's Blood ships exactly 48 unique referenced WebP cards", () => {
  const catalog = readJson("public/card-hall/artwork-manifest.json");
  assert.equal(catalog.release, WEB_ASSET_REVISION);
  assert.equal(catalog.cards.length, 48);
  assert.equal(new Set(catalog.cards.map((entry) => entry.id)).size, 48);
  for (const card of catalog.cards) {
    const filename = publicFile(`/card-hall/${card.path}`);
    assert.ok(fs.existsSync(filename), `${card.id} missing artwork: ${card.path}`);
    const header = fs.readFileSync(filename).subarray(0, 12);
    assert.equal(header.toString("ascii", 0, 4), "RIFF", card.id);
    assert.equal(header.toString("ascii", 8, 12), "WEBP", card.id);
  }
});

test("Triple Triad's 45 cards each resolve to a published WebP image", () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(workspace, "Web/crystal_guild/triple_triad_catalog.json"), "utf8"));
  assert.equal(catalog.cards.length, 45);
  assert.equal(new Set(catalog.cards.map((entry) => entry.id)).size, 45);
  for (const card of catalog.cards) {
    assert.ok(card.art?.startsWith("/gold-saucer/"), `${card.id} missing art URL`);
    const filename = publicFile(card.art);
    assert.ok(fs.existsSync(filename), `${card.id} referenced artwork missing: ${card.art}`);
    const header = fs.readFileSync(filename).subarray(0, 12);
    assert.equal(header.toString("ascii", 0, 4), "RIFF", card.id);
    assert.equal(header.toString("ascii", 8, 12), "WEBP", card.id);
  }
});
