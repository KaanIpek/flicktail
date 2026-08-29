// The twelve destinations. Each level introduces exactly one new thing, and
// every difficulty knob is visible on the level card — never hidden odds.

import { TABLE, FRICTION } from './config.js';

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
    accent: '#2EC4B6', felt: '#3aa88f', rail: '#8a5a38', time: 'day',
    table: { surface: 'bamboo', c: ['#b8924e', '#c9a55f', '#d8b876'] },
    goalTier: 5, flicks: 24, star2: 30, star3: 70,
    friction: FRICTION.sand, rails: rectRails(), spawnTiers: [2, 3],
    preplace: [{ tier: 3, x: -70, z: 430 }, { tier: 3, x: 66, z: 430 }],
    intro: 'Flick drinks up the table. Twins merge into bigger cocktails!',
    mechanic: 'Sand-soft table — shots die gently.',
  },
  {
    id: 2, place: 'South Beach', country: 'Miami, USA', backdrop: 'miami',
    accent: '#F26CA7', felt: '#4a9e8f', rail: '#c8c8d8', time: 'day',
    table: { surface: 'terrazzo', c: ['#cfd8d2', '#dde6e0', '#e8f0ea'], fleck: ['#F26CA7', '#40E0D0', '#ffd75e'] },
    goalTier: 6, flicks: 32, star2: 140, star3: 220,
    friction: FRICTION.wood, rails: rectRails(), railBounce: 0.85, spawnTiers: [1, 2, 3, 4],
    sideGoal: { type: 'bank', count: 1, label: 'Bank-shot merge', required: false, bonus: 25 },
    intro: 'Chrome deco rails love a bank shot.',
    mechanic: 'Bouncier rails (e=0.85). Side goal: 1 bank-shot merge.',
  },
  {
    id: 3, place: 'Cancún', country: 'Mexico', backdrop: 'cancun',
    accent: '#40E0D0', felt: '#38a0b0', rail: '#c9b08c', time: 'day',
    table: { surface: 'tile', c: ['#1f8296', '#2699ad', '#31b0c4'], grout: 'rgba(8,50,58,0.5)', motif: '#eafcff' },
    goalTier: 6, flicks: 42, star2: 180, star3: 275,
    friction: FRICTION.wood, rails: rectRails(), spawnTiers: [1, 2, 3, 4],
    orders: { count: 3, minTier: 2, maxTier: 4 },
    sideGoal: { type: 'orders', count: 3, label: 'Serve 3 orders', required: true },
    intro: 'Guests want drinks to go — land the right one on their tray for 2x.',
    mechanic: 'To-go orders: serve drinks off the table for double pay.',
  },
  {
    id: 4, place: 'Copacabana', country: 'Rio, Brazil', backdrop: 'rio',
    accent: '#FFC65C', felt: '#2f8f78', rail: '#3c3c3c', time: 'sunset',
    table: { surface: 'wave', c: ['#d8d2c4', '#e6e0d2', '#f0ebdf'], dark: '#33322e' },
    goalTier: 7, flicks: 46, star2: 290, star3: 435,
    friction: FRICTION.wood, rails: crescentRails(),
    orders: { minTier: 2, maxTier: 5 },
    sideGoal: { type: 'bank', count: 2, label: 'Land 2 bank-shots', required: false, bonus: 30 },
    intro: 'The table follows the beach curve — banks bend your shots.',
    mechanic: 'Curved rails. Aim like the promenade waves.',
  },
  {
    id: 5, place: 'Promenade', country: 'Nice, France', backdrop: 'nice',
    accent: '#1F6FB2', felt: '#3a8fa8', rail: '#d8cfc0', time: 'day',
    table: { surface: 'marble', c: ['#cfcdc9', '#e0ded9', '#eeece7'], vein: '#9a96a8' },
    goalTier: 7, flicks: 48, star2: 240, star3: 410,
    friction: FRICTION.wood, rails: rectRails(),
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
    accent: '#D96C47', felt: '#4f8f6f', rail: '#b06a4a', time: 'sunset',
    table: { surface: 'tile', c: ['#b86440', '#c9734a', '#d98555'], grout: 'rgba(90,40,20,0.5)', motif: '#f2dca6' },
    goalTier: 7, flicks: 50, star2: 260, star3: 420,
    friction: FRICTION.wood, rails: rectRails(),
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
    accent: '#2A5DAB', felt: '#3a6f9f', rail: '#f0ece4', time: 'sunset',
    table: { surface: 'plaster', c: ['#d8d2c4', '#e6e0d2', '#f2ede2'] },
    goalTier: 8, flicks: 68, star2: 440, star3: 820,
    friction: FRICTION.wood, rails: rectRails(),
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
    accent: '#C77DFF', felt: '#2f4470', rail: '#42346a', time: 'night',
    table: { surface: 'glass', c: ['#180f2c', '#221540', '#2c1c50'], glow: '#C77DFF' },
    goalTier: 8, flicks: 72, star2: 430, star3: 720,
    friction: FRICTION.wood, rails: rectRails(),
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
    accent: '#F2C14E', felt: '#7fa8b8', rail: '#d8c8a0', time: 'night',
    table: { surface: 'marble', c: ['#161310', '#221d15', '#302819'], vein: '#F2C14E' },
    goalTier: 8, flicks: 74, star2: 530, star3: 940,
    friction: FRICTION.marble, rails: rectRails(halfW * 0.85, length * 0.92),
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
    accent: '#23B5A0', felt: '#3aa08a', rail: '#8a5a38', time: 'day',
    table: { surface: 'wood', c: ['#6a4326', '#7d5330', '#8f6238'] },
    goalTier: 9, flicks: 98, star2: 850, star3: 1330,
    friction: FRICTION.wood, rails: rectRails(),
    orders: { minTier: 3, maxTier: 6 },
    spawnTiers: [1, 2, 3, 4, 5, 6],
    sideGoal: { type: 'combo', count: 4, label: 'Land a ×4 combo', required: false, bonus: 70 },
    intro: 'The bar pours SIX kinds now — bigger chaos, bigger chains.',
    mechanic: 'Wider spawn pool (tiers 1-6), announced up front.',
  },
  {
    id: 11, place: 'Tanah Lot', country: 'Bali, Indonesia', backdrop: 'bali',
    accent: '#FF8E53', felt: '#4f6f5f', rail: '#5a4a3a', time: 'sunset',
    table: { surface: 'stone', c: ['#363c34', '#434a40', '#4f574b'] },
    goalTier: 9, flicks: 105, star2: 670, star3: 1080,
    friction: FRICTION.wood, rails: rectRails(), spawnTiers: [2, 3, 4, 5, 6],
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
    accent: '#43D9C7', felt: '#2fa8a0', rail: '#b98a5a', time: 'day',
    table: { surface: 'glass', c: ['#137e86', '#1e9aa2', '#2bb6bc'], glow: '#9ff2ea' },
    goalTier: 11, flicks: 175, star2: 700, star3: 1250,
    friction: FRICTION.wood, rails: rectRails(), spawnTiers: [3, 4, 5, 6, 7],
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

export function levelById(id) { return LEVELS.find(l => l.id === id); }
