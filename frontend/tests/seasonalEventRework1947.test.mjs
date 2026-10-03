import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

test("seasonal event page uses the readability rework hierarchy", () => {
  const page = read("src/player/SeasonalEvent.jsx");
  const css = read("src/styles/portal.css");
  assert.match(page, /seasonal-event-rework/);
  assert.match(page, /Today’s Rotation/);
  assert.match(page, /Moonlit Emporium/);
  assert.match(page, /seasonal-progress-track/);
  assert.match(page, /seasonal-warden-callout/);
  assert.match(page, /Permanent Collection/);
  assert.match(page, /Event Gallery/);
  assert.match(css, /Seasonal Event readability rework/);
  assert.match(css, /seasonal-secondary-grid/);
  assert.match(css, /@media\(max-width:680px\)/);
});

test("streamer page exposes a dedicated authenticated seasonal event switch", () => {
  const page = read("src/pages/StreamerDashboard.jsx");
  const css = read("src/styles/streamer.css");
  assert.match(page, /streamer-seasonal-toggle-card/);
  assert.match(page, /role="switch"/);
  assert.match(page, /aria-checked=\{seasonalEnabled\}/);
  assert.match(page, /submitStreamerCommand\("seasonalevent", mode/);
  assert.match(page, /actionResult\.data\?\.seasonal/);
  assert.match(page, /seasonalEvent=\{dashboard\?\.seasonal_event/);
  assert.match(page, /if \(item\.id !== "seasonalevent"\) onDashboardRefresh\?\.\(\)/);
  assert.match(page, /Do not force a stale dashboard fetch immediately after toggling/);
  assert.match(css, /Seasonal event quick control/);
  assert.match(css, /streamer-seasonal-switch\[aria-checked="true"\]/);
});

test("player seasonal page refreshes from authoritative Bot state instead of trusting a stale mirror", () => {
  const page = read("src/player/SeasonalEvent.jsx");
  const api = read("src/api/auth.js");
  assert.match(api, /submitSeasonalState/);
  assert.match(page, /submitSeasonalState/);
  assert.match(page, /setLiveEvent\(snapshot\)/);
  assert.match(page, /Checking the authoritative Bot state/);
  assert.match(page, /mirroredIncomplete/);
});
