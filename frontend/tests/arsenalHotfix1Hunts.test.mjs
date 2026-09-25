import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Arsenal Hotfix 1 presents Hunts as timed autonomous assignments", async () => {
  const hunts = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(hunts, /active_hunt/);
  assert.match(hunts, /Hunt in Progress/);
  assert.match(hunts, /Automatic Hunt/);
  assert.match(hunts, /Assignment length/);
  assert.match(hunts, /duration\(hunt\.duration_seconds\)/);
  assert.match(hunts, /Resolves when the assignment timer ends/i);
  assert.doesNotMatch(hunts, /Hunt combat uses Twitch chat\. If you do not choose an action/);
});

test("Arsenal Hotfix 1 adds site-wide readability safeguards", async () => {
  const portal = await readFile(new URL("styles/portal.css", SRC), "utf8");
  const streamer = await readFile(new URL("styles/streamer.css", SRC), "utf8");
  const guide = await readFile(new URL("guide.css", PUBLIC), "utf8");
  assert.match(portal, /Arsenal Hotfix 1 — timed Hunts \+ site readability polish/);
  assert.match(portal, /--muted:\s*#adbdcc/);
  assert.match(portal, /overflow-wrap:\s*anywhere/);
  assert.match(portal, /\.timed-hunt-countdown/);
  assert.match(streamer, /Arsenal Hotfix 1 — dashboard readability and responsive polish/);
  assert.match(streamer, /text-wrap:\s*pretty/);
  assert.match(guide, /Arsenal Hotfix 1: Player Guide readability pass/);
  assert.match(guide, /--muted:\s*#b4c1da/);
  assert.match(guide, /text-wrap:\s*pretty/);
  assert.match(guide, /min-height:\s*44px/);
});
