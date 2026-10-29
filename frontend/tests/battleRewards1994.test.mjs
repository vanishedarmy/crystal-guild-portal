import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const hud = read("src/components/MobileCombatHud.jsx");
const css = read("src/styles/portal.css");
const releases = read("src/player/whatsNewData.js");
const version = read("src/version.js");
const guide = read("public/guide-body.html");
test("v1.9.94 is the featured release with both prior entries preserved", () => {
  assert.match(version, /v1\.9\.94/);
  assert.match(releases, /version: "v1\.9\.94"/);
  assert.ok(releases.indexOf('version: "v1.9.94"') < releases.indexOf('version: "v1.9.93"'));
  assert.match(releases, /version: "v1\.9\.92"/);
  assert.match(guide, /battle-rewards-1994/);
});
test("mobile hotbar shows HP value, percentage, name and accessible enemy meter", () => {
  assert.match(hud, /mobile-combat-hud-enemy-name/);
  assert.match(hud, /mobile-combat-hud-percent/);
  assert.match(hud, /mobile-combat-hud-hp-numbers/);
  assert.match(hud, /role="progressbar"/);
  assert.match(hud, /aria-valuenow/);
  assert.match(hud, /number\(current\).*number\(maximum\).*HP/);
  assert.match(hud, /MiniVital label="Enemy"/);
  assert.match(css, /v1\.9\.94 — always-visible enemy HP/);
  assert.match(css, /\.mobile-combat-hud-vital\.enemy\s*\{/);
});
