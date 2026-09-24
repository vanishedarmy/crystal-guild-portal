import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");
const version = readFileSync(new URL("../src/version.js", import.meta.url), "utf8");
const guide = readFileSync(new URL("../public/guide-body.html", import.meta.url), "utf8");

test("Hotfix 10 bounds mobile combat drawers instead of covering nearly the whole viewport", () => {
  assert.match(css, /Hotfix 10 — mobile combat drawer scroll hardening/);
  assert.match(css, /\.mobile-combat-drawer\s*\{[\s\S]*?top:\s*auto;[\s\S]*?bottom:[\s\S]*?max-height:\s*min\(58dvh,\s*520px\)/);
  assert.doesNotMatch(css, /top:\s*calc\(max\(0px, env\(safe-area-inset-top\)\) \+ 104px\)/);
});

test("drawer scroll can hand control back to the page instead of trapping touch movement", () => {
  assert.match(css, /\.mobile-combat-drawer\s*\{[\s\S]*?overflow-y:\s*auto;[\s\S]*?overscroll-behavior-y:\s*auto;[\s\S]*?touch-action:\s*pan-y/);
  const drawerBlock = css.match(/\.mobile-combat-drawer\s*\{[\s\S]*?\n  \}/)?.[0] || "";
  assert.doesNotMatch(drawerBlock, /overscroll-behavior:\s*contain/);
});

test("drawer headers remain pinned while long ability and item lists scroll", () => {
  assert.match(css, /\.mobile-combat-drawer \.panel-title-row,[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*0;/);
});

test("Hotfix 10 cache-busts the Portal and documents bounded mobile drawers", () => {
  assert.match(version, /WEB_ASSET_REVISION = "1\.9\.0-mobile-combat-hud-alpha11"/);
  assert.match(guide, /bounded drawer just above the bar/);
  assert.match(guide, /page remains scrollable outside the drawer/);
});
