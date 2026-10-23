import test from 'node:test';
import assert from 'node:assert/strict';
import {statusDeadlineMs,currentActivityLabel} from '../src/utils/activityStatus.js';

test('active Hunt, Venture, Raid and Expedition badges include countdowns',()=>{
  const now=1_000_000;
  for (const state of ['on_hunt','in_battle','in_raid','on_expedition']) {
    const status={state,label:'Active test',until:1100,remaining_seconds:100};
    assert.equal(statusDeadlineMs(status,now),1_100_000);
    assert.match(currentActivityLabel(status,100),/Active test · 1m 40s/);
  }
});
test('expired activity does not erroneously show Rest Complete',()=>{
  assert.match(currentActivityLabel({state:'on_hunt',label:'On Hunt',until:1000},0),/Ready to resolve/);
  assert.match(currentActivityLabel({state:'in_raid',label:'Raid — In Battle',until:1000},0),/Next round due/);
  assert.equal(currentActivityLabel({state:'resting',label:'Resting at Camp'},0),'Rest Complete');
});
