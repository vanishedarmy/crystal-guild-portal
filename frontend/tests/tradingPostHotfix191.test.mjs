import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source = fs.readFileSync(new URL('../src/player/MoogleEmporium.jsx', import.meta.url), 'utf8');

test('Trading Post refresh has independent loading state, not the Emporium transaction lock', () => {
  const marketBody = source.split('const loadMarket = useCallback')[1].split('const runMutation = async')[0];
  assert.match(marketBody, /setMarketLoading\(true\)/);
  assert.match(marketBody, /setMarketLoading\(false\)/);
  assert.doesNotMatch(marketBody, /setBusyKey\("market-state"\)/);
  assert.doesNotMatch(marketBody, /setBusyKey\(""\)/);
});

test('shop Buy and Sell actions remain independent of passive Trading Post loading', () => {
  assert.match(source, /if \(!shopActionsAvailable \|\| busyKey\) return/);
  assert.match(source, /disabled=\{!shopActionsAvailable \|\| shop\.combat_locked \|\| !affordable \|\| Boolean\(busyKey\)\}/);
  assert.match(source, /disabled=\{marketLoading \|\| Boolean\(busyKey\)\} onClick=\{\(\) => loadMarket\(\)\}/);
});
