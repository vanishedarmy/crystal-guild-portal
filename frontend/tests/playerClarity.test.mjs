import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const PUBLIC = new URL("../public/", import.meta.url);
const SRC = new URL("../src/", import.meta.url);

test("player guide keeps mechanics but removes development and backend jargon", async () => {
  const markup = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(markup, /Quick Start/);
  assert.match(markup, /!guild/);
  assert.match(markup, /!venture/);
  assert.match(markup, /Combat Style/);
  assert.match(markup, /Repeat rewards/);
  assert.doesNotMatch(markup, /development build|Beta|production baseline|production data|autonomous scheduler|timer ownership|combat semantics|bounded stat curve|responsive dossier|raid dossier/i);
});

test("public portal shows build identity but hides backend terminology from players", async () => {
  const header = await readFile(new URL("components/SiteHeader.jsx", SRC), "utf8");
  const directory = await readFile(new URL("pages/GuildDirectory.jsx", SRC), "utf8");
  const liveStatus = await readFile(new URL("components/LiveStatus.jsx", SRC), "utf8");
  assert.match(header, /build-badge/);
  assert.match(header, /WEB_BUILD/);
  assert.match(header, /WEB_VERSION/);
  assert.doesNotMatch(directory, /Crystal Registry|read-only live adventurer registry|development command map/i);
  assert.match(directory, /View Profile/);
  assert.match(liveStatus, /Updating/);
  assert.doesNotMatch(liveStatus, /Backup Sync/);
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(guide, /guide-build-badge/);
  assert.match(guide, /versionTop/);
  assert.match(guide, /versionSide/);
});

test("streamer dashboard explains tools in plain language while preserving its layout", async () => {
  const dashboard = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  assert.match(dashboard, /Check bot status, economy, and active battles/);
  assert.match(dashboard, /Live Ledger/);
  assert.match(dashboard, /Command buttons copy text only/);
  assert.match(dashboard, /WEB_RELEASE/);
  assert.match(dashboard, /streamer-build/);
  assert.doesNotMatch(dashboard, /Hosted Mirror|sanitized mirror|Bot authority|runtime services|direct Twitch REST|daemon, notifier|Gold Saucer gil/i);
});


test("camp rest status counts down locally between Portal syncs", async () => {
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  assert.match(profile, /campDeadlineMs/);
  assert.match(profile, /campRemainingSeconds/);
  assert.match(profile, /setInterval/);
  assert.doesNotMatch(profile, /duration\(overview\.status\.remaining_seconds\)/);
});


test("camp countdown catches up immediately after a backgrounded tab returns", async () => {
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  assert.match(profile, /visibilitychange/);
  assert.match(profile, /window\.addEventListener\("focus"/);
  assert.match(profile, /window\.addEventListener\("pageshow"/);
  assert.match(profile, /setClockNow\(Date\.now\(\)\)/);
});

test("mobile header exposes a compact LIVE or OFFLINE connection token", async () => {
  const liveStatus = await readFile(new URL("components/LiveStatus.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(liveStatus, /status === "connected" \|\| status === "polling" \? "LIVE" : "OFFLINE"/);
  assert.match(liveStatus, /live-status-mobile-token/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*live-status-mobile-token/);
  assert.match(css, /site-header \.live-status \{ display: inline-flex !important; \}/);
});
