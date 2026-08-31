// The twelve destinations. Each level introduces exactly one new thing, and
// every difficulty knob is visible on the level card — never hidden odds.

import { TABLE, FRICTION } from './config.js';
import { buildCountryLevels, buildTours } from './tours.js';

const { halfW, length, foulLine } = TABLE;

// Standard three-rail table: left, far, right; the near edge is the open
// gutter. Points wind counter-clockwise so wall normals face the felt.
function rectRails(hw = halfW, far = length, nearZ = foulLine) {
  return [
    { x: hw, z: nearZ }, { x: hw, z: far },
    { x: -hw, z: far }, { x: -hw, z: nearZ },
  ];
}

// Rio: side rails bow inward following the beach curve.
function crescentRails() {
  const pts = [];
  const bow = 70;
  pts.push({ x: halfW, z: foulLine });
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const z = foulLine + (length - foulLine) * t;
    pts.push({ x: halfW - Math.sin(t * Math.PI) * bow, z });
  }
  for (let i = 8; i >= 0; i--) {
    const t = i / 8;
    const z = foulLine + (length - foulLine) * t;
    pts.push({ x: -halfW + Math.sin(t * Math.PI) * bow, z });
  }
  return pts;
}

export const LEVELS = [
  {
    id: 1, place: 'Waikiki', country: 'Hawaii, USA', backdrop: 'waikiki',
    decor: [{ kind: 'coaster', x: -156, z: 250, c: '#e8dcc0', rot: 0.2 }, { kind: 'shell', x: 154, z: 330, c: '#f7e6d8' }, { kind: 'petal', x: -148, z: 690, c: '#ff7a9c' }, { kind: 'leaf', x: 156, z: 780, c: '#3e8e5e', rot: 0.6 }],
    barCat: { x: -238, c: '#d98a4a', alt: '#ffe9cf' },
    guest: { c: '#d98a4a', alt: '#ffe9cf', side: -1, offset: 0 },
    accent: '#2EC4B6', felt: '#3aa88f', rail: '#8a5a38', time: 'day',
    table: { surface: 'bamboo', c: ['#b8924e', '#c9a55f', '#d8b876'] },
    goalTier: 5, flicks: 14, star2: 40, star3: 40,
    friction: FRICTION.sand, rails: rectRails(), spawnTiers: [2, 3],
    preplace: [{ tier: 3, x: -70, z: 430 }, { tier: 3, x: 66, z: 430 }],
    intro: 'Flick drinks up the table. Twins merge into bigger cocktails!',
    mechanic: 'Sand-soft table — shots die gently.',
  },
  {
    id: 2, place: 'South Beach', country: 'Miami, USA', backdrop: 'miami',
    decor: [{ kind: 'coaster', x: -155, z: 300, c: '#f7a8c8', rot: 0.1 }, { kind: 'napkin', x: 153, z: 430, c: '#ffffff', rot: 0.5 }, { kind: 'star', x: -151, z: 730, c: '#ffd75e' }],
    barCat: { x: 238, c: '#e8e4ec', alt: '#ffffff' },
    guest: { c: '#e8e4ec', alt: '#ffffff', side: 1, offset: 12 },
    accent: '#F26CA7', felt: '#4a9e8f', rail: '#c8c8d8', time: 'day',
    table: { surface: 'terrazzo', c: ['#cfd8d2', '#dde6e0', '#e8f0ea'], fleck: ['#F26CA7', '#40E0D0', '#ffd75e'] },
    goalTier: 6, flicks: 20, star2: 132, star3: 134,
    friction: FRICTION.wood, rails: rectRails(), railBounce: 0.85, spawnTiers: [1, 2, 3, 4],
    sideGoal: { type: 'bank', count: 1, label: 'Bank-shot merge', required: false, bonus: 25 },
    intro: 'Chrome deco rails love a bank shot.',
    mechanic: 'Bouncier rails (e=0.85). Side goal: 1 bank-shot merge.',
  },
  {
    id: 3, place: 'Cancún', country: 'Mexico', backdrop: 'cancun',
    decor: [{ kind: 'petal', x: -155, z: 280, c: '#ff8f3c' }, { kind: 'star', x: 154, z: 500, c: '#ffd75e' }, { kind: 'coaster', x: -149, z: 740, c: '#eafcff', rot: 0.3 }],
    barCat: { x: -238, c: '#5c5148', alt: '#f2e6d8' },
    guest: { c: '#5c5148', alt: '#f2e6d8', side: -1, offset: 22 },
    accent: '#40E0D0', felt: '#38a0b0', rail: '#c9b08c', time: 'day',
    table: { surface: 'tile', c: ['#1f8296', '#2699ad', '#31b0c4'], grout: 'rgba(8,50,58,0.5)', motif: '#eafcff' },
    goalTier: 6, flicks: 31, star2: 230, star3: 280,
    friction: FRICTION.wood, rails: rectRails(), spawnTiers: [1, 2, 3, 4, 5],
    orders: { count: 3, minTier: 2, maxTier: 4 },
    sideGoal: { type: 'orders', count: 3, label: 'Serve 3 orders', required: true },
    intro: 'Guests want drinks to go — land the right one on their tray for 2x.',
    mechanic: 'To-go orders: serve drinks off the table for double pay.',
  },
  {
    id: 4, place: 'Copacabana', country: 'Rio, Brazil', backdrop: 'rio',
    decor: [{ kind: 'leaf', x: -153, z: 320, c: '#3e8e5e', rot: 0.4 }, { kind: 'coaster', x: 151, z: 560, c: '#ffc65c' }, { kind: 'napkin', x: -149, z: 760, c: '#f4efe4', rot: 0.8 }],
    barCat: { x: 238, c: '#2f2f36', alt: '#f0f0f0' },
    guest: { c: '#2f2f36', alt: '#f0f0f0', side: 1, offset: 6 },
    accent: '#FFC65C', felt: '#2f8f78', rail: '#3c3c3c', time: 'sunset',
    table: { surface: 'wave', c: ['#d8d2c4', '#e6e0d2', '#f0ebdf'], dark: '#33322e' },
    goalTier: 7, flicks: 25, star2: 214, star3: 217,
    friction: FRICTION.wood, rails: crescentRails(),
    spawnTiers: [1, 2, 3, 4, 5],
    orders: { minTier: 2, maxTier: 5 },
    sideGoal: { type: 'bank', count: 2, label: 'Land 2 bank-shots', required: false, bonus: 30 },
    intro: 'The table follows the beach curve — banks bend your shots.',
    mechanic: 'Curved rails. Aim like the promenade waves.',
  },
  {
    id: 5, place: 'Promenade', country: 'Nice, France', backdrop: 'nice',
    decor: [{ kind: 'napkin', x: -154, z: 260, c: '#cfe2f5', rot: 0.3 }, { kind: 'coaster', x: 153, z: 640, c: '#1f6fb2' }, { kind: 'petal', x: -146, z: 800, c: '#ffb3c7' }],
    barCat: { x: -238, c: '#8c8c96', alt: '#f4f4f7' },
    guest: { c: '#8c8c96', alt: '#f4f4f7', side: -1, offset: 18 },
    accent: '#1F6FB2', felt: '#3a8fa8', rail: '#d8cfc0', time: 'day',
    table: { surface: 'marble', c: ['#cfcdc9', '#e0ded9', '#eeece7'], vein: '#9a96a8' },
    goalTier: 7, flicks: 19, star2: 82, star3: 92,
    friction: FRICTION.wood, rails: rectRails(),
    spawnTiers: [1, 2, 3, 4, 5, 6],
    orders: { minTier: 2, maxTier: 5 },
    zones: [
      { xMin: -halfW, xMax: halfW, zMin: 380, zMax: 560, k: FRICTION.sand, tint: 'rgba(120,100,80,0.18)', label: 'pebbles' },
      { xMin: -halfW, xMax: -halfW + 90, zMin: foulLine, zMax: length, k: FRICTION.marble, tint: 'rgba(160,220,255,0.15)', label: 'promenade' },
      { xMin: halfW - 90, xMax: halfW, zMin: foulLine, zMax: length, k: FRICTION.marble, tint: 'rgba(160,220,255,0.15)', label: 'promenade' },
    ],
    intro: 'Slow pebbles mid-table, fast marble lanes along the rails.',
    mechanic: 'Friction zones — read the surface.',
  },
  {
    id: 6, place: 'Positano', country: 'Amalfi, Italy', backdrop: 'positano',
    decor: [{ kind: 'leaf', x: -154, z: 300, c: '#4f8f4f', rot: 0.5 }, { kind: 'petal', x: 153, z: 480, c: '#ffd75e' }, { kind: 'napkin', x: -148, z: 780, c: '#f2dca6', rot: 0.2 }],
    barCat: { x: 238, c: '#d98a4a', alt: '#ffeeda' },
    guest: { c: '#d98a4a', alt: '#ffeeda', side: 1, offset: 30 },
    accent: '#D96C47', felt: '#4f8f6f', rail: '#b06a4a', time: 'sunset',
    table: { surface: 'tile', c: ['#b86440', '#c9734a', '#d98555'], grout: 'rgba(90,40,20,0.5)', motif: '#f2dca6' },
    goalTier: 7, flicks: 18, star2: 106, star3: 112,
    friction: FRICTION.wood, rails: rectRails(),
    spawnTiers: [1, 2, 3, 4, 5, 6],
    orders: { minTier: 2, maxTier: 5 },
    // Shorter terraces set back in the far third — they add bank-shot texture
    // without a horizontal barrier across the near/mid build zone (the old
    // full-width walls at z420/640 bounced straight shots back into the gutter).
    innerWalls: [
      { pts: [{ x: -halfW, z: 600 }, { x: -halfW + 150, z: 600 }], both: true },
      { pts: [{ x: halfW - 150, z: 720 }, { x: halfW, z: 720 }], both: true },
    ],
    preplace: [
      { tier: 5, x: -92, z: 470 }, { tier: 5, x: 88, z: 470 }, { tier: 4, x: 0, z: 340 },
    ],
    sideGoal: { type: 'bank', count: 2, label: 'Bank off 2 terraces', required: false, bonus: 35 },
    intro: 'Cliff terraces — thread your flicks through the gaps.',
    mechanic: 'Interior half-rails split the table into terraces.',
  },
  {
    id: 7, place: 'Oia', country: 'Santorini, Greece', backdrop: 'santorini',
    decor: [{ kind: 'coaster', x: -155, z: 340, c: '#2a5dab' }, { kind: 'napkin', x: 153, z: 520, c: '#ffffff', rot: 0.6 }, { kind: 'shell', x: -149, z: 790, c: '#f7ece0' }],
    barCat: { x: 238, c: '#f0ece4', alt: '#ffffff' },
    guest: { c: '#f0ece4', alt: '#ffffff', side: -1, offset: 9 },
    accent: '#2A5DAB', felt: '#3a6f9f', rail: '#f0ece4', time: 'sunset',
    table: { surface: 'plaster', c: ['#d8d2c4', '#e6e0d2', '#f2ede2'] },
    goalTier: 8, flicks: 28, star2: 207, star3: 249,
    friction: FRICTION.wood, rails: rectRails(),
    spawnTiers: [1, 2, 3, 4, 5, 6],
    orders: { minTier: 3, maxTier: 6 },
    wind: { period: 12, warn: 2, len: 1.6, accel: 620 },
    preplace: [
      { tier: 6, x: -118, z: 560 }, { tier: 6, x: 96, z: 560 }, { tier: 5, x: -10, z: 430 },
    ],
    sideGoal: { type: 'combo', count: 3, label: 'Land a ×3 combo', required: false, bonus: 40 },
    intro: 'The Meltemi wind gusts sideways — watch the napkins flutter.',
    mechanic: 'Wind bends moving drinks. Parked drinks are safe.',
  },
  {
    id: 8, place: 'Ibiza', country: 'Spain', backdrop: 'ibiza',
    decor: [{ kind: 'chip', x: -154, z: 300, c: '#c77dff' }, { kind: 'star', x: 153, z: 560, c: '#7ff0e0' }, { kind: 'coaster', x: -148, z: 800, c: '#3a2a66' }],
    barCat: { x: 238, c: '#241a3a', alt: '#c77dff' },
    guest: { c: '#241a3a', alt: '#c77dff', side: 1, offset: 25 },
    accent: '#C77DFF', felt: '#2f4470', rail: '#42346a', time: 'night',
    table: { surface: 'glass', c: ['#180f2c', '#221540', '#2c1c50'], glow: '#C77DFF' },
    goalTier: 8, flicks: 29, star2: 221, star3: 246,
    friction: FRICTION.wood, rails: rectRails(),
    spawnTiers: [1, 2, 3, 4, 5, 6],
    orders: { minTier: 3, maxTier: 6 },
    beachBall: { r: 40, speed: 90 },
    preplace: [
      { tier: 6, x: -108, z: 520 }, { tier: 6, x: 104, z: 520 }, { tier: 5, x: 0, z: 400 },
    ],
    sideGoal: { type: 'combo', count: 4, label: 'Land a ×4 combo', required: false, bonus: 60 },
    intro: 'A glowing beach ball drifts across the party table.',
    mechanic: 'Moving obstacle — light, bouncy, never merges.',
  },
  {
    id: 9, place: 'Jumeirah', country: 'Dubai, UAE', backdrop: 'dubai',
    decor: [{ kind: 'coaster', x: -151, z: 320, c: '#f2c14e' }, { kind: 'napkin', x: 150, z: 600, c: '#2a241a', rot: 0.4 }, { kind: 'chip', x: -146, z: 790, c: '#f2c14e' }],
    barCat: { x: 238, c: '#c9a86a', alt: '#f7ecd2' },
    guest: { c: '#c9a86a', alt: '#f7ecd2', side: -1, offset: 15 },
    accent: '#F2C14E', felt: '#7fa8b8', rail: '#d8c8a0', time: 'night',
    table: { surface: 'marble', c: ['#161310', '#221d15', '#302819'], vein: '#F2C14E' },
    goalTier: 8, flicks: 30, star2: 350, star3: 354,
    friction: FRICTION.marble, rails: rectRails(halfW * 0.85, length * 0.92),
    spawnTiers: [1, 2, 3, 4, 5, 6],
    orders: { minTier: 3, maxTier: 6 },
    preplace: [
      { tier: 6, x: -100, z: 500 }, { tier: 6, x: 92, z: 500 }, { tier: 5, x: 0, z: 380 },
    ],
    sideGoal: { type: 'bank', count: 3, label: 'Land 3 bank-shots', required: false, bonus: 50 },
    intro: 'Polished marble, smaller table. Everything glides.',
    mechanic: 'Ice-slick surface — use the rails.',
  },
  {
    id: 10, place: 'Kata Beach', country: 'Phuket, Thailand', backdrop: 'phuket',
    decor: [{ kind: 'leaf', x: -155, z: 280, c: '#3e8e5e', rot: 0.7 }, { kind: 'petal', x: 154, z: 520, c: '#ff7a9c' }, { kind: 'shell', x: -149, z: 780, c: '#f7e6d8' }],
    barCat: { x: 238, c: '#e08a3c', alt: '#ffe9cf' },
    guest: { c: '#e08a3c', alt: '#ffe9cf', side: 1, offset: 3 },
    accent: '#23B5A0', felt: '#3aa08a', rail: '#8a5a38', time: 'day',
    table: { surface: 'wood', c: ['#6a4326', '#7d5330', '#8f6238'] },
    goalTier: 9, flicks: 33, star2: 354, star3: 373,
    friction: FRICTION.wood, rails: rectRails(),
    orders: { minTier: 3, maxTier: 6 },
    spawnTiers: [1, 2, 3, 4, 5, 6, 7],
    sideGoal: { type: 'combo', count: 4, label: 'Land a ×4 combo', required: false, bonus: 70 },
    intro: 'The bar pours SIX kinds now — bigger chaos, bigger chains.',
    mechanic: 'Wider spawn pool (tiers 1-6), announced up front.',
  },
  {
    id: 11, place: 'Tanah Lot', country: 'Bali, Indonesia', backdrop: 'bali',
    decor: [{ kind: 'leaf', x: -154, z: 300, c: '#4f7f4f', rot: 0.3 }, { kind: 'petal', x: 153, z: 500, c: '#ff8e53' }, { kind: 'star', x: -148, z: 770, c: '#ffd0a0' }],
    barCat: { x: 238, c: '#6b6b74', alt: '#efeff2' },
    guest: { c: '#6b6b74', alt: '#efeff2', side: -1, offset: 28 },
    accent: '#FF8E53', felt: '#4f6f5f', rail: '#5a4a3a', time: 'sunset',
    table: { surface: 'stone', c: ['#363c34', '#434a40', '#4f574b'] },
    goalTier: 9, flicks: 37, star2: 466, star3: 502,
    friction: FRICTION.wood, rails: rectRails(), spawnTiers: [2, 3, 4, 5, 6, 7],
    orders: { minTier: 3, maxTier: 7 },
    // A near-adjacent tier-8 pair gives a clean path to the tier-9 goal (nudge
    // them together), so the win is reliably reachable; the 7 and 6 are extra
    // score material for chasing stars.
    preplace: [
      { tier: 8, x: -108, z: 555 }, { tier: 8, x: 96, z: 555 },
      { tier: 7, x: -40, z: 400 }, { tier: 6, x: 200, z: 500 },
    ],
    tide: { period: 25, warn: 3, len: 2.2, fromZ: 640 },
    intro: 'The tide floods the far third — don’t park drinks up there.',
    mechanic: 'Tide hazard, telegraphed 3 s ahead.',
  },
  {
    id: 12, place: 'Bora Bora', country: 'French Polynesia', backdrop: 'borabora',
    decor: [{ kind: 'shell', x: -155, z: 260, c: '#f7f0e4' }, { kind: 'star', x: 154, z: 470, c: '#ffd75e' }, { kind: 'petal', x: -148, z: 700, c: '#ff9ec4' }, { kind: 'leaf', x: 153, z: 810, c: '#3e8e5e', rot: 0.5 }],
    barCat: { x: -238, c: '#f2ece0', alt: '#ffffff' },
    guest: { c: '#f2ece0', alt: '#ffffff', side: 1, offset: 20 },
    accent: '#43D9C7', felt: '#2fa8a0', rail: '#b98a5a', time: 'day',
    table: { surface: 'glass', c: ['#137e86', '#1e9aa2', '#2bb6bc'], glow: '#9ff2ea' },
    goalTier: 11, flicks: 100, star2: 620, star3: 691,
    friction: FRICTION.wood, rails: rectRails(), spawnTiers: [3, 4, 5, 6, 7, 8],
    orders: { minTier: 4, maxTier: 6 },
    obstacles: [
      { x: -168, z: 600, r: 46, kind: 'motu' },
      { x: 176, z: 730, r: 40, kind: 'motu' },
    ],
    // a running head start toward the Paradise Atlas so the finale is a
    // victory lap of skill, not a starvation grind: two tier-10s already on the
    // table (merge them for the Atlas = 1★), plus tier-9/8 pairs and a wide
    // pool to keep chasing the score thresholds for 2★/3★.
    preplace: [
      { tier: 10, x: -102, z: 650 }, { tier: 10, x: 102, z: 650 },  // nudge → Paradise Atlas win
      { tier: 9, x: -70, z: 480 }, { tier: 9, x: 96, z: 400 },
      { tier: 8, x: -220, z: 540 }, { tier: 8, x: 180, z: 330 },
      { tier: 7, x: 40, z: 290 },
    ],
    wind: { period: 26, warn: 3, len: 1.1, accel: 200 },
    intro: 'The lagoon finale. Mix the Paradise Atlas.',
    mechanic: 'Everything you learned — motu islands, wind, royal orders.',
    finale: true,
  },
];

// The World Tour keeps ids 1-12; country tours live from 100 up. Everything
// lands in one flat list so levelById, saves and the daily seed keep working.
export const WORLD_LEVELS = LEVELS.map(l => ({ ...l, tour: 'world' }));
export const COUNTRY_LEVELS = buildCountryLevels();
export const ALL_LEVELS = [...WORLD_LEVELS, ...COUNTRY_LEVELS];
export const TOURS = buildTours(WORLD_LEVELS.map(l => l.id));

export function levelById(id) { return ALL_LEVELS.find(l => l.id === id); }
export function tourById(id) { return TOURS.find(t => t.id === id); }
export function levelsOfTour(id) {
  const t = tourById(id);
  return t ? t.levels.map(levelById).filter(Boolean) : [];
}
// A level's drink names can be overridden per tour (each country has its own
// signature pour at the top of the chain).
export function tierNameFor(level, tierId, tiers) {
  return (level && level.names && level.names[tierId]) || tiers[tierId - 1].name;
}
