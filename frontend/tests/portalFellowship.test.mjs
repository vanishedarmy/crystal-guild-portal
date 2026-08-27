import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("Portal Phase 6 exposes only typed Fellowship state and contribution actions", async () => {
  const api = await readFile(new URL("api/auth.js", SRC), "utf8");
  for (const token of ["FELLOWSHIP_STATE", "CONTRIBUTE_GIL", "CONTRIBUTE_ITEM", "submitFellowshipState", "submitFellowshipGil", "submitFellowshipItem"]) {
    assert.match(api, new RegExp(token));
  }
  assert.doesNotMatch(api, /submit(?:ReadyAll|Attack|Raid)|submitPortalAction\(.*(?:READYALL|ATTACK|RAID_ACTION)/);
});

test("signed-in owners get a live Fellowship contribution workspace", async () => {
  const tab = await readFile(new URL("player/Fellowship.jsx", SRC), "utf8");
  assert.match(tab, /usePortalAuth/);
  assert.match(tab, /isOwnProfile/);
  assert.match(tab, /data\.identity\?\.username/);
  assert.match(tab, /Fellowship Contributions/);
  assert.match(tab, /submitFellowshipState/);
  assert.match(tab, /submitFellowshipGil/);
  assert.match(tab, /submitFellowshipItem/);
  assert.match(tab, /Gameplay requirements still advance through normal play/);
  assert.match(tab, /You have \{number\(req\.owned\)\}/);
  assert.doesNotMatch(tab, /!fellowshipproject|COMMAND|READYALL|VENTURE|Web combat/);
});

test("Fellowship contribution layout collapses safely on mobile", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  const phase = css.slice(css.indexOf("v1.1.7 Portal Actions Phase 6"));
  assert.match(phase, /repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(phase, /@media \(max-width: 900px\)[\s\S]*?grid-template-columns: 1fr/);
  assert.match(phase, /@media \(max-width: 620px\)/);
  assert.doesNotMatch(phase, /overflow-x:\s*(auto|scroll)/);
});
