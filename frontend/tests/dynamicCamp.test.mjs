import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Adventure Board explains and labels dynamic Camp timers", async () => {
  const hunts = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(hunts, /15 minutes while stream is LIVE and 1 hour while OFFLINE/);
  assert.match(hunts, /state\.camp\.stream_live \? "LIVE Camp" : "OFFLINE Camp"/);
});

test("Player Guide documents LIVE and OFFLINE Camp bases", async () => {
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  const data = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  assert.match(guide, /15 minutes while the channel is LIVE/);
  assert.match(guide, /1 hour while OFFLINE/);
  assert.equal(data.meta.camp_rest_online, 900);
  assert.equal(data.meta.camp_rest_offline, 3600);
});
