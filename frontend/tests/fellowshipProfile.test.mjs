import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);

test("Adventurer profiles expose a dedicated Fellowship tab", async () => {
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  assert.match(profile, /\["fellowship", "Fellowship",/);
  assert.match(profile, /import\("\.\.\/player\/Fellowship\.jsx"\)/);
  assert.match(profile, /activeTab === "overview" \|\| activeTab === "fellowship"/);
  assert.match(profile, /activeTab === "overview" \|\| activeTab === "fellowship"/);
});

test("Fellowship profile tab stays personal and summary-first", async () => {
  const tab = await readFile(new URL("player/Fellowship.jsx", SRC), "utf8");
  assert.match(tab, /Personal Fellowship Standing/);
  assert.match(tab, /rank\.name/);
  assert.match(tab, /Founding Member/);
  assert.match(tab, /Projects Supported/);
  assert.match(tab, /Gil Donated/);
  assert.match(tab, /Materials Donated/);
  assert.match(tab, /Orders Participated/);
  assert.match(tab, /Deeds Assisted/);
  assert.match(tab, /(?:to|href)="\/fellowship"/);
  assert.doesNotMatch(tab, /available_projects|rank_ladder|recent_activity/);
});

test("Fellowship member tab is fluid at narrow widths", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  const section = css.slice(css.indexOf("v1.1 Fellowship member profile tab"));
  assert.match(section, /grid-template-columns:\s*minmax\(0, 0\.9fr\) minmax\(280px, 1\.1fr\)/);
  assert.match(section, /@media \(max-width: 760px\)[\s\S]*?\.fellowship-member-rank-copy \{ grid-template-columns: 1fr; \}/);
  assert.match(section, /@media \(max-width: 360px\)[\s\S]*?\.fellowship-member-stats \{ grid-template-columns: 1fr; \}/);
  assert.doesNotMatch(section, /overflow-x:\s*(auto|scroll)/);
});
