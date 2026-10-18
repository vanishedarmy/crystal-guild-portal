import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(path.join(root, relative), 'utf8');
const sheet = read('public/card-hall/card-hall-snes.css');

test('Card Hall classic UI source declares the theme and required selectors', () => {
  for (const file of ['index.html']) {
    const html = read(file);
    const token = '/card-hall/card-hall-snes.css?v=cg197snes1';
    assert.equal(html.split(token).length - 1, 1, `${file} should load theme exactly once`);
    assert.ok(html.indexOf(token) < html.indexOf('</head>'), `${file} should load theme in head`);
  }
  // Deployed static parity is checked on the actual new Vite output by verify_compiled.mjs.
  assert.match(sheet, /\.card-hall-hub/);
  assert.match(sheet, /\.qb-tiles/);
  assert.match(sheet, /\.tt-rework/);
});

test('Queen\'s Blood replacement board has exactly five source-aligned columns', () => {
  const svg = read('public/card-hall/queens-blood-snes-board.svg');
  // Compiled board parity is a post-build release gate.
  assert.match(svg, /viewBox="0 0 1000 200"/);
  const offsets = [...svg.matchAll(/<g transform="translate\((\d+),0\)"/g)].map(match => +match[1]);
  assert.deepEqual(offsets, [0,200,400,600,800]);
  assert.match(sheet, /queens-blood-snes-board\.svg/);
});
