// Every number in the App Store listing, derived from the data that ships.
//
// The listing has already gone stale twice — it claimed five modes after Split
// Pour landed and six skins after the seventh shipped — and a wrong count is
// exactly the kind of thing that reads as a carelessly reskinned app. Run this
// before touching the listing and paste the numbers it prints.
import { COUNTRIES } from '../src/tours.js';
import { ALL_LEVELS } from '../src/levels.js';
import { SKINS } from '../src/skins.js';
import { SPECIES } from '../src/render.js';
import fs from 'node:fs';

const skins = Array.isArray(SKINS) ? SKINS : Object.values(SKINS);
const named = new Set();
for (const c of COUNTRIES) {
  for (const d of c.drinks || []) named.add(d);
  if (c.special) named.add(c.special);
}
const src = fs.readFileSync(new URL('../src/tours.js', import.meta.url), 'utf8');
const setNames = (src.match(/^const DRINK_SETS = \{([\s\S]*?)^\};/m) || ['', ''])[1]
  .split('\n').map(l => (l.match(/^\s{2}(\w+):/) || [])[1]).filter(Boolean);
const modes = ['World Tour + country tours', 'Rush Hour', 'The Shift', 'Split Pour', 'Daily', 'Endless'];
const backdrops = fs.readdirSync(new URL('../assets/backdrops/', import.meta.url)).filter(f => f.endsWith('.webp'));

const claims = {
  'countries': COUNTRIES.length,
  'stops (levels)': ALL_LEVELS.length,
  'ways to play': modes.length,
  'drink skins': skins.length,
  'signature pours': COUNTRIES.filter(c => c.special).length,
  'named drinks': named.size,
  'regional drink sets': setNames.length,
  'painted backdrops': backdrops.length,
  'creature species': Object.keys(SPECIES).length,
};
let bad = 0;
for (const [k, v] of Object.entries(claims)) {
  console.log(String(v).padStart(5) + '  ' + k);
  if (!v) { console.log('        ^ zero — the reader above is broken, not the game'); bad++; }
}
console.log('\nmodes:', modes.join(' · '));
console.log('skins:', skins.map(s => s.id || s.name).join(', '));
if (bad) { console.log(`\nFAIL: ${bad} claim(s) read as zero`); process.exit(1); }
console.log('\nOK — every listing number came from the shipped data');
