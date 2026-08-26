import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, "../src");

function read(relative) {
  return fs.readFileSync(path.join(SRC, relative), "utf8");
}

test("player-facing countdowns use the shared canonical duration formatter", () => {
  const inventory = read("player/Inventory.jsx");
  const daily = read("player/DailyReward.jsx");
  const adventure = read("player/Hunts.jsx");
  const chocobo = read("player/ChocoboStable.jsx");
  const moogle = read("player/MoogleEmporium.jsx");
  assert.match(inventory, /Camp recovery in \{duration\(campRemaining\)\}/);
  assert.match(daily, /duration\(remaining\)/);
  assert.match(adventure, /duration\(ventureRemaining\)/);
  assert.match(chocobo, /duration\(writRemaining\)/);
  assert.match(moogle, /duration\(shopRemaining\)/);
  assert.doesNotMatch(inventory, /padStart\(2/);
  assert.doesNotMatch(moogle, /toLocaleTimeString/);
});
