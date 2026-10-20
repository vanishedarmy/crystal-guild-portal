#!/usr/bin/env node
// Offline static-artwork release gate. Does not require npm packages or network.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventory = JSON.parse(fs.readFileSync(path.join(frontendRoot, '..', 'ARTWORK_V197_CHECKSUMS.json'), 'utf8'));
const variant = process.argv.includes('--dist') ? 'dist' : 'public';
const root = path.join(frontendRoot, variant);
if (inventory.release !== '1.9.7-queens-blood' || Object.keys(inventory.files || {}).length !== 1077) {
  console.error('Incorrect or incomplete artwork inventory');
  process.exit(2);
}
const missing = [], wrongSize = [];
for (const [name, info] of Object.entries(inventory.files)) {
  const filename = path.resolve(root, name);
  if (!filename.startsWith(path.resolve(root) + path.sep)) {
    console.error(`Unsafe inventory path: ${name}`);
    process.exit(2);
  }
  try {
    if (fs.statSync(filename).size !== info.size) wrongSize.push(name);
  } catch {
    missing.push(name);
  }
}
console.log(`${variant}: ${1077 - missing.length - wrongSize.length}/1077 v1.9.7 images confirmed`);
for (const name of missing.slice(0, 10)) console.error(`MISSING: ${name}`);
for (const name of wrongSize.slice(0, 10)) console.error(`INCORRECT SIZE: ${name}`);
if (missing.length || wrongSize.length) {
  console.error(`${missing.length} missing, ${wrongSize.length} incorrect. Restore both original Web archive parts before building.`);
  process.exit(1);
}
