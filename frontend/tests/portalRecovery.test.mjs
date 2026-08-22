import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Portal Phase 5 exposes live Inventory and Recovery actions without combat commands", async () => {
  const api = await readFile(new URL("api/auth.js", SRC), "utf8");
  const inventory = await readFile(new URL("player/Inventory.jsx", SRC), "utf8");
  assert.match(api, /RECOVERY_STATE/);
  assert.match(api, /USE_FIELD_ITEM/);
  assert.match(api, /START_REST/);
  assert.match(inventory, /Show usable now/);
  assert.match(inventory, /Start Camp/);
  assert.match(inventory, /Battle only/);
  assert.match(inventory, /recommended_item_name/);
  assert.match(inventory, /campRemainingSeconds/);
  assert.doesNotMatch(inventory, /VENTURE|START_HUNT|RAID_ACTION/);
});

test("Phase 5 camp countdown ticks locally and only catches up authoritatively at meaningful events", async () => {
  const inventory = await readFile(new URL("player/Inventory.jsx", SRC), "utf8");
  assert.match(inventory, /window\.setInterval\(tick, 1000\)/);
  assert.match(inventory, /pageshow/);
  assert.match(inventory, /visibilitychange/);
  assert.match(inventory, /expiryRefreshFor/);
  assert.doesNotMatch(inventory, /setInterval[\s\S]{0,200}submitRecoveryState/);
  assert.doesNotMatch(inventory, /\/api\/actions/);
});

test("Phase 5 recovery layout stays responsive and the Guide points players to Portal recovery", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(css, /\.recovery-dashboard/);
  assert.match(css, /\.recovery-resource-grid/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*?recovery-resource-grid/);
  assert.doesNotMatch(css, /\.recovery-(?:dashboard|resource-grid)[^{]*\{[^}]*min-width:\s*[5-9]\d\dpx/);
  assert.match(guide, /Equipment &amp; Inventory[\s\S]*?use eligible field recovery items or start Camp/);
  assert.match(guide, /Active Battle status cures remain battle actions through <code>!use/);
});
