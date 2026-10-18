import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("expanded profile destinations fill desktop and phone rows without legacy offsets", () => {
  const profile = read("src/pages/PlayerProfile.jsx");
  const css = read("src/styles/portal.css");
  const tabs = profile.match(/const TABS = \[([\s\S]*?)\n\];/)?.[1] || "";
  assert.equal([...tabs.matchAll(/^\s*\["[a-z_]+",/gm)].length, 21);
  assert.match(css, /@media \(min-width: 1280px\)[\s\S]*?repeat\(6, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(css, /\.profile-tabs button:nth-child\(13\)/);
  assert.doesNotMatch(css, /\.profile-tabs button:last-child\s*\{\s*grid-column:\s*1\s*\/\s*-1/);
});

test("seasonal errors are recoverable, not a permanent loading state", () => {
  const profile = read("src/pages/PlayerProfile.jsx");
  const seasonal = read("src/player/SeasonalEvent.jsx");
  const hosted = read("../crystal_guild/hosted_portal.py");
  assert.match(hosted, /"seasonal"/);
  assert.match(profile, /Could not load this section:/);
  assert.match(profile, /Retry Section/);
  assert.match(seasonal, /The event board is still loading/);
  assert.match(seasonal, /sync_pending/);
});