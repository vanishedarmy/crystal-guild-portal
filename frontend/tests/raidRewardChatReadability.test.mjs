import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const guideData = JSON.parse(fs.readFileSync(path.join(root, "public", "guide-data.json"), "utf8"));
const contextHelp = fs.readFileSync(path.join(root, "src", "utils", "contextHelp.js"), "utf8");
const guideBody = fs.readFileSync(path.join(root, "public", "guide-body.html"), "utf8");

test("Raid boss guide values carry the 50 percent XP rebalance", () => {
  const bosses = new Map(guideData.bosses.map((boss) => [boss.id, boss]));
  assert.equal(bosses.get("bomb_king").xp, 2700);
  assert.equal(bosses.get("ifrit").xp, 6300);
});

test("Portal help and Player Guide explain the Raid XP rebalance", () => {
  assert.match(contextHelp, /Raid victory XP has been increased by 50%/);
  assert.match(guideBody, /Raid XP rebalance:/);
  assert.match(guideBody, /increased by <b>50%<\/b>/);
});
