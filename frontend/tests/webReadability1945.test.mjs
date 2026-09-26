import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WEB_VERSION, WEB_BUILD, WEB_ASSET_REVISION } from '../src/version.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const css=fs.readFileSync(path.join(root,'src/styles/readability-1945.css'),'utf8');
const main=fs.readFileSync(path.join(root,'src/main.jsx'),'utf8');
const overlay=fs.readFileSync(path.join(root,'public/raid-overlay.html'),'utf8');
function luminance(hex) {
  const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+.055)/1.055)**2.4);
  return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
}
function contrast(a,b) {
  const [hi,lo]=[luminance(a),luminance(b)].sort((x,y)=>y-x);
  return (hi+.05)/(lo+.05);
}

test('the visibility layer is the final global CSS import and does not add removed controls',()=>{
  assert.ok(main.includes('import "./styles/readability-1945.css";'));
  const last=main.matchAll(/import "\.\/styles\/[^\"]+";/g);
  assert.equal([...last].at(-1)?.[0],'import "./styles/readability-1945.css";');
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g,''),/localStorage|cg-accessibility|display-preferences|backdrop-filter\s*:/);
  assert.match(css,/#root \.data-table \.locked/);
  assert.match(css,/#root \.raid-board-panel\.open::after/);
  assert.match(css,/#root \.crafting-workbench button:disabled/);
});

test('replacement grey copy, muted text and focus hue exceed AA contrast on relevant dark panels',()=>{
  // The pre-pass .locked (#687889) on #0c1e2f = 3.73:1 (ordinary text fails AA).
  assert.ok(contrast('#687889','#0c1e2f')<4.5);
  for(const [color,bg] of [
    ['#c1d1e2','#0c1e2f'],['#cedbea','#243d79'],
    ['#d1dfed','#223452'],['#bed1e2','#152556'],
    ['#ffecaa','#243d79'],['#f5dea5','#0c1e2f']
  ]) assert.ok(contrast(color,bg)>=4.5,`${color} on ${bg} was ${contrast(color,bg).toFixed(2)}:1`);
});

test('dense labels, mobile containment and visible keyboard focus are explicitly hardened',()=>{
  assert.match(css,/\.streamer-summary-card small/);
  assert.match(css,/\.streamer-roster-header/);
  assert.match(css,/\.search-field > span/);
  assert.match(css,/\.streamer-command-group-heading p/);
  assert.match(css,/\.market-watch-button, \.market-history-button, \.market-search-results button/);
  assert.match(css,/text-decoration:\s*underline/);
  assert.match(css,/focus-visible\s*\{\s*outline:\s*3px solid/);
  assert.match(css,/@media \(max-width: 720px\)/);
  assert.match(css,/prefers-contrast: more/);
});

test('Raid Command remains 4:3, adds legible labels and can show two warning lines',()=>{
  assert.match(overlay,/#wrap\{[^}]*width:1200px;height:900px/);
  assert.match(overlay,/#mechanic-warning\{[^}]*-webkit-line-clamp:2/);
  assert.match(overlay,/\.job\{font-size:12px/);
  assert.match(overlay,/\.action-target\{font-size:12px/);
  assert.equal(overlay,fs.readFileSync(path.join(root,'dist/raid-overlay.html'),'utf8'));
  assert.match(overlay,/raid-overlay\.js\?v=1\.9\.4\.4-raid-command/);
});

test('Web version and package metadata describe this incremental pass consistently',()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
  assert.equal(WEB_VERSION,'v1.9.4.5');
  assert.equal(WEB_BUILD,'Visibility Hardening');
  assert.equal(WEB_ASSET_REVISION,'1.9.4.5-visibility');
  assert.equal(pkg.version,'1.9.4.5');
  assert.equal(lock.version,'1.9.4.5');
  assert.equal(lock.packages[''].version,'1.9.4.5');
});
