import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("hero directory keeps long names on one line and status out of the name area", () => {
  const page = read("src/pages/GuildDirectory.jsx");
  const css = read("src/styles/character-identity.css");
  assert.match(page, /player-card-topline/);
  assert.match(page, /title=\{player\.display_name\}/);
  assert.match(css, /\.character-player-card h2[\s\S]*white-space: nowrap/);
  assert.match(css, /\.player-card-topline \.status-badge[\s\S]*position: static/);
});

test("Bestiary becomes a labeled portrait-led card layout on mobile", () => {
  const page = read("src/player/Bestiary.jsx");
  const css = read("src/styles/portal.css");
  assert.match(page, /bestiary-table-wrap/);
  assert.match(page, /data-label="Weakness"/);
  assert.match(page, /data-label="Combat Style"/);
  assert.match(page, /data-label="Active Skill"/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.bestiary-table tr[\s\S]*display: grid/);
  assert.match(css, /\.bestiary-table thead[\s\S]*display: none/);
});
