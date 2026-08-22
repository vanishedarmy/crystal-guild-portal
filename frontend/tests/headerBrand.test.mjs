import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { readFile } from "node:fs/promises";

const FRONTEND = new URL("../", import.meta.url);

test("site header uses the full circular Crystal Guild portal roundel instead of the legacy star glyph", async () => {
  const header = await readFile(new URL("src/components/SiteHeader.jsx", FRONTEND), "utf8");
  const css = await readFile(new URL("src/styles/portal.css", FRONTEND), "utf8");
  const html = await readFile(new URL("index.html", FRONTEND), "utf8");
  const mark = new URL("public/crystal-guild-portal-roundel.png", FRONTEND);

  assert.match(header, /className="brand-mark-image"/);
  assert.match(header, /src="\/crystal-guild-portal-roundel\.png"/);
  assert.doesNotMatch(header, />✦</);
  assert.match(css, /v1\.1\.12 Web Hotfix 6 — full-roundel header fit \+ browser asset cleanup/);
  assert.match(css, /\.brand-mark-image/);
  assert.match(html, /rel="icon" type="image\/png" href="\/crystal-guild-portal-roundel\.png"/);
  assert.ok(fs.statSync(mark).size > 0);
  assert.ok(fs.statSync(mark).size < 160_000);
  assert.equal(fs.existsSync(new URL("public/crystal-guild-header-mark.png", FRONTEND)), false);
  assert.match(css, /object-fit:\s*contain/);
  assert.match(css, /border-radius:\s*0/);
});


test("Player Guide header uses the same full circular Crystal Guild portal roundel without clipping", async () => {
  const markup = await readFile(new URL("public/guide-body.html", FRONTEND), "utf8");
  const css = await readFile(new URL("public/guide.css", FRONTEND), "utf8");

  assert.match(markup, /class="guide-brand-mark-image"/);
  assert.match(markup, /src="\/crystal-guild-portal-roundel\.png"/);
  assert.doesNotMatch(markup, /guide-brand-mark"><span>✦<\/span>/);
  assert.match(css, /v1\.1\.12 Web Hotfix 7 — shared full-roundel Player Guide header/);
  assert.match(css, /\.guide-brand-mark-image/);
  assert.match(css, /object-fit:\s*contain/);
  assert.match(css, /\.guide-brand-mark[\s\S]*?overflow:\s*visible/);
  assert.match(css, /\.guide-brand-mark-image[\s\S]*?border-radius:\s*0/);
});
