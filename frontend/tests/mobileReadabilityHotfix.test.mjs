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

test("Bestiary becomes a portrait-led research card layout on mobile", () => {
  const page = read("src/player/Bestiary.jsx");
  const css = read("src/styles/portal.css");
  assert.match(page, /bestiary-card-grid/);
  assert.match(page, /bestiary-card-portrait/);
  assert.match(page, /Combat Profile \/ Active Skill/);
  assert.match(page, /Known Drops/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.bestiary-card-grid/);
  assert.match(css, /\.bestiary-dossier-grid, \.bestiary-drop-list \{ grid-template-columns: 1fr; \}/);
});
