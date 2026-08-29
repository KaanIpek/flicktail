// Country tours. The World Tour is the mixed twelve-stop headline trip; each
// country then has its own shorter tour with its OWN cast of animals, its own
// signature drink, its own tables and its own time-of-day mix — so the same
// tier is an axolotl in Mexico and an elephant in Thailand.

import { TABLE, FRICTION } from './config.js';

const { halfW, length, foulLine } = TABLE;

function rectRails(hw = halfW, far = length, nearZ = foulLine) {
  return [
    { x: hw, z: nearZ }, { x: hw, z: far },
    { x: -hw, z: far }, { x: -hw, z: nearZ },
  ];
}

// hazard kits a tour can deal out, one per stop, so no two stops play alike
const HAZARDS = {
  calm: {},
  wind: { wind: { period: 14, warn: 2.2, len: 1.5, accel: 520 } },
  tide: { tide: { period: 30, warn: 3.2, len: 1.9, fromZ: 715 } },
  ball: { beachBall: { r: 38, speed: 84 } },
  ice: { friction: FRICTION.marble },
  sand: { friction: FRICTION.sand },
  terrace: {
    innerWalls: [
      { pts: [{ x: -halfW, z: 620 }, { x: -halfW + 140, z: 620 }], both: true },
      { pts: [{ x: halfW - 140, z: 730 }, { x: halfW, z: 730 }], both: true },
    ],
  },
  reef: {
    obstacles: [{ x: -150, z: 600, r: 42, kind: 'motu' }, { x: 160, z: 720, r: 36, kind: 'motu' }],
  },
  bouncy: { railBounce: 0.88 },
  // signature hazards — one per country, so a place plays like nowhere else
  cenote: { cenote: { x: -70, z: 560, r: 76 } },                                  // Mexico
  sandstorm: { sandstorm: { period: 15, warn: 2.4, len: 2.2, accel: 430, dir: 1 } }, // UAE
  lava: { lava: { zMin: 690, zMax: 810, dwell: 2.6 } },                           // Indonesia
  monsoon: { monsoon: { period: 17, warn: 2.2, len: 3.2 } },                      // Thailand
  typhoon: { wind: { period: 11, warn: 1.8, len: 1.9, accel: 600 } },             // Japan
  atlantic: { tide: { period: 24, warn: 3, len: 2.0, fromZ: 700 } },              // Portugal
};

const SIDE_GOALS = [
  null,
  { type: 'bank', count: 2, label: 'Land 2 bank-shots', required: false, bonus: 30 },
  { type: 'combo', count: 3, label: 'Land a ×3 combo', required: false, bonus: 40 },
  { type: 'orders', count: 2, label: 'Serve 2 orders', required: false, bonus: 45 },
  { type: 'combo', count: 4, label: 'Land a ×4 combo', required: false, bonus: 60 },
];

// Each country: where it is, who lives there, what it pours, how it looks.
export const COUNTRIES = [
  {
    id: 'mexico', name: 'Mexico', flag: '🇲🇽', backdrop: 'cancun',
    accent: '#40E0D0', rail: '#c9b08c',
    drinks: ['Cenote Cooler', 'Coco Michelada', 'Tulum Tiki', 'Mayan Martini', 'Sunset Paloma'],
    special: 'Golden Agave',
    cast: ['frog', 'axolotl', 'iguana', 'turtle', 'coati', 'armadillo',
      'toucan', 'jaguar', 'crab', 'octopus', 'axolotl'],
    stops: ['Playa Norte', 'Tulum', 'Cozumel', 'Isla Mujeres', 'Akumal'],
    tables: [
      { surface: 'tile', c: ['#1f8296', '#2699ad', '#31b0c4'], grout: 'rgba(8,50,58,0.5)', motif: '#eafcff' },
      { surface: 'terrazzo', c: ['#e2d6bd', '#eee3cd', '#f6eeda'], fleck: ['#40E0D0', '#ff8f3c', '#ffd75e'] },
      { surface: 'stone', c: ['#5a5148', '#6b6055', '#7a6d60'] },
    ],
    hazards: ['calm', 'sand', 'cenote', 'wind', 'cenote'],
    times: ['day', 'day', 'sunset', 'night', 'day'],
  },
  {
    id: 'brazil', name: 'Brazil', flag: '🇧🇷', backdrop: 'rio',
    accent: '#FFC65C', rail: '#3c3c3c',
    drinks: ['Ipanema Ice', 'Coco Verde', 'Samba Sour', 'Rio Royale', 'Amazon Amber'],
    special: 'Carnival Punch',
    cast: ['frog', 'capybara', 'sloth', 'turtle', 'monkey', 'tapir',
      'macaw', 'jaguar', 'crab', 'octopus', 'macaw'],
    stops: ['Ipanema', 'Leblon', 'Búzios', 'Paraty', 'Ilha Grande'],
    tables: [
      { surface: 'wave', c: ['#d8d2c4', '#e6e0d2', '#f0ebdf'], dark: '#33322e' },
      { surface: 'wood', c: ['#6a4326', '#7d5330', '#8f6238'] },
      { surface: 'terrazzo', c: ['#cfd8d2', '#dde6e0', '#e8f0ea'], fleck: ['#FFC65C', '#3e8e5e', '#ff6d7f'] },
    ],
    hazards: ['calm', 'bouncy', 'ball', 'wind', 'terrace'],
    times: ['sunset', 'day', 'sunset', 'night', 'sunset'],
  },
  {
    id: 'italy', name: 'Italy', flag: '🇮🇹', backdrop: 'positano',
    accent: '#D96C47', rail: '#b06a4a',
    drinks: ['Amalfi Spritz', 'Latte di Capri', 'Vesuvio Fizz', 'Prosecco Prisma', 'Sole d’Oro'],
    special: 'Limoncello Sole',
    cast: ['frog', 'cat', 'songbird', 'turtle', 'hedgehog', 'fox',
      'gecko', 'goat', 'crab', 'octopus', 'cat'],
    stops: ['Amalfi', 'Capri', 'Cinque Terre', 'Portofino', 'Taormina'],
    tables: [
      { surface: 'tile', c: ['#b86440', '#c9734a', '#d98555'], grout: 'rgba(90,40,20,0.5)', motif: '#f2dca6' },
      { surface: 'marble', c: ['#cfcdc9', '#e0ded9', '#eeece7'], vein: '#9a96a8' },
      { surface: 'plaster', c: ['#d8d2c4', '#e6e0d2', '#f2ede2'] },
    ],
    hazards: ['terrace', 'calm', 'ice', 'wind', 'bouncy'],
    times: ['sunset', 'day', 'sunset', 'day', 'night'],
  },
  {
    id: 'greece', name: 'Greece', flag: '🇬🇷', backdrop: 'santorini',
    accent: '#2A5DAB', rail: '#f0ece4',
    drinks: ['Aegean Blue', 'Yogurt Cloud', 'Olive Ember', 'Ouzo Prism', 'Golden Meltemi'],
    special: 'Aegean Mythos',
    cast: ['frog', 'cat', 'songbird', 'turtle', 'goat', 'fox',
      'octopus', 'pelican', 'crab', 'dolphin', 'octopus'],
    stops: ['Oia', 'Mykonos', 'Naxos', 'Milos', 'Paros'],
    tables: [
      { surface: 'plaster', c: ['#d8d2c4', '#e6e0d2', '#f2ede2'] },
      { surface: 'marble', c: ['#cfd4d8', '#e2e6ea', '#f0f3f6'], vein: '#7f93a8' },
      { surface: 'stone', c: ['#4a4f55', '#585e66', '#666d76'] },
    ],
    hazards: ['wind', 'calm', 'ice', 'tide', 'bouncy'],
    times: ['sunset', 'day', 'day', 'night', 'sunset'],
  },
  {
    id: 'france', name: 'France', flag: '🇫🇷', backdrop: 'nice',
    accent: '#1F6FB2', rail: '#d8cfc0',
    drinks: ['Côte Bleue', 'Crème Riviera', 'Provence Ember', 'Cassis Prisme', 'Soleil Doré'],
    special: 'Riviera Royale',
    cast: ['frog', 'songbird', 'snail', 'turtle', 'poodle', 'fox',
      'octopus', 'seabird', 'crab', 'seal', 'poodle'],
    stops: ['Promenade', 'Cannes', 'Antibes', 'Saint-Tropez', 'Menton'],
    tables: [
      { surface: 'marble', c: ['#cfcdc9', '#e0ded9', '#eeece7'], vein: '#9a96a8' },
      { surface: 'terrazzo', c: ['#d6dbe2', '#e6eaf0', '#f2f5f8'], fleck: ['#1F6FB2', '#ff6d7f', '#ffd75e'] },
      { surface: 'wood', c: ['#7a5a3a', '#8c6a46', '#9e7a52'] },
    ],
    hazards: ['ice', 'calm', 'bouncy', 'wind', 'terrace'],
    times: ['day', 'day', 'sunset', 'night', 'day'],
  },
  {
    id: 'spain', name: 'Spain', flag: '🇪🇸', backdrop: 'ibiza',
    accent: '#C77DFF', rail: '#42346a',
    drinks: ['Sangría Azul', 'Horchata Nube', 'Fuego Tiki', 'Cava Prisma', 'Oro de Ibiza'],
    special: 'Medianoche',
    cast: ['frog', 'gecko', 'songbird', 'turtle', 'lynx', 'fox',
      'owl', 'flamingo', 'crab', 'bull', 'owl'],
    stops: ['Ibiza Town', 'Formentera', 'Sitges', 'Marbella', 'San Antonio'],
    tables: [
      { surface: 'glass', c: ['#180f2c', '#221540', '#2c1c50'], glow: '#C77DFF' },
      { surface: 'tile', c: ['#8a3f5a', '#a04c6c', '#b65a7e'], grout: 'rgba(40,12,26,0.5)', motif: '#ffd9ea' },
      { surface: 'stone', c: ['#3a3340', '#463e4c', '#524959'] },
    ],
    hazards: ['ball', 'bouncy', 'calm', 'ice', 'wind'],
    times: ['night', 'day', 'sunset', 'night', 'night'],
  },
  {
    id: 'usa', name: 'United States', flag: '🇺🇸', backdrop: 'waikiki',
    accent: '#2EC4B6', rail: '#8a5a38',
    drinks: ['Blue Hawaii', 'Coco Cloud', 'Mainland Ember', 'Neon Martini', 'Golden Pineapple'],
    special: 'Aloha Comet',
    cast: ['frog', 'crab', 'duckling', 'turtle', 'seal', 'fox',
      'octopus', 'pelican', 'dolphin', 'shark', 'dolphin'],
    stops: ['Waikiki', 'Maui', 'Key West', 'Malibu', 'Kauai'],
    tables: [
      { surface: 'bamboo', c: ['#b8924e', '#c9a55f', '#d8b876'] },
      { surface: 'wood', c: ['#6a4326', '#7d5330', '#8f6238'] },
      { surface: 'terrazzo', c: ['#cfd8d2', '#dde6e0', '#e8f0ea'], fleck: ['#2EC4B6', '#ff9d2e', '#ffd75e'] },
    ],
    hazards: ['sand', 'calm', 'ball', 'tide', 'wind'],
    times: ['day', 'day', 'sunset', 'day', 'sunset'],
  },
  {
    id: 'uae', name: 'United Arab Emirates', flag: '🇦🇪', backdrop: 'dubai',
    accent: '#F2C14E', rail: '#d8c8a0',
    drinks: ['Oasis Blue', 'Desert Cloud', 'Spice Ember', 'Crystal Martini', 'Golden Date'],
    special: 'Desert Pearl',
    cast: ['frog', 'fennec', 'gecko', 'turtle', 'oryx', 'gazelle',
      'falcon', 'camel', 'scorpion', 'shark', 'falcon'],
    stops: ['Jumeirah', 'Palm', 'Abu Dhabi', 'Fujairah', 'Ras Al Khaimah'],
    tables: [
      { surface: 'marble', c: ['#161310', '#221d15', '#302819'], vein: '#F2C14E' },
      { surface: 'glass', c: ['#1a1408', '#261d0e', '#332816'], glow: '#F2C14E' },
      { surface: 'stone', c: ['#6b5c44', '#7a6a50', '#8a795c'] },
    ],
    hazards: ['ice', 'calm', 'sandstorm', 'bouncy', 'sandstorm'],
    times: ['night', 'day', 'night', 'sunset', 'night'],
  },
  {
    id: 'thailand', name: 'Thailand', flag: '🇹🇭', backdrop: 'phuket',
    accent: '#23B5A0', rail: '#8a5a38',
    drinks: ['Andaman Blue', 'Coconut Sticky', 'Chili Ember', 'Lemongrass Prism', 'Golden Mango'],
    special: 'Siam Sunrise',
    cast: ['frog', 'clownfish', 'gecko', 'turtle', 'gibbon', 'hornbill',
      'monkey', 'tiger', 'crab', 'elephant', 'elephant'],
    stops: ['Kata Beach', 'Krabi', 'Phi Phi', 'Koh Samui', 'Railay'],
    tables: [
      { surface: 'wood', c: ['#6a4326', '#7d5330', '#8f6238'] },
      { surface: 'bamboo', c: ['#a8843e', '#bb974f', '#cdaa66'] },
      { surface: 'tile', c: ['#1f7a6a', '#268f7c', '#31a68f'], grout: 'rgba(8,44,38,0.5)', motif: '#e6fff8' },
    ],
    hazards: ['calm', 'monsoon', 'reef', 'ball', 'monsoon'],
    times: ['day', 'sunset', 'day', 'night', 'day'],
  },
  {
    id: 'indonesia', name: 'Indonesia', flag: '🇮🇩', backdrop: 'bali',
    accent: '#FF8E53', rail: '#5a4a3a',
    drinks: ['Bali Blue', 'Kelapa Cloud', 'Sambal Ember', 'Frangipani Prism', 'Golden Salak'],
    special: 'Volcano Bloom',
    cast: ['frog', 'gecko', 'clownfish', 'turtle', 'monkey', 'komodo',
      'hornbill', 'orangutan', 'ray', 'tiger', 'komodo'],
    stops: ['Tanah Lot', 'Uluwatu', 'Nusa Penida', 'Gili', 'Lombok'],
    tables: [
      { surface: 'stone', c: ['#363c34', '#434a40', '#4f574b'] },
      { surface: 'wood', c: ['#5e3d24', '#6f4b2e', '#805938'] },
      { surface: 'tile', c: ['#7a4030', '#8d4d3a', '#a05a45'], grout: 'rgba(40,16,10,0.5)', motif: '#ffd9b8' },
    ],
    hazards: ['lava', 'calm', 'terrace', 'wind', 'lava'],
    times: ['sunset', 'day', 'sunset', 'night', 'day'],
  },
  {
    id: 'polynesia', name: 'French Polynesia', flag: '🇵🇫', backdrop: 'borabora',
    accent: '#43D9C7', rail: '#b98a5a',
    drinks: ['Motu Blue', 'Coco Vahine', 'Tiki Feu', 'Pearl Martini', 'Golden Monoi'],
    special: 'Lagoon Crown',
    cast: ['frog', 'parrotfish', 'clownfish', 'turtle', 'seal', 'seabird',
      'octopus', 'ray', 'dolphin', 'shark', 'ray'],
    stops: ['Matira', 'Moorea', 'Taha’a', 'Rangiroa', 'Huahine'],
    tables: [
      { surface: 'glass', c: ['#137e86', '#1e9aa2', '#2bb6bc'], glow: '#9ff2ea' },
      { surface: 'bamboo', c: ['#b8924e', '#c9a55f', '#d8b876'] },
      { surface: 'marble', c: ['#cfe0e2', '#e0eef0', '#eef8f9'], vein: '#7fbfc4' },
    ],
    hazards: ['reef', 'calm', 'tide', 'ice', 'ball'],
    times: ['day', 'day', 'sunset', 'day', 'night'],
  },
  {
    id: 'japan', name: 'Japan', flag: '🇯🇵', backdrop: 'okinawa',
    accent: '#E8546B', rail: '#8c4a3a',
    drinks: ['Ryukyu Blue', 'Mochi Cloud', 'Yuzu Ember', 'Sakura Prism', 'Kin no Nami'],
    special: 'Torii Sunrise',
    cast: ['frog', 'cat', 'songbird', 'turtle', 'bunny', 'fox',
      'octopus', 'crab', 'seal', 'dolphin', 'fox'],
    stops: ['Naha', 'Kabira Bay', 'Miyako', 'Zamami', 'Iriomote'],
    tables: [
      { surface: 'wood', c: ['#7a4a2e', '#8c5a38', '#9e6a44'] },
      { surface: 'plaster', c: ['#e0d8c8', '#eee7d8', '#f6f1e6'] },
      { surface: 'tile', c: ['#8a3040', '#a03a4e', '#b6455c'], grout: 'rgba(50,10,18,0.5)', motif: '#ffe0e6' },
    ],
    hazards: ['calm', 'typhoon', 'ice', 'reef', 'typhoon'],
    times: ['day', 'sunset', 'day', 'night', 'day'],
  },
  {
    id: 'portugal', name: 'Portugal', flag: '🇵🇹', backdrop: 'algarve',
    accent: '#E8A33D', rail: '#b8865a',
    drinks: ['Atlantico Azul', 'Nata Cloud', 'Piri Ember', 'Porto Prisma', 'Ouro do Sul'],
    special: 'Algarve Gold',
    cast: ['frog', 'songbird', 'gecko', 'turtle', 'hedgehog', 'fox',
      'octopus', 'seabird', 'crab', 'dolphin', 'seabird'],
    stops: ['Lagos', 'Benagil', 'Sagres', 'Albufeira', 'Faro'],
    tables: [
      { surface: 'tile', c: ['#2a5f8a', '#33719e', '#3d84b2'], grout: 'rgba(8,30,50,0.5)', motif: '#eaf4ff' },
      { surface: 'stone', c: ['#a8895e', '#b89a6e', '#c8ab7e'] },
      { surface: 'plaster', c: ['#e6dcc8', '#f0e8d8', '#f8f2e6'] },
    ],
    hazards: ['bouncy', 'atlantic', 'calm', 'wind', 'atlantic'],
    times: ['day', 'sunset', 'day', 'sunset', 'night'],
  },
  {
    id: 'australia', name: 'Australia', flag: '🇦🇺', backdrop: 'whitsundays',
    accent: '#2FC4B2', rail: '#8a7a5a',
    drinks: ['Coral Sea', 'Pavlova Cloud', 'Outback Ember', 'Opal Prism', 'Golden Reef'],
    special: 'Southern Cross',
    cast: ['frog', 'quokka', 'gecko', 'turtle', 'koalaish', 'fox',
      'octopus', 'parrotfish', 'crab', 'ray', 'quokka'],
    stops: ['Whitehaven', 'Hamilton', 'Airlie', 'Hayman', 'Daydream'],
    tables: [
      { surface: 'bamboo', c: ['#c2a05a', '#d2b06a', '#e0c07e'] },
      { surface: 'glass', c: ['#0f6f78', '#178a92', '#22a5ad'], glow: '#9ff2ea' },
      { surface: 'terrazzo', c: ['#dfe6e2', '#ecf2ee', '#f6faf7'], fleck: ['#2FC4B2', '#ffd75e', '#ff8f6b'] },
    ],
    hazards: ['reef', 'calm', 'ball', 'ice', 'reef'],
    times: ['day', 'day', 'sunset', 'day', 'night'],
  },
  {
    id: 'vietnam', name: 'Vietnam', flag: '🇻🇳', backdrop: 'halong',
    accent: '#3FBF8F', rail: '#7a5a3a',
    drinks: ['Ha Long Jade', 'Che Cloud', 'Pho Ember', 'Lotus Prism', 'Golden Junk'],
    special: 'Karst Mist',
    cast: ['frog', 'gecko', 'songbird', 'turtle', 'monkey', 'hornbill',
      'octopus', 'crab', 'clownfish', 'tiger', 'hornbill'],
    stops: ['Ha Long', 'Cat Ba', 'Lan Ha', 'Bai Tu Long', 'Ninh Binh'],
    tables: [
      { surface: 'wood', c: ['#6a4a2e', '#7c5a38', '#8e6a44'] },
      { surface: 'stone', c: ['#3e4a44', '#4a5850', '#56655c'] },
      { surface: 'tile', c: ['#1f7a5e', '#268f70', '#31a682'], grout: 'rgba(8,40,30,0.5)', motif: '#e6fff2' },
    ],
    hazards: ['calm', 'monsoon', 'reef', 'wind', 'monsoon'],
    times: ['day', 'sunset', 'day', 'night', 'sunset'],
  },
];

const GOALS = [4, 5, 6, 7, 8];
const FLICKS = [18, 23, 28, 35, 44];
const POOLS = [
  [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6],
];
// placeholder star lines; the real ones are measured with the auto-player and
// written back into STAR_LINES below
const STAR_LINES = {
  100: { star2: 35, star3: 60 },
  101: { star2: 20, star3: 35 },
  102: { star2: 120, star3: 195 },
  103: { star2: 245, star3: 395 },
  104: { star2: 320, star3: 520 },
  110: { star2: 35, star3: 60 },
  111: { star2: 100, star3: 160 },
  112: { star2: 120, star3: 190 },
  113: { star2: 245, star3: 395 },
  114: { star2: 290, star3: 470 },
  120: { star2: 35, star3: 60 },
  121: { star2: 100, star3: 160 },
  122: { star2: 100, star3: 160 },
  123: { star2: 245, star3: 395 },
  124: { star2: 310, star3: 500 },
  130: { star2: 35, star3: 60 },
  131: { star2: 100, star3: 160 },
  132: { star2: 100, star3: 160 },
  133: { star2: 145, star3: 230 },
  134: { star2: 310, star3: 500 },
  140: { star2: 35, star3: 60 },
  141: { star2: 100, star3: 160 },
  142: { star2: 120, star3: 190 },
  143: { star2: 245, star3: 395 },
  144: { star2: 290, star3: 470 },
  150: { star2: 45, star3: 70 },
  151: { star2: 100, star3: 160 },
  152: { star2: 120, star3: 195 },
  153: { star2: 185, star3: 295 },
  154: { star2: 335, star3: 540 },
  160: { star2: 20, star3: 30 },
  161: { star2: 100, star3: 160 },
  162: { star2: 120, star3: 190 },
  163: { star2: 145, star3: 230 },
  164: { star2: 335, star3: 540 },
  170: { star2: 35, star3: 60 },
  171: { star2: 100, star3: 160 },
  172: { star2: 120, star3: 195 },
  173: { star2: 210, star3: 340 },
  174: { star2: 320, star3: 520 },
  180: { star2: 35, star3: 60 },
  181: { star2: 100, star3: 160 },
  182: { star2: 75, star3: 120 },
  183: { star2: 175, star3: 280 },
  184: { star2: 320, star3: 520 },
  190: { star2: 35, star3: 60 },
  191: { star2: 100, star3: 160 },
  192: { star2: 110, star3: 180 },
  193: { star2: 245, star3: 395 },
  194: { star2: 320, star3: 520 },
  200: { star2: 20, star3: 30 },
  201: { star2: 100, star3: 160 },
  202: { star2: 85, star3: 140 },
  203: { star2: 185, star3: 295 },
  204: { star2: 260, star3: 420 },
  210: { star2: 35, star3: 60 },
  211: { star2: 95, star3: 150 },
  212: { star2: 100, star3: 160 },
  213: { star2: 155, star3: 250 },
  214: { star2: 340, star3: 545 },
  220: { star2: 35, star3: 60 },
  221: { star2: 70, star3: 115 },
  222: { star2: 120, star3: 195 },
  223: { star2: 245, star3: 395 },
  224: { star2: 200, star3: 325 },
  230: { star2: 20, star3: 30 },
  231: { star2: 100, star3: 160 },
  232: { star2: 120, star3: 190 },
  233: { star2: 185, star3: 295 },
  234: { star2: 275, star3: 440 },
  240: { star2: 35, star3: 60 },
  241: { star2: 100, star3: 160 },
  242: { star2: 75, star3: 120 },
  243: { star2: 245, star3: 395 },
  244: { star2: 320, star3: 520 },
};

export function buildCountryLevels() {
  const out = [];
  COUNTRIES.forEach((c, ci) => {
    for (let i = 0; i < 5; i++) {
      const id = 100 + ci * 10 + i;
      const hz = HAZARDS[c.hazards[i % c.hazards.length]] || {};
      const table = c.tables[i % c.tables.length];
      const lines = STAR_LINES[id] || { star2: 120 + i * 90, star3: 200 + i * 150 };
      out.push({
        id,
        tour: c.id,
        place: c.stops[i],
        country: c.name,
        backdrop: c.backdrop,
        accent: c.accent,
        felt: c.accent,
        rail: c.rail,
        time: c.times[i % c.times.length],
        table,
        cast: c.cast,
        names: { 4: c.drinks[0], 5: c.drinks[1], 6: c.drinks[2],
          7: c.drinks[3], 8: c.drinks[4], 11: c.special },
        colors: { 11: [c.accent, c.sigAlt || '#fff4d8'] },
        goalTier: GOALS[i],
        flicks: FLICKS[i],
        star2: lines.star2,
        star3: lines.star3,
        friction: hz.friction || FRICTION.wood,
        rails: rectRails(),
        railBounce: hz.railBounce,
        spawnTiers: POOLS[i],
        wind: hz.wind,
        tide: hz.tide,
        beachBall: hz.beachBall,
        innerWalls: hz.innerWalls,
        obstacles: hz.obstacles,
        orders: i >= 2 ? { minTier: 2, maxTier: Math.min(6, GOALS[i] - 1) } : undefined,
        // the last stop of a tour gets a small head start so the run is a
        // finish, not a grind (measured: without it the bot wins 1/5)
        preplace: i === 4 ? [
          { tier: GOALS[i] - 3, x: -96, z: 520 }, { tier: GOALS[i] - 3, x: 92, z: 520 },
        ] : undefined,
        sideGoal: SIDE_GOALS[i],
        barCat: { x: i % 2 ? 238 : -238, c: '#8a7f74', alt: '#f6efe6' },
        guest: { c: '#7a6f64', alt: '#f2ece2', side: i % 2 ? -1 : 1, offset: i * 9 },
        decor: [
          { kind: 'coaster', x: -152, z: 300, c: '#f0e6d2', rot: 0.2 },
          { kind: 'petal', x: 150, z: 520, c: c.accent },
          { kind: 'leaf', x: -140, z: 760, c: '#3e8e5e', rot: 0.5 },
        ],
        intro: `${c.stops[i]} — ${c.name}. Mix a ${c.special === undefined ? 'signature drink' : 'local favourite'}.`,
        mechanic: c.hazards[i % c.hazards.length],
      });
    }
  });
  return out;
}

// The tours shown on the main map: the mixed headline trip, then the countries.
export function buildTours(worldLevelIds) {
  return [
    {
      id: 'world', name: 'World Tour', flag: '🌍', backdrop: 'waikiki',
      blurb: 'Twelve flagship stops, every country mixed together.',
      levels: worldLevelIds,
    },
    ...COUNTRIES.map((c, ci) => ({
      id: c.id, name: c.name, flag: c.flag, backdrop: c.backdrop,
      blurb: `${c.stops.length} stops · ${c.special}`,
      special: c.special,
      levels: Array.from({ length: 5 }, (_, i) => 100 + ci * 10 + i),
    })),
  ];
}
