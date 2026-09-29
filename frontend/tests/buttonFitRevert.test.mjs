import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const main = read("src/main.jsx");
const fit = read("src/styles/button-fit.css");
const guide = read("public/guide.css");

test("massive unified SNES UI pass is fully reverted", () => {
  assert.doesNotMatch(main, /ui-system-pass\.css/);
  assert.equal(fs.existsSync(path.join(root, "src/styles/ui-system-pass.css")), false);
});

test("targeted button fit layer loads after the existing design styles", () => {
  const environment = main.indexOf('import "./styles/environment-pass.css"');
  const buttonFit = main.indexOf('import "./styles/button-fit.css"');
  assert.ok(environment >= 0);
  assert.ok(buttonFit > environment);
  assert.match(fit, /targeted control-fit pass/i);
});

test("profile and compact tab groups wrap instead of clipping controls", () => {
  assert.match(fit, /\.profile-tabs,[\s\S]*\.moogle-commerce-tabs[\s\S]*flex-wrap: wrap;[\s\S]*overflow-x: visible;/);
  assert.match(fit, /\.profile-tabs,[\s\S]*> :where\(button, \[role="tab"\]\)[\s\S]*max-width: 100%/);
});

test("mobile action rows wrap with practical touch targets", () => {
  assert.match(fit, /@media \(max-width: 720px\)/);
  assert.match(fit, /\.equipment-card-actions,[\s\S]*\.venture-action-row[\s\S]*flex: 1 1 9rem;[\s\S]*min-height: 44px/);
  assert.match(fit, /@media \(max-width: 430px\)[\s\S]*flex-basis: 100%/);
});

test("compact icon and disclosure controls are not stretched by the button pass", () => {
  assert.match(fit, /\.dialog-close,[\s\S]*\.section-collapse-button,[\s\S]*flex: 0 0 auto;[\s\S]*width: auto/);
});

test("Player Guide receives only matching control-fit safety rules", () => {
  assert.match(guide, /targeted Guide control-fit pass/);
  assert.match(guide, /@media \(max-width: 720px\)[\s\S]*min-height: 44px/);
  assert.doesNotMatch(guide, /Unified PC\/Mobile UI\/UX \+ SNES FF visual systems pass/);
});
