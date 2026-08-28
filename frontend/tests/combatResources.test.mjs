import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("player profile exposes MP and AP as vital bars when the snapshot enables them", async () => {
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(profile, /overview\.resources\?\.mp\?\.max/);
  assert.match(profile, /overview\.resources\?\.ap\?\.max/);
  assert.match(profile, /<span>MP<\/span>/);
  assert.match(profile, /<span>AP<\/span>/);
  assert.match(css, /\.progress-fill\.mp/);
  assert.match(css, /\.progress-fill\.ap/);
});

test("guide ability catalog labels generic costs with MP or AP", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  assert.equal(data.active_abilities.warrior[0].resource, "ap");
  assert.equal(data.active_abilities.blackmage[0].resource, "mp");
  assert.equal(data.active_abilities.paladin.find((a) => a.id === "clemency").resource, "mp");
  assert.equal(data.active_abilities.paladin.find((a) => a.id === "shield_bash").resource, "ap");
  assert.equal(data.active_abilities.warrior[0].cost, 4);
});
