import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("portal polish is consolidated into the main stylesheet", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  const main = await readFile(new URL("main.jsx", SRC), "utf8");
  assert.match(main, /styles\/portal\.css/);
  assert.doesNotMatch(main, /styles\/(ifrit|leviathan|alexander)\.css/);
  assert.match(css, /registry-summary/);
  assert.match(css, /Keyboard clarity/);
});

test("registry and Bestiary polish remains present", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  const directory = await readFile(new URL("pages/GuildDirectory.jsx", SRC), "utf8");
  const bestiary = await readFile(new URL("player/Bestiary.jsx", SRC), "utf8");
  assert.match(css, /registry-state-grid/);
  assert.match(directory, /registry-summary/);
  assert.match(bestiary, /Temperament|Active Skill/);
});
