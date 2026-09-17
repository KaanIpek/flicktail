# Flicktail — A Slingshot Bar Puzzle

A portrait phone game for the web and iOS. You pull back and let go; a glass
slides up a bar table, banks off the rails and stops where your aim and power
put it. Two matching drinks that touch mix into the next drink up the chain
(`TIERS` in `src/config.js`), and each stop asks you to make a particular drink
with a counted number of glasses. A stop is lost when the glasses run out before
its goal is met, or when a drink stays parked at the launch line.

The content counts (countries, stops, ways to play, skins, backdrops) are not
written here because they change; the shipped data prints them:

```bash
node --experimental-default-type=module tools/verify-store-claims.mjs
```

(The flag is needed on Node 20: there is no `package.json` at the repository
root, so without it `src/*.js` loads as CommonJS and the import fails.)

## Play

Serve the repository root from any static server and open it at phone size, in
portrait:

```bash
python -m http.server 5610
```

`sw.js` is a cache-first service worker. The first visit caches the game code,
fonts, the house drink art, the backdrops, the sound effects and one music track
and ambience bed; the other tracks and the skin art are cached the first time
they load. A tour stop in progress is saved to local storage as you play, and
the title screen offers to continue it.

## How it plays

- **Launch:** drag back and release; launch speed follows the square root of
  the drag length, up to full power (`src/input.js`). The NEXT panel shows the drink on the tee
  and the one after it.
- **Mixing:** two drinks of the same tier combine the moment they touch, at any
  speed (`src/physics.js`); in Split Pour they must also share a tab. The new
  drink carries a damped, capped share of their momentum and is never placed
  over the open near edge (`src/game.js`). Two of the last drink in the chain
  clear each other for a bonus instead.
- **Scoring:** making a drink pays a triangular number for its tier, times a
  combo multiplier with a cap; to-go orders pay a multiple of the drink's score.
  The numbers are `TIERS`, `COMBO` and `ORDERS` in `src/config.js`.
- **Losing a drink or the round:** a drink that slides past the foul line falls
  off the open near edge; a drink parked in the launch strip for longer than
  `FAIL.dwell` ends the round.
- **World Tour:** its stops are specified one by one in `src/levels.js`. After
  the first, each adds one mechanic: bouncier rails, to-go orders, curved rails,
  friction zones, terraces, wind, a beach ball, a small marble table, a wider
  spawn pool and a tide; the finale combines islands on the table with wind and
  orders.
- **Country tours:** `buildCountryLevels()` in `src/tours.js` builds each
  country's stops from that country's table surfaces, hazards and drinks.
- **Other modes:** Rush Hour, The Shift, Split Pour, Daily and Endless. Vacation
  Mode replays a stop you already have a star on, with unlimited glasses and no
  way to lose.

## Tech

- **Web game:** plain JavaScript modules and Canvas 2D, with no game engine, no
  framework, no bundler and no build step; the files in `src/` are what ship.
  Physics is a swept-circle solver on a fixed 120 Hz step on a flat table
  plane, and the 3D look comes from a perspective camera projecting that plane
  (`src/view.js`). Backdrops draw on their own canvas at about 30 fps with
  code-drawn ambient movers such as boats, cable cars and club beams.
- **iOS app:** `mobile/` wraps the same files with Capacitor 7 and the
  `@capacitor-community/admob` plugin (Google Mobile Ads SDK); see
  `mobile/package.json`. `node mobile/sync-web.mjs` copies `index.html`,
  `manifest.webmanifest`, `sw.js`, `css/`, `src/` and `assets/` (without the
  `raw*` source-art folders) into `mobile/www`, and `.github/workflows/ios.yml`
  builds the app.
- **Ads:** in the iOS app, an AdMob banner is framed inside the bar scene during
  a round, and an optional rewarded video is offered when a round runs out of
  glasses. The web build has no ad network connected; its refill offer shows a
  labelled placeholder panel instead (`src/ads.js`). Nothing is sold in either.

## Art, sound and licences

- **Drink art, signature bottles and destination backdrops:** AI-generated for
  this project. `tools/process_art.py` turns the generated images into sprites
  and WebP backdrops.
- **Animal cups:** drawn at runtime by the game's canvas code (`src/render.js`).
- **Music, ambience and sound effects:** generated locally with Stable Audio 3
  (`stabilityai/stable-audio-3-medium-base`) under the Stability AI Community
  License. The WebAudio code in `src/audio.js` synthesizes only the button tap
  and the wind gust, plus a stand-in for any sound effect that has not loaded.
- **Fonts:** Baloo 2 and Nunito, SIL Open Font License 1.1, downloaded from
  Google Fonts and bundled in `assets/fonts` by `tools/bundle_fonts.py`.

Details and licence terms: [NOTICE](NOTICE).

## Dev notes

- **QA hooks:** on a plain-http local server (`localhost`, `127.0.0.1`, or any
  `http:` origin opened with `?qa`), `src/main.js` loads `qa/hook.js`, which
  sets `window.__ft` (game, view, renderer, physics, fx, save, audio, backdrop,
  ui, ads and the mode starters, plus `spawn`, `state` and `retune`). It arrives shortly after boot,
  so wait for it, e.g. `page.waitForFunction(() => window.__ft)`. It never loads
  inside the Capacitor app, and `qa/` is not copied into `mobile/www`.
- `tools/check-star-lines.mjs` checks every three-star line against scores the
  game can produce; `tools/check-sw-shell.mjs` checks that `sw.js` precaches
  every module in `src/`.
- `tools/make_icon.py` builds the app icons.
