import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const component = fs.readFileSync(new URL("../src/player/GoldSaucer.jsx", import.meta.url), "utf8");

test("RC2 exposes Mini Cactpot net win draw loss accounting in the Saucer Ledger", () => {
  assert.match(component, /Cactpot W \/ D \/ L/);
  assert.match(component, /records\.cactpot_net_wins/);
  assert.match(component, /records\.cactpot_draws/);
  assert.match(component, /records\.cactpot_losses/);
  assert.match(component, /Mini Cactpot now records net wins, draws, and losses/);
});
