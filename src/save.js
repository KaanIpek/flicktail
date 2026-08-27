// Progress + settings in localStorage, defensive against private-mode
// failures and corrupted payloads.

const KEY = 'flicktail.v1';

const DEFAULTS = {
  stars: {},          // levelId -> 0..3
  bestScore: {},      // levelId -> number
  bestTier: 1,        // highest drink ever mixed (any level)
  unlockedLevel: 1,
  totalMerges: 0,
  settings: { music: true, sfx: true, haptics: true, aimLine: true },
  seenTutorial: false,
  endlessBest: 0,
};

export class Save {
  constructor() {
    this.data = structuredClone(DEFAULTS);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = { ...structuredClone(DEFAULTS), ...parsed,
          settings: { ...DEFAULTS.settings, ...(parsed.settings || {}) } };
      }
    } catch {}
  }

  write() {
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch {}
  }

  starsFor(levelId) { return this.data.stars[levelId] || 0; }

  recordResult(levelId, score, stars, maxTier) {
    const d = this.data;
    if (stars > (d.stars[levelId] || 0)) d.stars[levelId] = stars;
    if (score > (d.bestScore[levelId] || 0)) d.bestScore[levelId] = score;
    if (maxTier > d.bestTier) d.bestTier = maxTier;
    if (stars >= 1 && levelId >= d.unlockedLevel) d.unlockedLevel = levelId + 1;
    this.write();
  }
}
