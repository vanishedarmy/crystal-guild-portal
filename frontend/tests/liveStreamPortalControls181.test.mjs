import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("authenticated Stream Activities can submit live rally joins and round actions", async () => {
  const stream = await readFile(new URL("player/StreamActivities.jsx", SRC), "utf8");
  const auth = await readFile(new URL("api/auth.js", SRC), "utf8");
  assert.match(stream, /runLiveJoin/);
  assert.match(stream, /runLiveAction/);
  assert.match(stream, /Join Stream Venture/);
  assert.match(stream, /liveRaid=\{state\?\.raid \|\| null\}/);
  assert.match(auth, /submitPortalAction\("LIVE_EVENT_JOIN"/);
  assert.match(auth, /submitPortalAction\("LIVE_EVENT_ACTION"/);
});

test("live battle controller exposes core actions, abilities, ally targeting, and categorized items", async () => {
  const controls = await readFile(new URL("components/LiveStreamCombatControls.jsx", SRC), "utf8");
  for (const text of ["Attack", "Defend", "Abilities", "Support target", "Healing", "Support", "Damage", "Owned"]) {
    assert.match(controls, new RegExp(text));
  }
  assert.match(controls, /ItemArtwork/);
  assert.match(controls, /onAction\?\.\("ability"/);
  assert.match(controls, /onAction\?\.\("item"/);
});

test("raid board renders personal Portal join and combat controls beside public raid telemetry", async () => {
  const raids = await readFile(new URL("player/Raids.jsx", SRC), "utf8");
  assert.match(raids, /Join Raid/);
  assert.match(raids, /LiveStreamCombatControls/);
  assert.match(raids, /liveRaid\?\.state === "rally"/);
  assert.match(raids, /liveRaid\?\.state === "combat"/);
});

test("mobile live battle choices stay compact and consumables use two columns", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.live-stream-option-grid \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
});
