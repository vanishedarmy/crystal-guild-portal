#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const dryRun = process.argv.includes('--dry-run');
const skipInstall = process.argv.includes('--skip-install');
const lock=existsSync(path.join(dir,'package-lock.json'));
const installArgs=[lock ? 'ci' : 'install','--include=dev','--no-audit','--no-fund'];
const commands=skipInstall ? [['run','build']] : [installArgs,['run','build']];
console.log(`Crystal Guild build setup: ${lock ? 'locked install' : 'initial install + generate package-lock.json'}`);
for (const args of commands) {
  console.log(`> npm ${args.join(' ')}`);
  if (dryRun) continue;
  const result=spawnSync(npm,args,{cwd:dir,stdio:'inherit',env:process.env,shell:process.platform==='win32'});
  if (result.error || result.status !== 0) {
    console.error(result.error?.message || `npm exited with code ${result.status}`);
    if (args===installArgs) console.error('If you saw EAI_AGAIN or ENOTFOUND, run: npm run doctor. DNS/network access must be restored before packages can be installed.');
    process.exit(result.status || 1);
  }
}
if (!dryRun) {
  const target=path.join(dir,'dist','index.html');
  if (!existsSync(target)) {
    console.error('The build command exited without producing dist/index.html; review vite.config.js.');
    process.exit(1);
  }
  console.log('Production build succeeded: dist/index.html exists.');
  if (!lock && existsSync(path.join(dir,'package-lock.json'))) console.log('Commit package-lock.json for reproducible future installs.');
} else {
  console.log('Dry run only. No dependencies were installed and no production build was performed.');
}
