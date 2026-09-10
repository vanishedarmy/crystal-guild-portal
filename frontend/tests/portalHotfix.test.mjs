import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("player-profile exit navigation uses full document links", async () => {
  const header = await readFile(new URL("components/SiteHeader.jsx", SRC), "utf8");
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  const fellowship = await readFile(new URL("player/Fellowship.jsx", SRC), "utf8");

  assert.match(header, /brandHref = "\/players"/);
  assert.match(header, /href: "\/players"/);
  assert.match(header, /href: "\/fellowship"/);
  assert.doesNotMatch(header, /<Link[^>]+to="\/(?:players|fellowship)"/);
  assert.match(profile, /<a className="back-link" href="\/players">/);
  assert.match(fellowship, /href="\/fellowship">View the full Fellowship/);
});

test("Portal auth status refreshes in the background and when the tab returns", async () => {
  const hook = await readFile(new URL("hooks/usePortalAuth.js", SRC), "utf8");
  assert.match(hook, /AUTH_POLL_MS = 120000/);
  assert.match(hook, /window\.setInterval\(\(\) =>/);
  assert.match(hook, /window\.addEventListener\("focus", refreshOnReturn\)/);
  assert.match(hook, /window\.addEventListener\("pageshow", refreshOnReturn\)/);
  assert.match(hook, /visibilitychange/);
  assert.match(hook, /const subscribers = new Set\(\)/);
});

test("completed Portal action result overrides the temporary queued message", async () => {
  const panel = await readFile(new URL("components/PortalLinkPanel.jsx", SRC), "utf8");
  assert.match(panel, /latestFinished/);
  assert.match(panel, /latestFinished && latestText \? latestText : \(message \|\| latestText\)/);
  assert.match(panel, /aria-live="polite">\{displayedMessage\}/);
  assert.match(panel, /window\.addEventListener\("focus", refreshActions\)/);
  assert.match(panel, /window\.addEventListener\("pageshow", refreshActions\)/);
});


test("Portal action history stays idle unless an action is pending", async () => {
  const panel = await readFile(new URL("components/PortalLinkPanel.jsx", SRC), "utf8");
  assert.match(panel, /const hasPending = useMemo/);
  assert.match(panel, /if \(!isOwnProfile \|\| !hasPending\) return undefined/);
  assert.match(panel, /waitForPortalAction\(pending\.id/);
  assert.match(panel, /actionRefreshInFlight\.current/);
  assert.match(panel, /\}, \[isOwnProfile, refreshActions\]\);/);
  assert.doesNotMatch(panel, /\}, \[isOwnProfile, refreshActions, actions\]\);/);
});
