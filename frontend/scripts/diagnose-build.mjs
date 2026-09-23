#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const offline = process.argv.includes('--offline');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const manifest = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
const major = Number(process.versions.node.split('.')[0]);
const minor = Number(process.versions.node.split('.')[1]);
const nodeOK = major > 22 || (major === 22 && minor >= 12);
console.log(`Node.js ${process.version}: ${nodeOK ? 'OK' : 'UPGRADE to Node 22.12+ recommended'}`);
console.log(`Dependencies declared: ${Object.keys(manifest.dependencies || {}).length} runtime, ${Object.keys(manifest.devDependencies || {}).length} build-time`);
const lock = existsSync(path.join(dir,'package-lock.json'));
console.log(lock ? 'package-lock.json: present (npm ci)' : 'package-lock.json: absent (first run uses npm install and creates it)');
let registry;
try {
  const config=spawnSync(npm,['config','get','registry'],{cwd:dir,encoding:'utf8',timeout:5000,shell:process.platform==='win32'});
  if (config.status !== 0) throw new Error(config.stderr || 'npm config failed');
  registry=config.stdout.trim();
  console.log(`npm registry: ${registry}`);
} catch (err) {
  console.error('npm is unavailable or its configuration could not be read. Install Node.js 22 LTS with npm.');
  process.exitCode=1;
}
if (offline) {
  console.log('Offline audit only: skipped network test. A production build has NOT been verified.');
} else if (registry) {
  console.log('Probing npm registry (no packages installed)...');
  const result=spawnSync(npm,['ping','--fetch-retries=0','--fetch-timeout=6000'],{cwd:dir,encoding:'utf8',timeout:12000,env:process.env,shell:process.platform==='win32'});
  if (result.status === 0) {
    console.log('npm registry: reachable. Run: npm run build:setup');
  } else {
    console.error('npm registry: unreachable from this machine.');
    const details=[result.stdout,result.stderr,result.error?.message].filter(Boolean).join('\n');
    console.error(details.slice(-1800));
    console.error('Check DNS resolution, firewall access to HTTPS port 443, VPN and approved proxy settings.');
    console.error('The network administrator or hosting provider must fix a DNS/egress block; changing game code will not fix it.');
    process.exitCode=2;
  }
}
