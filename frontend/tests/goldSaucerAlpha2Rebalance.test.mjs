import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const saucer = fs.readFileSync(new URL("../src/player/GoldSaucer.jsx", import.meta.url), "utf8");
const guide = fs.readFileSync(new URL("../public/guide-body.html", import.meta.url), "utf8");
const whatsNew = fs.readFileSync(new URL("../src/player/whatsNewData.js", import.meta.url), "utf8");

test("Alpha 2 surfaces the richer MGP daily support and balance target", () => {
  assert.match(saucer, /daily_reward_mgp/);
  assert.match(saucer, /125/);
  assert.match(saucer, /50 MGP daily reward|dailyRewardMgp/);
  assert.match(saucer, /97\.1/);
  assert.match(guide, /125 MGP floor allowance/);
  assert.match(guide, /50 MGP daily reward/);
  assert.match(whatsNew, /Gold Saucer MGP rewards step up/);
});
