import assert from "node:assert/strict";
import test from "node:test";
import { reconnectDelay, streamIsFresh } from "../src/utils/livePolicy.js";

test("live reconnect backoff is bounded", () => {
  assert.equal(reconnectDelay(0), 1000);
  assert.equal(reconnectDelay(1), 2000);
  assert.equal(reconnectDelay(4), 15000);
  assert.equal(reconnectDelay(99), 15000);
});


test("healthy live streams suppress fallback polling", () => {
  const OPEN = 1;
  assert.equal(streamIsFresh(OPEN, OPEN, 10_000, 20_000, 35_000), true);
  assert.equal(streamIsFresh(OPEN, OPEN, 10_000, 50_001, 35_000), false);
  assert.equal(streamIsFresh(2, OPEN, 10_000, 20_000, 35_000), false);
});


test("portal sync heartbeat state is wired into the live notifier", async () => {
  const { readFile } = await import("node:fs/promises");
  const hook = await readFile(new URL("../src/hooks/useLiveUpdates.js", import.meta.url), "utf8");
  assert.match(hook, /sync_connected/);
  assert.match(hook, /portalSyncConnected/);
  assert.match(hook, /notePortalSync/);
});
