// Every gameplay number lives here. World space: x across the table centred
// on 0 (so [-310, 310]), z along the table from the near/serving edge (0) to
// the far rail (900). Units are "table pixels".

export const TABLE = {
  halfW: 310,
  length: 1020,   // longer table: more room to build, less backdrop
  foulLine: 60,       // z below this = the gutter drop (near edge is open)
  launchZ: 92,        // where the queued drink tees up
  launchStripZ: 120,  // sleeping drinks nearer than this trigger the overcrowd timer
};

export const PHYS = {
  gravity: 2600,          // for spawn drops / merge pops (y axis, table px/s^2)
  coulomb: 52,            // px/s^2 constant sliding deceleration (raised with
                          // maxSpeed so faster shots still settle promptly)
  stopSpeed: 8,           // below this a drink parks (and can trigger overcrowd)
  restitution: 0.5,       // drink vs drink
  wallRestitution: 0.8,   // drink vs rail
  hitEventSpeed: 90,      // impacts faster than this clink audibly
  edgeForgiveness: 0.15,
};

// Friction "skins" — exponential damping constant k in v *= exp(-k*dt).
export const FRICTION = { sand: 1.52, wood: 0.91, marble: 0.48 };

export const FLICK = {
  maxDrag: 200,       // px of screen drag for full power (shorter pull, more punch)
  maxSpeed: 1820,     // table px/s — the whole game is a shot and a wait, and the
                      // wait was the long half, especially in Shift where a drink
                      // has to cross the entire table to reach the dock
  minSpeed: 210,
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

// Which creature cups actually meow when you mix one: the cat and the fox.
// (Every tier 1-10 is some animal — see CREATURE in render.js — but a duckling
// meowing would be worse than no sound at all.)
export const CAT_TIERS = new Set([2, 6]);

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

// Rush: the bar keeps sending drinks whether you are ready or not, and a line
// across the table marks how far the pile may come. Cross it and stay across it
// and the shift is over. The drop interval tightens as the run goes on, so the
// run always ends — the question is how long you hold it.
export const RUSH = {
  lineZ: 330,        // world z of the overflow line
  dwell: 2.2,        // seconds a parked drink may sit past the line
  dropFirst: 3.4,    // seconds before the first automatic drop
  dropEvery: 4.6,    // seconds between drops at the start
  dropFloor: 1.5,    // fastest it ever gets
  tighten: 0.965,    // each drop shortens the interval by this factor
  spawnZ: 880,       // drops land near the far rail
  topTierAt: 55,     // seconds before the pool widens by one tier
};

// Shift: the order board is the whole game. A fixed number of tickets, each
// naming one drink, and a cooler that does run out — the pressure is matching
// what is asked for rather than building the biggest thing you can.
export const SHIFT = {
  tickets: 12,      // orders to fill for a clean shift
  flicks: 90,       // the cooler for the whole shift
  minTier: 3,
  maxTier: 7,
  bonusPerLeft: 25, // score for each flick still in the cooler at the end
};

// The ad board. A real AdMob banner is a native view the SDK draws itself —
// its pixels cannot be read back and painted onto the table, and obscuring or
// compositing one is against AdMob policy. So the game draws the FRAME and
// leaves the middle empty: a signboard hung on the front of the bar, with the
// live banner sitting inside it. The ad stays untouched and fully visible; only
// the woodwork around it belongs to the game.
export const BANNER = {
  w: 320, h: 50,     // the standard banner the slot is sized for (CSS px)
  padX: 12,          // frame thickness around the ad
  padTop: 14,        // extra room above for the rope and the monkey's hands
  padBottom: 10,
  minFrontH: 118,    // below this much bar front, the board is not hung at all
  swing: 0.03,       // radians of idle sway
};

// Split Pour: the bar is running three tabs at once and they do not mix. Two
// drinks of the same tier only merge if they belong to the same tab, so you are
// keeping three chains alive on one table instead of one.
export const SPLIT = {
  families: 3,
  goalTier: 7,       // every tab has to reach this
  flicks: 70,
  colors: ['#ff8a5c', '#5cc9ff', '#9ee36b'],
  names: ['Amber', 'Blue', 'Herb'],
};

export const COMBO_CALLOUTS = { 2: 'Double Pour!', 3: 'Happy Hour!', 4: 'Tiki Time!', 5: 'TIDAL WAVE!' };
