import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("portal readability rules remain consolidated without geometry regressions", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
  assert.match(css, /profile-tabs button[\s\S]*?white-space:\s*nowrap/);
});

test("Player Guide documents battle status and on-demand battle log", async () => {
  const body = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(body, /!encounter/);
  assert.match(body, /!battlelog/);
});
