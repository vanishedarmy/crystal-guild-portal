import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

test("shared pointer assets ship as distinct optimized WebP images", () => {
  const right = path.join(root, "public/ui/collapse-pointer-right-a2.webp");
  const down = path.join(root, "public/ui/collapse-pointer-down-a2.webp");
  for (const p of [right, down]) {
    const stat = fs.statSync(p);
    assert.ok(stat.size > 0 && stat.size < 10000);
  }
  assert.notDeepEqual(fs.readFileSync(right), fs.readFileSync(down), "right and down pointers must be different image files");
});

test("controlled collapsibles render a real state-selected pointer image", () => {
  const component = read("src/components/CollapsePointer.jsx");
  assert.ok(component.includes('open ? "/ui/collapse-pointer-down-a2.webp" : "/ui/collapse-pointer-right-a2.webp"'));
  for (const rel of ["src/player/Hunts.jsx", "src/player/Expeditions.jsx", "src/player/WhatsNew.jsx", "src/player/Inventory.jsx"]) {
    assert.match(read(rel), /<CollapsePointer open=\{/);
  }
  assert.ok(read("src/styles/portal.css").includes('.section-collapse-button::before { content: none !important; display: none !important; }'));
});

test("native details use actual right/down pointer image elements", () => {
  const component = read("src/components/CollapsePointer.jsx");
  assert.ok(component.includes('className="details-collapse-pointer-closed" src="/ui/collapse-pointer-right-a2.webp"'));
  assert.ok(component.includes('className="details-collapse-pointer-open" src="/ui/collapse-pointer-down-a2.webp"'));
  const css = read("src/styles/portal.css");
  assert.ok(css.includes('details[open] > summary .details-collapse-pointer-closed { display: none; }'));
  assert.ok(css.includes('details[open] > summary .details-collapse-pointer-open { display: block; }'));
  for (const rel of ["src/pages/FellowshipPage.jsx", "src/pages/StreamerDashboard.jsx", "src/player/WhatsNew.jsx", "src/player/Jobs.jsx"]) {
    assert.ok(read(rel).includes('<DetailsPointer />'));
  }
});

test("Stream Venture uses a real DOM image layer rather than a CSS background URL", () => {
  const rel = "public/retro-phase-iii/scene-backgrounds-v4/rally_venture.webp";
  assert.ok(fs.existsSync(path.join(root, rel)));
  const stream = read("src/player/StreamActivities.jsx");
  assert.ok(stream.includes('<img className="rally-venture-background-art" src="/retro-phase-iii/scene-backgrounds-v4/rally_venture.webp"'));
  const portal = read("src/styles/portal.css");
  assert.match(portal, /\.rally-venture-background-art \{[\s\S]*position: absolute;[\s\S]*object-fit: cover;/);
  assert.doesNotMatch(read("src/styles/environment-pass.css"), /rally_venture\.webp/);
});

test("public tree remains PNG-free after UI4", () => {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
  const png = walk(path.join(root, "public")).filter((p) => p.toLowerCase().endsWith(".png"));
  assert.equal(png.length, 0);
});
