import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("Pixelify Sans is loaded for retro display typography without replacing body text", () => {
  const html = read("index.html");
  const portal = read("src/styles/portal.css");
  const guide = read("public/guide.css");
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=Pixelify\+Sans/);
  assert.match(portal, /--font-retro:\s*"Pixelify Sans"/);
  assert.match(portal, /\.character-player-card h2/);
  assert.match(portal, /\.bestiary-monster-copy strong/);
  assert.match(portal, /\.boss-name/);
  assert.match(guide, /--font-retro:"Pixelify Sans"/);
  assert.match(portal, /body[\s\S]*font-family:\s*var\(--font-body\)/);
});
