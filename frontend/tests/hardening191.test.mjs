import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');

test('current release version and deployed asset revision are consistent', () => {
  assert.match(read('../src/version.js'), /1\.9\.3-guild-initiatives/);
  assert.match(read('../package.json'), /"version": "1\.9\.3"/);
});

test('shop state browsing does not require buy and sell permissions', () => {
  const source = read('../src/player/MoogleEmporium.jsx');
  assert.match(source, /const shopStateAvailable = Boolean\([\s\S]*capabilities\.has\("SHOP_STATE"\)/);
  assert.match(source, /const shopActionsAvailable = Boolean\([\s\S]*shopStateAvailable/);
});

test('failed and timed-out requests show an actionable retry instead of an infinite spinner', () => {
  const source = read('../src/player/MoogleEmporium.jsx');
  assert.match(source, /setShopLoadError\("The Guild did not respond in time/);
  assert.match(source, /setMarketLoadError\("The Trading Post did not respond in time/);
  assert.match(source, /shopLoadError \? <div[^>]+role="alert"/);
  assert.match(source, /Retry Emporium/);
  assert.match(source, /Retry Trading Post/);
  assert.match(source, /shopStateAvailable && !shopLoadError/);
  assert.match(source, /!marketLoadError \? <div/);
});

test('duplicate state fetches are coalesced and shop countdown does not rerender every second', () => {
  const source = read('../src/player/MoogleEmporium.jsx');
  assert.match(source, /shopRequest\.current\) return shopRequest\.current/);
  assert.match(source, /marketRequest\.current\) return marketRequest\.current/);
  assert.match(source, /}, 30000\)/);
  assert.match(read('../src/pages/PlayerProfile.jsx'), /const StableProfileModule = memo/);
});

test('mobile shop cards avoid translucent GPU blur and expensive offscreen paint', () => {
  const css = read('../src/styles/portal.css');
  assert.match(css, /v1\.9\.1 stability/);
  assert.match(css, /\.moogle-panel \.moogle-item-card,[\s\S]*backdrop-filter: none/);
  assert.match(css, /content-visibility: auto/);
  assert.match(css, /\.moogle-panel::after \{ height: min\(780px, 100%\)/);
});

test('logout does not reference a missing idempotency key', () => {
  const auth = read('../src/api/auth.js');
  const logout = auth.split('export async function logoutPortal')[1].split('export function fetchPortalActions')[0];
  assert.doesNotMatch(logout, /idempotencyKey/);
});
