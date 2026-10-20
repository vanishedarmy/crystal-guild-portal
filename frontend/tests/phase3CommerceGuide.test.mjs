import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

test("production Player Guide exactly matches the source guide body", async () => {
  const [source, built] = await Promise.all([read("public/guide-body.html"), read("dist/guide-body.html")]);
  assert.equal(built, source, "prebuilt guide must receive every source documentation correction");
});

test("Player Guide shows the current accessible Trading Post and Guild upgrade benefits", async () => {
  const guide = await read("public/guide-body.html");
  assert.match(guide, /Trading Post is open to players before construction/);
  assert.match(guide, /2% listing fee, 5% completed-sale tax, and six active listings/);
  assert.match(guide, /1% listing fee, 3% sale tax, and ten active listings/);
  assert.doesNotMatch(guide, /each player can have up to 24 active listings/);
});

test("regional Moogle inventory and Annex discounts remain authoritative Bot outputs", async () => {
  const [emporium, fellowship, guide] = await Promise.all([
    read("src/player/MoogleEmporium.jsx"),
    read("src/pages/FellowshipPage.jsx"),
    read("public/guide-body.html"),
  ]);
  assert.match(emporium, /const stockSlots = Number\(shop\?\.stock_slots \|\| 12\)/);
  assert.match(emporium, /annexUnlocked && regionalModel/);
  assert.match(fellowship, /Construction grants 10% off every regional counter/);
  assert.match(guide, /stock capacity depends on the region and your current Job/);
  assert.doesNotMatch(guide, /that raises the rotation from 9 choices to 21/);
});
