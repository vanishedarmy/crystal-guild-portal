import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const text = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Guild Expansion Beta 1 publishes the player-facing balance summary", async () => {
  const news = await text("../src/player/whatsNewData.js");
  assert.match(news, /name: "Guild Expansion Beta 1"/);
  assert.match(news, /Airship arrives sooner/);
  assert.match(news, /Rare materials respect rarity/);
  assert.match(news, /Weekly rewards stay steady/);
});

test("Guild Expansion Beta 1 public identity is current", async () => {
  const version = await text("../src/version.js");
  assert.match(version, /WEB_BUILD = "Guild Expansion Beta 1"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.3\.0-guild-expansion-b1"/);
});

test("Player Guide stays focused on play instead of simulation internals", async () => {
  const guide = await text("../public/guide-body.html");
  assert.doesNotMatch(guide, /fixed seed|runs per profile|Monte Carlo|simulation matrix/i);
  assert.match(guide, /Airship Dock/);
  assert.match(guide, /Weekly Orders/);
});
