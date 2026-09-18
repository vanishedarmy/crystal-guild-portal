import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import test from "node:test";

const ROOT = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("v1.6.0 production identity is final", () => {
  const version = read("src/version.js");
  assert.match(version, /WEB_VERSION = "v1\.8\.1"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.8\.1-merc-recruitment"/);
});

test("Gold Saucer mobile disclosure pointer stays in the right-side grid column", () => {
  const css = read("src/styles/portal.css");
  assert.match(css, /production mobile disclosure alignment/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.saucer-section-disclosure > \.saucer-section-summary \{[\s\S]*?display: grid;[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto auto;[\s\S]*?flex-wrap: nowrap;/);
  assert.match(css, /\.saucer-section-disclosure > \.saucer-section-summary > \.saucer-details-pointer \{[\s\S]*?justify-self: end;/);
});
