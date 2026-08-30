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
  { type: 'bank', count: 3, label: 'Land 3 bank-shots', required: false, bonus: 55 },
  { type: 'combo', count: 5, label: 'Land a ×5 combo', required: false, bonus: 90 },
];

// Each country: where it is, who lives there, what it pours, how it looks.
export const COUNTRIES = [
  {
    id: 'mexico', name: 'Mexico', flag: '🇲🇽', backdrop: 'cancun',
    accent: '#40E0D0', rail: '#c9b08c',
    drinks: ['Cenote Cooler', 'Coco Michelada', 'Tulum Tiki', 'Mayan Martini', 'Sunset Paloma'],
    special: 'Golden Agave',
    sigArt: 'assets/signatures/golden-agave.png',
    cast: ['frog', 'axolotl', 'iguana', 'turtle', 'coati', 'armadillo',
      'toucan', 'jaguar', 'crab', 'octopus', 'axolotl'],
    stops: ['Playa Norte', 'Tulum', 'Cozumel', 'Isla Mujeres', 'Akumal', 'Holbox', 'Bacalar'],
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
    sigArt: 'assets/signatures/carnival-punch.png',
    cast: ['frog', 'capybara', 'sloth', 'turtle', 'monkey', 'tapir',
      'macaw', 'jaguar', 'crab', 'octopus', 'macaw'],
    stops: ['Ipanema', 'Leblon', 'Búzios', 'Paraty', 'Ilha Grande', 'Jericoacoara', 'Fernando de Noronha'],
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
    sigArt: 'assets/signatures/limoncello-sole.png',
    cast: ['frog', 'cat', 'songbird', 'turtle', 'hedgehog', 'fox',
      'gecko', 'goat', 'crab', 'octopus', 'cat'],
    stops: ['Amalfi', 'Capri', 'Cinque Terre', 'Portofino', 'Taormina', 'Sorrento', 'Procida'],
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
    sigArt: 'assets/signatures/aegean-mythos.png',
    cast: ['frog', 'cat', 'songbird', 'turtle', 'goat', 'fox',
      'octopus', 'pelican', 'crab', 'dolphin', 'octopus'],
    stops: ['Oia', 'Mykonos', 'Naxos', 'Milos', 'Paros', 'Rhodes', 'Zakynthos'],
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
    sigArt: 'assets/signatures/riviera-royale.png',
    cast: ['frog', 'songbird', 'snail', 'turtle', 'poodle', 'fox',
      'octopus', 'seabird', 'crab', 'seal', 'poodle'],
    stops: ['Promenade', 'Cannes', 'Antibes', 'Saint-Tropez', 'Menton', 'Villefranche', 'Porquerolles'],
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
    sigArt: 'assets/signatures/medianoche.png',
    cast: ['frog', 'gecko', 'songbird', 'turtle', 'lynx', 'fox',
      'owl', 'flamingo', 'crab', 'bull', 'owl'],
    stops: ['Ibiza Town', 'Formentera', 'Sitges', 'Marbella', 'San Antonio', 'Menorca', 'Tarifa'],
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
    sigArt: 'assets/signatures/aloha-comet.png',
    cast: ['frog', 'crab', 'duckling', 'turtle', 'seal', 'fox',
      'octopus', 'pelican', 'dolphin', 'shark', 'dolphin'],
    stops: ['Waikiki', 'Maui', 'Key West', 'Malibu', 'Kauai', 'Big Sur', 'Outer Banks'],
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
    sigArt: 'assets/signatures/desert-pearl.png',
    cast: ['frog', 'fennec', 'gecko', 'turtle', 'oryx', 'gazelle',
      'falcon', 'camel', 'scorpion', 'shark', 'falcon'],
    stops: ['Jumeirah', 'Palm', 'Abu Dhabi', 'Fujairah', 'Ras Al Khaimah', 'Khor Fakkan', 'Sir Bani Yas'],
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
    sigArt: 'assets/signatures/siam-sunrise.png',
    cast: ['frog', 'clownfish', 'gecko', 'turtle', 'gibbon', 'hornbill',
      'monkey', 'tiger', 'crab', 'elephant', 'elephant'],
    stops: ['Kata Beach', 'Krabi', 'Phi Phi', 'Koh Samui', 'Railay', 'Hua Hin', 'Con Dao'],
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
    sigArt: 'assets/signatures/volcano-bloom.png',
    cast: ['frog', 'gecko', 'clownfish', 'turtle', 'monkey', 'komodo',
      'hornbill', 'orangutan', 'ray', 'tiger', 'komodo'],
    stops: ['Tanah Lot', 'Uluwatu', 'Nusa Penida', 'Gili', 'Lombok', 'Raja Ampat', 'Flores'],
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
    sigArt: 'assets/signatures/lagoon-crown.png',
    cast: ['frog', 'parrotfish', 'clownfish', 'turtle', 'seal', 'seabird',
      'octopus', 'ray', 'dolphin', 'shark', 'ray'],
    stops: ['Matira', 'Moorea', 'Taha’a', 'Rangiroa', 'Huahine', 'Bora Lagoon', 'Tetiaroa'],
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
    sigArt: 'assets/signatures/torii-sunrise.png',
    cast: ['frog', 'cat', 'songbird', 'turtle', 'bunny', 'fox',
      'octopus', 'crab', 'seal', 'dolphin', 'fox'],
    stops: ['Naha', 'Kabira Bay', 'Miyako', 'Zamami', 'Iriomote', 'Ishigaki', 'Amami'],
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
    sigArt: 'assets/signatures/algarve-gold.png',
    cast: ['frog', 'songbird', 'gecko', 'turtle', 'hedgehog', 'fox',
      'octopus', 'seabird', 'crab', 'dolphin', 'seabird'],
    stops: ['Lagos', 'Benagil', 'Sagres', 'Albufeira', 'Faro', 'Nazare', 'Madeira'],
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
    sigArt: 'assets/signatures/southern-cross.png',
    cast: ['frog', 'quokka', 'gecko', 'turtle', 'koalaish', 'fox',
      'octopus', 'parrotfish', 'crab', 'ray', 'quokka'],
    stops: ['Whitehaven', 'Hamilton', 'Airlie', 'Hayman', 'Daydream', 'Byron Bay', 'Cape Tribulation'],
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
    sigArt: 'assets/signatures/karst-mist.png',
    cast: ['frog', 'gecko', 'songbird', 'turtle', 'monkey', 'hornbill',
      'octopus', 'crab', 'clownfish', 'tiger', 'hornbill'],
    stops: ['Ha Long', 'Cat Ba', 'Lan Ha', 'Bai Tu Long', 'Ninh Binh', 'Phu Quoc', 'Nha Trang'],
    tables: [
      { surface: 'wood', c: ['#6a4a2e', '#7c5a38', '#8e6a44'] },
      { surface: 'stone', c: ['#3e4a44', '#4a5850', '#56655c'] },
      { surface: 'tile', c: ['#1f7a5e', '#268f70', '#31a682'], grout: 'rgba(8,40,30,0.5)', motif: '#e6fff2' },
    ],
    hazards: ['calm', 'monsoon', 'reef', 'wind', 'monsoon'],
    times: ['day', 'sunset', 'day', 'night', 'sunset'],
  },
  {
    id: 'china', name: 'China', flag: '🇨🇳', backdrop: 'halong',
    accent: '#E8434C', rail: '#7a2f2a',
    drinks: ['Lychee Lantern', 'Osmanthus Fizz', 'Jasmine Pearl', 'Dragon Well Cooler', 'Silk Road Sour'],
    special: 'Jade Dragon',
    sigArt: 'assets/signatures/jade-dragon.png',
    cast: ['frog', 'panda', 'redpanda', 'turtle', 'monkey', 'crane',
      'koi', 'songbird', 'tiger', 'crab', 'panda'],
    stops: ['Sanya', 'Yalong Bay', 'Wuzhizhou', 'Guilin', 'Yangshuo', 'Xiamen', 'West Lake'],
    tables: [
      { surface: 'wood', c: ['#6e2a24', '#832f28', '#98392f'] },
      { surface: 'tile', c: ['#2f7a63', '#398f75', '#46a687'], grout: 'rgba(8,38,30,0.5)', motif: '#eafff5' },
      { surface: 'stone', c: ['#4a4e52', '#585d62', '#666c72'] },
    ],
    hazards: ['calm', 'terrace', 'wind', 'ice', 'typhoon'],
    times: ['day', 'sunset', 'day', 'night', 'sunset'],
  },
  {
    id: 'turkey', name: 'Türkiye', flag: '🇹🇷', backdrop: 'santorini',
    accent: '#E03A3E', rail: '#cfd6dc',
    drinks: ['Bosphorus Blue', 'Nar Şerbet', 'Anise Mist', 'Fig & Pistachio', 'Lokum Fizz'],
    special: 'Anatolian Sunset',
    sigArt: 'assets/signatures/anatolian-sunset.png',
    cast: ['frog', 'cat', 'songbird', 'turtle', 'goat', 'stork',
      'seabird', 'angora', 'dolphin', 'seal', 'kangal'],
    stops: ['Bodrum', 'Ölüdeniz', 'Kaş', 'Çeşme', 'Kaputaş', 'Datça', 'Alaçatı'],
    tables: [
      { surface: 'tile', c: ['#1c5c9c', '#2470b8', '#2f86d2'], grout: 'rgba(6,26,50,0.5)', motif: '#eaf4ff' },
      { surface: 'marble', c: ['#d2cec6', '#e4e0d8', '#f2efe8'], vein: '#8f8a7e' },
      { surface: 'wood', c: ['#6a5a3e', '#7c6a4a', '#8e7c58'] },
    ],
    hazards: ['calm', 'wind', 'ball', 'sand', 'tide'],
    times: ['day', 'day', 'sunset', 'night', 'day'],
  },
];

// Seven stops per country: a real trip, not a taster.
const STOPS_PER_TOUR = 7;
const GOALS = [4, 5, 6, 7, 8, 8, 9];
const FLICKS = [18, 23, 28, 35, 46, 56, 62];
const POOLS = [
  [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6],
  [2, 3, 4, 5, 6], [3, 4, 5, 6, 7],
];
// Measured with the auto-player (qa/autoplay.mjs 5 country), not guessed: each
// star3 is the midpoint of the bot's median and 80th-percentile score on that
// stop, so a focused human clears it and a greedy bot usually doesn't. The
// placeholders these replaced made 3 stars mathematically impossible on 53 of
// the 105 country stops, which nobody noticed because the harness was being
// asked for a country id it silently ignored.
const STAR_LINES = {
  100: { star2: 33, star3: 53 },
  101: { star2: 16, star3: 25 },
  102: { star2: 121, star3: 195 },
  103: { star2: 200, star3: 322 },
  104: { star2: 295, star3: 476 },
  105: { star2: 471, star3: 760 },
  106: { star2: 251, star3: 405 },
  110: { star2: 33, star3: 53 },
  111: { star2: 94, star3: 152 },
  112: { star2: 118, star3: 190 },
  113: { star2: 200, star3: 322 },
  114: { star2: 244, star3: 394 },
  115: { star2: 471, star3: 760 },
  116: { star2: 636, star3: 1025 },
  120: { star2: 25, star3: 40 },
  121: { star2: 95, star3: 153 },
  122: { star2: 95, star3: 154 },
  123: { star2: 200, star3: 322 },
  124: { star2: 260, star3: 419 },
  125: { star2: 385, star3: 621 },
  126: { star2: 594, star3: 958 },
  130: { star2: 31, star3: 50 },
  131: { star2: 95, star3: 153 },
  132: { star2: 95, star3: 154 },
  133: { star2: 143, star3: 230 },
  134: { star2: 260, star3: 419 },
  135: { star2: 465, star3: 750 },
  136: { star2: 594, star3: 958 },
  140: { star2: 33, star3: 53 },
  141: { star2: 95, star3: 153 },
  142: { star2: 114, star3: 184 },
  143: { star2: 200, star3: 322 },
  144: { star2: 244, star3: 394 },
  145: { star2: 525, star3: 846 },
  146: { star2: 594, star3: 958 },
  150: { star2: 30, star3: 48 },
  151: { star2: 94, star3: 152 },
  152: { star2: 121, star3: 195 },
  153: { star2: 156, star3: 252 },
  154: { star2: 363, star3: 585 },
  155: { star2: 397, star3: 640 },
  156: { star2: 636, star3: 1025 },
  160: { star2: 10, star3: 16 },
  161: { star2: 95, star3: 153 },
  162: { star2: 118, star3: 190 },
  163: { star2: 143, star3: 230 },
  164: { star2: 363, star3: 585 },
  165: { star2: 215, star3: 347 },
  166: { star2: 594, star3: 958 },
  170: { star2: 33, star3: 53 },
  171: { star2: 95, star3: 153 },
  172: { star2: 121, star3: 195 },
  173: { star2: 187, star3: 302 },
  174: { star2: 295, star3: 476 },
  175: { star2: 525, star3: 846 },
  176: { star2: 594, star3: 958 },
  180: { star2: 33, star3: 53 },
  181: { star2: 95, star3: 153 },
  182: { star2: 74, star3: 120 },
  183: { star2: 174, star3: 280 },
  184: { star2: 295, star3: 476 },
  185: { star2: 471, star3: 760 },
  186: { star2: 594, star3: 958 },
  190: { star2: 33, star3: 53 },
  191: { star2: 95, star3: 153 },
  192: { star2: 109, star3: 176 },
  193: { star2: 200, star3: 322 },
  194: { star2: 295, star3: 476 },
  195: { star2: 471, star3: 760 },
  196: { star2: 594, star3: 958 },
  200: { star2: 19, star3: 30 },
  201: { star2: 95, star3: 153 },
  202: { star2: 87, star3: 140 },
  203: { star2: 156, star3: 252 },
  204: { star2: 282, star3: 455 },
  205: { star2: 379, star3: 612 },
  206: { star2: 594, star3: 958 },
  210: { star2: 33, star3: 53 },
  211: { star2: 93, star3: 150 },
  212: { star2: 95, star3: 154 },
  213: { star2: 126, star3: 204 },
  214: { star2: 312, star3: 504 },
  215: { star2: 471, star3: 760 },
  216: { star2: 694, star3: 1120 },
  220: { star2: 33, star3: 53 },
  221: { star2: 71, star3: 115 },
  222: { star2: 121, star3: 195 },
  223: { star2: 200, star3: 322 },
  224: { star2: 208, star3: 335 },
  225: { star2: 432, star3: 696 },
  226: { star2: 434, star3: 700 },
  230: { star2: 19, star3: 30 },
  231: { star2: 95, star3: 153 },
  232: { star2: 118, star3: 190 },
  233: { star2: 156, star3: 252 },
  234: { star2: 270, star3: 436 },
  235: { star2: 379, star3: 612 },
  236: { star2: 594, star3: 958 },
  240: { star2: 33, star3: 53 },
  241: { star2: 95, star3: 153 },
  242: { star2: 74, star3: 120 },
  243: { star2: 200, star3: 322 },
  244: { star2: 295, star3: 476 },
  245: { star2: 471, star3: 760 },
  246: { star2: 594, star3: 958 },
  250: { star2: 33, star3: 53 },
  251: { star2: 72, star3: 116 },
  252: { star2: 117, star3: 189 },
  253: { star2: 156, star3: 252 },
  254: { star2: 312, star3: 504 },
  255: { star2: 481, star3: 776 },
  256: { star2: 529, star3: 854 },
  260: { star2: 33, star3: 53 },
  261: { star2: 99, star3: 160 },
  262: { star2: 138, star3: 222 },
  263: { star2: 64, star3: 104 },
  264: { star2: 254, star3: 410 },
  265: { star2: 481, star3: 776 },
  266: { star2: 661, star3: 1066 },
};

export function buildCountryLevels() {
  const out = [];
  COUNTRIES.forEach((c, ci) => {
    for (let i = 0; i < STOPS_PER_TOUR; i++) {
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
        // cast is opt-in (skins); the painted sprites are the default look
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
        preplace: i >= STOPS_PER_TOUR - 3 ? [
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
      sigArt: c.sigArt,
      levels: Array.from({ length: STOPS_PER_TOUR }, (_, i) => 100 + ci * 10 + i),
    })),
  ];
}
