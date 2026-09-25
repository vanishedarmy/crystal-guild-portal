import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("mobile Recovery usable items stay in a compact two-column grid", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  const tail = css.slice(css.lastIndexOf("Mobile recovery inventory"));
  assert.match(tail, /@media \(max-width: 620px\)/);
  assert.match(tail, /\.recovery-quick-grid\s*\{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(tail, /\.recovery-item-artwork\s*\{[\s\S]*?width: 34px/);
});
