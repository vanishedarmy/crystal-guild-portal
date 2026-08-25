import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const css = fs.readFileSync(path.join(root, "src/styles/character-identity.css"), "utf8");

test("mobile player profile display names stay on one line", () => {
  assert.match(css, /mobile profile display-name no-wrap hotfix/);
  assert.match(css, /\.profile-identity \.display-name[\s\S]*white-space:\s*nowrap/);
  assert.match(css, /text-overflow:\s*ellipsis/);
});
