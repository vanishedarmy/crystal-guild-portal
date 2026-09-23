import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { momentBadgeSrc } from '../src/utils/recordsMoments.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = path.resolve(root, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, '../ARTWORK_STEP5_MANIFEST.json'), 'utf8'));
const moments = JSON.parse(fs.readFileSync(path.join(packageRoot, 'Bot/data/moments.json'), 'utf8'));
const gamePath = (url) => path.join(root, 'public', url.slice(1));

// Guarantee that releasing the cumulative patch leaves every previous
// standalone artwork path intact, with no accidental sprite-sheet dependency.
test('Step 6: 12 canonical Moment badges exactly match the game files and manifest', () => {
  const badges = manifest.filter((entry) => entry.badge_id);
  const ids = new Set();
  assert.equal(badges.length, 12);
  for (const badge of badges) {
    assert.ok(!ids.has(badge.badge_id));
    ids.add(badge.badge_id);
    const moment = moments.find((entry) => entry.id === badge.id);
    assert.ok(moment, `${badge.id} missing from the authoritative catalog`);
    assert.equal(moment.reward.badge_id, badge.badge_id);
    assert.equal(momentBadgeSrc({ badge_id: badge.badge_id, secret: true, unlocked: true }), badge.web_path);
    assert.equal(momentBadgeSrc({ badge_id: badge.badge_id, secret: true, unlocked: false }), null);
    assert.ok(fs.statSync(gamePath(badge.web_path)).isFile());
  }
  assert.equal(ids.size, 12);
});

test('Step 6: all 16 standalone WebPs are byte-for-byte stable and earn/lock variants differ', () => {
  assert.equal(manifest.length, 16);
  const hashes = new Set();
  for (const entry of manifest) {
    const src = gamePath(entry.web_path);
    assert.ok(fs.existsSync(src), `missing individual image: ${src}`);
    const bytes = fs.readFileSync(src);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash, entry.webp_sha256, `art altered or wrong asset: ${entry.web_path}`);
    hashes.add(hash);
  }
  assert.equal(hashes.size, 16, 'each badge and earned/locked trophy must be its own distinct file');
  for (const rootName of ['world-event-close-call', 'raid-last-survivor']) {
    const earned = manifest.find((row) => row.web_path.endsWith(`/${rootName}.webp`));
    const locked = manifest.find((row) => row.web_path.endsWith(`/${rootName}-locked.webp`));
    assert.ok(earned && locked);
    assert.notEqual(earned.webp_sha256, locked.webp_sha256);
  }
});

test('Step 6: read-only Cards and Hall never grant a secret from browser state', () => {
  const cards = fs.readFileSync(path.join(root, 'src/player/Records.jsx'), 'utf8');
  const hall = fs.readFileSync(path.join(root, 'src/player/TrophyHall.jsx'), 'utf8');
  assert.match(cards, /momentBadgeSrc\(moment\)/);
  assert.match(hall, /data\.moment_slots/);
  assert.match(hall, /trophy\.secret && !unlocked/);
  assert.doesNotMatch(cards, /award_settlement|reconcile_verified_history/);
  assert.doesNotMatch(hall, /award_settlement|reconcile_verified_history/);
});
