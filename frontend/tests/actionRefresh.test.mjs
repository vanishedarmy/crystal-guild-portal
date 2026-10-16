import test from 'node:test';
import assert from 'node:assert/strict';
import { refreshAfterPortalMutation } from '../src/utils/actionRefresh.js';

test('live revision cancels redundant fallback refresh', async () => {
  const events = new EventTarget();
  const old = globalThis.window;
  globalThis.window = {
    addEventListener: (...args) => events.addEventListener(...args),
    removeEventListener: (...args) => events.removeEventListener(...args),
    setTimeout, clearTimeout,
  };
  try {
    let count = 0;
    refreshAfterPortalMutation(() => count++, 12);
    assert.equal(count, 1);
    events.dispatchEvent(new Event('crystal-guild-live-revision'));
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(count, 1);
  } finally { globalThis.window = old; }
});

test('offline SSE stream still gets one fallback refresh', async () => {
  const events = new EventTarget();
  const old = globalThis.window;
  globalThis.window = {
    addEventListener: (...args) => events.addEventListener(...args),
    removeEventListener: (...args) => events.removeEventListener(...args),
    setTimeout, clearTimeout,
  };
  try {
    let count = 0;
    refreshAfterPortalMutation(() => count++, 10);
    assert.equal(count, 1);
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(count, 2);
  } finally { globalThis.window = old; }
});
