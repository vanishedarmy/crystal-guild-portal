import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const exists = (path) => fs.existsSync(new URL(path, import.meta.url));

test("World Events is collapsible with the shared Portal pointer control", () => {
  const source = read("../src/player/StreamActivities.jsx");
  assert.match(source, /CollapsePointer/);
  assert.match(source, /toggleWithViewportAnchor/);
  assert.match(source, /worldEventsOpen/);
  assert.match(source, /collapsible-board-section/);
  assert.match(source, /aria-label=\{worldEventsOpen \? "Collapse World Events" : "Expand World Events"\}/);
  assert.match(source, /crystal-guild:stream:world-events/);
  assert.match(source, /worldEventActiveRef/);
  assert.match(source, /if \(active && !worldEventActiveRef\.current\) setWorldEventsOpen\(true\)/);
});

test("World Events removes the redundant idle status block and oversized duplicate hero", () => {
  const source = read("../src/player/StreamActivities.jsx");
  assert.doesNotMatch(source, /world-events-hero-art/);
  assert.doesNotMatch(source, /world-event-idle-state/);
  assert.match(source, /world-events-body/);
});

test("hotfix state artwork uses cropped cache-safe assets", () => {
  const source = read("../src/player/StreamActivities.jsx");
  for (const name of ["world_event_idle_h1.webp", "world_event_active_h1.webp", "world_event_defeated_h1.webp"]) {
    assert.equal(exists(`../public/world-events/a1/${name}`), true, `${name} should be packaged`);
    assert.match(source, new RegExp(name.replaceAll(".", "\\.")));
  }
});

test("World Events compact layout removes fixed banner aspect and tightens roster cards", () => {
  const css = read("../src/styles/portal.css");
  assert.match(css, /\.world-events-body[\s\S]*gap: \.58rem/);
  assert.match(css, /\.world-event-state-banner img \{[\s\S]*height: auto/);
  assert.match(css, /\.world-event-boss-card img \{[\s\S]*aspect-ratio: 1 \/ 1/);
  assert.match(css, /-webkit-line-clamp: 2/);
  assert.doesNotMatch(css, /\.world-event-idle-state/);
});
