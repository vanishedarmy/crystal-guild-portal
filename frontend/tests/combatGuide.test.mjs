import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const PUBLIC = new URL("../public/", import.meta.url);

test("Player Guide keeps battle-mastery mechanics without development-build jargon", async () => {
  const markup = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(markup, /MP\/AP persist between battles/i);
  assert.match(markup, /6% MP/i);
  assert.match(markup, /8% AP/i);
  assert.match(markup, /Stun/i);
  assert.match(markup, /Repeat rewards/i);
  assert.match(markup, /one hero/i);
  assert.match(markup, /ten levels/i);
  assert.doesNotMatch(markup, /development build|internal balance jargon/i);
});

test("Summoner guide ability data matches the tuned resource rule", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  const aetherflow = data.active_abilities.summoner.find((ability) => ability.id === "aetherflow");
  const restore = aetherflow.effects.find((effect) => effect.type === "restore_mp");
  assert.equal(restore.fraction, 0.22);
  assert.match(aetherflow.description, /22%/);
});
