import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const player = path.resolve(import.meta.dirname, '../src/player');
const api = path.resolve(import.meta.dirname, '../src/api/auth.js');
const read = (name) => fs.readFileSync(path.join(player, name), 'utf8');

test('Card Hall hosts both games, Gold Saucer hosts neither Triple Triad UI nor actions', () => {
  const hub = read('CardHall.jsx');
  assert.match(hub, /import QueensBlood from/);
  assert.match(hub, /import TripleTriadHall from/);
  assert.match(hub, /Queen’s Blood/);
  assert.match(hub, /Triple Triad/);
  const saucer = read('GoldSaucer.jsx');
  assert.doesNotMatch(saucer, /TripleTriad|submitTriad|triple_triad|\btriad\b/i);
});

test('Triple Triad is an independent action with no MGP charge or award', () => {
  const hall = read('TripleTriadHall.jsx');
  assert.match(hall, /submitTriadState/);
  assert.match(hall, /triple_triad_state/);
  assert.match(hall, /TRIAD_STATE/);
  assert.doesNotMatch(hall, /submitGoldSaucerState/);
  const triad = read('TripleTriad.jsx');
  assert.match(triad, /Free play/);
  assert.match(triad, /Unlimited matches/);
  assert.doesNotMatch(triad, /win_payout|entry_cost|circuit\.bonus_paid/);
  assert.match(fs.readFileSync(api, 'utf8'), /export function submitTriadState/);
});
