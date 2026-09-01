import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const text = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Guild Expansion publishes the complete player-facing Guild summary", async () => {
  const news = await text("../src/player/whatsNewData.js");
  assert.match(news, /name: "Guild Expansion"/);
  assert.match(news, /Build the Guild together/);
  assert.match(news, /Weekly work rewards participation/);
  assert.match(news, /The Crystal Guild Airship/);
});

test("Guild Expansion public identity is current", async () => {
  const version = await text("../src/version.js");
  assert.match(version, /WEB_BUILD = "Gold Saucer"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.6\.0-gold-saucer-a5h3"/);
});

test("Player Guide stays focused on play instead of simulation internals", async () => {
  const guide = await text("../public/guide-body.html");
  assert.doesNotMatch(guide, /fixed seed|runs per profile|Monte Carlo|simulation matrix/i);
  assert.match(guide, /Airship Dock/);
  assert.match(guide, /Weekly Orders/);
});
