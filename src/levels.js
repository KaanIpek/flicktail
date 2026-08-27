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
    goalTier: 5, flicks: 20, star2: 80, star3: 140,
    friction: FRICTION.sand, rails: rectRails(),
    intro: 'Flick drinks up the table. Twins merge into bigger cocktails!',
    mechanic: 'Sand-soft table — shots die gently.',
  },
  {
    id: 2, place: 'South Beach', country: 'Miami, USA', backdrop: 'miami',
    accent: '#F26CA7', felt: '#4a9e8f', rail: '#c8c8d8', time: 'day',
    goalTier: 6, flicks: 26, star2: 150, star3: 260,
    friction: FRICTION.wood, rails: rectRails(), railBounce: 0.85,
    sideGoal: { type: 'bank', count: 1, label: 'Bank-shot merge' },
    intro: 'Chrome deco rails love a bank shot.',
    mechanic: 'Bouncier rails (e=0.85). Side goal: 1 bank-shot merge.',
  },
  {
    id: 3, place: 'Cancún', country: 'Mexico', backdrop: 'cancun',
    accent: '#40E0D0', felt: '#38a0b0', rail: '#c9b08c', time: 'day',
    goalTier: 6, flicks: 30, star2: 200, star3: 350,
    friction: FRICTION.wood, rails: rectRails(),
    orders: { count: 3, minTier: 2, maxTier: 4 },
    sideGoal: { type: 'orders', count: 3, label: 'Serve 3 orders' },
    intro: 'Guests want drinks to go — land the right one on their tray for 2x.',
    mechanic: 'To-go orders: serve drinks off the table for double pay.',
  },
  {
    id: 4, place: 'Copacabana', country: 'Rio, Brazil', backdrop: 'rio',
    accent: '#FFC65C', felt: '#2f8f78', rail: '#3c3c3c', time: 'sunset',
    goalTier: 7, flicks: 36, star2: 300, star3: 520,
    friction: FRICTION.wood, rails: crescentRails(),
    orders: { minTier: 2, maxTier: 5 },
    intro: 'The table follows the beach curve — banks bend your shots.',
    mechanic: 'Curved rails. Aim like the promenade waves.',
  },
  {
    id: 5, place: 'Promenade', country: 'Nice, France', backdrop: 'nice',
    accent: '#1F6FB2', felt: '#3a8fa8', rail: '#d8cfc0', time: 'day',
    goalTier: 7, flicks: 38, star2: 340, star3: 600,
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
    goalTier: 7, flicks: 40, star2: 380, star3: 680,
    friction: FRICTION.wood, rails: rectRails(),
    orders: { minTier: 2, maxTier: 5 },
    innerWalls: [
      { pts: [{ x: -halfW, z: 420 }, { x: -halfW + 220, z: 420 }], both: true },
      { pts: [{ x: halfW - 220, z: 640 }, { x: halfW, z: 640 }], both: true },
    ],
    intro: 'Cliff terraces — thread your flicks through the gaps.',
    mechanic: 'Interior half-rails split the table into terraces.',
  },
  {
    id: 7, place: 'Oia', country: 'Santorini, Greece', backdrop: 'santorini',
    accent: '#2A5DAB', felt: '#3a6f9f', rail: '#f0ece4', time: 'sunset',
    goalTier: 8, flicks: 55, star2: 600, star3: 1000,
    friction: FRICTION.wood, rails: rectRails(),
    orders: { minTier: 3, maxTier: 6 },
    wind: { period: 12, warn: 2, len: 1.6, accel: 620 },
    intro: 'The Meltemi wind gusts sideways — watch the napkins flutter.',
    mechanic: 'Wind bends moving drinks. Parked drinks are safe.',
  },
  {
    id: 8, place: 'Ibiza', country: 'Spain', backdrop: 'ibiza',
    accent: '#C77DFF', felt: '#2f4470', rail: '#42346a', time: 'night',
    goalTier: 8, flicks: 58, star2: 650, star3: 1100,
    friction: FRICTION.wood, rails: rectRails(),
    orders: { minTier: 3, maxTier: 6 },
    beachBall: { r: 40, speed: 90 },
    intro: 'A glowing beach ball drifts across the party table.',
    mechanic: 'Moving obstacle — light, bouncy, never merges.',
  },
  {
    id: 9, place: 'Jumeirah', country: 'Dubai, UAE', backdrop: 'dubai',
    accent: '#F2C14E', felt: '#7fa8b8', rail: '#d8c8a0', time: 'night',
    goalTier: 8, flicks: 60, star2: 700, star3: 1200,
    friction: FRICTION.marble, rails: rectRails(halfW * 0.85, length * 0.92),
    orders: { minTier: 3, maxTier: 6 },
    intro: 'Polished marble, smaller table. Everything glides.',
    mechanic: 'Ice-slick surface — use the rails.',
  },
  {
    id: 10, place: 'Kata Beach', country: 'Phuket, Thailand', backdrop: 'phuket',
    accent: '#23B5A0', felt: '#3aa08a', rail: '#8a5a38', time: 'day',
    goalTier: 9, flicks: 80, star2: 1000, star3: 1700,
    friction: FRICTION.wood, rails: rectRails(),
    orders: { minTier: 3, maxTier: 6 },
    spawnTiers: [1, 2, 3, 4, 5, 6],
    intro: 'The bar pours SIX kinds now — bigger chaos, bigger chains.',
    mechanic: 'Wider spawn pool (tiers 1-6), announced up front.',
  },
  {
    id: 11, place: 'Tanah Lot', country: 'Bali, Indonesia', backdrop: 'bali',
    accent: '#FF8E53', felt: '#4f6f5f', rail: '#5a4a3a', time: 'sunset',
    goalTier: 9, flicks: 85, star2: 1100, star3: 1900,
    friction: FRICTION.wood, rails: rectRails(),
    orders: { minTier: 3, maxTier: 7 },
    tide: { period: 25, warn: 3, len: 2.2, fromZ: 640 },
    intro: 'The tide floods the far third — don’t park drinks up there.',
    mechanic: 'Tide hazard, telegraphed 3 s ahead.',
  },
  {
    id: 12, place: 'Bora Bora', country: 'French Polynesia', backdrop: 'borabora',
    accent: '#43D9C7', felt: '#2fa8a0', rail: '#b98a5a', time: 'day',
    goalTier: 11, flicks: 150, star2: 2000, star3: 3400,
    friction: FRICTION.wood, rails: rectRails(),
    orders: { minTier: 4, maxTier: 8 },
    obstacles: [
      { x: -120, z: 560, r: 52, kind: 'motu' },
      { x: 140, z: 700, r: 44, kind: 'motu' },
    ],
    preplace: [
      { tier: 8, x: -60, z: 780 }, { tier: 8, x: 200, z: 480 },
      { tier: 5, x: -200, z: 620 }, { tier: 4, x: 80, z: 380 },
      { tier: 3, x: -100, z: 300 }, { tier: 3, x: 220, z: 640 },
    ],
    wind: { period: 18, warn: 2, len: 1.4, accel: 480 },
    intro: 'The lagoon finale. Mix the Paradise Atlas.',
    mechanic: 'Everything you learned — motu islands, wind, royal orders.',
    finale: true,
  },
];

export function levelById(id) { return LEVELS.find(l => l.id === id); }
