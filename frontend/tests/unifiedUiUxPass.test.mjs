import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const ui = read("src/styles/ui-system-pass.css");
const main = read("src/main.jsx");
const guide = read("public/guide.css");

function pos(haystack, needle) {
  const index = haystack.indexOf(needle);
  assert.notEqual(index, -1, `missing ${needle}`);
  return index;
}

test("unified UI system is loaded after every historical Portal stylesheet", () => {
  assert.ok(pos(main, 'import "./styles/ui-system-pass.css"') > pos(main, 'import "./styles/environment-pass.css"'));
  assert.match(ui, /Unified PC\/Mobile UI\/UX \+ SNES FF Pass/);
});

test("shared UI tokens define one page, panel, card, control, and pixel-window scale", () => {
  assert.match(ui, /--cg-page-max: 1500px/);
  assert.match(ui, /--cg-panel-gap:/);
  assert.match(ui, /--cg-control-h: 42px/);
  assert.match(ui, /--cg-touch-h: 46px/);
  assert.match(ui, /--cg-radius-window: 4px/);
  assert.match(ui, /--cg-pixel-shadow/);
});

test("Portal panels resolve to crisp SNES-style double-edge windows", () => {
  assert.match(ui, /\.panel,\n\.profile-header,\n\.player-card,\n\.toolbar,\n\.registry-stat \{/);
  assert.match(ui, /border: 2px solid var\(--cg-window-edge-dark\) !important/);
  assert.match(ui, /inset 0 0 0 1px var\(--cg-window-edge\)/);
  assert.match(ui, /inset 0 0 0 3px var\(--cg-window-inner\)/);
  assert.match(ui, /backdrop-filter: none !important/);
});

test("global action buttons share one readable placement and size contract", () => {
  assert.match(ui, /\.equipment-action-button \{[\s\S]*min-width: 6\.25rem;[\s\S]*padding: \.55rem \.76rem/);
  assert.match(ui, /\.equipment-action-button\.secondary \{/);
  assert.match(ui, /\.section-collapse-button \{[\s\S]*width: 40px;[\s\S]*min-height: 40px/);
});

test("desktop Player identity preserves the three-part portrait, identity, vitals layout while staying compact", () => {
  assert.match(ui, /\.profile-header \{[\s\S]*grid-template-columns: clamp\(118px, 13vw, 160px\) minmax\(0, 1fr\) minmax\(280px, \.72fr\);[\s\S]*min-height: 0/);
  assert.match(ui, /\.profile-header \.profile-job-portrait \{[\s\S]*aspect-ratio: 3 \/ 4/);
  assert.match(ui, /\.profile-header \.profile-job-portrait img \{[\s\S]*object-fit: contain/);
  assert.match(ui, /\.display-name \{[\s\S]*font-size: clamp\(2rem, 5\.8vw, 4\.3rem\)/);
  assert.match(ui, /\.profile-tabs \{[\s\S]*flex-wrap: nowrap;[\s\S]*overflow-x: auto/);
});

test("mobile Player identity uses a bounded portrait and compact vitals instead of desktop monumentality", () => {
  assert.match(ui, /@media \(max-width: 760px\)[\s\S]*\.profile-header \{[\s\S]*grid-template-columns: 68px minmax\(0, 1fr\);[\s\S]*min-height: 0/);
  assert.match(ui, /\.profile-header \.profile-job-portrait \{[\s\S]*width: 68px;[\s\S]*height: auto;[\s\S]*aspect-ratio: 3 \/ 4/);
  assert.match(ui, /\.profile-sigil \{[\s\S]*display: none/);
  assert.match(ui, /\.profile-vitals \{[\s\S]*grid-column: 1 \/ -1/);
});

test("mobile section headings reserve one stable action column", () => {
  assert.match(ui, /@media \(max-width: 760px\)[\s\S]*\.panel-title-row \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto/);
  assert.match(ui, /\.panel-title-row > :where\(\.small-badge, \.equipment-action-button, \.section-collapse-button/);
});

test("mobile primary card actions become full-width touch targets without forcing heading actions wide", () => {
  assert.match(ui, /\.equipment-action-button \{[\s\S]*min-height: var\(--cg-touch-h\)/);
  assert.match(ui, /\.card-actions,[\s\S]*\.blacksmith-card-actions,[\s\S]*\.management-job-actions/);
  assert.match(ui, /\.card-actions,[\s\S]*\) \.equipment-action-button \{[\s\S]*width: 100%/);
});

test("equipment cards stop shrinking into tall narrow columns and keep star next to the action", () => {
  assert.match(ui, /\.inventory-equipment-grid,[\s\S]*grid-template-columns: repeat\(auto-fit, minmax\(min\(100%, 260px\), 1fr\)\)/);
  assert.match(ui, /\.equipment-card-actions \{[\s\S]*grid-template-columns: 40px minmax\(0, 1fr\)/);
  assert.match(ui, /\.gear-favorite-button \{[\s\S]*grid-column: 1;[\s\S]*height: var\(--cg-touch-h\)/);
});

test("dense content grids collapse before content or images can squeeze", () => {
  assert.match(ui, /\.inventory-equipment-grid,[\s\S]*\.boss-grid[\s\S]*grid-template-columns: 1fr !important/);
  assert.match(ui, /\.stat-grid,[\s\S]*\.saucer-record-grid[\s\S]*repeat\(2, minmax\(0, 1fr\)\) !important/);
});

test("switch and filter controls use horizontal touch rails on mobile", () => {
  assert.match(ui, /\.inventory-view-tabs,[\s\S]*\.filter-row[\s\S]*overflow-x: auto/);
  assert.match(ui, /scroll-snap-type: x proximity/);
  assert.match(ui, /min-height: var\(--cg-touch-h\)/);
});

test("Blacksmith and Emporium controls share compact spacing and no desktop-only toolbar grid on phone", () => {
  assert.match(ui, /\.blacksmith-toolbar \{[\s\S]*gap: \.6rem/);
  assert.match(ui, /@media \(max-width: 760px\)[\s\S]*\.blacksmith-toolbar \{[\s\S]*grid-template-columns: 1fr/);
  assert.match(ui, /\.moogle-wallet \{[\s\S]*padding: \.48rem \.62rem/);
});

test("Adventure, Dungeon, Expedition and Raid artwork is bounded on mobile", () => {
  assert.match(ui, /\.raid-featured-trial \{[\s\S]*grid-template-columns: 104px minmax\(0, 1fr\)/);
  assert.match(ui, /\.raid-featured-art \{[\s\S]*width: 104px;[\s\S]*height: 104px/);
  assert.match(ui, /\.saucer-scenic-art, \.panel-scenic-art, \.dungeon-board-background-art[\s\S]*opacity: \.38 !important/);
});

test("Retainer keeps action-first mobile ordering while artwork is reduced to subordinate thumbnails", () => {
  assert.match(ui, /\.retainer-mobile-nav \{[\s\S]*gap: \.26rem/);
  assert.match(ui, /\.retainer-hero-panel \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) 86px/);
  assert.match(ui, /\.retainer-assignment-card \{[\s\S]*grid-template-columns: 82px minmax\(0, 1fr\)/);
  assert.match(ui, /@media \(max-width: 460px\)[\s\S]*\.retainer-mobile-nav \{[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
});

test("small phones simplify vitals, stats, Retainer and Raid layouts again", () => {
  assert.match(ui, /@media \(max-width: 460px\)/);
  assert.match(ui, /\.profile-vitals \{[\s\S]*grid-template-columns: 1fr/);
  assert.match(ui, /\.stat-grid,[\s\S]*grid-template-columns: 1fr !important/);
  assert.match(ui, /\.raid-featured-trial \{[\s\S]*grid-template-columns: 82px minmax\(0, 1fr\)/);
});

test("tables and dialogs prefer scroll or bounded viewport geometry over page overflow", () => {
  assert.match(ui, /\.data-table-wrap,[\s\S]*overflow-x: auto/);
  assert.match(ui, /\.detail-dialog \{[\s\S]*width: min\(760px, calc\(100vw - 2rem\)\)/);
  assert.match(ui, /@media \(max-width: 760px\)[\s\S]*width: calc\(100vw - 1rem\)/);
});

test("short touch landscape has its own compact profile layout", () => {
  assert.match(ui, /@media \(max-height: 620px\) and \(orientation: landscape\) and \(pointer: coarse\)/);
  assert.match(ui, /grid-template-columns: 62px minmax\(0, 1fr\) minmax\(230px, \.65fr\)/);
});

test("Guide receives the same crisp FF window language and denser desktop hero", () => {
  assert.match(guide, /Unified PC\/Mobile UI\/UX \+ SNES FF visual systems pass/);
  assert.match(guide, /--guide-radius: 4px/);
  assert.match(guide, /\.hero h2 \{[\s\S]*font-size: clamp\(38px, 5vw, 68px\)/);
  assert.match(guide, /inset 0 0 0 3px var\(--guide-window-inner\)/);
});

test("Guide mobile sections and card catalogs collapse cleanly and keep touch rails", () => {
  assert.match(guide, /@media \(max-width: 760px\)[\s\S]*\.guide-section-summary \{[\s\S]*min-height: 60px/);
  assert.match(guide, /\.command-grid,[\s\S]*\.boss-card-grid[\s\S]*grid-template-columns: 1fr !important/);
  assert.match(guide, /\.command-group-nav,[\s\S]*\.completion-view-tabs[\s\S]*overflow-x: auto/);
  assert.match(guide, /min-height: var\(--guide-touch\)/);
});

test("Guide detail overlay and data tables are viewport-safe on phones", () => {
  assert.match(guide, /\.tablewrap,[\s\S]*overflow-x: auto/);
  assert.match(guide, /\.info-panel \{[\s\S]*width: calc\(100vw - 10px\);[\s\S]*max-height: calc\(100dvh - 10px\)/);
  assert.match(guide, /\.info-stage-grid \{[\s\S]*grid-template-columns: 1fr/);
});
