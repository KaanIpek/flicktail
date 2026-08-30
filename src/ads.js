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
