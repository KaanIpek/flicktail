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
    stops: ['Playa Norte', 'Tulum', 'Cozumel', 'Isla Mujeres', 'Akumal', 'Holbox', 'Bacalar', 'Chichen Coast'],
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
    stops: ['Ipanema', 'Leblon', 'Búzios', 'Paraty', 'Ilha Grande', 'Jericoacoara', 'Fernando de Noronha', 'Trancoso'],
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
    stops: ['Amalfi', 'Capri', 'Cinque Terre', 'Portofino', 'Taormina', 'Sorrento', 'Procida', 'Ravello'],
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
    stops: ['Oia', 'Mykonos', 'Naxos', 'Milos', 'Paros', 'Rhodes', 'Zakynthos', 'Santorini'],
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
    stops: ['Promenade', 'Cannes', 'Antibes', 'Saint-Tropez', 'Menton', 'Villefranche', 'Porquerolles', 'Cap Ferrat'],
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
    stops: ['Ibiza Town', 'Formentera', 'Sitges', 'Marbella', 'San Antonio', 'Menorca', 'Tarifa', 'Formentera'],
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
    stops: ['Waikiki', 'Maui', 'Key West', 'Malibu', 'Kauai', 'Big Sur', 'Outer Banks', 'Big Island'],
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
    stops: ['Jumeirah', 'Palm', 'Abu Dhabi', 'Fujairah', 'Ras Al Khaimah', 'Khor Fakkan', 'Sir Bani Yas', 'Saadiyat'],
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
    stops: ['Kata Beach', 'Krabi', 'Phi Phi', 'Koh Samui', 'Railay', 'Hua Hin', 'Con Dao', 'Koh Lipe'],
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
    stops: ['Tanah Lot', 'Uluwatu', 'Nusa Penida', 'Gili', 'Lombok', 'Raja Ampat', 'Flores', 'Raja Ampat'],
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
    stops: ['Matira', 'Moorea', 'Taha’a', 'Rangiroa', 'Huahine', 'Bora Lagoon', 'Tetiaroa', 'Rangiroa Pass'],
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
    stops: ['Naha', 'Kabira Bay', 'Miyako', 'Zamami', 'Iriomote', 'Ishigaki', 'Amami', 'Yakushima'],
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
    stops: ['Lagos', 'Benagil', 'Sagres', 'Albufeira', 'Faro', 'Nazare', 'Madeira', 'Porto Santo'],
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
    stops: ['Whitehaven', 'Hamilton', 'Airlie', 'Hayman', 'Daydream', 'Byron Bay', 'Cape Tribulation', 'Lord Howe'],
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
    stops: ['Ha Long', 'Cat Ba', 'Lan Ha', 'Bai Tu Long', 'Ninh Binh', 'Phu Quoc', 'Nha Trang', 'Con Dao'],
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
    stops: ['Sanya', 'Yalong Bay', 'Wuzhizhou', 'Guilin', 'Yangshuo', 'Xiamen', 'West Lake', 'Gulangyu'],
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
    stops: ['Bodrum', 'Ölüdeniz', 'Kaş', 'Çeşme', 'Kaputaş', 'Datça', 'Alaçatı', 'Kekova'],
    tables: [
      { surface: 'tile', c: ['#1c5c9c', '#2470b8', '#2f86d2'], grout: 'rgba(6,26,50,0.5)', motif: '#eaf4ff' },
      { surface: 'marble', c: ['#d2cec6', '#e4e0d8', '#f2efe8'], vein: '#8f8a7e' },
      { surface: 'wood', c: ['#6a5a3e', '#7c6a4a', '#8e7c58'] },
    ],
    hazards: ['calm', 'wind', 'ball', 'sand', 'tide'],
    times: ['day', 'day', 'sunset', 'night', 'day'],
  },
  {
    id: 'maldives', name: 'Maldives', flag: '🇲🇻', backdrop: 'borabora',
    accent: '#2FD9D1', rail: '#e8dcc4',
    drinks: ['Atoll Aqua', 'Coconut Dhoni', 'Bioluminous', 'Reef Spritz', 'Manta Mule'],
    special: 'Starlit Tide',
    sigArt: 'assets/signatures/starlit-tide.png',
    cast: ['frog', 'clownfish', 'parrotfish', 'turtle', 'seal', 'dolphin',
      'ray', 'seabird', 'octopus', 'shark', 'ray'],
    stops: ['Malé', 'Hulhumalé', 'Maafushi', 'Baa Atoll', 'Vaadhoo', 'Fulhadhoo', 'Thoddoo', 'Addu Atoll'],
    tables: [
      { surface: 'glass', c: ['#0d7f8c', '#159aa8', '#20b5c4'], glow: '#a8f6ef' },
      { surface: 'wave', c: ['#ece4d2', '#f4ede0', '#fbf6ec'], dark: '#c3ad86' },
      { surface: 'bamboo', c: ['#c8a862', '#d8b872', '#e6c886'] },
    ],
    hazards: ['reef', 'tide', 'calm', 'ball', 'reef'],
    times: ['day', 'day', 'sunset', 'night', 'day'],
  },
  {
    id: 'morocco', name: 'Morocco', flag: '🇲🇦', backdrop: 'morocco',
    accent: '#E4572E', rail: '#b5763f',
    drinks: ['Mint Atlas', 'Saffron Riad', 'Argan Amber', 'Medina Mule', 'Blue Pearl'],
    special: 'Riad Lantern',
    sigArt: 'assets/signatures/riad-lantern.png',
    cast: ['frog', 'fennec', 'gecko', 'turtle', 'goat', 'stork',
      'falcon', 'monkey', 'scorpion', 'camel', 'fennec'],
    stops: ['Essaouira', 'Agadir', 'Taghazout', 'Chefchaouen', 'Marrakech', 'Tangier', 'Merzouga', 'Legzira'],
    tables: [
      { surface: 'tile', c: ['#1d6f77', '#25868f', '#309da7'], grout: 'rgba(10,40,44,0.5)', motif: '#ffeccd' },
      { surface: 'plaster', c: ['#d9b98e', '#e8cca4', '#f3dcb8'] },
      { surface: 'wood', c: ['#6b4526', '#7d5430', '#8f643c'] },
    ],
    hazards: ['sand', 'wind', 'sandstorm', 'calm', 'terrace'],
    times: ['day', 'sunset', 'day', 'sunset', 'night'],
  },
  {
    id: 'egypt', name: 'Egypt', flag: '🇪🇬', backdrop: 'egypt',
    accent: '#F0C24B', rail: '#cbb183',
    drinks: ['Nile Lotus', 'Karkade Cooler', 'Papyrus Punch', 'Red Sea Reef', 'Oasis Date'],
    special: 'Scarab Gold',
    sigArt: 'assets/signatures/scarab-gold.png',
    cast: ['frog', 'gecko', 'scorpion', 'turtle', 'camel', 'falcon',
      'clownfish', 'ray', 'crab', 'shark', 'falcon'],
    stops: ['Sharm El Sheikh', 'Dahab', 'Hurghada', 'Marsa Alam', 'Siwa', 'Nuweiba', 'Ras Mohammed', 'Nabq'],
    tables: [
      { surface: 'stone', c: ['#8a7350', '#9c855e', '#ae976c'] },
      { surface: 'marble', c: ['#d8cfb8', '#e6dfcc', '#f2ede0'], vein: '#a08d63' },
      { surface: 'tile', c: ['#1b4f8f', '#2260a8', '#2c73c2'], grout: 'rgba(6,22,44,0.5)', motif: '#ffe9a8' },
    ],
    hazards: ['sand', 'sandstorm', 'reef', 'calm', 'wind'],
    times: ['day', 'day', 'sunset', 'night', 'sunset'],
  },
  {
    id: 'croatia', name: 'Croatia', flag: '🇭🇷', backdrop: 'positano',
    accent: '#1E88C7', rail: '#ddd6c6',
    drinks: ['Dalmatian Fig', 'Lavender Spritz', 'Maraschino Sour', 'Adriatic Blue', 'Olive Grove'],
    special: 'Sea Organ',
    sigArt: 'assets/signatures/sea-organ.png',
    cast: ['frog', 'cat', 'songbird', 'turtle', 'goat', 'seabird',
      'dolphin', 'seal', 'octopus', 'crab', 'dolphin'],
    stops: ['Hvar', 'Dubrovnik', 'Split', 'Korčula', 'Brač', 'Rovinj', 'Vis', 'Mljet'],
    tables: [
      { surface: 'stone', c: ['#9a9384', '#a8a292', '#b6b1a2'] },
      { surface: 'marble', c: ['#cfd2d0', '#e0e3e0', '#eef0ee'], vein: '#8b968f' },
      { surface: 'wood', c: ['#6d6040', '#7f714c', '#918358'] },
    ],
    hazards: ['calm', 'wind', 'tide', 'bouncy', 'terrace'],
    times: ['day', 'sunset', 'day', 'day', 'night'],
  },
];

// Seven stops per country: a real trip, not a taster.
// Regional drink sets. Eleven glasses shared by twenty-one countries made every
// table look the same; a country now draws its middle tiers from the set that
// suits its coast, so a spritz in Italy is not the same object as a mint tea in
// Morocco. Tiers outside a set fall through to the house art, so a half-painted
// set still renders.
const DRINK_SETS = {
  med: { 4: 'lavender-tumbler', 5: 'spritz-orange', 6: 'honey-vine', 7: 'anise-cup' },
  desert: { 4: 'mint-brass', 5: 'saffron-cream', 6: 'hibiscus-ruby', 7: 'cardamom-copper' },
};

// Which set a country pours. Anything unlisted keeps the tropical house set.
const SET_BY_TOUR = {
  italy: 'med', greece: 'med', france: 'med', spain: 'med',
  portugal: 'med', croatia: 'med', turkey: 'med',
  uae: 'desert', egypt: 'desert', morocco: 'desert',
};

function setArtFor(tourId) {
  const set = DRINK_SETS[SET_BY_TOUR[tourId]];
  if (!set) return {};
  const out = {};
  for (const [tier, slug] of Object.entries(set)) out[tier] = `assets/drinks/sets/${slug}.png`;
  return out;
}

// Eight: the last one is the country's signature run. Until it existed the
// special drink was tier 11 while no stop ever asked for more than tier 9, so
// it could be earned as a collection trophy and never once poured.
const STOPS_PER_TOUR = 8;
const GOALS = [4, 5, 6, 7, 8, 8, 9, 11];
// Trimmed ~18%: the auto-player was winning 5 runs out of 5 on nearly every
// stop, which is the shape of a game you cannot lose. Star lines below are
// re-measured against THESE numbers, never carried over — a smaller cooler
// lowers scores, so an old threshold silently becomes unreachable.
// Tuned against bot win-rate per stop, not by feel. The jump at stop 4 is
// real: it is the first tier-8 goal, and 29 flicks made it unwinnable on 7
// tours while the stop after it (same goal, more flicks) was comfortable.
const FLICKS = [8, 20, 34, 19, 37, 35, 34, 165];
// Every pool used to top out one tier below the goal, so the cooler handed you
// a drink that needed a single merge to finish the level — which is why cutting
// flicks barely moved the win rate on the early stops. Two tiers of headroom
// means you have to actually build the chain.
const POOLS = [
  [1, 2, 3], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6],
  [2, 3, 4, 5, 6], [3, 4, 5, 6, 7], [4, 5, 6, 7, 8],
];
// Measured with the auto-player (qa/autoplay.mjs 5 country), not guessed: each
// star3 is the midpoint of the bot's median and 80th-percentile score on that
// stop, so a focused human clears it and a greedy bot usually doesn't. The
// placeholders these replaced made 3 stars mathematically impossible on 53 of
// the 105 country stops, which nobody noticed because the harness was being
// asked for a country id it silently ignored.
// Per-stop rope for the handful the shared ladder gets wrong. The auto-player
// won 0 of 5 on each of these; hazards (a hidden cenote, a bouncing ball, a
// terraced wall) cost more flicks than the same stop on a calmer tour.
const FLICK_FIX = {};

const STAR_LINES = {
  100: { star2: 14, star3: 25 },
  101: { star2: 26, star3: 31 },
  102: { star2: 232, star3: 237 },
  103: { star2: 108, star3: 213 },
  104: { star2: 348, star3: 385 },
  105: { star2: 355, star3: 415 },
  106: { star2: 344, star3: 358 },
  107: { star2: 3045, star3: 4047 },
  110: { star2: 14, star3: 25 },
  111: { star2: 123, star3: 157 },
  112: { star2: 221, star3: 239 },
  113: { star2: 108, star3: 213 },
  114: { star2: 305, star3: 343 },
  115: { star2: 355, star3: 415 },
  116: { star2: 363, star3: 468 },
  117: { star2: 2295, star3: 3831 },
  120: { star2: 17, star3: 20 },
  121: { star2: 114, star3: 130 },
  122: { star2: 171, star3: 237 },
  123: { star2: 108, star3: 213 },
  124: { star2: 327, star3: 373 },
  125: { star2: 347, star3: 398 },
  126: { star2: 395, star3: 524 },
  127: { star2: 3268, star3: 5244 },
  130: { star2: 14, star3: 25 },
  131: { star2: 114, star3: 130 },
  132: { star2: 171, star3: 237 },
  133: { star2: 118, star3: 120 },
  134: { star2: 327, star3: 373 },
  135: { star2: 339, star3: 715 },
  136: { star2: 395, star3: 524 },
  137: { star2: 3268, star3: 5244 },
  140: { star2: 14, star3: 25 },
  141: { star2: 114, star3: 130 },
  142: { star2: 227, star3: 256 },
  143: { star2: 108, star3: 213 },
  144: { star2: 305, star3: 343 },
  145: { star2: 434, star3: 472 },
  146: { star2: 395, star3: 524 },
  147: { star2: 2372, star3: 2583 },
  150: { star2: 11, star3: 14 },
  151: { star2: 123, star3: 157 },
  152: { star2: 232, star3: 237 },
  153: { star2: 81, star3: 108 },
  154: { star2: 297, star3: 720 },
  155: { star2: 315, star3: 447 },
  156: { star2: 363, star3: 468 },
  157: { star2: 3045, star3: 4047 },
  160: { star2: 6, star3: 9 },
  161: { star2: 114, star3: 130 },
  162: { star2: 221, star3: 239 },
  163: { star2: 118, star3: 120 },
  164: { star2: 297, star3: 720 },
  165: { star2: 244, star3: 265 },
  166: { star2: 395, star3: 524 },
  167: { star2: 2295, star3: 3831 },
  170: { star2: 14, star3: 25 },
  171: { star2: 114, star3: 130 },
  172: { star2: 232, star3: 237 },
  173: { star2: 123, star3: 127 },
  174: { star2: 348, star3: 385 },
  175: { star2: 434, star3: 472 },
  176: { star2: 395, star3: 524 },
  177: { star2: 3045, star3: 4047 },
  180: { star2: 14, star3: 25 },
  181: { star2: 114, star3: 130 },
  182: { star2: 146, star3: 196 },
  183: { star2: 96, star3: 121 },
  184: { star2: 348, star3: 385 },
  185: { star2: 355, star3: 415 },
  186: { star2: 395, star3: 524 },
  187: { star2: 1245, star3: 2527 },
  190: { star2: 14, star3: 25 },
  191: { star2: 114, star3: 130 },
  192: { star2: 215, star3: 241 },
  193: { star2: 108, star3: 213 },
  194: { star2: 348, star3: 385 },
  195: { star2: 355, star3: 415 },
  196: { star2: 395, star3: 524 },
  197: { star2: 1785, star3: 2004 },
  200: { star2: 9, star3: 9 },
  201: { star2: 114, star3: 130 },
  202: { star2: 171, star3: 237 },
  203: { star2: 81, star3: 108 },
  204: { star2: 336, star3: 526 },
  205: { star2: 315, star3: 391 },
  206: { star2: 395, star3: 524 },
  207: { star2: 3268, star3: 5244 },
  210: { star2: 14, star3: 25 },
  211: { star2: 111, star3: 121 },
  212: { star2: 171, star3: 237 },
  213: { star2: 56, star3: 78 },
  214: { star2: 351, star3: 403 },
  215: { star2: 355, star3: 415 },
  216: { star2: 482, star3: 572 },
  217: { star2: 3268, star3: 5244 },
  220: { star2: 14, star3: 25 },
  221: { star2: 114, star3: 130 },
  222: { star2: 232, star3: 237 },
  223: { star2: 108, star3: 213 },
  224: { star2: 323, star3: 337 },
  225: { star2: 357, star3: 428 },
  226: { star2: 395, star3: 524 },
  227: { star2: 3045, star3: 4047 },
  230: { star2: 9, star3: 9 },
  231: { star2: 114, star3: 130 },
  232: { star2: 221, star3: 239 },
  233: { star2: 81, star3: 108 },
  234: { star2: 336, star3: 394 },
  235: { star2: 315, star3: 391 },
  236: { star2: 395, star3: 524 },
  237: { star2: 2295, star3: 3831 },
  240: { star2: 14, star3: 25 },
  241: { star2: 114, star3: 130 },
  242: { star2: 146, star3: 196 },
  243: { star2: 108, star3: 213 },
  244: { star2: 348, star3: 385 },
  245: { star2: 355, star3: 415 },
  246: { star2: 395, star3: 524 },
  247: { star2: 1245, star3: 2527 },
  250: { star2: 14, star3: 25 },
  251: { star2: 115, star3: 128 },
  252: { star2: 212, star3: 244 },
  253: { star2: 81, star3: 108 },
  254: { star2: 351, star3: 403 },
  255: { star2: 355, star3: 415 },
  256: { star2: 397, star3: 479 },
  257: { star2: 1758, star3: 2011 },
  260: { star2: 14, star3: 25 },
  261: { star2: 99, star3: 130 },
  262: { star2: 221, star3: 239 },
  263: { star2: 42, star3: 49 },
  264: { star2: 305, star3: 325 },
  265: { star2: 355, star3: 415 },
  266: { star2: 412, star3: 487 },
  267: { star2: 2295, star3: 3831 },
  270: { star2: 9, star3: 9 },
  271: { star2: 114, star3: 130 },
  272: { star2: 232, star3: 237 },
  273: { star2: 96, star3: 121 },
  274: { star2: 336, star3: 394 },
  275: { star2: 315, star3: 391 },
  276: { star2: 395, star3: 524 },
  277: { star2: 3045, star3: 4047 },
  280: { star2: 6, star3: 9 },
  281: { star2: 99, star3: 130 },
  282: { star2: 232, star3: 237 },
  283: { star2: 127, star3: 128 },
  284: { star2: 305, star3: 343 },
  285: { star2: 244, star3: 265 },
  286: { star2: 412, star3: 487 },
  287: { star2: 3045, star3: 4047 },
  290: { star2: 6, star3: 9 },
  291: { star2: 114, star3: 130 },
  292: { star2: 146, star3: 196 },
  293: { star2: 127, star3: 128 },
  294: { star2: 297, star3: 720 },
  295: { star2: 244, star3: 265 },
  296: { star2: 395, star3: 524 },
  297: { star2: 1245, star3: 2527 },
  300: { star2: 14, star3: 25 },
  301: { star2: 99, star3: 130 },
  302: { star2: 227, star3: 256 },
  303: { star2: 123, star3: 127 },
  304: { star2: 305, star3: 343 },
  305: { star2: 355, star3: 415 },
  306: { star2: 412, star3: 487 },
  307: { star2: 2372, star3: 2583 },
};

export function buildCountryLevels() {
  const out = [];
  COUNTRIES.forEach((c, ci) => {
    for (let i = 0; i < STOPS_PER_TOUR; i++) {
      const id = 100 + ci * 10 + i;
      // The tide sweeps the whole board toward the player every half minute.
      // On a late stop, where the cooler hands you tier 5s and 6s, that is a
      // good scare. On an early stop, where a tier-6 goal has to be built up
      // from twos and threes, it wipes the work faster than it can be rebuilt:
      // Taha'a, Split and Benagil were unwinnable in five runs each and MORE
      // flicks did not help, because the runs were not losing to an empty
      // cooler. Below a tier-7 goal the stop takes the tour's next hazard.
      let mech = c.hazards[i % c.hazards.length];
      // The tide sweeps the whole board every half minute, so it punishes long
      // builds. That makes it fine in the middle of a tour and fatal at both
      // ends: on an early stop a tier-6 goal has to be assembled from twos, and
      // on the tier-11 finale the chain is the longest in the game. Measured,
      // not assumed — both extremes went 0-for-5 and more flicks did not help,
      // because those runs were not losing to an empty cooler.
      if (HAZARDS[mech] && HAZARDS[mech].tide && (GOALS[i] < 7 || GOALS[i] > 8)) {
        mech = c.hazards[(i + 1) % c.hazards.length];
      }
      const hz = HAZARDS[mech] || {};
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
        // Tier 11 is this country's own painted signature, so the trophy drink
        // is visible ON THE TABLE and not only in the collection — every
        // country's chain used to end in the same generic bottle.
        art: (() => {
          const a = setArtFor(c.id);
          if (c.sigArt) a[11] = c.sigArt;
          return Object.keys(a).length ? a : null;
        })(),
        // cast is opt-in (skins); the painted sprites are the default look
        names: { 4: c.drinks[0], 5: c.drinks[1], 6: c.drinks[2],
          7: c.drinks[3], 8: c.drinks[4], 11: c.special },
        colors: { 11: [c.accent, c.sigAlt || '#fff4d8'] },
        goalTier: GOALS[i],
        flicks: FLICK_FIX[id] || FLICKS[i],
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
        preplace: i >= 4 ? [
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
        mechanic: mech,
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
