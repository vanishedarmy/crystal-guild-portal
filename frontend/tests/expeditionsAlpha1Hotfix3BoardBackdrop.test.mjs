import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");

test("Alpha 1 Hotfix 3 expands the Expedition Board map-room backdrop beyond the shared 1px panel accent", () => {
  assert.match(css, /\.expedition-board-panel::before \{[\s\S]*?height:\s*auto;[\s\S]*?url\('\/expeditions\/expedition-board\.webp'\);[\s\S]*?background-position:\s*center 42%;[\s\S]*?opacity:\s*\.95;[\s\S]*?\}/);
});
