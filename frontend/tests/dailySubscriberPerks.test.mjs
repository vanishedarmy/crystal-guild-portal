import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Daily Guild Provisions present randomized rewards and subscriber perks", async () => {
  const daily = await readFile(new URL("player/DailyReward.jsx", SRC), "utf8");
  assert.match(daily, /provision_summary/);
  assert.match(daily, /subscriber_tier/);
  assert.match(daily, /subscriber_gil_bonus_percent/);
  assert.match(daily, /Twitch subscribers receive tier-based Daily Guild Provision bonuses/);
  assert.doesNotMatch(daily, /potion_quantity/);
});

test("Player Guide documents Daily randomness and substatus", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  const daily = data.commands.find((row) => row.command === "!daily");
  const substatus = data.commands.find((row) => row.command === "!substatus");
  assert.ok(daily);
  assert.match(daily.description, /randomized/i);
  assert.match(daily.description, /subscriber/i);
  assert.ok(substatus);
  assert.match(substatus.description, /subscription tier/i);

  const body = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(body, /randomized Daily Guild Provisions/);
  assert.match(body, /!substatus/);
});
