import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("interactive card feedback remains in-bounds", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /\.clickable-card:hover[\s\S]*?transform:\s*none/);
  assert.match(css, /prefers-reduced-motion/);
});

test("Player Guide hover safety remains in the current Guide stylesheet", async () => {
  const css = await readFile(new URL("guide.css", PUBLIC), "utf8");
  assert.match(css, /Hover\/focus paint safety/);
});
