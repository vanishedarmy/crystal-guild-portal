import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const component = readFileSync(new URL("../src/components/LiveStreamCombatControls.jsx", import.meta.url), "utf8");
const stream = readFileSync(new URL("../src/player/StreamActivities.jsx", import.meta.url), "utf8");

// Exercise the *actual* initialization statements extracted from the React component.
// Before this fix, the first unlocked Limit Break calls Array.find while
// preferredLimitTier is in its temporal dead zone, throwing ReferenceError.
const start = component.indexOf("  const targets = ", component.indexOf("export default function LiveStreamCombatControls"));
const end = component.indexOf("\n  useEffect(() =>", start);
assert.ok(start >= 0 && end > start, "combat state setup must be present");
const init = component.slice(start, end);
const initialize = new Function("controls", "useState", `${init}\nreturn {limitTier, preferredLimitTier, techniques:limitTechniques, actor};`);
const mockState = (value) => [value, () => {}];

test("Ultros raid combat mounts with unlocked Job Lv50 Limit Break techniques", () => {
  const {limitTier, preferredLimitTier} = initialize({
    actor: {display_name: "Ultros Raider"},
    limit: {charge: 100, techniques: [{level:50, name:"Dawn Strike"}]},
    targets: [{username:"ultros_raider", self:true}],
    abilities: [], items: [],
  }, mockState);
  assert.equal(preferredLimitTier, 0);
  assert.equal(limitTier.name, "Dawn Strike");
});

test("Highest unlocked tier remains the default and the empty case is safe", () => {
  const high = initialize({limit:{techniques:[{level:50,name:"Dawn"},{level:75,name:"Solar"},{level:99,name:"Eternal"}]}},mockState);
  assert.equal(high.limitTier.level,99);
  const none = initialize({limit:{techniques:[]}},mockState);
  assert.equal(none.limitTier,null);
});

test("Raid Board failures are isolated rather than crashing all Stream Activities", () => {
  assert.match(stream,/import SectionErrorBoundary from "\.\.\/components\/SectionErrorBoundary\.jsx"/);
  assert.match(stream,/<SectionErrorBoundary resetKey=\{`raid:/);
  assert.match(stream,/Other Stream Activities remain available/);
  assert.match(stream,/<Raids username=/);
});
