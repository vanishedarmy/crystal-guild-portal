import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const achievements = fs.readFileSync(new URL("../src/player/Achievements.jsx", import.meta.url), "utf8");
const auth = fs.readFileSync(new URL("../src/api/auth.js", import.meta.url), "utf8");

test("earned Titles expose authoritative Portal equip controls", () => {
  assert.match(auth, /submitSetTitle\(titleId/);
  assert.match(auth, /submitPortalAction\("SET_TITLE", \{ title_id: titleId \}/);
  assert.match(achievements, /capabilities\.has\("SET_TITLE"\)/);
  assert.match(achievements, /title\.unlocked && canManage/);
  assert.match(achievements, /title\.equipped\s*\n\s*\? "Equipped Now"/);
  assert.match(achievements, /Choose any Title you have earned and equip it here\./);
  assert.match(achievements, /Earned Titles can be equipped here/);
});
