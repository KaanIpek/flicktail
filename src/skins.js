// Drink skins: an optional look for the whole chain.
//
// The default is the painted cocktail art — that is the game's face and it
// stays free. A skin swaps the drinks for something else; the creature cast
// (ears, tails, blinking faces) is the first one, and future skins can be new
// painted sets dropped in as `art: 'folder'`.
//
// Two ways to own one: pay for it, or earn it with stars. Real money needs a
// store connection the app does not have yet (see docs/MONETISATION.md), so a
// paid skin is shown with its price and marked unavailable until an IAP
// provider is registered — the game never pretends to take money.

export const SKINS = [
  {
    id: 'classic',
    name: 'Classic Bar',
    blurb: 'The painted cocktails the bar is known for.',
    kind: 'sprite',
    free: true,
  },
  {
    id: 'critters',
    name: 'Critter Cups',
    blurb: 'Every drink is a little animal — ears, tails, blinking faces.',
    kind: 'creature',
    cast: ['frog', 'cat', 'piglet', 'turtle', 'bunny', 'fox',
      'octopus', 'duckling', 'seal', 'crab'],
    stars: 12,          // earnable today
    price: '$1.99',     // and priced for when the store is connected
  },
  {
    id: 'reef',
    name: 'Reef Court',
    blurb: 'A tide-pool cast: clownfish, rays, seals and a crab king.',
    kind: 'creature',
    cast: ['frog', 'clownfish', 'parrotfish', 'turtle', 'seal', 'octopus',
      'ray', 'seabird', 'dolphin', 'crab'],
    stars: 40,
    price: '$2.99',
  },
  {
    id: 'safari',
    name: 'Safari Lounge',
    blurb: 'Fennec, oryx, gazelle and a tiger at the top of the chain.',
    kind: 'creature',
    cast: ['frog', 'fennec', 'gecko', 'turtle', 'oryx', 'gazelle',
      'falcon', 'camel', 'jaguar', 'tiger'],
    stars: 80,
    price: '$2.99',
  },
  {
    id: 'signature',
    name: 'Signature Bar',
    blurb: 'The eleven house signatures, hand-painted, poured for the whole chain.',
    kind: 'art',
    // Ordered small cup to grand trophy, so the chain still reads as a
    // progression the way the default set does.
    art: ['anatolian-sunset', 'torii-sunrise', 'medianoche', 'limoncello-sole',
      'siam-sunrise', 'aloha-comet', 'jade-dragon', 'riviera-royale',
      'golden-agave', 'volcano-bloom', 'lagoon-crown'],
    stars: 150,
    price: '$2.99',
  },
  {
    id: 'grand',
    name: 'Grand Tour',
    blurb: 'The other ten signatures, from the Aegean to the Southern Cross.',
    kind: 'art',
    art: ['scarab-gold', 'sea-organ', 'starlit-tide', 'riad-lantern',
      'aegean-mythos', 'algarve-gold', 'southern-cross', 'karst-mist',
      'desert-pearl', 'carnival-punch', 'lagoon-crown'],
    stars: 260,
    price: '$2.99',
  },
  {
    id: 'world',
    name: 'World Bar',
    blurb: 'One glass from every coast: lavender, mint tea, matcha, agave.',
    kind: 'art',
    // The regional sets are already on the device — worn together they make a
    // chain that changes continent every tier, which no single tour shows you.
    art: ['agave-salt', 'lavender-tumbler', 'mint-brass', 'matcha-bamboo',
      'caipirinha-muddle', 'spritz-orange', 'saffron-cream', 'lychee-pearl',
      'michelada-red', 'honey-vine', 'cardamom-copper'],
    dir: 'assets/drinks/sets',
    stars: 60,
    price: '$1.99',
  },
];

export function skinById(id) { return SKINS.find(s => s.id === id) || SKINS[0]; }

// The cast a level should render with, or null for the painted sprites.
export function castFor(skinId) {
  const s = skinById(skinId);
  return s.kind === 'creature' ? s.cast : null;
}

// tier -> asset key for a painted skin, or null for the default set.
export function artFor(skinId) {
  const s = skinById(skinId);
  if (s.kind !== 'art' || !s.art) return null;
  const map = {};
  s.art.forEach((slug, i) => { map[i + 1] = 'sig_' + slug; });
  return map;
}

// Where a painted skin's pictures live. Signatures are the default; a skin can
// point somewhere else, which is how World Bar reuses the regional sets.
export function artDir(skinId) {
  return skinById(skinId).dir || 'assets/signatures';
}

// [assetKey, url] pairs a painted skin needs loaded before it can be worn.
export function artAssets(skinId) {
  const s = skinById(skinId);
  if (s.kind !== 'art' || !s.art) return [];
  const dir = s.dir || 'assets/signatures';
  return s.art.map(slug => ['sig_' + slug, `${dir}/${slug}.png`]);
}
