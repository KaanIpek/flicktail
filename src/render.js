// Everything on and around the table. The table itself is pre-rendered once
// per level into an offscreen canvas and blitted each frame.
//
// Presentation goals: the table reads as REAL wood with raised 3D rails, the
// drinks sit IN the scene (directional soft shadows, glossy reflections, a
// subtle billboard lean toward the camera), and every level gets a light
// grade + vignette so the backdrop and the table feel like one place.

import { TABLE, TIERS, ORDERS, FRICTION, CAT_TIERS } from './config.js';

const RAIL_H = 24;        // world units of rail height
const RAIL_TH = 26;       // world units of rail thickness (outward)

// Cute layer: some drinks are CAT glasses (ears, a swishing tail, a little
// face); others fizz. Drawn procedurally over the sprite so the tail can
// actually move — a baked sprite could never wag. CAT_TIERS lives in config
// because the game needs it too (to meow).
const FIZZ_TIERS = new Set([1, 3, 4, 7]);
const GLINT_TIERS = new Set([9, 10, 11]);

// The drinks ARE creatures: each tier is a different animal-shaped cup, drawn
// in code so its ears twitch, its tail swishes and its eyes blink. Tier 11 is
// deliberately left as the rendered Paradise Atlas sprite — the trophy at the
// end of the chain should look like a different class of object.
// Creatures are built from parts, so a country can field its own cast without
// a new drawing per animal: pick ears, a tail and one signature feature.
export const SPECIES = {
  frog:     { ears: 'none',   tail: 'none',  extra: 'frog' },
  cat:      { ears: 'point',  tail: 'curl',  extra: null },
  fox:      { ears: 'point',  tail: 'bushy', extra: null },
  lynx:     { ears: 'tuft',   tail: 'stub',  extra: 'whiskers' },
  bunny:    { ears: 'long',   tail: 'puff',  extra: null },
  piglet:   { ears: 'round',  tail: 'curly', extra: 'snout' },
  turtle:   { ears: 'none',   tail: 'stub',  extra: 'shell' },
  octopus:  { ears: 'none',   tail: 'none',  extra: 'tentacles' },
  duckling: { ears: 'none',   tail: 'none',  extra: 'beak' },
  seal:     { ears: 'none',   tail: 'fin',   extra: 'whiskers' },
  crab:     { ears: 'stalks', tail: 'none',  extra: 'claws' },
  axolotl:  { ears: 'none',   tail: 'fin',   extra: 'gills' },
  iguana:   { ears: 'none',   tail: 'long',  extra: 'crest' },
  coati:    { ears: 'round',  tail: 'long',  extra: 'muzzle' },
  toucan:   { ears: 'none',   tail: 'plume', extra: 'bigbeak' },
  armadillo:{ ears: 'round',  tail: 'stub',  extra: 'shell' },
  jaguar:   { ears: 'round',  tail: 'long',  extra: 'spots' },
  capybara: { ears: 'round',  tail: 'stub',  extra: 'muzzle' },
  sloth:    { ears: 'none',   tail: 'none',  extra: 'sleepy' },
  macaw:    { ears: 'none',   tail: 'plume', extra: 'beak' },
  monkey:   { ears: 'round',  tail: 'long',  extra: 'muzzle' },
  hedgehog: { ears: 'round',  tail: 'stub',  extra: 'spines' },
  songbird: { ears: 'none',   tail: 'plume', extra: 'beak' },
  goat:     { ears: 'floppy', tail: 'stub',  extra: 'horns' },
  pelican:  { ears: 'none',   tail: 'none',  extra: 'bigbeak' },
  dolphin:  { ears: 'none',   tail: 'fin',   extra: 'snoutfin' },
  poodle:   { ears: 'floppy', tail: 'puff',  extra: 'muzzle' },
  snail:    { ears: 'stalks', tail: 'none',  extra: 'shell' },
  bull:     { ears: 'floppy', tail: 'curl',  extra: 'horns' },
  flamingo: { ears: 'none',   tail: 'plume', extra: 'beak' },
  gecko:    { ears: 'none',   tail: 'long',  extra: 'crest' },
  owl:      { ears: 'tuft',   tail: 'none',  extra: 'bigeyes' },
  camel:    { ears: 'round',  tail: 'stub',  extra: 'hump' },
  falcon:   { ears: 'none',   tail: 'plume', extra: 'beak' },
  fennec:   { ears: 'long',   tail: 'bushy', extra: null },
  oryx:     { ears: 'floppy', tail: 'stub',  extra: 'horns' },
  elephant: { ears: 'fan',    tail: 'stub',  extra: 'trunk' },
  gibbon:   { ears: 'round',  tail: 'long',  extra: 'sleepy' },
  hornbill: { ears: 'none',   tail: 'plume', extra: 'bigbeak' },
  tiger:    { ears: 'round',  tail: 'long',  extra: 'stripes' },
  clownfish:{ ears: 'none',   tail: 'fin',   extra: 'stripes' },
  komodo:   { ears: 'none',   tail: 'long',  extra: 'crest' },
  ray:      { ears: 'none',   tail: 'whip',  extra: 'wings' },
  parrotfish:{ ears: 'none',  tail: 'fin',   extra: 'beak' },
  shark:    { ears: 'none',   tail: 'fin',   extra: 'snoutfin' },
  seabird:  { ears: 'none',   tail: 'plume', extra: 'beak' },
  scorpion: { ears: 'stalks', tail: 'sting', extra: 'claws' },
  gazelle:  { ears: 'long',   tail: 'stub',  extra: 'horns' },
  orangutan:{ ears: 'round',  tail: 'none',  extra: 'muzzle' },
  tapir:    { ears: 'round',  tail: 'stub',  extra: 'trunk' },
  quokka:   { ears: 'round',  tail: 'long',  extra: 'muzzle' },
  koalaish: { ears: 'fan',    tail: 'stub',  extra: 'muzzle' },
  // China and Turkey: their own faces rather than a borrowed cast.
  panda:    { ears: 'round',  tail: 'stub',  extra: 'bigeyes' },
  redpanda: { ears: 'point',  tail: 'bushy', extra: 'whiskers' },
  crane:    { ears: 'none',   tail: 'plume', extra: 'bigbeak' },
  koi:      { ears: 'none',   tail: 'fin',   extra: 'gills' },
  angora:   { ears: 'point',  tail: 'puff',  extra: 'whiskers' },
  kangal:   { ears: 'floppy', tail: 'curl',  extra: 'muzzle' },
  stork:    { ears: 'none',   tail: 'plume', extra: 'beak' },
};

// No cast by default: every tier renders its painted 3D sprite, which reads far
// better than a drawn cup. The creature drawer stays for SKINS — a level (or a
// bought skin) opts in by setting `cast`, and only then does a tier become an
// animal.
export const DEFAULT_CAST = [];

const BELLY = ['#eafbc8', '#ffe6c2', '#ffdfe4', '#d8f4ff', '#fffaf0',
  '#ffe0bd', '#e8d4ff', '#fff2c2', '#eafcfa', '#ffd9e2', '#fff0d0'];

// Resolve which animal a tier is on a given level.
// A level can recolour a tier — each country's signature pour wears its own
// colours rather than the global chain's.
export function tierStyle(level, tierId, tiers) {
  const base = tiers[tierId - 1];
  const o = level && level.colors && level.colors[tierId];
  return o ? { ...base, color: o[0], alt: o[1] || base.alt } : base;
}

// The active skin's cast, set by main when a skin is equipped. A level can
// still override it (a themed stop), but nothing does by default.
export let ACTIVE_CAST = null;
export function setActiveCast(cast) { ACTIVE_CAST = cast && cast.length ? cast : null; }

// A painted skin swaps the sprite each tier draws with. The map is
// tier -> asset key; anything missing falls back to that tier's own art, so a
// half-finished set still renders. Set by main.js when a skin is equipped.
export let ACTIVE_ART = null;
export function setActiveArt(map) { ACTIVE_ART = map && Object.keys(map).length ? map : null; }
export function tierAssetKey(tier) {
  return (ACTIVE_ART && ACTIVE_ART[tier]) || 'tier' + String(tier).padStart(2, '0');
}

export function creatureFor(level, tierId) {
  const cast = (level && level.cast) || ACTIVE_CAST || DEFAULT_CAST;
  const name = cast[tierId - 1];
  if (!name) return null;                       // tier 11 on the World Tour = the Atlas sprite
  const parts = SPECIES[name] || SPECIES.cat;
  return { ...parts, name, belly: BELLY[(tierId - 1) % BELLY.length] };
}

export class Renderer {
  constructor(view, assets) {
    this.view = view;
    this.assets = assets;
    this.tableCanvas = null;
    this.vignette = null;
    this.level = null;
  }

  setLevel(level, w, h) {
    this.level = level;
    // table dressing: props react to drinks sliding past, so they live here
    // (dynamic) rather than baked into the prerendered tabletop
    this.props = (level.decor || []).map((d, i) => ({ ...d, hitT: -9, seed: i * 1.7 }));
    this.trail = [];
    this.prerenderTable(w, h);
    this.prerenderVignette(w, h);
    this.prerenderFrond(Math.round(w * 0.46));
  }

  // A palm frond silhouette used as a foreground framing layer. Drawn once to
  // an offscreen canvas, blitted with a slow sway each frame.
  prerenderFrond(size) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const night = this.level && this.level.time === 'night';
    ctx.strokeStyle = night ? 'rgba(8,16,14,0.92)' : 'rgba(16,44,26,0.9)';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineCap = 'round';
    try { ctx.filter = 'blur(1.6px)'; } catch {}
    // stem from top-left corner arcing down-right
    const stem = t => ({
      x: size * (0.02 + 0.75 * t),
      y: size * (0.05 + 0.55 * t * t + 0.18 * t),
    });
    ctx.lineWidth = size * 0.016;
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const p = stem(i / 20);
      i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
    }
    ctx.stroke();
    // leaflets on both sides, shrinking toward the tip
    for (let i = 2; i <= 19; i++) {
      const t = i / 20;
      const p = stem(t);
      const q = stem(t + 0.02);
      const ang = Math.atan2(q.y - p.y, q.x - p.x);
      const len = size * 0.20 * (1 - t * 0.75);
      for (const side of [-1, 1]) {
        const la = ang + side * (1.15 - t * 0.25);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(
          p.x + Math.cos(la) * len * 0.5, p.y + Math.sin(la) * len * 0.5 + len * 0.16,
          p.x + Math.cos(la) * len, p.y + Math.sin(la) * len + len * 0.34);
        ctx.lineWidth = size * 0.012 * (1 - t * 0.5);
        ctx.stroke();
      }
    }
    this.frond = c;
  }

  drawFronds(ctx, time) {
    if (!this.frond) return;
    const w = this.view.w;
    const s = this.frond.width;
    const sway = Math.sin(time * 0.7) * 0.022;
    ctx.save();
    ctx.translate(-s * 0.12, -s * 0.12);
    ctx.rotate(sway);
    ctx.drawImage(this.frond, 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(w + s * 0.12, -s * 0.12);
    ctx.scale(-1, 1);
    ctx.rotate(Math.sin(time * 0.6 + 2) * 0.022);
    ctx.drawImage(this.frond, 0, 0);
    ctx.restore();
  }

  gloss() {
    const l = this.level;
    if (!l) return 0.1;
    if (l.friction === FRICTION.marble) return 0.26;
    if (l.time === 'night') return 0.18;
    return 0.11;
  }

  // ---------- static table ----------

  prerenderTable(w, h) {
    const view = this.view;
    const level = this.level;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const pts = level.rails;

    const nearL = { x: pts[pts.length - 1].x, z: TABLE.foulLine };
    const nearR = { x: pts[0].x, z: TABLE.foulLine };

    // ---- tabletop (wood planks, tinted per scene) ----
    const top = [nearR, ...pts, nearL].map(p => view.project(p.x, 0, p.z));
    ctx.save();
    ctx.beginPath();
    top.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();

    // Per-destination surface palette (far, mid, near). Each level's table is a
    // real material — bamboo bar, talavera tile, marble, neon glass, lagoon —
    // so the world genuinely changes underfoot, not just a colour tint.
    const tbl = level.table || { surface: 'wood', c: ['#9a6540', '#ad7449', '#c08454'] };
    const farY = view.project(0, 0, TABLE.length).y;
    const nearY = view.project(0, 0, TABLE.foulLine).y;
    const g = ctx.createLinearGradient(0, farY, 0, nearY);
    g.addColorStop(0, shade(tbl.c[0], -0.22));
    g.addColorStop(0.5, tbl.c[1] || tbl.c[0]);
    g.addColorStop(1, shade(tbl.c[2] || tbl.c[1] || tbl.c[0], 0.08));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();

    this.drawSurface(ctx, tbl, w, h, farY, nearY);

    // sun sheen: diagonal light band
    const sheen = ctx.createLinearGradient(w * 0.15, farY, w * 0.75, nearY);
    sheen.addColorStop(0, 'rgba(255,245,220,0)');
    sheen.addColorStop(0.45, `rgba(255,245,220,${level.time === 'night' ? 0.05 : 0.10})`);
    sheen.addColorStop(0.6, 'rgba(255,245,220,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    // AO: darken along the rails
    ctx.lineWidth = 26;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(15,8,4,0.28)';
    ctx.beginPath();
    pts.map(p => view.project(p.x, 0, p.z)).forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.stroke();

    // friction zones
    if (level.zones) {
      for (const zn of level.zones) {
        ctx.fillStyle = zn.tint;
        quad(ctx, view, [zn.xMin, zn.zMin], [zn.xMax, zn.zMin], [zn.xMax, zn.zMax], [zn.xMin, zn.zMax]);
      }
    }

    // launch strip + painted foul line
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    quad(ctx, view, [-TABLE.halfW, TABLE.foulLine], [TABLE.halfW, TABLE.foulLine],
      [TABLE.halfW, TABLE.launchStripZ], [-TABLE.halfW, TABLE.launchStripZ]);
    ctx.setLineDash([16, 12]);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3.5;
    const f0 = view.project(-TABLE.halfW, 0, TABLE.launchStripZ);
    const f1 = view.project(TABLE.halfW, 0, TABLE.launchStripZ);
    ctx.beginPath(); ctx.moveTo(f0.x, f0.y); ctx.lineTo(f1.x, f1.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // ---- 3D rails ----
    this.drawRail3D(ctx, pts, level);
    if (level.innerWalls) {
      for (const iw of level.innerWalls) this.drawRail3D(ctx, iw.pts, level, 0.8);
    }

    // ---- the bar front, from the near edge to the bottom of the screen ----
    //
    // Pulling the camera back to leave room under the tee exposed whatever the
    // backdrop photo happened to have down there — usually a pale slab of sand
    // or pavement that read as an unfinished white band. You are standing AT a
    // bar, so what belongs below the counter edge is the counter's own front
    // panel, in that destination's material, all the way off the bottom.
    const e0 = view.project(nearL.x, 0, TABLE.foulLine);
    const e1 = view.project(nearR.x, 0, TABLE.foulLine);
    const topY = Math.min(e0.y, e1.y);
    const frontH = h - topY;
    if (frontH > 4) this.drawBarFront(ctx, w, h, topY, frontH, level);

    this.tableCanvas = c;
  }

  // The panelled face of the bar below the counter edge. It takes the level's
  // rail colour so a bamboo bar has a bamboo front and a marble one marble, and
  // it runs to the bottom of the canvas so no backdrop is ever visible under
  // the table — the phone's bottom edge becomes part of the counter.
  drawBarFront(ctx, w, h, topY, frontH, level) {
    // Real bars pair a light top with a dark cabinet underneath, and half the
    // rail colours here are pale stone — using the rail straight gave a flat
    // grey wall that read as more background. Mixing it into deep wood keeps a
    // trace of the destination's hue and always lands dark enough to sit under
    // the counter rather than compete with it.
    const base = mix(level.rail || '#7c4e2e', '#38210f', 0.74);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, topY - 2, w, frontH + 4);
    ctx.clip();

    const g = ctx.createLinearGradient(0, topY, 0, h);
    g.addColorStop(0, shade(base, 0.10));
    g.addColorStop(0.18, base);
    g.addColorStop(0.75, shade(base, -0.24));
    g.addColorStop(1, shade(base, -0.46));
    ctx.fillStyle = g;
    ctx.fillRect(0, topY - 2, w, frontH + 4);

    // The counter casts onto its own front.
    const cast = ctx.createLinearGradient(0, topY, 0, topY + Math.min(70, frontH));
    cast.addColorStop(0, 'rgba(0,0,0,0.42)');
    cast.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cast;
    ctx.fillRect(0, topY, w, Math.min(70, frontH));

    // A row of recessed panels, splayed outward from the centre so they agree
    // with the perspective of the top the player is looking down at.
    const panelTop = topY + frontH * 0.20;
    const panelBot = topY + frontH * 0.78;
    const n = 4, gap = w * 0.028, pw = (w - gap * (n + 1)) / n;
    const splay = (x) => (x - w / 2) * 0.10;
    for (let i = 0; i < n; i++) {
      const x0 = gap + i * (pw + gap), x1 = x0 + pw;
      const b0 = x0 + splay(x0), b1 = x1 + splay(x1);
      const face = ctx.createLinearGradient(0, panelTop, 0, panelBot);
      face.addColorStop(0, shade(base, -0.26));
      face.addColorStop(1, shade(base, -0.10));
      ctx.fillStyle = face;
      ctx.beginPath();
      ctx.moveTo(x0, panelTop); ctx.lineTo(x1, panelTop);
      ctx.lineTo(b1, panelBot); ctx.lineTo(b0, panelBot);
      ctx.closePath(); ctx.fill();
      // bevel: lit on the left and top, dark on the right and bottom
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = 'rgba(255,238,210,0.13)';
      ctx.beginPath(); ctx.moveTo(b0, panelBot); ctx.lineTo(x0, panelTop); ctx.lineTo(x1, panelTop); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.40)';
      ctx.beginPath(); ctx.moveTo(x1, panelTop); ctx.lineTo(b1, panelBot); ctx.lineTo(b0, panelBot); ctx.stroke();
    }

    // Grain across the whole face, fine and low-contrast.
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 34; i++) {
      const x = ((i * 97) % 100) / 100 * w;
      ctx.strokeStyle = i % 2 ? 'rgba(0,0,0,0.10)' : 'rgba(255,235,205,0.045)';
      ctx.lineWidth = 1 + (i % 3) * 0.6;
      ctx.beginPath(); ctx.moveTo(x, topY); ctx.lineTo(x + splay(x), h); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // The lit bullnose where the counter top rolls over into the front.
    const lip = ctx.createLinearGradient(0, topY - 4, 0, topY + 16);
    lip.addColorStop(0, shade(base, 0.44));
    lip.addColorStop(0.30, shade(base, 0.16));
    lip.addColorStop(1, 'rgba(0,0,0,0.34)');
    ctx.fillStyle = lip;
    ctx.fillRect(0, topY - 4, w, 19);

    // Corners fall away from the light, which stops the band looking like a
    // flat rectangle laid over the screen.
    const vig = ctx.createLinearGradient(0, 0, w, 0);
    vig.addColorStop(0, 'rgba(0,0,0,0.34)');
    vig.addColorStop(0.5, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.34)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, topY, w, frontH);
    ctx.restore();
  }

  // ---- surface materials (drawn inside the clipped, gradient-filled tabletop) ----

  drawSurface(ctx, tbl, w, h, farY, nearY) {
    const view = this.view;
    const P = (x, z) => view.project(x, 0, z);
    const HW = TABLE.halfW, Z0 = TABLE.foulLine, Z1 = TABLE.length;
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    // perspective row lines (constant z) and column lines (constant x)
    const row = (z, style, lw) => { const a = P(-HW, z), b = P(HW, z); ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
    const col = (x, style, lw) => { const a = P(x, Z0), b = P(x, Z1); ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };

    switch (tbl.surface) {
      case 'bamboo': {
        // vertical light slats with darker node bands
        for (let x = -HW; x <= HW; x += 30) col(x, 'rgba(90,60,25,0.32)', 1.4);
        for (let x = -HW + 15; x < HW; x += 30) col(x, 'rgba(255,240,200,0.14)', 3);
        for (let z = Z0 + 120; z < Z1; z += 170) row(z, 'rgba(80,52,20,0.28)', 2.4);
        break;
      }
      case 'tile': {
        const grout = tbl.grout || 'rgba(0,0,0,0.4)';
        const step = 88;
        for (let z = Z0; z <= Z1; z += step) row(z, grout, 3);
        for (let x = -HW; x <= HW; x += step) col(x, grout, 3);
        // per-tile tone + a painted motif dot
        for (let z = Z0; z < Z1; z += step) for (let x = -HW; x < HW; x += step) {
          const t = (rnd() - 0.5) * 0.12;
          const p = P(x + step / 2, z + step / 2);
          ctx.fillStyle = t >= 0 ? `rgba(255,255,255,${t})` : `rgba(0,0,0,${-t})`;
          const rr = (P(x, z).y - P(x, z + step).y) * 0.42;
          ctx.beginPath(); ctx.ellipse(p.x, p.y, Math.abs(rr) * 1.15, Math.abs(rr) * 0.62, 0, 0, 7); ctx.fill();
          if (tbl.motif && rnd() > 0.5) { ctx.fillStyle = hexToRgba(tbl.motif, 0.5); ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(2, Math.abs(rr) * 0.32), 0, 7); ctx.fill(); }
        }
        break;
      }
      case 'marble': {
        const vein = tbl.vein || '#ffffff';
        for (let i = 0; i < 22; i++) {
          const zx = -HW + rnd() * (HW * 2);
          const a = P(zx, Z0 + rnd() * 200), b = P(zx + (rnd() - 0.5) * 260, Z1 - rnd() * 200);
          ctx.strokeStyle = hexToRgba(vein, 0.06 + rnd() * 0.14);
          ctx.lineWidth = 0.6 + rnd() * 2.4;
          ctx.beginPath(); ctx.moveTo(a.x, a.y);
          ctx.bezierCurveTo((a.x + b.x) / 2 + (rnd() - 0.5) * 120, (a.y + b.y) / 2, (a.x + b.x) / 2 - (rnd() - 0.5) * 90, (a.y + b.y) / 2 + 30, b.x, b.y);
          ctx.stroke();
        }
        // polished sheen band
        const sh = ctx.createLinearGradient(w * 0.2, farY, w * 0.8, nearY);
        sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(0.55, 'rgba(255,255,255,0.12)'); sh.addColorStop(0.7, 'rgba(255,255,255,0)');
        ctx.fillStyle = sh; ctx.fillRect(0, 0, w, h);
        break;
      }
      case 'terrazzo': {
        const flecks = tbl.fleck || ['#F26CA7', '#40E0D0', '#ffd75e'];
        for (let i = 0; i < 520; i++) {
          const x = -HW + rnd() * (HW * 2), z = Z0 + rnd() * (Z1 - Z0);
          const p = P(x, z);
          const scale = 1 - (z - Z0) / (Z1 - Z0) * 0.55;
          ctx.fillStyle = hexToRgba(flecks[(rnd() * flecks.length) | 0], 0.5);
          ctx.beginPath(); ctx.ellipse(p.x, p.y, (2 + rnd() * 4) * scale, (1.4 + rnd() * 2.6) * scale, rnd() * 3, 0, 7); ctx.fill();
        }
        break;
      }
      case 'wave': {
        // Copacabana promenade: chevron bands of light stone and dark
        const dark = tbl.dark || '#2a2a2a';
        let k = 0;
        for (let z = Z0; z < Z1; z += 64) {
          if ((k++ % 2) === 0) continue;
          ctx.fillStyle = hexToRgba(dark, 0.5);
          quad(ctx, view, [-HW, z], [0, z + 28], [0, z + 92], [-HW, z + 64]);
          quad(ctx, view, [0, z + 28], [HW, z], [HW, z + 64], [0, z + 92]);
        }
        break;
      }
      case 'glass': {
        // translucent surface with reflection streaks + an inner edge glow
        const glow = tbl.glow || '#8ff0e8';
        for (let i = 0; i < 7; i++) {
          const x = -HW + rnd() * (HW * 2);
          ctx.strokeStyle = `rgba(255,255,255,${0.05 + rnd() * 0.08})`;
          ctx.lineWidth = 6 + rnd() * 22;
          const a = P(x, Z0), b = P(x + (rnd() - 0.5) * 120, Z1);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        const gl = ctx.createLinearGradient(0, farY, 0, nearY);
        gl.addColorStop(0, hexToRgba(glow, 0.16)); gl.addColorStop(0.5, hexToRgba(glow, 0)); gl.addColorStop(1, hexToRgba(glow, 0.10));
        ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
        break;
      }
      case 'plaster': {
        // whitewashed matte with soft mottling
        for (let i = 0; i < 120; i++) {
          const x = -HW + rnd() * (HW * 2), z = Z0 + rnd() * (Z1 - Z0), p = P(x, z);
          ctx.fillStyle = `rgba(120,110,95,${0.02 + rnd() * 0.04})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 8 + rnd() * 26, 0, 7); ctx.fill();
        }
        break;
      }
      case 'stone': {
        // volcanic stone: dark mottle + hairline cracks
        for (let i = 0; i < 260; i++) {
          const x = -HW + rnd() * (HW * 2), z = Z0 + rnd() * (Z1 - Z0), p = P(x, z);
          const d = (rnd() - 0.5) * 0.2;
          ctx.fillStyle = d >= 0 ? `rgba(255,255,255,${d * 0.4})` : `rgba(0,0,0,${-d})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 3 + rnd() * 9, 0, 7); ctx.fill();
        }
        break;
      }
      default: {  // wood planks + grain (Waikiki, Rio, Phuket teak…)
        const plankW = 64;
        for (let x = -HW; x < HW; x += plankW) {
          const tone = (rnd() - 0.5) * 0.14;
          const p0 = P(x, Z0), p1 = P(x, Z1), q0 = P(Math.min(x + plankW, HW), Z0), q1 = P(Math.min(x + plankW, HW), Z1);
          ctx.fillStyle = tone >= 0 ? `rgba(255,225,190,${tone})` : `rgba(30,10,0,${-tone})`;
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(q1.x, q1.y); ctx.lineTo(q0.x, q0.y); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(20,8,2,0.35)'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
          for (let i = 0; i < 3; i++) {
            const gx = x + rnd() * plankW;
            const a0 = P(gx, Z0 + rnd() * 300), a1 = P(gx + (rnd() - 0.5) * 14, Z0 + 300 + rnd() * 540);
            ctx.strokeStyle = `rgba(40,18,6,${0.05 + rnd() * 0.08})`; ctx.lineWidth = 1 + rnd() * 1.6;
            ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.quadraticCurveTo((a0.x + a1.x) / 2 + (rnd() - 0.5) * 20, (a0.y + a1.y) / 2, a1.x, a1.y); ctx.stroke();
          }
        }
        break;
      }
    }
  }

  drawRail3D(ctx, pts, level, scale = 1) {
    const view = this.view;
    const railH = RAIL_H * scale;
    const base = pts.map(p => view.project(p.x, 0, p.z));
    const top = pts.map(p => view.project(p.x, railH, p.z));

    // inner face: quad strip between base line and top line
    for (let i = 0; i < pts.length - 1; i++) {
      const g = ctx.createLinearGradient(0, top[i].y, 0, base[i].y);
      g.addColorStop(0, shade(level.rail, -0.05));
      g.addColorStop(1, shade(level.rail, -0.45));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(base[i].x, base[i].y);
      ctx.lineTo(base[i + 1].x, base[i + 1].y);
      ctx.lineTo(top[i + 1].x, top[i + 1].y);
      ctx.lineTo(top[i].x, top[i].y);
      ctx.closePath();
      ctx.fill();
    }

    // top face: fat rounded stroke along the top line, lit from above
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(8, RAIL_TH * scale * (top[0]?.s ?? 0.5));
    ctx.strokeStyle = shade(level.rail, 0.16);
    ctx.beginPath();
    top.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.stroke();
    // top-face highlight rim
    ctx.lineWidth = Math.max(3, RAIL_TH * 0.32 * scale * (top[0]?.s ?? 0.5));
    ctx.strokeStyle = shade(level.rail, 0.42);
    ctx.beginPath();
    top.forEach((p, i) => i ? ctx.lineTo(p.x, p.y - ctx.lineWidth * 0.4) : ctx.moveTo(p.x, p.y - ctx.lineWidth * 0.4));
    ctx.stroke();
  }

  prerenderVignette(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const level = this.level;
    // corner vignette
    const v = ctx.createRadialGradient(w / 2, h * 0.55, h * 0.42, w / 2, h * 0.55, h * 0.85);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(5,10,20,0.34)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    // scene grade
    let tint = null;
    if (level) {
      if (level.time === 'sunset') tint = 'rgba(255,130,50,0.07)';
      else if (level.time === 'night') tint = 'rgba(50,70,160,0.10)';
      else tint = 'rgba(255,240,200,0.05)';
    }
    if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, w, h); }
    this.vignette = c;
  }

  // ---------- per frame ----------

  draw(ctx, game, time) {
    const view = this.view;
    // faces read the run's outcome: everyone beams on a win, wilts on a loss
    this.mood = game.state === 'won' ? 'happy' : (game.state === 'failed' ? 'sad' : null);
    if (this.tableCanvas) ctx.drawImage(this.tableCanvas, 0, 0);

    // tide flood overlay
    if (game.tide && (game.tide.active || game.tide.warning)) {
      const t = game.tide;
      const a = t.active ? 0.4 : 0.12 + 0.08 * Math.sin(time * 8);
      ctx.fillStyle = `rgba(80,200,230,${a})`;
      quad(ctx, view, [-TABLE.halfW, t.fromZ], [TABLE.halfW, t.fromZ],
        [TABLE.halfW, TABLE.length], [-TABLE.halfW, TABLE.length]);
    }

    this.drawTrails(ctx, game, time);
    this.drawProps(ctx, game, time);

    // ---- country hazards ----
    if (game.lava) {                                   // Indonesia: a hot seam
      const lv = game.lava, pulse = 0.55 + 0.25 * Math.sin(time * 3);
      const g2 = ctx.createLinearGradient(0, view.project(0, 0, lv.zMax).y, 0, view.project(0, 0, lv.zMin).y);
      g2.addColorStop(0, `rgba(255,90,30,${0.5 * pulse})`);
      g2.addColorStop(1, `rgba(255,180,40,${0.18 * pulse})`);
      ctx.fillStyle = g2;
      quad(ctx, view, [-TABLE.halfW, lv.zMin], [TABLE.halfW, lv.zMin],
        [TABLE.halfW, lv.zMax], [-TABLE.halfW, lv.zMax]);
      ctx.strokeStyle = `rgba(255,220,120,${0.5 * pulse})`;
      ctx.lineWidth = 2.5;
      for (const z of [lv.zMin, lv.zMax]) {
        const a = view.project(-TABLE.halfW, 0, z), b2 = view.project(TABLE.halfW, 0, z);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.stroke();
      }
    }
    if (game.cenote) {                                 // Mexico: a hole to fall into
      const cn = game.cenote, p2 = view.project(cn.x, 0, cn.z), rr = cn.r * p2.s;
      const g3 = ctx.createRadialGradient(p2.x, p2.y, rr * 0.15, p2.x, p2.y, rr);
      g3.addColorStop(0, 'rgba(4,20,32,0.95)');
      g3.addColorStop(0.7, 'rgba(14,70,104,0.85)');
      g3.addColorStop(1, 'rgba(60,170,200,0.35)');
      ctx.fillStyle = g3;
      ellipse(ctx, p2.x, p2.y, rr, rr * 0.5);
      ctx.strokeStyle = `rgba(160,240,255,${0.35 + 0.2 * Math.sin(time * 2.2)})`;
      ctx.lineWidth = 2.5;
      ellipseStroke(ctx, p2.x, p2.y, rr * (0.72 + 0.06 * Math.sin(time * 2.2)), rr * 0.36);
    }

    if (game.level.orders) this.drawDocks(ctx, game, time);
    // after the docks so the cat is never hidden behind an order card
    if (game.level.barCat) this.drawBarCat(ctx, game, time);
    this.drawTableGuest(ctx, game, time);

    // overcrowd warning pulse
    if (game.overcrowdT > 0) {
      const p = Math.min(1, game.overcrowdT / 2);
      const a = 0.18 + 0.2 * Math.sin(time * 10) + p * 0.25;
      ctx.fillStyle = `rgba(255,60,60,${Math.max(0, a)})`;
      quad(ctx, view, [-TABLE.halfW, TABLE.foulLine], [TABLE.halfW, TABLE.foulLine],
        [TABLE.halfW, TABLE.launchStripZ], [-TABLE.halfW, TABLE.launchStripZ]);
    }

    if (game.aim && game.tee.ready) this.drawAim(ctx, game);

    // bodies far-to-near
    const bodies = game.phys.bodies.filter(b => !b.dead).sort((x, y) => y.z - x.z);
    const glossA = this.gloss();
    for (const b of bodies) {
      this.drawBody(ctx, b, time, glossA);   // b.born advanced by game.update on the fixed step
    }

    if (game.tee.ready && game.state === 'aiming') this.drawTee(ctx, game, time);

    if (game.wind && (game.wind.warning || game.wind.active)) this.drawWind(ctx, game, time);

    // foreground framing + scene grade + vignette over everything
    if (game.sandstorm && (game.sandstorm.active || game.sandstorm.warning)) {
      const ss = game.sandstorm, a = ss.active ? 0.34 : 0.1 + 0.06 * Math.sin(time * 8);
      ctx.save();
      ctx.fillStyle = `rgba(214,178,110,${a})`;
      ctx.fillRect(0, 0, view.w, view.h);
      ctx.strokeStyle = `rgba(255,232,190,${a * 0.7})`;
      ctx.lineWidth = 1.6;
      const dir = ss.dir || 1;
      for (let i = 0; i < 26; i++) {
        const y = ((i * 97 + time * 240) % view.h);
        const x = ((i * 173 + time * 900 * dir) % (view.w + 200)) - 100;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 46 * dir, y + 5); ctx.stroke();
      }
      ctx.restore();
    }
    if (game.monsoon && (game.monsoon.active || game.monsoon.warning)) {
      const mo = game.monsoon, a = mo.active ? 0.5 : 0.18;
      ctx.save();
      ctx.strokeStyle = `rgba(190,225,245,${a})`;
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 60; i++) {
        const x = (i * 131 + time * 60) % view.w;
        const y = ((i * 211 + time * 1500) % (view.h + 120)) - 60;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 22); ctx.stroke();
      }
      if (mo.active) { ctx.fillStyle = 'rgba(120,160,190,0.12)'; ctx.fillRect(0, 0, view.w, view.h); }
      ctx.restore();
    }
    this.drawFronds(ctx, time);
    if (this.vignette) ctx.drawImage(this.vignette, 0, 0);
  }

  drawBody(ctx, b, time, glossA = 0.1) {
    const view = this.view;
    const p = view.project(b.x, 0, b.z);

    if (b.fixed) {   // motu island obstacle
      softShadow(ctx, p.x, p.y + 3 * p.s, b.r * p.s * 1.15, b.r * p.s * 0.5, 0.35);
      ctx.fillStyle = '#e8d5a8';
      ellipse(ctx, p.x, p.y - 6 * p.s, b.r * p.s, b.r * p.s * 0.55);
      ctx.fillStyle = '#d9c191';
      ellipse(ctx, p.x, p.y - 2 * p.s, b.r * p.s * 0.96, b.r * p.s * 0.4);
      ctx.fillStyle = '#3e8e5e';
      ellipse(ctx, p.x, p.y - 12 * p.s, b.r * p.s * 0.55, b.r * p.s * 0.3);
      ctx.fillStyle = '#2e7a4c';
      ellipse(ctx, p.x + b.r * p.s * 0.2, p.y - 10 * p.s, b.r * p.s * 0.3, b.r * p.s * 0.18);
      return;
    }

    // directional soft shadow (light from upper-left → shadow lower-right)
    const sh = Math.max(0.25, 1 - b.y / 300);
    softShadow(ctx, p.x + b.r * p.s * 0.18, p.y + 2 * p.s,
      b.r * p.s * 1.02 * (2 - sh), b.r * p.s * 0.45 * (2 - sh), 0.34 * sh);

    if (b.kind === 'ball') { this.drawBall(ctx, b, p, time); return; }

    const tier = tierStyle(this.level, b.tier, TIERS);
    const img = this.assets.image(tierAssetKey(b.tier));
    const born = b.born === undefined ? 1 : b.born;
    const pop = born < 1 ? 0.7 + 0.38 * easeOutBack(born) : 1;
    // the queued tee drink "breathes" to feel alive and invite the flick;
    // parked drinks bob almost imperceptibly
    const bob = b.tee ? Math.sin(time * 3.2) * 0.045
      : (b.sleeping ? Math.sin(time * 2 + b.id) * 0.012 : 0);
    const squash = b.justHit > 0 ? 1 - b.justHit * 0.6 : 1;
    // oversized silhouettes for small tiers; physics footprint stays honest
    const vis = 1.92 - 0.038 * (b.tier - 1);   // the longer table shrinks everything; hold the read
    const wpx = b.r * 2 * p.s * vis * pop * (1 + bob);
    const hpx = view.project(b.x, b.y, b.z);
    // The 3D-rendered sprites already carry a fixed 3/4 perspective, so the old
    // billboard shear would fight it — keep only a whisper of lean for life.
    const shear = (this.view.cx - p.x) / this.view.w * 0.04;

    const creature = creatureFor(this.level, b.tier);
    if (creature) {
      // the cup IS the animal — drawn, so its ears and tail can move
      const cheer = b.cheer > 0 ? Math.sin(Math.min(1, b.cheer) * Math.PI) : 0;
      const CW = wpx * 0.62 * (1 + cheer * 0.06), CH = CW * 1.22 * squash * (1 - cheer * 0.05);
      const ax = hpx.x, ay = hpx.y + b.r * p.s * 0.35 - cheer * CH * 0.16;
      if (glossA > 0 && b.y < 40) {          // a soft colour bloom on the table
        ctx.save();
        ctx.globalAlpha = glossA * sh * 1.4;
        ctx.fillStyle = tier.color;
        ellipse(ctx, ax, ay + CH * 0.1, CW * 0.5, CH * 0.14);
        ctx.restore();
      }
      ctx.save();
      ctx.translate(ax, ay);
      ctx.transform(1, 0, shear, 1, 0, 0);
      this.drawCreature(ctx, b, tier, CW, CH, time);
      this.drawCharm(ctx, b, CW, CH, time);
      ctx.restore();
    } else if (img) {
      const ih = wpx * (img.naturalHeight / img.naturalWidth);
      const ax = hpx.x, ay = hpx.y + b.r * p.s * 0.35;
      // reflection on the felt
      if (glossA > 0 && b.y < 40) {
        ctx.save();
        ctx.globalAlpha = glossA * sh;
        ctx.translate(ax, ay);
        ctx.scale(1, -0.5);
        ctx.drawImage(img, -wpx / 2, 0, wpx, ih * squash);
        ctx.restore();
      }
      ctx.save();
      ctx.translate(ax, ay);
      ctx.transform(1, 0, shear, 1, 0, 0);
      // tail sits BEHIND the glass so it reads as coming out from behind it
      if (CAT_TIERS.has(b.tier) && !creatureFor(this.level, b.tier)) this.drawCatTail(ctx, b, wpx, ih * squash, time);
      ctx.drawImage(img, -wpx / 2, -ih * 0.96 * squash, wpx, ih * squash);
      this.drawCharm(ctx, b, wpx, ih * squash, time);
      ctx.restore();
    } else {
      const ih = wpx * 1.35;
      const x = hpx.x, y = hpx.y + b.r * p.s * 0.35;
      ctx.fillStyle = tier.color;
      roundRect(ctx, x - wpx * 0.36, y - ih, wpx * 0.72, ih * 0.92, wpx * 0.18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,30,40,0.8)';
      ctx.lineWidth = Math.max(1.5, wpx * 0.045);
      roundRect(ctx, x - wpx * 0.36, y - ih, wpx * 0.72, ih * 0.92, wpx * 0.18);
      ctx.stroke();
    }
  }

  // Wet streaks left by sliding drinks — the table remembers the shot for a
  // moment, which makes the surface feel physical rather than painted.
  drawTrails(ctx, game, time) {
    if (!this.trail) this.trail = [];
    for (const b of game.phys.bodies) {
      if (b.dead || b.fixed || b.sleeping) continue;
      if (Math.hypot(b.vx, b.vz) < 130) continue;
      const t = TIERS[b.tier - 1];
      this.trail.push({ x: b.x, z: b.z, r: b.r, t: time, c: (t && t.color) || '#ffffff' });
    }
    if (this.trail.length > 300) this.trail.splice(0, this.trail.length - 300);
    const view = this.view;
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const s = this.trail[i];
      const age = time - s.t;
      if (age > 0.6 || age < 0) { this.trail.splice(i, 1); continue; }
      const p = view.project(s.x, 0, s.z);
      ctx.globalAlpha = (1 - age / 0.6) * 0.15;
      ctx.fillStyle = s.c;
      ellipse(ctx, p.x, p.y, s.r * p.s * 0.95, s.r * p.s * 0.38);
    }
    ctx.globalAlpha = 1;
  }

  // Table dressing that reacts: a drink sliding past nudges a prop and it
  // wobbles itself still again.
  drawProps(ctx, game, time) {
    if (!this.props || !this.props.length) return;
    const view = this.view;
    for (const pr of this.props) {
      for (const b of game.phys.bodies) {
        if (b.dead || b.sleeping || b.fixed) continue;
        if (Math.hypot(b.x - pr.x, b.z - pr.z) < b.r + 52) { pr.hitT = time; break; }
      }
      const since = time - pr.hitT;
      const wob = since >= 0 && since < 1.1 ? Math.sin(since * 24) * (1 - since / 1.1) : 0;
      const p = view.project(pr.x, 0, pr.z);
      const k = p.s;
      ctx.save();
      ctx.translate(p.x, p.y + wob * 2.5 * k);
      ctx.rotate((pr.rot || 0) + wob * 0.22);
      ctx.scale(1, 0.55);                       // lying flat on the table
      const c = pr.c || '#ffffff';
      switch (pr.kind) {
        case 'coaster':
          ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.arc(2 * k, 2 * k, 26 * k, 0, 7); ctx.fill();
          ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, 26 * k, 0, 7); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2.5 * k;
          ctx.beginPath(); ctx.arc(0, 0, 18 * k, 0, 7); ctx.stroke();
          break;
        case 'napkin':
          ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(-22 * k + 2, -22 * k + 2, 44 * k, 44 * k);
          ctx.fillStyle = c; ctx.fillRect(-22 * k, -22 * k, 44 * k, 44 * k);
          ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.5 * k;
          ctx.beginPath(); ctx.moveTo(-22 * k, 0); ctx.lineTo(22 * k, 0); ctx.stroke();
          break;
        case 'shell':
          ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, 20 * k, Math.PI, 0); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(160,120,110,0.6)'; ctx.lineWidth = 1.4 * k;
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(i * 8 * k, -19 * k); ctx.stroke();
          }
          break;
        case 'star':                                   // starfish
          ctx.fillStyle = c; ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2, rr = (i % 2 ? 8 : 21) * k;
            i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          ctx.closePath(); ctx.fill();
          break;
        case 'leaf':
          ctx.fillStyle = c; ctx.beginPath();
          ctx.ellipse(0, 0, 30 * k, 15 * k, 0.5, 0, 7); ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1.4 * k;
          ctx.beginPath(); ctx.moveTo(-26 * k, -10 * k); ctx.lineTo(26 * k, 10 * k); ctx.stroke();
          break;
        case 'petal':
          ctx.fillStyle = c;
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            ctx.beginPath(); ctx.ellipse(Math.cos(a) * 11 * k, Math.sin(a) * 11 * k, 10 * k, 7 * k, a, 0, 7); ctx.fill();
          }
          ctx.fillStyle = '#ffe07a'; ctx.beginPath(); ctx.arc(0, 0, 5 * k, 0, 7); ctx.fill();
          break;
        default:                                        // 'chip' — a simple token
          ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, 16 * k, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
  }

  // A guest that pads onto the table now and then, sits down to watch you mix,
  // hops when something merges, then wanders off again.
  drawTableGuest(ctx, game, time) {
    const cfg = game.level.guest;
    if (!cfg) return;
    const CYCLE = 52, IN = 4.5, STAY = 17, OUT = 4.5;
    const t = (time + (cfg.offset || 0)) % CYCLE;
    let x, walking = false;
    const side = cfg.side || 1;
    const offX = side * (TABLE.halfW + 90);
    const sitX = side * (TABLE.halfW - 78);
    const z = cfg.z || 745;
    if (t < IN) { const p = t / IN; x = offX + (sitX - offX) * (1 - Math.pow(1 - p, 3)); walking = true; }
    else if (t < IN + STAY) x = sitX;
    else if (t < IN + STAY + OUT) { const p = (t - IN - STAY) / OUT; x = sitX + (offX - sitX) * p * p; walking = true; }
    else return;                                    // away between visits

    // it looks at whatever is liveliest, and hops when a merge lands
    let watch = 0, best = 0, joy = 0;
    for (const b of game.phys.bodies) {
      if (b.dead) continue;
      if (b.cheer > joy) joy = b.cheer;
      if (b.sleeping) continue;
      const sp = Math.hypot(b.vx, b.vz);
      if (sp > best) { best = sp; watch = Math.max(-1, Math.min(1, (b.x - x) / 340)); }
    }
    const hop = joy > 0 ? Math.abs(Math.sin(time * 12)) * joy : 0;
    const p = this.view.project(x, 0, z);
    const k = p.s * 1.7;
    const body = cfg.c || '#8a7f74', pale = cfg.alt || '#f6efe6';
    const ph = time * 2.2;
    const blink = ((time * 0.5 + 1.7) % 4) < 0.13;

    softShadow(ctx, p.x, p.y + 2 * k, 15 * k, 6 * k, 0.3);
    ctx.save();
    ctx.translate(p.x, p.y - hop * 9 * k);
    if (side > 0) ctx.scale(-1, 1);                 // always face the table
    ctx.strokeStyle = body; ctx.lineCap = 'round'; ctx.lineWidth = 4.5 * k;
    ctx.beginPath();                                 // tail
    ctx.moveTo(-11 * k, -4 * k);
    ctx.quadraticCurveTo(-27 * k, 1 * k + Math.sin(ph) * 4 * k, -34 * k, -12 * k + Math.sin(ph) * 7 * k);
    ctx.stroke();
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0, -9 * k, 13 * k, 10 * k, 0, 0, 7); ctx.fill();
    if (walking) {                                   // little legs while padding
      ctx.strokeStyle = body; ctx.lineWidth = 3 * k;
      for (const lx of [-5, 5]) {
        ctx.beginPath();
        ctx.moveTo(lx * k, -3 * k);
        ctx.lineTo(lx * k + Math.sin(time * 14 + lx) * 3 * k, 1 * k);
        ctx.stroke();
      }
    }
    const hx = watch * 3 * k;
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(hx, -23 * k, 9 * k, 0, 7); ctx.fill();
    for (const s2 of [-1, 1]) {                      // ears
      ctx.beginPath();
      ctx.moveTo(hx + s2 * 7.5 * k, -27 * k);
      ctx.lineTo(hx + s2 * 3.5 * k, -36 * k);
      ctx.lineTo(hx + s2 * 0.5 * k, -27 * k);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = pale;
    ctx.beginPath(); ctx.ellipse(hx * 0.5, -8 * k, 6 * k, 7 * k, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx, -20 * k, 5 * k, 3.5 * k, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(20,16,20,0.9)';
    ctx.strokeStyle = 'rgba(20,16,20,0.9)'; ctx.lineWidth = 1.5 * k;
    for (const s2 of [-1, 1]) {
      const ex = hx + s2 * 3.8 * k, ey = -25 * k;
      ctx.beginPath();
      if (joy > 0.15) { ctx.arc(ex, ey + 1.2 * k, 2.4 * k, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
      else if (blink) { ctx.moveTo(ex - 1.8 * k, ey); ctx.lineTo(ex + 1.8 * k, ey); ctx.stroke(); }
      else { ctx.arc(ex, ey, 1.7 * k, 0, 7); ctx.fill(); }
    }
    ctx.fillStyle = '#ff9db5';
    ctx.beginPath(); ctx.arc(hx, -20.5 * k, 1.3 * k, 0, 7); ctx.fill();
    ctx.restore();
  }

  // A little bar cat perched on the far rail: it swishes its tail, blinks, and
  // turns its head to follow whichever drink is moving fastest.
  drawBarCat(ctx, game, time) {
    const cfg = game.level.barCat;
    const view = this.view;
    const p = view.project(cfg.x, RAIL_H, TABLE.length);
    const k = p.s * 1.5;
    // watch the liveliest drink
    let watch = 0, best = 0;
    for (const b of game.phys.bodies) {
      if (b.dead || b.sleeping) continue;
      const sp = Math.hypot(b.vx, b.vz);
      if (sp > best) { best = sp; watch = Math.max(-1, Math.min(1, (b.x - cfg.x) / 320)); }
    }
    const body = cfg.c || '#4a4a55', pale = cfg.alt || '#f6efe6';
    const ph = time * 1.9;
    const blink = ((time * 0.5) % 4.2) < 0.14;
    ctx.save();
    ctx.translate(p.x, p.y);
    // tail draped along the rail, swishing
    ctx.strokeStyle = body; ctx.lineCap = 'round'; ctx.lineWidth = 5 * k;
    ctx.beginPath();
    ctx.moveTo(-14 * k, -3 * k);
    ctx.quadraticCurveTo(-34 * k, 2 * k + Math.sin(ph) * 5 * k, -44 * k, -10 * k + Math.sin(ph) * 9 * k);
    ctx.stroke();
    // haunches + body
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0, -9 * k, 16 * k, 12 * k, 0, 0, 7); ctx.fill();
    // head (turns toward the action)
    const hx = watch * 3.5 * k;
    ctx.beginPath(); ctx.arc(hx, -25 * k, 10.5 * k, 0, 7); ctx.fill();
    for (const side of [-1, 1]) {                       // ears
      ctx.beginPath();
      ctx.moveTo(hx + side * 9 * k, -30 * k);
      ctx.lineTo(hx + side * 4 * k, -40 * k);
      ctx.lineTo(hx + side * 1 * k, -30 * k);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = pale;                                // chest + muzzle
    ctx.beginPath(); ctx.ellipse(hx * 0.5, -8 * k, 7 * k, 8 * k, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx, -22 * k, 6 * k, 4 * k, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(20,16,20,0.9)';               // eyes
    ctx.strokeStyle = 'rgba(20,16,20,0.9)'; ctx.lineWidth = 1.6 * k;
    for (const side of [-1, 1]) {
      const ex = hx + side * 4.2 * k, ey = -27 * k;
      ctx.beginPath();
      if (blink) { ctx.moveTo(ex - 2 * k, ey); ctx.lineTo(ex + 2 * k, ey); ctx.stroke(); }
      else { ctx.arc(ex, ey, 1.9 * k, 0, 7); ctx.fill(); }
    }
    ctx.fillStyle = '#ff9db5';                           // nose
    ctx.beginPath(); ctx.arc(hx, -22.5 * k, 1.5 * k, 0, 7); ctx.fill();
    ctx.restore();
  }

  // ---------- creature cups ----------
  // Origin is the foot of the cup: the body spans y ∈ [-H, 0], x ∈ [-W/2, W/2].

  cupPath(ctx, W, H) {
    const tw = W / 2, bw = W * 0.32;
    ctx.beginPath();
    ctx.moveTo(-tw, -H);
    ctx.bezierCurveTo(-tw * 1.12, -H * 0.58, -tw * 1.06, -H * 0.16, -bw, -H * 0.03);
    ctx.quadraticCurveTo(0, H * 0.12, bw, -H * 0.03);
    ctx.bezierCurveTo(tw * 1.06, -H * 0.16, tw * 1.12, -H * 0.58, tw, -H);
    ctx.closePath();
  }

  drawCreature(ctx, b, tier, W, H, time) {
    const spec = b.spec || creatureFor(this.level, b.tier);
    const ph = time * 2.1 + b.id * 1.7;
    const sway = Math.sin(ph);
    const dark = shade(tier.color, -0.28);
    const lite = shade(tier.color, 0.22);
    const tw = W / 2;

    // ---- behind the body: tail, shell, tentacles, claws ----
    ctx.save();
    ctx.fillStyle = dark;
    ctx.strokeStyle = dark;
    ctx.lineCap = 'round';
    switch (spec.tail) {
      case 'curl': {                                    // cat
        ctx.lineWidth = W * 0.10;
        ctx.beginPath();
        ctx.moveTo(tw * 0.75, -H * 0.14);
        ctx.bezierCurveTo(tw * 1.5, -H * 0.16, tw * 1.7 + sway * W * 0.1, -H * 0.5,
          tw * 1.05 + sway * W * 0.14, -H * 0.72);
        ctx.stroke();
        break;
      }
      case 'bushy': {                                   // fox
        ctx.beginPath();
        ctx.moveTo(tw * 0.7, -H * 0.1);
        ctx.quadraticCurveTo(tw * 1.9 + sway * W * 0.08, -H * 0.22,
          tw * 1.25 + sway * W * 0.12, -H * 0.68);
        ctx.quadraticCurveTo(tw * 1.0, -H * 0.3, tw * 0.7, -H * 0.1);
        ctx.fill();
        ctx.fillStyle = '#fff6ea';                      // white tip
        ctx.beginPath();
        ctx.arc(tw * 1.25 + sway * W * 0.12, -H * 0.66, W * 0.1, 0, 7);
        ctx.fill();
        break;
      }
      case 'curly': {                                   // piglet
        ctx.lineWidth = W * 0.065;
        ctx.beginPath();
        for (let i = 0; i <= 16; i++) {
          const t = i / 16, a = t * 8 + sway * 0.5;
          const r = W * 0.14 * (1 - t * 0.35);
          const x = tw * 0.85 + Math.cos(a) * r + t * W * 0.16;
          const y = -H * 0.2 - Math.sin(a) * r;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
        break;
      }
      case 'puff':                                      // bunny
        ctx.fillStyle = '#fffaf2';
        ctx.beginPath();
        ctx.arc(tw * 0.92, -H * 0.16 + sway * H * 0.015, W * 0.15, 0, 7);
        ctx.fill();
        break;
      case 'fin':                                       // seal
        ctx.beginPath();
        ctx.moveTo(tw * 0.7, -H * 0.1);
        ctx.quadraticCurveTo(tw * 1.5, -H * 0.02 + sway * H * 0.05, tw * 1.55, -H * 0.28);
        ctx.quadraticCurveTo(tw * 1.1, -H * 0.16, tw * 0.7, -H * 0.1);
        ctx.fill();
        break;
      case 'stub':                                      // turtle, capybara…
        ctx.beginPath();
        ctx.ellipse(tw * 0.95, -H * 0.14, W * 0.1, W * 0.07, sway * 0.2, 0, 7);
        ctx.fill();
        break;
      case 'long': {                                    // monkey, iguana, big cats
        ctx.lineWidth = W * 0.06;
        ctx.beginPath();
        ctx.moveTo(tw * 0.72, -H * 0.12);
        ctx.bezierCurveTo(tw * 1.7, -H * 0.06, tw * 1.85 + sway * W * 0.12, -H * 0.45,
          tw * 1.15 + sway * W * 0.2, -H * 0.66);
        ctx.stroke();
        break;
      }
      case 'plume': {                                   // birds
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(tw * 0.7, -H * 0.16);
          ctx.quadraticCurveTo(tw * 1.35, -H * (0.1 + i * 0.06) + sway * H * 0.02,
            tw * 1.7, -H * (0.05 + i * 0.16) + sway * H * 0.03);
          ctx.lineWidth = W * 0.055;
          ctx.stroke();
        }
        break;
      }
      case 'whip':                                      // ray
        ctx.lineWidth = W * 0.045;
        ctx.beginPath();
        ctx.moveTo(tw * 0.7, -H * 0.12);
        ctx.quadraticCurveTo(tw * 1.6, -H * 0.1 + sway * H * 0.04, tw * 2.0, -H * 0.2);
        ctx.stroke();
        break;
      case 'sting': {                                   // scorpion
        ctx.lineWidth = W * 0.07;
        ctx.beginPath();
        ctx.moveTo(tw * 0.7, -H * 0.14);
        ctx.quadraticCurveTo(tw * 1.6, -H * 0.5, tw * 0.95 + sway * W * 0.08, -H * 0.85);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tw * 0.95 + sway * W * 0.08, -H * 0.88, W * 0.075, 0, 7);
        ctx.fill();
        break;
      }
    }
    if (spec.extra === 'tentacles') {                   // octopus
      ctx.lineWidth = W * 0.075;
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        const s0 = i * W * 0.17;
        ctx.beginPath();
        ctx.moveTo(s0 * 0.6, -H * 0.1);
        ctx.quadraticCurveTo(s0 * 1.25, H * 0.06 + Math.sin(ph + i) * H * 0.03,
          s0 * 1.5, -H * 0.05 + Math.sin(ph + i * 1.4) * H * 0.05);
        ctx.stroke();
      }
    }
    if (spec.extra === 'claws') {                       // crab
      for (const side of [-1, 1]) {
        const cx = side * tw * 1.28, cy = -H * 0.4 + Math.sin(ph + side) * H * 0.04;
        ctx.lineWidth = W * 0.075;
        ctx.beginPath();
        ctx.moveTo(side * tw * 0.85, -H * 0.28);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.beginPath();                                 // pincer
        ctx.arc(cx, cy, W * 0.14, side > 0 ? -2.1 : 1.05, side > 0 ? 1.05 : -2.1);
        ctx.lineWidth = W * 0.1;
        ctx.stroke();
      }
    }
    ctx.restore();

    // ---- ears (behind the head line so they read as attached) ----
    ctx.save();
    ctx.fillStyle = shade(tier.color, -0.1);
    const cheerT = b.cheer > 0 ? Math.sin(Math.min(1, b.cheer) * Math.PI) : 0;
    const earTwitch = Math.sin(ph * 1.3) * 0.06
      + (this.mood === 'sad' ? 0.5 : 0) - cheerT * 0.22;
    for (const side of [-1, 1]) {
      const ex = side * W * 0.27, ey = -H * 0.97;
      if (['point', 'round', 'long', 'tuft', 'floppy', 'fan'].includes(spec.ears)) {
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(side * (0.12 + earTwitch));
        ctx.beginPath();
        if (spec.ears === 'point') {
          ctx.moveTo(-W * 0.11, H * 0.06);
          ctx.quadraticCurveTo(0, -H * 0.20, W * 0.11, H * 0.06);
        } else if (spec.ears === 'round') {
          ctx.arc(0, -H * 0.02, W * 0.12, 0, 7);
        } else if (spec.ears === 'long') {                // bunny / fennec
          ctx.ellipse(0, -H * 0.14, W * 0.075, H * 0.19, 0, 0, 7);
        } else if (spec.ears === 'tuft') {                // lynx / owl
          ctx.moveTo(-W * 0.08, H * 0.05);
          ctx.quadraticCurveTo(W * 0.02, -H * 0.26, W * 0.09, H * 0.05);
        } else if (spec.ears === 'floppy') {              // goat / poodle
          ctx.ellipse(side * W * 0.06, H * 0.03, W * 0.06, H * 0.13, side * 0.5, 0, 7);
        } else {                                          // fan (elephant)
          ctx.ellipse(side * W * 0.09, -H * 0.01, W * 0.15, H * 0.16, side * 0.25, 0, 7);
        }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,178,202,0.9)';          // inner ear
        ctx.beginPath();
        if (spec.ears === 'point') {
          ctx.moveTo(-W * 0.05, H * 0.04);
          ctx.quadraticCurveTo(0, -H * 0.12, W * 0.05, H * 0.04);
        } else if (spec.ears === 'round') {
          ctx.arc(0, -H * 0.02, W * 0.06, 0, 7);
        } else if (spec.ears === 'long') {
          ctx.ellipse(0, -H * 0.14, W * 0.035, H * 0.13, 0, 0, 7);
        } else if (spec.ears === 'fan') {
          ctx.ellipse(side * W * 0.09, -H * 0.01, W * 0.08, H * 0.09, side * 0.25, 0, 7);
        } else {
          ctx.ellipse(side * W * 0.04, 0, W * 0.03, H * 0.06, 0, 0, 7);
        }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = shade(tier.color, -0.1);
        ctx.restore();
      } else if (spec.ears === 'stalks') {                // crab eye stalks
        ctx.strokeStyle = shade(tier.color, -0.1);
        ctx.lineWidth = W * 0.05;
        ctx.beginPath();
        ctx.moveTo(side * W * 0.16, -H * 0.92);
        ctx.lineTo(ex, ey - H * 0.09 + Math.sin(ph + side) * H * 0.015);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex, ey - H * 0.10, W * 0.075, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(30,22,28,0.9)';
        ctx.beginPath();
        ctx.arc(ex, ey - H * 0.10, W * 0.035, 0, 7); ctx.fill();
        ctx.fillStyle = shade(tier.color, -0.1);
      }
    }
    ctx.restore();

    // ---- body ----
    const g = ctx.createLinearGradient(-tw, -H, tw * 0.6, 0);
    g.addColorStop(0, lite);
    g.addColorStop(0.45, tier.color);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    this.cupPath(ctx, W, H);
    ctx.fill();
    ctx.strokeStyle = shade(tier.color, -0.42);
    ctx.lineWidth = Math.max(1, W * 0.035);
    ctx.stroke();

    // belly patch
    ctx.save();
    this.cupPath(ctx, W, H);
    ctx.clip();
    ctx.fillStyle = spec.belly;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.ellipse(0, -H * 0.24, W * 0.3, H * 0.24, 0, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (spec.extra === 'shell') {                        // turtle shell plates
      ctx.strokeStyle = 'rgba(30,60,70,0.35)';
      ctx.lineWidth = Math.max(1, W * 0.03);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, -H * 0.3, W * (0.16 + i * 0.13), Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    }
    // liquid surface + gloss
    ctx.fillStyle = shade(tier.alt || lite, 0.1);
    ctx.beginPath();
    ctx.ellipse(0, -H * 0.9, tw * 0.93, tw * 0.3, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(-tw * 0.44, -H * 0.5, W * 0.07, H * 0.24, 0.13, 0, 7);
    ctx.fill();
    ctx.restore();

    // inner shading so the body reads as a rounded vessel, not a flat shape
    ctx.save();
    this.cupPath(ctx, W, H);
    ctx.clip();
    const shd = ctx.createLinearGradient(0, -H * 0.35, 0, H * 0.1);
    shd.addColorStop(0, 'rgba(0,0,0,0)');
    shd.addColorStop(1, 'rgba(0,0,0,0.36)');
    ctx.fillStyle = shd;
    ctx.fillRect(-tw * 1.2, -H * 0.4, W * 1.4, H * 0.6);
    const side = ctx.createLinearGradient(tw * 0.25, 0, tw * 1.1, 0);
    side.addColorStop(0, 'rgba(0,0,0,0)');
    side.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = side;
    ctx.fillRect(0, -H, tw * 1.2, H);
    ctx.restore();

    // rim: a bright band so the cup has a lip you can read
    ctx.fillStyle = shade(tier.color, 0.5);
    ctx.beginPath();
    ctx.ellipse(0, -H * 0.97, tw, tw * 0.3, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = shade(tier.alt || tier.color, 0.05);
    ctx.beginPath();
    ctx.ellipse(0, -H * 0.945, tw * 0.88, tw * 0.245, 0, 0, 7);
    ctx.fill();
    ctx.strokeStyle = shade(tier.color, -0.42);
    ctx.lineWidth = Math.max(1, W * 0.03);
    ctx.beginPath();
    ctx.ellipse(0, -H * 0.97, tw, tw * 0.3, 0, 0, 7);
    ctx.stroke();

    // ---- face ----
    const fy = -H * 0.56;
    const blink = ((time * 0.5 + b.id * 0.9) % 3.6) < 0.13;
    const eo = W * 0.15, er = Math.max(1.4, W * 0.055);
    ctx.fillStyle = 'rgba(28,20,26,0.9)';
    ctx.strokeStyle = 'rgba(28,20,26,0.9)';
    ctx.lineWidth = Math.max(1.2, W * 0.03);
    ctx.lineCap = 'round';
    if (spec.extra === 'frog') {                          // frog eyes ride on top
      for (const side of [-1, 1]) {
        const ex = side * W * 0.22, ey = -H * 1.0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(ex, ey, W * 0.13, 0, 7); ctx.fill();
        ctx.strokeStyle = shade(tier.color, -0.42);
        ctx.lineWidth = Math.max(1, W * 0.028); ctx.stroke();
        ctx.fillStyle = 'rgba(28,20,26,0.9)';
        ctx.beginPath();
        if (blink) { ctx.rect(ex - W * 0.07, ey - W * 0.012, W * 0.14, W * 0.024); }
        else ctx.arc(ex, ey, W * 0.055, 0, 7);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(28,20,26,0.85)';
      ctx.lineWidth = Math.max(1.2, W * 0.032);
      ctx.beginPath();                                    // wide frog smile
      ctx.arc(0, fy - H * 0.06, W * 0.2, 0.25, Math.PI - 0.25);
      ctx.stroke();
    } else {
      const glad = this.mood === 'happy' || b.cheer > 0.15;
      const glum = this.mood === 'sad';
      for (const side of [-1, 1]) {
        const ex = side * eo;
        ctx.beginPath();
        if (glad) {                                   // ^ ^ delighted
          ctx.arc(ex, fy + er * 0.5, er * 1.05, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        } else if (glum) {                            // droopy, looking down
          ctx.arc(ex, fy - er * 0.4, er, Math.PI * 0.2, Math.PI * 0.8);
          ctx.stroke();
        } else if (blink) { ctx.moveTo(ex - er, fy); ctx.lineTo(ex + er, fy); ctx.stroke(); }
        else { ctx.arc(ex, fy, er, 0, 7); ctx.fill(); }
      }
      ctx.fillStyle = 'rgba(255,140,170,0.4)';            // blush
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * W * 0.26, fy + er * 1.5, W * 0.065, W * 0.042, 0, 0, 7);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(28,20,26,0.9)';
      if (spec.extra === 'beak') {                        // duckling
        ctx.fillStyle = '#ff9c2e';
        ctx.beginPath();
        ctx.moveTo(-W * 0.11, fy + er * 1.5);
        ctx.quadraticCurveTo(0, fy + er * 3.6, W * 0.11, fy + er * 1.5);
        ctx.closePath(); ctx.fill();
      } else if (spec.extra === 'snout') {                // piglet
        ctx.fillStyle = 'rgba(255,150,175,0.95)';
        ctx.beginPath();
        ctx.ellipse(0, fy + er * 2.2, W * 0.11, W * 0.078, 0, 0, 7);
        ctx.fill();
        ctx.fillStyle = 'rgba(150,70,95,0.8)';
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(side * W * 0.04, fy + er * 2.2, W * 0.018, W * 0.028, 0, 0, 7);
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        if (this.mood === 'sad') {                        // small upside-down curve
          ctx.arc(0, fy + er * 2.5, er * 0.85, Math.PI * 1.15, Math.PI * 1.85);
        } else if (this.mood === 'happy' || b.cheer > 0.15) {
          ctx.arc(0, fy + er * 1.4, er * 1.05, 0.2, Math.PI - 0.2);   // big open smile
        } else {                                          // :3
          ctx.arc(-er * 0.6, fy + er * 1.7, er * 0.62, 0, Math.PI);
          ctx.arc(er * 0.6, fy + er * 1.7, er * 0.62, 0, Math.PI);
        }
        ctx.stroke();
      }
      if (spec.extra === 'horns') {                       // goat, bull, oryx, gazelle
        ctx.strokeStyle = '#f0e2c8'; ctx.lineWidth = W * 0.055; ctx.lineCap = 'round';
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(side * W * 0.17, -H * 0.94);
          ctx.quadraticCurveTo(side * W * 0.32, -H * 1.12, side * W * 0.2, -H * 1.24);
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(28,20,26,0.9)';
      } else if (spec.extra === 'trunk') {                 // elephant, tapir
        ctx.strokeStyle = shade(tier.color, -0.16); ctx.lineWidth = W * 0.1; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, fy + er * 1.4);
        ctx.quadraticCurveTo(W * 0.05, fy + er * 4.2, -W * 0.07 + Math.sin(ph) * W * 0.03, fy + er * 5.6);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(28,20,26,0.9)';
      } else if (spec.extra === 'gills') {                 // axolotl
        ctx.strokeStyle = 'rgba(255,150,190,0.85)'; ctx.lineWidth = W * 0.045;
        for (const side of [-1, 1]) for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(side * W * 0.3, fy + i * er * 0.9);
          ctx.lineTo(side * W * 0.46, fy + i * er * 1.6 - er * 0.5);
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(28,20,26,0.9)';
      } else if (spec.extra === 'crest') {                 // iguana, gecko, komodo
        ctx.fillStyle = shade(tier.color, -0.3);
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(-W * 0.1 + i * W * 0.05, -H * 0.96);
          ctx.lineTo(-W * 0.075 + i * W * 0.05, -H * 1.08);
          ctx.lineTo(-W * 0.05 + i * W * 0.05, -H * 0.96);
          ctx.closePath(); ctx.fill();
        }
      } else if (spec.extra === 'spines') {                // hedgehog
        ctx.fillStyle = shade(tier.color, -0.34);
        for (let i = 0; i < 7; i++) {
          const a = Math.PI * (1.08 + i * 0.14);
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * W * 0.4, -H * 0.72 + Math.sin(a) * H * 0.24);
          ctx.lineTo(Math.cos(a) * W * 0.56, -H * 0.72 + Math.sin(a) * H * 0.36);
          ctx.lineTo(Math.cos(a + 0.1) * W * 0.4, -H * 0.72 + Math.sin(a + 0.1) * H * 0.24);
          ctx.closePath(); ctx.fill();
        }
      } else if (spec.extra === 'spots') {                 // jaguar
        ctx.fillStyle = 'rgba(60,40,20,0.35)';
        for (let i = 0; i < 6; i++) {
          const a = i * 1.7;
          ctx.beginPath();
          ctx.ellipse(Math.cos(a) * W * 0.24, -H * 0.34 + Math.sin(a) * H * 0.18,
            W * 0.045, W * 0.035, a, 0, 7);
          ctx.fill();
        }
      } else if (spec.extra === 'stripes') {               // tiger, clownfish
        ctx.strokeStyle = 'rgba(40,28,20,0.4)'; ctx.lineWidth = W * 0.05;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(i * W * 0.16 - W * 0.06, -H * 0.16);
          ctx.lineTo(i * W * 0.16 + W * 0.04, -H * 0.44);
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(28,20,26,0.9)';
      } else if (spec.extra === 'hump') {                  // camel
        ctx.fillStyle = shade(tier.color, -0.16);
        ctx.beginPath();
        ctx.ellipse(0, -H * 0.98, W * 0.2, H * 0.1, 0, Math.PI, 0);
        ctx.fill();
      } else if (spec.extra === 'wings') {                 // ray
        ctx.fillStyle = shade(tier.color, -0.14);
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(side * W * 0.4, -H * 0.5);
          ctx.quadraticCurveTo(side * W * 0.95, -H * (0.42 + Math.sin(ph) * 0.06),
            side * W * 0.78, -H * 0.2);
          ctx.quadraticCurveTo(side * W * 0.5, -H * 0.3, side * W * 0.4, -H * 0.5);
          ctx.fill();
        }
      } else if (spec.extra === 'bigeyes') {               // owl
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        for (const side of [-1, 1]) {
          ctx.beginPath(); ctx.arc(side * eo, fy, er * 2.1, 0, 7); ctx.fill();
        }
        ctx.fillStyle = 'rgba(28,20,26,0.9)';
        for (const side of [-1, 1]) {
          ctx.beginPath(); ctx.arc(side * eo, fy, er * 1.05, 0, 7); ctx.fill();
        }
      } else if (spec.extra === 'sleepy') {                // sloth, gibbon
        ctx.strokeStyle = 'rgba(28,20,26,0.75)'; ctx.lineWidth = Math.max(1.2, W * 0.03);
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(side * eo, fy - er * 0.5, er * 1.1, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();
        }
      } else if (spec.extra === 'snoutfin') {              // dolphin, shark
        ctx.fillStyle = shade(tier.color, -0.22);
        ctx.beginPath();
        ctx.moveTo(-W * 0.09, -H * 0.98);
        ctx.quadraticCurveTo(W * 0.02, -H * 1.2, W * 0.13, -H * 0.96);
        ctx.closePath(); ctx.fill();
      } else if (spec.extra === 'bigbeak') {               // toucan, pelican, hornbill
        ctx.fillStyle = '#ff9c2e';
        ctx.beginPath();
        ctx.moveTo(-W * 0.1, fy + er * 1.2);
        ctx.quadraticCurveTo(W * 0.34, fy + er * 2.6, -W * 0.05, fy + er * 4.4);
        ctx.closePath(); ctx.fill();
      } else if (spec.extra === 'muzzle') {                // monkey, capybara, coati
        ctx.fillStyle = spec.belly;
        ctx.beginPath();
        ctx.ellipse(0, fy + er * 2.1, W * 0.15, W * 0.11, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(50,32,28,0.85)';
        ctx.beginPath();
        ctx.ellipse(0, fy + er * 1.5, W * 0.045, W * 0.032, 0, 0, 7); ctx.fill();
      }
      if (spec.extra === 'whiskers') {                    // seal, lynx
        ctx.globalAlpha = 0.5;
        for (const side of [-1, 1]) for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(side * W * 0.14, fy + er * 1.6 + i * er * 0.5);
          ctx.lineTo(side * W * 0.34, fy + er * 1.3 + i * er * 1.3);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }
  }

  // A tail curling out from behind the glass, swishing on its own rhythm.
  // Origin is the glass anchor; the sprite spans y ∈ [-h*0.96, h*0.04].
  drawCatTail(ctx, b, w, h, time) {
    const t = TIERS[b.tier - 1];
    const ph = time * 2.2 + b.id * 1.9;
    const sway = Math.sin(ph);
    // spine: leaves the glass near its foot, arcs out and up, hooks back at the tip
    const x0 = w * 0.14, y0 = -h * 0.07;
    const x1 = w * 0.40, y1 = -h * 0.09 + sway * h * 0.02;
    const x2 = w * 0.48 + sway * w * 0.07, y2 = -h * 0.29;
    const x3 = w * 0.27 + sway * w * 0.11, y3 = -h * 0.40;
    const pt = s => {
      const u = 1 - s;
      return {
        x: u * u * u * x0 + 3 * u * u * s * x1 + 3 * u * s * s * x2 + s * s * s * x3,
        y: u * u * u * y0 + 3 * u * u * s * y1 + 3 * u * s * s * y2 + s * s * s * y3,
      };
    };
    const N = 14, base = Math.max(1.5, w * 0.075);
    const left = [], right = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N, p = pt(s), q = pt(Math.min(1, s + 0.02));
      const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len, wd = base * (1 - s * 0.7);
      left.push([p.x + nx * wd, p.y + ny * wd]);
      right.push([p.x - nx * wd, p.y - ny * wd]);
    }
    ctx.save();
    ctx.fillStyle = shade(t.color, -0.1);
    ctx.beginPath();
    left.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath(); ctx.fill();
    const tip = pt(1);                                  // pale rounded tip
    ctx.fillStyle = shade(t.alt || t.color, 0.3);
    ctx.beginPath(); ctx.arc(tip.x, tip.y, base * 0.36, 0, 7); ctx.fill();
    ctx.restore();
  }

  // Ears + face for cat glasses, fizz bubbles for sodas, a glint for premiums.
  drawCharm(ctx, b, w, h, time) {
    const tier = TIERS[b.tier - 1];
    const topY = -h * 0.96;
    // creature cups draw their own ears/face/tail; this overlay is only for
    // the sprite-based tiers that are still plain cocktails
    if (CAT_TIERS.has(b.tier) && !creatureFor(this.level, b.tier)) {
      const ph = time * 2.2 + b.id * 1.9;
      const earW = w * 0.17, earH = h * 0.11;
      for (const side of [-1, 1]) {
        const ex = side * w * 0.19;
        const tilt = Math.sin(ph + (side > 0 ? 0.6 : 0)) * w * 0.015;
        ctx.fillStyle = shade(tier.color, -0.08);
        ctx.beginPath();
        ctx.moveTo(ex - earW / 2, topY + earH * 0.9);
        ctx.quadraticCurveTo(ex + tilt, topY - earH * 0.4, ex + earW / 2, topY + earH * 0.9);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,178,202,0.92)';
        ctx.beginPath();
        ctx.moveTo(ex - earW * 0.2, topY + earH * 0.75);
        ctx.quadraticCurveTo(ex + tilt, topY + earH * 0.04, ex + earW * 0.2, topY + earH * 0.75);
        ctx.closePath(); ctx.fill();
      }
      // face
      const fy = topY + h * 0.44;
      const blink = ((time * 0.55 + b.id * 0.7) % 3.4) < 0.13;
      const eo = w * 0.12, er = Math.max(1.3, w * 0.034);
      ctx.fillStyle = 'rgba(38,26,32,0.88)';
      ctx.strokeStyle = 'rgba(38,26,32,0.88)';
      ctx.lineWidth = Math.max(1.2, w * 0.024);
      ctx.lineCap = 'round';
      for (const side of [-1, 1]) {
        const ex = side * eo;
        ctx.beginPath();
        if (blink) { ctx.moveTo(ex - er, fy); ctx.lineTo(ex + er, fy); ctx.stroke(); }
        else { ctx.arc(ex, fy, er, 0, 7); ctx.fill(); }
      }
      ctx.fillStyle = 'rgba(255,140,170,0.38)';
      for (const side of [-1, 1]) {
        ctx.beginPath(); ctx.ellipse(side * w * 0.2, fy + er * 1.3, w * 0.05, w * 0.033, 0, 0, 7); ctx.fill();
      }
      ctx.beginPath();   // :3 mouth
      ctx.arc(-er * 0.55, fy + er * 1.45, er * 0.6, 0, Math.PI);
      ctx.arc(er * 0.55, fy + er * 1.45, er * 0.6, 0, Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 0.45;   // whiskers
      for (const side of [-1, 1]) for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(side * w * 0.14, fy + i * er * 0.7 + er * 0.9);
        ctx.lineTo(side * w * 0.27, fy + i * er * 1.5 + er * 0.7);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    if (FIZZ_TIERS.has(b.tier)) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < 5; i++) {
        const seed = i * 1.7 + b.id * 0.9;
        const t01 = (time * 0.55 + seed) % 1;
        const r = Math.max(0.8, w * 0.024 * (1 - t01 * 0.4));
        ctx.globalAlpha = 0.5 * (1 - t01);
        ctx.beginPath();
        ctx.arc(Math.sin(seed * 3.1) * w * 0.16, topY + h * (0.74 - t01 * 0.34), r, 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (GLINT_TIERS.has(b.tier)) {
      const g = ((time * 0.5 + b.id) % 3) / 3;
      if (g < 0.34) {
        ctx.save();
        ctx.globalAlpha = 0.32 * Math.sin(g * 3 * Math.PI);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = w * 0.05;
        const gx = -w * 0.5 + g * 3 * w;
        ctx.beginPath();
        ctx.moveTo(gx, topY + h * 0.16);
        ctx.lineTo(gx - w * 0.1, topY + h * 0.72);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawBall(ctx, b, p, time) {
    const r = b.r * p.s;
    const g = ctx.createRadialGradient(p.x - r * 0.3, p.y - r * 1.1, r * 0.2, p.x, p.y - r * 0.8, r * 1.1);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, '#ff6da0');
    g.addColorStop(1, '#c77dff');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y - r * 0.8, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - r * 0.8, r, r * 0.4, time % (Math.PI * 2), 0, Math.PI * 2);
    ctx.stroke();
    // glow on night table
    ctx.globalAlpha = 0.25 + 0.1 * Math.sin(time * 3);
    ctx.fillStyle = '#ff9ad0';
    ellipse(ctx, p.x, p.y, r * 1.3, r * 0.5);
    ctx.globalAlpha = 1;
  }

  drawTee(ctx, game, time) {
    const b = { tier: game.tee.tier, x: 0, z: TABLE.launchZ, r: TIERS[game.tee.tier - 1].r, y: 0, sleeping: true, id: 0, justHit: 0, tee: true };
    const p = this.view.project(0, 0, TABLE.launchZ);
    ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.2 * Math.sin(time * 4)})`;
    ctx.lineWidth = 2.5;
    ellipseStroke(ctx, p.x, p.y, (b.r + 10) * p.s, (b.r + 10) * p.s * 0.45);
    this.drawBody(ctx, b, time, this.gloss());
  }

  drawAim(ctx, game) {
    const view = this.view;
    const a = game.aim;
    const maxLen = 760;
    let ox = 0, oz = TABLE.launchZ;
    let dx = a.dirX, dz = a.dirZ;
    const r = TIERS[game.tee.tier - 1].r;

    let bestT = maxLen, hitWall = null;
    for (const w of game.phys.walls) {
      const denom = dx * w.nx + dz * w.nz;
      if (denom >= 0) continue;
      const t = ((w.ax - ox) * w.nx + (w.az - oz) * w.nz - r) / -denom;
      if (t > 0 && t < bestT) {
        const cx = ox + dx * t, cz = oz + dz * t;
        const ex = w.bx - w.ax, ez = w.bz - w.az;
        const u = ((cx - w.ax) * ex + (cz - w.az) * ez) / (ex * ex + ez * ez);
        if (u >= -0.05 && u <= 1.05) { bestT = t; hitWall = w; }
      }
    }
    for (const b of game.phys.bodies) {
      if (b.dead) continue;
      const fx = b.x - ox, fz = b.z - oz;
      const proj = fx * dx + fz * dz;
      if (proj <= 0) continue;
      const perp2 = fx * fx + fz * fz - proj * proj;
      const rr = (b.r + r) * (b.r + r);
      if (perp2 < rr) {
        const t = proj - Math.sqrt(rr - perp2);
        if (t > 0 && t < bestT) { bestT = t; hitWall = null; }
      }
    }

    const powFrac = Math.min(1, a.power / 1100);
    // A flick that points at or behind the near edge can't be launched
    // (game.flick rejects dirZ <= 0.05). Show that in red so the aim never
    // looks valid when it isn't — a silent no-op reads as "rigged".
    const invalid = dz <= 0.05;
    const line = invalid ? `rgba(255,90,90,${0.5 + powFrac * 0.3})` : `rgba(255,255,255,${0.35 + powFrac * 0.45})`;
    dotLine(ctx, view, ox, oz, ox + dx * bestT, oz + dz * bestT, line);
    if (hitWall && !invalid && game.aimAssist !== false) {
      const vn = dx * hitWall.nx + dz * hitWall.nz;
      const rx = dx - 2 * vn * hitWall.nx, rz = dz - 2 * vn * hitWall.nz;
      const hx = ox + dx * bestT, hz = oz + dz * bestT;
      dotLine(ctx, view, hx, hz, hx + rx * 180, hz + rz * 180, 'rgba(255,255,255,0.25)');
    }

    const p = view.project(0, 0, TABLE.launchZ);
    ctx.strokeStyle = invalid ? '#ff5a5a' : (powFrac > 0.85 ? '#ff6d7f' : '#7fe3ff');
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 30, 34, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * powFrac);
    ctx.stroke();
  }

  drawDocks(ctx, game, time) {
    const view = this.view;
    for (const o of game.orders) {
      if (!o) continue;
      const p = view.project(o.x, RAIL_H, o.z + 40);
      const s = p.s;
      const w = 168 * s, h = 74 * s;
      ctx.fillStyle = 'rgba(24,32,46,0.82)';
      roundRect(ctx, p.x - w / 2, p.y - h, w, h, 14 * s);
      ctx.fill();
      ctx.strokeStyle = '#ffd97b';
      ctx.lineWidth = 2.5 * s;
      roundRect(ctx, p.x - w / 2, p.y - h, w, h, 14 * s);
      ctx.stroke();
      const img = this.assets.image(tierAssetKey(o.tier));
      const iw = 54 * s;
      if (img) ctx.drawImage(img, p.x - iw / 2 - 30 * s, p.y - h + 8 * s, iw, iw);
      const frac = 1 - o.t / ORDERS.softTimer;
      ctx.strokeStyle = frac < 0.25 ? '#ff6d7f' : '#7fe3ff';
      ctx.lineWidth = 4 * s;
      ctx.beginPath();
      ctx.arc(p.x + 38 * s, p.y - h / 2, 16 * s, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
      ctx.stroke();
      const cg = view.project(o.x, 0, o.z);
      ctx.strokeStyle = `rgba(255,217,123,${0.3 + 0.15 * Math.sin(time * 3 + o.slot)})`;
      ctx.lineWidth = 3;
      ellipseStroke(ctx, cg.x, cg.y, ORDERS.dockR * cg.s, ORDERS.dockR * cg.s * 0.45);
    }
  }

  drawWind(ctx, game, time) {
    const w = game.wind;
    const alpha = w.active ? 0.55 : 0.28;
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const z = 180 + (i * 97) % 620;
      const span = TABLE.halfW * 2;
      const x0 = -TABLE.halfW + ((i * 211 + time * (w.active ? 700 : 260)) % span + span) % span;
      const x = w.dir > 0 ? x0 : TABLE.halfW - (x0 + TABLE.halfW);
      const p0 = this.view.project(x - 46 * w.dir, 6, z);
      const p1 = this.view.project(x, 6, z + 6);
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.quadraticCurveTo((p0.x + p1.x) / 2, p0.y - 6, p1.x, p1.y);
      ctx.stroke();
    }
    // gust direction arrow near the top of the table
    const ap = this.view.project(0, RAIL_H + 30, TABLE.length - 120);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#eaf6ff';
    ctx.save();
    ctx.translate(ap.x, ap.y);
    ctx.scale(w.dir, 1);
    ctx.beginPath();
    ctx.moveTo(-26, -5); ctx.lineTo(8, -5); ctx.lineTo(8, -12); ctx.lineTo(26, 0);
    ctx.lineTo(8, 12); ctx.lineTo(8, 5); ctx.lineTo(-26, 5);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

// ---- small helpers ----

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt >= 0) {
    r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt;
  } else {
    r *= 1 + amt; g *= 1 + amt; b *= 1 + amt;
  }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

// Blend two hex colours; t is how much of `b` to take.
function mix(a, b, t) {
  const na = parseInt(a.slice(1), 16), nb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round((((na >> s) & 255) * (1 - t)) + (((nb >> s) & 255) * t));
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function quad(ctx, view, ...pts) {
  ctx.beginPath();
  pts.map(([x, z]) => view.project(x, 0, z)).forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
}

function softShadow(ctx, x, y, rx, ry, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, 0.1));
  g.addColorStop(0, `rgba(8,14,22,${alpha})`);
  g.addColorStop(0.7, `rgba(8,14,22,${alpha * 0.55})`);
  g.addColorStop(1, 'rgba(8,14,22,0)');
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, Math.max(ry / Math.max(rx, 0.1), 0.05));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(rx, 0.1), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
  ctx.fill();
}

function ellipseStroke(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function dotLine(ctx, view, x0, z0, x1, z1, style) {
  ctx.fillStyle = style;
  const steps = 14;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const p = view.project(x0 + (x1 - x0) * t, 2, z0 + (z1 - z0) * t);
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(1.5, 3.4 * p.s), 0, Math.PI * 2);
    ctx.fill();
  }
}

function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// The UI (collection, passport, HUD, order cards) must show the same creature
// the player meets on the table, so icons are rendered from the very same
// drawing code rather than the old cocktail sprites. Cached per tier+size.
const ICON_CACHE = new Map();
export function creatureIcon(tierId, px = 128, level = null) {
  const spec = creatureFor(level, tierId);
  if (!spec) return null;                             // tier 11 keeps its sprite
  const key = tierId + ':' + px + ':' + spec.name;
  if (ICON_CACHE.has(key)) return ICON_CACHE.get(key);
  const c = document.createElement('canvas');
  c.width = px; c.height = px;
  const ctx = c.getContext('2d');
  const tier = tierStyle(level, tierId, TIERS);
  const W = px * 0.62, H = W * 1.22;
  ctx.translate(px / 2, px * 0.93);
  // t=1.1 so nobody is mid-blink in a still icon
  Renderer.prototype.drawCreature.call(
    { cupPath: Renderer.prototype.cupPath }, ctx,
    { tier: tierId, id: 0, spec }, tier, W, H, 1.1);
  const url = c.toDataURL();
  ICON_CACHE.set(key, url);
  return url;
}
