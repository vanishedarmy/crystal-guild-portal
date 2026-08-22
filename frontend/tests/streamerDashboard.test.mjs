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

test("Streamer dashboard uses one aggregate endpoint and isolated stylesheet", async () => {
  const page = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  const api = await readFile(new URL("api/streamer.js", SRC), "utf8");
  const main = await readFile(new URL("main.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/streamer.css", SRC), "utf8");
  assert.match(api, /\/api\/streamer/);
  assert.match(page, /Streamer Dashboard/);
  assert.match(page, /Stream Commands/);
  assert.match(main, /styles\/streamer\.css/);
  assert.match(css, /Broadcaster-only presentation layer/);
  assert.doesNotMatch(css, /translateY\(|scale\(/);
});


test("Streamer dashboard lists every Twitch owner-only command", async () => {
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
    "!resolveencounter",
    "!clearencounter",
    "!spawnboss <boss name>",
    "!resolveboss",
  ];
  for (const command of commands) assert.equal(page.includes(command), true, `missing ${command}`);
  assert.match(page, /12 streamer-only commands/);
  assert.doesNotMatch(page, /TWITCH_OWNER_ID/);
});

test("Streamer readability pass keeps protected hover feedback in bounds", async () => {
  const css = await readFile(new URL("styles/streamer.css", SRC), "utf8");
  assert.match(css, /streamer-roster-header/);
  assert.match(css, /streamer-hp-track/);
  assert.match(css, /streamer-owner-panel/);
  assert.match(css, /outline-offset:\s*-2px/);
  assert.doesNotMatch(css, /translateY\(|scale\(/);
});

test("Streamer keeps Guild Leaders stationary and moves Live Ledger to the scrolling workspace", async () => {
  const page = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/streamer.css", SRC), "utf8");
  const opsIndex = page.indexOf('className="streamer-ops-strip"');
  const leadersIndex = page.indexOf('className="streamer-panel streamer-leaders-panel"');
  const workspaceIndex = page.indexOf('className="streamer-workspace"');
  const rosterIndex = page.indexOf('className="streamer-panel streamer-roster-panel"');
  const ownerIndex = page.indexOf('className="streamer-panel streamer-owner-panel"');
  const ledgerIndex = page.indexOf('className="streamer-panel streamer-ledger-panel"');
  assert.ok(opsIndex >= 0 && leadersIndex > opsIndex, "Guild Leaders must remain in the stationary strip");
  assert.ok(workspaceIndex > leadersIndex && rosterIndex > workspaceIndex, "Roster must remain inside the scrolling workspace");
  assert.ok(ledgerIndex > ownerIndex, "Live Ledger must render at the bottom after owner commands");
  assert.match(page, /document\.body\.classList\.add\("streamer-page"\)/);
  assert.match(page, /\.slice\(0, 8\)/);
  assert.match(page, /href="#activity">Ledger/);
  assert.match(css, /body\.streamer-page[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.streamer-ops-strip[\s\S]*flex:\s*0 0 auto/);
  assert.match(css, /\.streamer-workspace[\s\S]*overflow-y:\s*auto/);
  assert.match(css, /\.streamer-ledger-panel \.streamer-activity-list[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.doesNotMatch(css, /\.streamer-ledger-panel \.streamer-activity-list\s*\{[^}]*repeat\(2/);
  assert.doesNotMatch(css, /\.streamer-ledger-panel \.streamer-activity-list\s*\{[^}]*max-height:\s*142px/);
  assert.doesNotMatch(css, /\.streamer-ops-strip[\s\S]{0,240}height:\s*184px/);
  assert.doesNotMatch(css, /\.streamer-ops-strip\s*\{[^}]*position:\s*(sticky|fixed)/);
});
