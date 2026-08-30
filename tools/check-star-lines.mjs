// Every 3-star line must be a score the game can actually produce.
//
// This exists because the country tours shipped with placeholder thresholds that
// made 3 stars mathematically impossible on 53 of 105 stops. Nothing failed: the
// levels were all winnable, the tests all passed, and the auto-player was being
// handed a country id it silently ignored — so it kept re-measuring the World
// Tour and reporting it as healthy.
//
// Run after any change to physics, flick counts, level layout or scoring:
//     node qa/autoplay.mjs 5 world && node qa/autoplay.mjs 5 country
//     node tools/check-star-lines.mjs
//
// A line above the bot's best run is a hard failure. A line the bot clears more
// than four times in five is a soft warning: 3 stars should mean something.

import { readFileSync } from 'node:fs';
import { ALL_LEVELS } from '../src/levels.js';

const read = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'));
let rows;
try {
  rows = [...read('../qa/bot-world.json'), ...read('../qa/bot-country.json')];
} catch (e) {
  console.error('no measurements: run qa/autoplay.mjs for world and country first');
  process.exit(2);
}

// The line to judge is the one in the source RIGHT NOW; each measurement only
// contributes the score the bot actually reached. Reading star3 back out of the
// json would compare the run against the thresholds it was run under, which
// always agrees with itself and proves nothing.
const lineOf = new Map(ALL_LEVELS.map(l => [l.id, l.star3]));
const missing = rows.filter(r => !lineOf.has(r.id));
if (missing.length) {
  console.error(`stale measurements for ${missing.length} level(s) that no longer exist — re-run the bot`);
  process.exit(2);
}
const unmeasured = ALL_LEVELS.filter(l => !rows.some(r => r.id === l.id));

const impossible = [];
const trivial = [];
for (const r of rows) {
  const star3 = lineOf.get(r.id);
  const [won, runs] = r.winRate.split('/').map(Number);
  // star3Rate in the file was measured against the OLD line, so re-derive how
  // often the bot would clear the CURRENT one from the score spread it recorded.
  const clears = [r.scoreMin, r.scoreMed, r.scoreP80, r.scoreMax].filter(s => s >= star3).length;
  if (r.scoreMax < star3) impossible.push({ ...r, star3 });
  else if (clears === 4) trivial.push({ ...r, star3 });
  if (won === 0) impossible.push({ ...r, star3, place: r.place + ' (UNWINNABLE)' });
}

const line = (r) => `  ${String(r.id).padEnd(4)} ${r.place.padEnd(22)} `
  + `star3=${String(r.star3).padEnd(6)} bot best=${String(r.scoreMax).padEnd(6)} `
  + `win=${r.winRate} 3*=${r.star3Rate}`;

console.log(`checked ${rows.length} levels`);
if (unmeasured.length) console.log(`(${unmeasured.length} level(s) have no measurement: ${unmeasured.map(l=>l.id).join(', ')})`);
if (trivial.length) {
  console.log(`\n${trivial.length} level(s) where the bot 3-stars almost every run — consider raising:`);
  for (const r of trivial) console.log(line(r));
}
if (impossible.length) {
  console.log(`\n${impossible.length} UNREACHABLE line(s):`);
  for (const r of impossible) console.log(line(r));
  process.exit(1);
}
console.log('\nOK — every 3-star line is inside what the game can score');
