import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { WEB_ASSET_REVISION, WEB_RELEASE, WEB_VERSION } from "../src/version.js";

const SRC = new URL("../src/", import.meta.url);
const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
const directory = await readFile(new URL("pages/GuildDirectory.jsx", SRC), "utf8");
const streamer = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
const fellowshipPage = await readFile(new URL("pages/FellowshipPage.jsx", SRC), "utf8");
const connection = await readFile(new URL("components/PortalLinkPanel.jsx", SRC), "utf8");
const refreshButton = await readFile(new URL("components/PageRefreshButton.jsx", SRC), "utf8");

const sectionSources = await Promise.all([
  "Blacksmith.jsx", "ChocoboStable.jsx", "DailyReward.jsx", "Fellowship.jsx",
  "GoldSaucer.jsx", "Hunts.jsx", "Inventory.jsx", "Jobs.jsx", "MercService.jsx",
  "MoogleEmporium.jsx", "RetainerService.jsx",
].map((name) => readFile(new URL(`player/${name}`, SRC), "utf8")));

test("RC3 advances the visible UI polish identity", () => {
  assert.equal(WEB_VERSION, "v1.8.0 Final");
  assert.equal(WEB_RELEASE, "v1.8.0 Final — Merc Service");
  assert.equal(WEB_ASSET_REVISION, "1.8.0-merc-final");
});

test("profile navigation prioritizes readable one-line labels at every desktop tier", () => {
  assert.match(css, /navigation fit \+ one-page refresh/);
  assert.match(css, /\.profile-tabs\s*\{[\s\S]*grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media \(min-width: 1600px\)[\s\S]*repeat\(8,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media \(min-width: 901px\) and \(max-width: 1279px\)[\s\S]*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media \(min-width: 721px\) and \(max-width: 900px\)[\s\S]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.profile-tabs button\s*\{[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.profile-tabs button > span:last-child\s*\{[\s\S]*white-space:\s*nowrap;/);
  assert.doesNotMatch(css, /text-overflow:\s*ellipsis/);
});

test("normal desktop final row is centered instead of orphaned", () => {
  assert.match(css, /@media \(min-width: 1280px\) and \(max-width: 1599px\)[\s\S]*\.profile-tabs button:nth-child\(13\)\s*\{\s*grid-column:\s*2;/);
});

test("manual refresh is one shared control at the page bottom", () => {
  assert.match(refreshButton, /portal-page-refresh-button/);
  assert.match(refreshButton, />\s*Refresh\s*</);
  assert.match(profile, /<PageRefreshButton onRefresh=\{manualRefresh\}/);
  assert.match(directory, /<PageRefreshButton onRefresh=\{refresh\}/);
  assert.match(streamer, /<PageRefreshButton onRefresh=\{refresh\}/);
  assert.match(fellowshipPage, /<PageRefreshButton onRefresh=\{refresh\}/);
  assert.match(css, /\.portal-page-refresh\s*\{[\s\S]*justify-content:\s*center/);
});

test("feature panels no longer expose their own manual refresh buttons", () => {
  const combined = sectionSources.join("\n");
  for (const label of ["Refresh Board", "Refresh stock", "Refresh Stable", "Refresh Floor", "Refresh Recovery"]) {
    assert.doesNotMatch(combined, new RegExp(label));
  }
  assert.doesNotMatch(connection, /Refresh connection/);
  assert.doesNotMatch(combined, />\s*\{[^}]*\?\s*["'](?:Refreshing…|Checking…)["']\s*:\s*["']Refresh["']/);
});

test("page-level refresh remounts the active special module without making live updates do so", () => {
  assert.match(profile, /const \[manualRefreshToken, setManualRefreshToken\] = useState\(0\)/);
  assert.match(profile, /const manualRefresh = useCallback\(\(\) => \{/);
  assert.match(profile, /key=\{`\$\{activeTab\}:\$\{manualRefreshToken\}`\}/);
  assert.match(profile, /useLiveUpdates\(refresh\)/);
});
