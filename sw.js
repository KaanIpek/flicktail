// Cache-first service worker: precache the shell, runtime-cache everything
// else (backdrops, sprites, audio) so the game is fully playable offline
// after the first visit.

const VERSION = 'flicktail-v1';
const SHELL = [
  '.', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'src/main.js', 'src/config.js', 'src/levels.js', 'src/physics.js',
  'src/view.js', 'src/input.js', 'src/game.js', 'src/render.js',
  'src/backdrop.js', 'src/fx.js', 'src/audio.js', 'src/assets.js',
  'src/save.js', 'src/ui.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
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
