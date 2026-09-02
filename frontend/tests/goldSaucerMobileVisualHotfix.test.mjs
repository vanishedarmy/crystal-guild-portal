import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const css = fs.readFileSync(path.join(root, "src/styles/portal.css"), "utf8");
const version = fs.readFileSync(path.join(root, "src/version.js"), "utf8");

test("Hotfix 3 bounds the Gold Saucer balance track instead of using max-content auto sizing", () => {
  assert.match(css, /Mobile Visual Pass Hotfix 3/);
  assert.match(css, /\.gold-saucer-hero\{\s*grid-template-columns:minmax\(0,1fr\) minmax\(220px,360px\);/s);
  assert.match(css, /\.saucer-balance\{[\s\S]*?max-width:360px;[\s\S]*?justify-self:end;/);
  assert.match(css, /\.saucer-balance small\{[\s\S]*?overflow-wrap:break-word;/);
});

test("Gold Saucer hero stacks cleanly at the established mobile breakpoint", () => {
  assert.match(css, /@media\(max-width:900px\)\{[\s\S]*?\.gold-saucer-hero\{\s*grid-template-columns:minmax\(0,1fr\);/);
  assert.match(css, /@media\(max-width:900px\)\{[\s\S]*?\.saucer-balance\{[\s\S]*?max-width:none;[\s\S]*?justify-self:stretch;[\s\S]*?text-align:left;/);
});

test("Hotfix 3 is a Web-only asset revision", () => {
  assert.match(version, /WEB_ASSET_REVISION = "1\.7\.0-emporium-annex-a3h4"/);
});
