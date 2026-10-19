import assert from 'node:assert/strict';
import test from 'node:test';
import { formatItemUse } from '../src/utils/formatters.js';

test('full HP plus MP/AP recovery is described as Job-applicable, not universally dual-resource', () => {
  const use = {
    target: 'party',
    effects: [
      { type: 'heal_hp', fraction: 1 },
      { type: 'restore_mp', fraction: 1 },
      { type: 'restore_ap', fraction: 1 },
    ],
  };
  assert.equal(formatItemUse(use), 'Fully restores HP and applicable MP/AP');
});

test('single-resource restoratives retain their actual fractions and resource types', () => {
  assert.match(formatItemUse({ effects: [{ type: 'restore_mp', fraction: 0.65 }] }), /65% max MP/);
  assert.match(formatItemUse({ effects: [{ type: 'restore_ap', fraction: 0.4 }] }), /40% max AP/);
});
