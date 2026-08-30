// Put the AdMob ad unit ids into the packaged index.html as globals.
//
// The game reads window.FLICKTAIL_BANNER_UNIT and window.FLICKTAIL_AD_UNIT. With
// neither set, admobBanner() and admobProvider() both report unavailable, the
// signboard shows the game's own card and no ad is ever offered — the same
// behaviour as the browser build. So a missing variable degrades quietly
// instead of shipping a broken ad slot.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const page = path.join(here, 'www', 'index.html');

const banner = (process.env.FLICKTAIL_BANNER_UNIT || '').trim();
const reward = (process.env.FLICKTAIL_AD_UNIT || '').trim();

if (!banner && !reward) {
  console.log('no ad unit ids set — the game will hang its house sign instead');
  process.exit(0);
}

const looksRight = (id) => !id || /^ca-app-pub-\d+\/\d+$/.test(id);
for (const [name, id] of [['FLICKTAIL_BANNER_UNIT', banner], ['FLICKTAIL_AD_UNIT', reward]]) {
  if (!looksRight(id)) {
    console.error(`${name} is not an ad unit id: ${JSON.stringify(id)}\n` +
      'Expected ca-app-pub-<publisher>/<unit>. The id with a ~ is the APP id, which belongs in Info.plist.');
    process.exit(1);
  }
}

let html = fs.readFileSync(page, 'utf8');
const anchor = '<script type="module"';
if (!html.includes(anchor)) {
  console.error('no module script tag in ' + page);
  process.exit(1);
}
const tag = `<script>window.FLICKTAIL_BANNER_UNIT=${JSON.stringify(banner)};`
  + `window.FLICKTAIL_AD_UNIT=${JSON.stringify(reward)};</script>\n`;
html = html.replace(anchor, tag + anchor);

const tmp = page + '.tmp';
fs.writeFileSync(tmp, html);
fs.renameSync(tmp, page);
console.log(`ad unit ids injected — banner:${banner ? 'yes' : 'no'} rewarded:${reward ? 'yes' : 'no'}`);
