// Copies the playable web game into the Capacitor shell's www/ directory.
// Excludes source-only weight: raw AI art (46 MB), docs, tools.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = path.join(here, 'www');

const INCLUDE = ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'src'];
const ASSET_EXCLUDE = new Set(['raw']);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

function copy(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const e of fs.readdirSync(src)) copy(path.join(src, e), path.join(dst, e));
  } else {
    fs.copyFileSync(src, dst);
  }
}

for (const item of INCLUDE) copy(path.join(root, item), path.join(out, item));

const assetsSrc = path.join(root, 'assets');
const assetsDst = path.join(out, 'assets');
fs.mkdirSync(assetsDst, { recursive: true });
for (const e of fs.readdirSync(assetsSrc)) {
  if (ASSET_EXCLUDE.has(e)) continue;
  copy(path.join(assetsSrc, e), path.join(assetsDst, e));
}

let total = 0, files = 0;
(function walk(p) {
  for (const e of fs.readdirSync(p)) {
    const f = path.join(p, e);
    const st = fs.statSync(f);
    if (st.isDirectory()) walk(f);
    else { total += st.size; files++; }
  }
})(out);
console.log(`www/: ${files} files, ${(total / 1024 / 1024).toFixed(1)} MB`);
