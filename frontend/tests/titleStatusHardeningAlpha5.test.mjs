import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("Alpha 5 publishes Title Status Hardening as the current web identity", () => {
  const version = read("../src/version.js");
  assert.match(version, /WEB_VERSION = "v1\.9\.0 Alpha 8"/);
  assert.match(version, /WEB_BUILD = "Seasonal Event Framework"/);
  assert.match(version, /1\.9\.0-seasonal-events-alpha8/);
});

test("Achievement cards use authoritative unlocked state rather than current progress", () => {
  const source = read("../src/player/Achievements.jsx");
  assert.match(source, /achievement\.unlocked \? "Unlocked"/);
  assert.match(source, /achievement\.unlocked\) return "earned"|achievementAttainmentState/);
  assert.match(source, /title\.unlocked \? <strong>Unlocked<\/strong> : <span>Locked<\/span>/);
});

test("What's New documents proactive retroactive reconciliation", () => {
  const whatsNew = read("../src/player/whatsNewData.js");
  for (const phrase of [
    "v1.9.0 Alpha 5",
    "Title Status Hardening",
    "Retroactive startup reconciliation",
    "Portal reconciliation before sync",
    "Reward-title repair",
    "Permanent means complete",
  ]) assert.match(whatsNew, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
