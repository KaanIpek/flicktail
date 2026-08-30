// Progress + settings in localStorage, defensive against private-mode
// failures and corrupted payloads.

const KEY = 'flicktail.v1';

const DEFAULTS = {
  stars: {},          // levelId -> 0..3
  bestScore: {},      // levelId -> number
  bestTier: 1,        // highest drink ever mixed (any level)
  unlockedLevel: 1,
  totalMerges: 0,     // lifetime drinks mixed
  maxCombo: 0,        // biggest chain ever
  settings: { music: true, sfx: true, haptics: true, aimLine: true },
  seenTutorial: false,
  toursDone: {},       // tourId -> true once its completion has been celebrated
  ownedSkins: ['classic'],
  activeSkin: 'classic',
  endlessBest: 0,
  rushBest: 0,
  shiftBest: 0,
  // daily challenge
  dailyBest: 0,       // best daily score ever
  dailyStreak: 0,     // consecutive days played
  dailyLastDay: '',   // YYYY-MM-DD of the last completed daily
  dailyTodayDone: '', // YYYY-MM-DD if today's daily is already recorded
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

  recordEndless(score) {
    const d = this.data;
    const isBest = score > d.endlessBest;
    if (isBest) d.endlessBest = score;
    this.write();
    return isBest;
  }

  recordRush(score) {
    const d = this.data;
    const isBest = score > d.rushBest;
    if (isBest) d.rushBest = score;
    this.write();
    return isBest;
  }

  recordShift(score) {
    const d = this.data;
    const isBest = score > d.shiftBest;
    if (isBest) d.shiftBest = score;
    this.write();
    return isBest;
  }

  // Records a completed daily run and advances the streak. Returns
  // {isBest, streak, alreadyPlayed}. Streak counts consecutive calendar days.
  recordDaily(dayKey, score) {
    const d = this.data;
    const already = d.dailyTodayDone === dayKey;
    const isBest = score > d.dailyBest;
    if (isBest) d.dailyBest = score;
    if (!already) {
      const prev = d.dailyLastDay;
      const y = yesterdayOf(dayKey);
      d.dailyStreak = prev === y ? d.dailyStreak + 1 : 1;
      d.dailyLastDay = dayKey;
      d.dailyTodayDone = dayKey;
    }
    this.write();
    return { isBest, streak: d.dailyStreak, alreadyPlayed: already };
  }

  // The current streak, decayed to 0 if a day was skipped.
  liveStreak(dayKey) {
    const d = this.data;
    if (!d.dailyLastDay) return 0;
    if (d.dailyLastDay === dayKey || d.dailyLastDay === yesterdayOf(dayKey)) return d.dailyStreak;
    return 0;
  }

  totalStars() {
    return Object.values(this.data.stars).reduce((a, b) => a + (b || 0), 0);
  }
}

// Date math without Date.now() ergonomics that break under a fixed seed —
// this is calendar UI, real wall-clock is fine here.
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayOf(key) {
  const [y, m, dd] = key.split('-').map(Number);
  const t = new Date(y, m - 1, dd);
  t.setDate(t.getDate() - 1);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

// A stable integer seed from a YYYY-MM-DD key, so everyone gets the same board.
export function daySeed(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
