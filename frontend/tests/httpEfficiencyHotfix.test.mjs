import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const webRoot = path.resolve(root, "..");

test("Portal action API keeps single-action long polling while the passive connection strip does not poll", () => {
  const auth = read("src/api/auth.js");
  const panel = read("src/components/PortalLinkPanel.jsx");
  assert.match(auth, /fetchPortalAction/);
  assert.match(auth, /\?wait=/);
  assert.match(auth, /waitForPortalAction/);
  assert.match(auth, /singleActionSupported/);
  assert.match(auth, /fetchPortalActions/);
  assert.doesNotMatch(panel, /waitForPortalAction|fetchPortalActions|submitPortalPing/);
  assert.doesNotMatch(panel, /setInterval\(pollPending, 1500\)/);
});

test("shared JSON client reuses ETags and accepts 304 without a response body", () => {
  const client = read("src/api/client.js");
  assert.match(client, /responseCache/);
  assert.match(client, /If-None-Match/);
  assert.match(client, /response\.status === 304/);
  assert.match(client, /response\.headers\.get\("ETag"\)/);
  assert.match(client, /clearJsonCache/);
});

test("live update policy prefers SSE and delays duplicate initial health polling", () => {
  const live = read("src/hooks/useLiveUpdates.js");
  assert.match(live, /HEARTBEAT_STALE_MS = 50000/);
  assert.match(live, /if \(!force && streamFresh\) return/);
  assert.match(live, /initialHealthTimer = setTimeout/);
  assert.match(live, /2500/);
  assert.match(live, /crystal-guild-live-revision/);
});

test("standalone raid overlay is SSE-driven with slow HTTP recovery only", () => {
  const overlay = read("public/raid-overlay.js");
  assert.match(overlay, /new EventSource\('\/api\/events'\)/);
  assert.match(overlay, /streamFresh/);
  assert.match(overlay, /60000/);
  assert.doesNotMatch(overlay, /setInterval\(refresh,700\)/);
  assert.doesNotMatch(overlay, /overlay\/state\?ts=/);
});

test("high-frequency views use live revisions and slow fallback intervals", () => {
  const inventory = read("src/player/Inventory.jsx");
  const raids = read("src/player/Raids.jsx");
  const hunts = read("src/player/Hunts.jsx");
  assert.match(inventory, /crystal-guild-live-revision/);
  assert.match(inventory, /120000/);
  assert.match(raids, /crystal-guild-live-revision/);
  assert.match(raids, /60000/);
  assert.match(raids, /120000/);
  assert.doesNotMatch(raids, /\?ts=\$\{Date\.now\(\)\}/);
  assert.match(hunts, /crystal-guild-live-revision/);
  assert.match(hunts, /30000/);
  assert.match(hunts, /60000/);
});

test("hosted SSE keepalive and client stale window are safely widened", () => {
  const hosted = fs.readFileSync(path.join(webRoot, "crystal_guild/hosted_portal.py"), "utf8");
  const live = read("src/hooks/useLiveUpdates.js");
  assert.match(hosted, /wait_for_revision\(revision, timeout=20\.0\)/);
  assert.match(live, /HEARTBEAT_STALE_MS = 50000/);
});

test("auth refresh uses a low-frequency visible fallback with focus throttling", () => {
  const authHook = read("src/hooks/usePortalAuth.js");
  assert.match(authHook, /AUTH_POLL_MS = 120000/);
  assert.match(authHook, /AUTH_FOCUS_STALE_MS = 15000/);
  assert.match(authHook, /document\.visibilityState === "visible"/);
  assert.match(authHook, /refreshOnReturn/);
  assert.match(authHook, /resetPortalApiCache/);
});
