import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guide = JSON.parse(fs.readFileSync(path.join(root,'public/guide-data.json'),'utf8'));

test('Job Ascension guide mirrors all 18 Job Level 99 progressions', () => {
  assert.equal(guide.meta.job_level_cap, 99);
  assert.equal(guide.jobs.length, 18);
  assert.equal(Object.keys(guide.active_abilities).length,18);
  for (const job of guide.jobs) {
    const active = guide.active_abilities[job.id];
    assert.ok(active, job.id);
    assert.ok(job.abilities.some(a=>a.level===95),job.id);
    assert.ok(active.some(a=>a.level===99),job.id);
  }
});

test('Job Mastery remains JLv.50 while Guide shows JLv.99 cap', () => {
  const text = fs.readFileSync(path.join(root, 'public/guide-body.html'),'utf8');
  assert.match(text,/1&ndash;99<\/b> using JP/);
  assert.match(text,/JLv\. 50 unlocks that Job's cross-Job Mastery/);
  assert.match(text,/further active and passive abilities continue through JLv\. 99/);
});
