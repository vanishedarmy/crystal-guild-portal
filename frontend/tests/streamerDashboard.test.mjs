import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);

test("the dedicated streamer route remains outside public navigation", async () => {
  const app = await readFile(new URL("App.jsx", SRC), "utf8");
  const siteHeader = await readFile(new URL("components/SiteHeader.jsx", SRC), "utf8");
  assert.match(app, /path="\/streamer"/);
  assert.doesNotMatch(siteHeader, /to="\/streamer"|href="\/streamer"/);
});

test("Streamer dashboard uses the aggregate endpoint plus authenticated Portal controls", async () => {
  const page = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  const api = await readFile(new URL("api/streamer.js", SRC), "utf8");
  const authApi = await readFile(new URL("api/auth.js", SRC), "utf8");
  const main = await readFile(new URL("main.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/streamer.css", SRC), "utf8");
  assert.match(api, /\/api\/streamer/);
  assert.match(authApi, /STREAMER_COMMAND/);
  assert.match(page, /Streamer Control Center/);
  assert.match(page, /streamer_authorized/);
  assert.match(page, /submitStreamerCommand/);
  assert.match(main, /styles\/streamer\.css/);
  assert.match(css, /Broadcaster-only presentation layer/);
  assert.doesNotMatch(css, /translateY\(|scale\(/);
});

test("Streamer dashboard exposes all fifteen allow-listed owner operations", async () => {
  const page = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  const commands = [
    "!health",
    "!economy [days]",
    "!cgversion",
    "!encounterdebug",
    "!directtest",
    "!fellowshipproject <project>",
    "!readyall",
    "!resettimers",
    "!clearadventures",
    "!resolveencounter",
    "!clearencounter",
    "!spawnboss <boss name>",
    "!resolveboss",
    "!additem <player> | <item> | [qty]",
    "!removeitem <player> | <item> | [qty]",
  ];
  for (const command of commands) assert.equal(page.includes(command), true, `missing ${command}`);
  assert.match(page, /15 verified owner actions/);
  assert.doesNotMatch(page, /TWITCH_OWNER_ID/);
  assert.match(page, /Arbitrary chat commands cannot be relayed/);
  assert.match(page, /streamer-inventory-admin-fields/);
  assert.match(page, /Choose player…/);
  assert.match(page, /Item name or ID/);
  assert.match(page, /loadGuideData/);
});

test("Streamer force actions require an explicit second click", async () => {
  const page = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  assert.match(page, /item\.risk === "danger" && confirming !== item\.id/);
  assert.match(page, /Confirm \$\{item\.label\}/);
  assert.match(page, /5000/);
});

test("Streamer dashboard no longer locks desktop viewport or parks a stationary section", async () => {
  const page = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/streamer.css", SRC), "utf8");
  assert.match(page, /className="streamer-flow-layout"/);
  assert.match(page, /className="streamer-pulse-grid"/);
  assert.match(page, /href="#controls">Controls/);
  assert.match(page, /\.slice\(0, 8\)/);
  assert.doesNotMatch(page, /streamer-ops-strip|streamer-workspace|streamer-dashboard-frame/);
  assert.doesNotMatch(page, /document\.body\.classList\.add\("streamer-page"\)/);
  const hotfixOverride = css.slice(css.lastIndexOf("v1.1.19 RC1 Hotfix 5"));
  assert.match(hotfixOverride, /\.streamer-shell\s*\{[\s\S]*height:\s*auto/);
  assert.match(hotfixOverride, /overflow:\s*visible/);
  assert.doesNotMatch(hotfixOverride, /\.streamer-shell\s*\{[^}]*overflow:\s*hidden/);
});

test("Streamer control and pulse grids collapse cleanly for smaller views", async () => {
  const css = await readFile(new URL("styles/streamer.css", SRC), "utf8");
  assert.match(css, /\.streamer-control-grid/);
  assert.match(css, /@media \(max-width: 1040px\)/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /\.streamer-pulse-grid \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /outline-offset:\s*-2px/);
  assert.doesNotMatch(css, /translateY\(|scale\(/);
});
