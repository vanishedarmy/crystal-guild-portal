import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);

test("Fellowship has its own public route and navigation entry", async () => {
  const app = await readFile(new URL("App.jsx", SRC), "utf8");
  const header = await readFile(new URL("components/SiteHeader.jsx", SRC), "utf8");
  assert.match(app, /path="\/fellowship"/);
  assert.match(app, /<FellowshipPage/);
  assert.match(header, /href: "\/fellowship"/);
  assert.match(header, /label: "Fellowship"/);
});

test("Fellowship page is summary-first and keeps deep ledgers collapsible", async () => {
  const page = await readFile(new URL("pages/FellowshipPage.jsx", SRC), "utf8");
  assert.doesNotMatch(page, /!fellowshipproject/);
  assert.match(page, /data\.level_label/);
  assert.match(page, /Guild Rank ladder/);
  assert.match(page, /Fellowship Deeds/);
  assert.match(page, /<details className="fellowship-details"/);
  assert.match(page, /<details className="panel fellowship-details fellowship-deeds"/);
  assert.match(page, /Guild Facilities/);
  assert.match(page, /Fellowship Orders/);
  assert.doesNotMatch(page, /Fellowship Rank:\s*[A-Z][a-z]+/);
});

test("Fellowship responsive layout collapses cleanly without fixed-width rails", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /\.fellowship-summary-grid[\s\S]*minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.fellowship-summary-grid[\s\S]*grid-template-columns: 1fr/);
  assert.doesNotMatch(css, /\.fellowship-[^{]+\{[^}]*min-width:\s*[6-9]\d\dpx/);
});
