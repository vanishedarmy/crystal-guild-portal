import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("v1.7.0 Alpha 2 mounts Retainer Service as a personal Guild Service", async () => {
  const profile = await read("src/pages/PlayerProfile.jsx");
  assert.match(profile, /RetainerService/);
  assert.match(profile, /\["retainer", "Retainer Service", "◇"\]/);
  assert.match(profile, /\["Guild Services", \["shop", "blacksmith", "chocobo", "retainer", "mercs"\]\]/);
  assert.match(profile, /activeTab === "retainer"/);
});

test("Retainer Service exposes state, dispatch, collect, rank, timer, and material haul UI", async () => {
  const source = await read("src/player/RetainerService.jsx");
  for (const token of ["RETAINER_STATE", "RETAINER_DISPATCH", "RETAINER_COLLECT", "Retainer Service", "Current Assignment", "Procurement Board", "Collect Materials", "Bonus Finds", "ready_at", "setInterval(tick, 1000)"]) {
    assert.match(source, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
  assert.match(source, /Only one assignment can be active at a time/i);
  assert.match(source, /cannot be rerolled/i);
});

test("Portal auth exports strict Retainer action helpers", async () => {
  const source = await read("src/api/auth.js");
  for (const action of ["RETAINER_STATE", "RETAINER_DISPATCH", "RETAINER_COLLECT"]) assert.match(source, new RegExp(action));
});

test("Retainer Service has responsive assignment and haul layouts", async () => {
  const css = await read("src/styles/portal.css");
  assert.match(css, /v1\.7\.0 Alpha 2 — Retainer Service/);
  assert.match(css, /\.retainer-assignment-grid\{display:grid/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(css, /\.retainer-assignment-grid,.retainer-haul-grid\{grid-template-columns:1fr\}/);
});

test("Retainer Service is documented in What's New and the Player Guide", async () => {
  const updates = await read("src/player/whatsNewData.js");
  const guide = await read("public/guide-body.html");
  const guideData = JSON.parse(await read("public/guide-data.json"));
  assert.match(updates, /version: "v1\.7\.0 Alpha 2"[\s\S]*?name: "Retainer Service"/);
  assert.match(updates, /tab: "retainer"/);
  assert.match(guide, /id="retainer-service"/);
  assert.match(guide, /Priority material/);
  assert.equal(guideData.meta.version, "v1.8.1 — Merc Recruitment");
  assert.equal(guideData.meta.release, "1.8.1-merc-recruitment");
});
