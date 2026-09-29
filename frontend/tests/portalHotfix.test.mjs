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

test("connection status strip is passive and has no action-history polling", async () => {
  const panel = await readFile(new URL("components/PortalLinkPanel.jsx", SRC), "utf8");
  assert.match(panel, /Crystal Guild Connection/);
  assert.match(panel, /ONLINE/);
  assert.match(panel, /OFFLINE/);
  assert.doesNotMatch(panel, /submitPortalPing|fetchPortalActions|waitForPortalAction|Refresh connection/);
});
