import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);

test("locked Job state lives in the upper-right card header without duplicate Locked body copy", async () => {
  const jobs = await readFile(new URL("player/Jobs.jsx", SRC), "utf8");
  assert.match(jobs, /card-status-row management-job-head/);
  assert.match(jobs, /card-status-badges[\s\S]*?small-badge locked[\s\S]*?Locked/);
  assert.match(jobs, /Signature: \$\{job\.signature\}/);
  assert.match(jobs, /<summary>How to unlock(?:<DetailsPointer \/>)?<\/summary>/);
  assert.doesNotMatch(jobs, /\(unlocked \? "Ready to learn" : "Locked"\)\} · \{job\.signature\}/);
});

test("Region cards use the same upper-right status grammar while keeping travel actions separate", async () => {
  const hunts = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  assert.match(hunts, /card-status-row adventure-region-head/);
  assert.match(hunts, /region\.current \? "Current" : region\.unlocked \? "Unlocked" : <LockIcon/);
  const header = hunts.indexOf("card-status-row adventure-region-head");
  const travel = hunts.indexOf('className="adventure-card-footer"', header);
  assert.ok(header >= 0 && travel > header, "Region status should render before the separate Travel action row");
});

test("Hotfix 3 responsive card rules protect desktop, tablet, mobile, and narrow-phone layouts", async () => {
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(css, /v1\.1\.12 Hotfix 3 — card hierarchy \+ responsive view pass/);
  assert.match(css, /\.card-status-row\s*\{[\s\S]*?justify-content:\s*space-between/);
  assert.match(css, /\.card-status-badges\s*\{[\s\S]*?justify-content:\s*flex-end/);
  assert.match(css, /@media \(max-width: 1180px\)[\s\S]*?management-job-grid[\s\S]*?adventure-region-grid/);
  assert.match(css, /@media \(max-width: 820px\)[\s\S]*?character-summary-strip[\s\S]*?repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*?management-job-grid,[\s\S]*?hunt-board-grid,[\s\S]*?fellowship-facility-grid,[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 390px\)[\s\S]*?card-status-badges/);
  assert.match(css, /\.site-header \.live-status \{ display: inline-flex !important; \}/);
});
