import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

test("shared collapse pointer assets ship as optimized WebP", () => {
  for (const rel of ["public/ui/collapse-pointer-right.webp", "public/ui/collapse-pointer-down.webp"]) {
    const stat = fs.statSync(path.join(root, rel));
    assert.ok(stat.size > 0 && stat.size < 10000, `${rel} should stay lightweight`);
  }
});

test("Rally Venture ships and references the dedicated background", () => {
  const rel = "public/retro-phase-iii/scene-backgrounds-v4/rally_venture.webp";
  assert.ok(fs.existsSync(path.join(root, rel)));
  const css = read("src/styles/portal.css");
  assert.match(css, /rally_venture\.webp/);
  assert.match(css, /\.rally-venture-notice::before/);
});

test("player collapsibles use the shared pointer language", () => {
  const css = read("src/styles/portal.css");
  assert.match(css, /collapse-pointer-down\.webp/);
  assert.match(css, /collapse-pointer-right\.webp/);
  assert.match(css, /section-collapse-button\[aria-expanded="false"\]/);
});

test("streamer and guide disclosures share the pointer assets", () => {
  assert.match(read("src/styles/streamer.css"), /collapse-pointer-right\.webp/);
  assert.match(read("src/styles/streamer.css"), /collapse-pointer-down\.webp/);
  assert.match(read("public/guide.css"), /collapse-pointer-right\.webp/);
  assert.match(read("public/guide.css"), /collapse-pointer-down\.webp/);
});
