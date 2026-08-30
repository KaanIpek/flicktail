// Rewarded ads, behind a provider interface.
//
// No ad network is wired into the game yet — doing that needs an AdMob (or
// similar) account and a native plugin in the Capacitor shell. So the GAME
// side is finished and testable here, and swapping in the real thing is one
// `ads.use(provider)` call: a provider is just
//     { name, available() -> bool, show() -> Promise<bool /* rewarded */> }
//
// Until then the built-in placeholder shows an honestly-labelled panel so the
// flow can be played and tuned. It must not ship as if it were an ad: call
// ads.use(realProvider) before release, or ads.disable() to hide the offer.

// The stand-in is a development tool. It stays available on localhost and on
// the web build (where the flow is tuned and tested) and is switched off
// everywhere else, which is what a packaged app is.
const ALLOW_PLACEHOLDER = typeof location !== 'undefined'
  && /^(localhost|127\.0\.0\.1|.*\.github\.io)$/.test(location.hostname);

export class Ads {
  constructor() {
    this.provider = placeholderProvider();
    this.lastShown = 0;
  }

  use(provider) { this.provider = provider; }
  disable() { this.provider = null; }

  get placeholder() { return !!this.provider && this.provider.name === 'placeholder'; }

  available() {
    if (!this.provider || !this.provider.available()) return false;
    // A shipped build must never offer "watch an ad" and then show the labelled
    // stand-in — that is a promise the app cannot keep, and it reads as a bug
    // or a trick. The placeholder exists to tune the flow during development;
    // on a release build the refill simply is not offered until a real network
    // is registered with ads.use().
    if (this.placeholder && !ALLOW_PLACEHOLDER) return false;
    // never two in a row within a few seconds, however the game asks
    return Date.now() - this.lastShown > 4000;
  }

  async show() {
    if (!this.available()) return false;
    this.lastShown = Date.now();
    try { return await this.provider.show(); } catch { return false; }
  }
}

// The real thing, once the native plugin is present. Capacitor exposes the
// AdMob plugin on window.Capacitor.Plugins.AdMob; if it isn't there (web, or
// a build without the pod) this provider reports unavailable and the game
// falls back to whatever else is registered. Wire it with:
//     import { admobProvider } from './ads.js';
//     const p = admobProvider('ca-app-pub-XXX/YYY');
//     if (p.available()) ads.use(p);
export function admobProvider(adUnitId) {
  const plugin = () => (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) || null;
  let prepared = false;
  return {
    name: 'admob',
    available: () => !!plugin() && !!adUnitId,
    async show() {
      const AdMob = plugin();
      if (!AdMob) return false;
      const opts = { adId: adUnitId };
      try {
        if (!prepared) { await AdMob.initialize({}); prepared = true; }
        await AdMob.prepareRewardVideoAd(opts);
        const reward = await AdMob.showRewardVideoAd();
        // the plugin resolves with the reward payload only when it was earned
        return !!reward;
      } catch { return false; }
    },
  };
}

// The banner half of AdMob. The SDK draws the ad into its own native view; all
// the game can do is tell it where to sit. That rectangle is the hole in the
// signboard the renderer paints, so the ad ends up framed by the bar without
// anything ever being drawn over it.
export function admobBanner(adUnitId) {
  const plugin = () => (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) || null;
  let shown = false;
  let last = '';
  return {
    name: 'admob-banner',
    available: () => !!plugin() && !!adUnitId,
    // slot is {x,y,w,h} in CSS pixels
    async show(slot) {
      const AdMob = plugin();
      if (!AdMob || !slot) return false;
      const key = `${slot.x},${slot.y},${slot.w},${slot.h}`;
      if (shown && key === last) return true;
      last = key;
      try {
        if (!shown) {
          await AdMob.showBanner({
            adId: adUnitId,
            adSize: 'BANNER',
            position: 'BOTTOM_CENTER',
            margin: 0,
            isTesting: false,
          });
          shown = true;
        }
        return true;
      } catch { return false; }
    },
    async hide() {
      const AdMob = plugin();
      if (!AdMob || !shown) return;
      try { await AdMob.hideBanner(); } catch {}
      shown = false; last = '';
    },
  };
}

// A labelled stand-in: a short countdown panel that grants the reward. It says
// what it is, so nobody mistakes it for a real ad.
function placeholderProvider() {
  return {
    name: 'placeholder',
    available: () => true,
    show: () => new Promise(resolve => {
      const el = document.createElement('div');
      el.className = 'ad-overlay';
      el.innerHTML = `
        <div class="ad-panel">
          <div class="ad-tag">Ad placeholder</div>
          <div class="ad-note">No ad network is connected yet — this stands in
            for a rewarded video so the reward flow can be played.</div>
          <div class="ad-count" id="adCount">3</div>
          <button class="btn ghost tiny" id="adSkip">Skip</button>
        </div>`;
      document.body.appendChild(el);
      let n = 3;
      const countEl = el.querySelector('#adCount');
      const done = ok => { clearInterval(iv); el.remove(); resolve(ok); };
      const iv = setInterval(() => {
        n -= 1;
        if (countEl) countEl.textContent = String(Math.max(0, n));
        if (n <= 0) done(true);
      }, 1000);
      el.querySelector('#adSkip').addEventListener('click', () => done(false));
    }),
  };
}
