import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const bodyUrl = new URL("../public/guide-body.html", import.meta.url);

test("Guide inline command examples use code tokens that the runtime can make copyable", async () => {
  const body = await readFile(bodyUrl, "utf8");
  const commandTokens = [...body.matchAll(/<code[^>]*>\s*(![^<]+?)\s*<\/code>/g)].map((match) => match[1].replace(/\s+/g, " ").trim());
  assert.ok(commandTokens.length >= 50, `expected broad inline command coverage, found ${commandTokens.length}`);
  assert.ok(commandTokens.includes("!rest"));
  assert.ok(commandTokens.includes("!camp"));
  assert.ok(commandTokens.includes("!venture"));
  assert.ok(commandTokens.some((token) => token.startsWith("!ability")));
});
