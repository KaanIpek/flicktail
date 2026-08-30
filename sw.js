// Cache-first service worker: precache the shell, runtime-cache everything
// else (backdrops, sprites, audio) so the game is fully playable offline
// after the first visit.

const VERSION = 'flicktail-v38';
const BACKDROPS = ['waikiki', 'miami', 'cancun', 'rio', 'nice', 'positano',
  'santorini', 'ibiza', 'dubai', 'phuket', 'bali', 'borabora',
  'okinawa', 'algarve', 'whitsundays', 'halong', 'morocco', 'egypt', 'croatia', 'maldives'];
const SHELL = [
  '.', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'assets/fonts/fonts.css',
  ...['baloo2-600', 'baloo2-700', 'baloo2-800', 'nunito-400', 'nunito-700', 'nunito-800']
    .map(f => `assets/fonts/${f}.woff2`),
  'src/main.js', 'src/config.js', 'src/levels.js', 'src/physics.js',
  'src/view.js', 'src/input.js', 'src/game.js', 'src/render.js',
  'src/backdrop.js', 'src/fx.js', 'src/audio.js', 'src/assets.js',
  'src/save.js', 'src/ui.js', 'src/ads.js', 'src/tours.js', 'src/skins.js',
  'assets/icon-192.png', 'assets/icon-512.png',
  ...Array.from({ length: 11 }, (_, i) => `assets/drinks/tier${String(i + 1).padStart(2, '0')}.png`),
  ...BACKDROPS.map(b => `assets/backdrops/${b}.webp`),
  // Only the audio the player hears IMMEDIATELY is precached. The one-shots
  // must be ready the first time you flick, but there are eight music tracks
  // and three ambient beds and you only ever hear one of each at a time —
  // precaching them all cost ~6 MB on first load. The fetch handler below
  // runtime-caches every track the moment it actually plays, so the rest are
  // still offline-safe after you've been there once.
  'assets/audio/music_morning.mp3', 'assets/audio/amb_beach_day.mp3',
  ...['meow', 'meow_big', 'purr', 'clink', 'merge_pop', 'slide', 'whoosh', 'shaker',
    'splash', 'pour', 'ice', 'chime', 'fanfare', 'fail'].map(s => `assets/audio/sfx/${s}.mp3`),
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.g'))) {
        const clone = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => hit))
  );
});
