import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("detail dialogs open in the current viewport instead of document layout", async () => {
  const css = await readFile(new URL("styles/environment-pass.css", SRC), "utf8");
  assert.match(css, /\.detail-dialog\s*\{[\s\S]*position:\s*fixed\s*!important/);
  assert.match(css, /inset:\s*50%\s+auto\s+auto\s+50%/);
  assert.match(css, /transform:\s*translate\(-50%,\s*-50%\)/);
  assert.match(css, /@media \(max-width:\s*640px\)[\s\S]*\.detail-dialog\s*\{[\s\S]*inset:\s*auto\s+0\s+0\s+0/);
  assert.match(css, /max-height:\s*90dvh/);
});

test("public update history omits prerelease viewport notes", async () => {
  const data = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  assert.match(data, /name: "Dungeons & Delves Beta 1"/);
  assert.match(data, /name: "Expeditions"/);
  const previous = data.slice(data.indexOf('name: "Asset Optimization"'));
  assert.doesNotMatch(previous, /name: "[^"]*(?:Alpha|Beta|RC\d*)[^"]*"/i);
});
