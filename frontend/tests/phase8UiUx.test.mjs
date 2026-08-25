import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Phase 8 UI/UX layer remains intact under the v1.1.18 release identity", async () => {
  const version = await readFile(new URL("version.js", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(version, /WEB_VERSION = "v1\.1\.18"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.1\.18-retro-phase-ii26"/);
  assert.match(css, /v1\.1\.8 — Phase 8 UI\/UX Pass & Polish/);
});

test("adventurer profile provides desktop tabs and a compact mobile section selector", async () => {
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(profile, /profile-tab-select/);
  assert.match(profile, /role="tablist"/);
  assert.match(profile, /aria-selected=\{activeTab === id\}/);
  assert.match(profile, /role="tabpanel"/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*?\.profile-tabs \{ display: none; \}[\s\S]*?\.profile-tab-select/);
});

test("Overview acts as an adventurer home with direct quick actions", async () => {
  const overview = await readFile(new URL("player/Overview.jsx", SRC), "utf8");
  assert.match(overview, /Adventurer Home/);
  assert.match(overview, /overview-quick-actions/);
  assert.match(overview, /Recover & Equip/);
  assert.match(overview, /Guild Blacksmith/);
  assert.match(overview, /onNavigate\?\.\(id\)/);
});

test("Phase 8 adds touch, focus, reduced-motion, Guide, and Streamer polish", async () => {
  const portal = await readFile(new URL("styles/portal.css", SRC), "utf8");
  const streamer = await readFile(new URL("styles/streamer.css", SRC), "utf8");
  const guide = await readFile(new URL("guide.css", PUBLIC), "utf8");
  for (const css of [portal, streamer, guide]) {
    assert.match(css, /prefers-reduced-motion/);
    assert.match(css, /focus-visible/);
  }
  assert.match(portal, /--control-height:\s*44px/);
  assert.match(guide, /--guide-touch:\s*44px/);
  assert.match(streamer, /--streamer-touch:\s*42px/);
});
