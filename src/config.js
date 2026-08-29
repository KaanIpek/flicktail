// Every gameplay number lives here. World space: x across the table centred
// on 0 (so [-310, 310]), z along the table from the near/serving edge (0) to
// the far rail (900). Units are "table pixels".

export const TABLE = {
  halfW: 310,
  length: 900,
  foulLine: 60,       // z below this = the gutter drop (near edge is open)
  launchZ: 92,        // where the queued drink tees up
  launchStripZ: 120,  // sleeping drinks nearer than this trigger the overcrowd timer
};

export const PHYS = {
  gravity: 2600,          // for spawn drops / merge pops (y axis, table px/s^2)
  coulomb: 40,            // px/s^2 constant sliding deceleration
  stopSpeed: 8,           // below this a drink parks (and can trigger overcrowd)
  restitution: 0.5,       // drink vs drink
  wallRestitution: 0.8,   // drink vs rail
  hitEventSpeed: 90,      // impacts faster than this clink audibly
  edgeForgiveness: 0.15,
};

// Friction "skins" — exponential damping constant k in v *= exp(-k*dt).
export const FRICTION = { sand: 1.52, wood: 0.91, marble: 0.48 };

export const FLICK = {
  maxDrag: 260,       // px of screen drag for full power
  maxSpeed: 1100,     // table px/s
  minSpeed: 150,
  cancelDrag: 30,     // release under this = cancel
};

// The 11-tier drink chain. r in table px (geometric ~1.19 — every merge frees
// net space); score = points for CREATING that tier (triangular numbers).
export const TIERS = [
  { id: 1,  name: 'Lime Pop',       r: 18,  score: 0,   color: '#8fd936', alt: '#e8f8c0' },
  { id: 2,  name: 'Sunset Soda',    r: 22,  score: 1,   color: '#ff9d2e', alt: '#ffd9a0' },
  { id: 3,  name: 'Coral Cooler',   r: 26,  score: 3,   color: '#ff6d7f', alt: '#ffc7ce' },
  { id: 4,  name: 'Lagoon Rita',    r: 31,  score: 6,   color: '#28c8f0', alt: '#bdefff' },
  { id: 5,  name: 'Coconut Cloud',  r: 37,  score: 10,  color: '#f3ead8', alt: '#b98a5a' },
  { id: 6,  name: 'Tiki Ember',     r: 44,  score: 15,  color: '#ff5a2a', alt: '#ffc46b' },
  { id: 7,  name: 'Prism Martini',  r: 52,  score: 21,  color: '#a05ae8', alt: '#3fd4c0' },
  { id: 8,  name: 'Golden Pine',    r: 62,  score: 28,  color: '#ffc72e', alt: '#7fb832' },
  { id: 9,  name: 'Pearl Nautilus', r: 74,  score: 36,  color: '#9fe8e0', alt: '#ffb7d0' },
  { id: 10, name: 'Sunset Volcano', r: 88,  score: 45,  color: '#ff3d8a', alt: '#ff8a3d' },
  { id: 11, name: 'Paradise Atlas', r: 105, score: 55,  color: '#2ee6c8', alt: '#ffd700' },
];

// Cat glasses: these tiers wear ears, a face and a swishing tail — and meow
// when you mix one. Shared by the renderer (draws them) and the game (sounds).
export const CAT_TIERS = new Set([2, 5, 8, 11]);

export const TOP_TIER_CLINK_BONUS = 100;  // two Paradise Atlas touch -> both vanish

export const COMBO = {
  window: 1.5,    // seconds between merges to keep the chain alive
  cap: 5,         // multiplier = min(combo, cap)
};

export const ORDERS = {
  payMult: 2,       // tier score x this for serving
  softTimer: 45,    // seconds before an order is silently replaced
  maxCards: 2,
  dockR: 46,        // catch radius around the dock centre
};

export const SPAWN = {
  tiers: [1, 2, 3, 4, 5],   // default spawn pool (level can override)
  dropHeight: 120,
  mergeLock: 0.12,          // merge immunity after any spawn (s)
  spawnImmunity: 1.5,       // overcrowd-check immunity for fresh drinks (s)
  mergePopHeight: 60,       // little hop of a newly merged drink
};

// Running dry isn't the end: the bar can send another round. Gated behind a
// rewarded ad, capped so a level still has to be earned.
export const REFILL = { flicks: 6, max: 2 };

export const FAIL = {
  dwell: 2.8,       // sleeping drink in the launch strip this long = fail
                    // (generous: the launch line is a warning, not a guillotine)
};

export const COMBO_CALLOUTS = { 2: 'Double Pour!', 3: 'Happy Hour!', 4: 'Tiki Time!', 5: 'TIDAL WAVE!' };
