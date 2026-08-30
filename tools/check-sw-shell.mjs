// Every module the game imports must be in the service worker's precache list.
//
// A missing entry does nothing on a warm network and then breaks the game
// offline — src/skins.js shipped that way. Cheap to check, so check it.

import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const sw = readFileSync(new URL('sw.js', root), 'utf8');
const modules = readdirSync(new URL('src/', root)).filter(f => f.endsWith('.js'));

const missing = modules.filter(f => !sw.includes(`'src/${f}'`));
console.log(`${modules.length} modules in src/, ${modules.length - missing.length} precached`);
if (missing.length) {
  console.log('MISSING from the sw.js SHELL list:');
  for (const f of missing) console.log('  src/' + f);
  process.exit(1);
}
console.log('OK — the shell lists every module');
