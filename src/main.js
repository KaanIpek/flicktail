// Boot, screens, and the loop.

import { TABLE, TIERS } from './config.js';
import { LEVELS, levelById } from './levels.js';
import { Physics } from './physics.js';
import { View } from './view.js';
import { Slingshot } from './input.js';
import { Game, S } from './game.js';
import { Renderer } from './render.js';
import { Backdrop } from './backdrop.js';
import { Fx } from './fx.js';
import { AudioMan } from './audio.js';
import { Assets } from './assets.js';
import { Save } from './save.js';
import { UI } from './ui.js';

const stage = document.getElementById('stage');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const uiRoot = document.getElementById('ui');

const save = new Save();
const audio = new AudioMan();
audio.muted.music = !save.data.settings.music;
audio.muted.sfx = !save.data.settings.sfx;
const assets = new Assets();
const view = new View();
const physics = new Physics();
const fx = new Fx();
const game = new Game(physics, fx, audio, save);
const ui = new UI(uiRoot, save, audio);
const backdropCanvas = document.createElement('canvas');
backdropCanvas.id = 'bg';
stage.insertBefore(backdropCanvas, canvas);
const backdrop = new Backdrop(backdropCanvas, assets);
const renderer = new Renderer(view, assets);
const input = new Slingshot(canvas, view);

let screen = 'title';       // title | map | collection | intro | game | result
let currentLevel = null;
let zenMode = false;
let paused = false;
let W = 0, H = 0, DPR = 1;

// ---- sizing ----

function resize() {
  const vw = window.visualViewport ? window.visualViewport.width : innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : innerHeight;
  // portrait stage, letterboxed on wide screens
  const aspect = 9 / 16;
  let w = vw, h = vh;
  if (w / h > aspect) w = h * aspect;
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = Math.round(w * DPR);
  H = Math.round(h * DPR);
  for (const c of [canvas, backdropCanvas]) {
    c.width = W; c.height = H;
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    c.style.left = (vw - w) / 2 + 'px';
    c.style.top = '0px';
    c.style.position = 'absolute';
  }
  uiRoot.style.width = w + 'px';
  uiRoot.style.height = h + 'px';
  uiRoot.style.left = (vw - w) / 2 + 'px';
  uiRoot.style.top = '0px';
  view.camH = 1100;
  view.camZ = -420;
  view.pitch = 1.05;
  view.fit(W, H, TABLE.halfW, 0.97, 0.965);
  if (currentLevel) renderer.setLevel(currentLevel, W, H);
  backdrop.render();
}
addEventListener('resize', resize);
if (window.visualViewport) visualViewport.addEventListener('resize', resize);

// ---- asset manifest ----

function preload() {
  const entries = [];
  for (let i = 1; i <= 11; i++) {
    const k = 'tier' + String(i).padStart(2, '0');
    entries.push([k, 'assets/drinks/' + k + '.png']);
  }
  for (const l of LEVELS) entries.push(['bg_' + l.backdrop, 'assets/backdrops/' + l.backdrop + '.webp']);
  // fire and forget; the game renders fallbacks until each arrives
  for (const [k, u] of entries) assets.load(k, u).then(() => {
    if (screen === 'title' || screen === 'map') { /* backgrounds refresh next frame */ }
    backdrop.render();
  });
  const sfx = ['clink', 'thunk', 'flick', 'splash', 'splashSmall', 'order', 'win', 'lose', 'tap', 'fanfare'];
  for (const s of sfx) audio.load(s, 'assets/audio/' + s + '.ogg');
  for (let i = 2; i <= 11; i++) audio.load('merge' + i, 'assets/audio/merge' + i + '.ogg');
  for (const m of ['music_morning', 'music_golden', 'music_night', 'music_neon']) {
    audio.load(m, 'assets/audio/' + m + '.ogg');
  }
}

function musicFor(level) {
  if (!level) return 'music_morning';
  if (level.time === 'night') return 'music_neon';
  if (level.time === 'sunset') return 'music_golden';
  return 'music_morning';
}

// ---- screen flow ----

function showTitle() {
  screen = 'title';
  zenMode = false;
  input.enabled = false;
  backdrop.set('waikiki');
  backdrop.render();
  ui.showTitle();
  audio.music('music_morning');
}

function showMap() {
  screen = 'map';
  input.enabled = false;
  ui.showMap();
}

function startLevel(id, { zen = false, seed = null, restore = null } = {}) {
  const level = levelById(id);
  if (!level) return;
  currentLevel = level;
  zenMode = zen;
  screen = 'intro';
  paused = false;
  backdrop.set(level.backdrop);
  backdrop.render();
  renderer.setLevel(level, W, H);
  game.loadLevel(level, { zen, seed, restore });
  ui.showIntro(level, zen);
  audio.music(musicFor(level));
}

function beginPlay() {
  screen = 'game';
  input.enabled = true;
  ui.showHud(game);
  if (!save.data.seenTutorial && currentLevel.id === 1) {
    ui.showTutorial(1);
    save.data.seenTutorial = true;
    save.write();
  }
}

// ---- UI wiring ----

ui.on('play', () => { audio.unlock(); showMap(); });
ui.on('title', showTitle);
ui.on('map', () => { game.clearSaved(); showMap(); });
ui.on('collection', () => { screen = 'collection'; ui.showCollection(); });
ui.on('level', d => { audio.unlock(); startLevel(+d.id); });
ui.on('zen', d => { audio.unlock(); startLevel(+d.id, { zen: true }); });
ui.on('start', beginPlay);
ui.on('replay', () => { ui.closeModal(); paused = false; startLevel(currentLevel.id, { zen: zenMode }); });
ui.on('retry', () => startLevel(currentLevel.id, { seed: game.result?.seed }));
ui.on('shuffle', () => startLevel(currentLevel.id));
ui.on('pause', () => { paused = true; ui.showPause(game, save.data.settings); });
ui.on('resume', () => { paused = false; ui.closeModal(); });
ui.on('tgMusic', () => {
  save.data.settings.music = !save.data.settings.music; save.write();
  audio.setMuted('music', !save.data.settings.music);
  ui.closeModal(); ui.showPause(game, save.data.settings);
});
ui.on('tgSfx', () => {
  save.data.settings.sfx = !save.data.settings.sfx; save.write();
  audio.setMuted('sfx', !save.data.settings.sfx);
  ui.closeModal(); ui.showPause(game, save.data.settings);
});
ui.on('tgHaptics', () => {
  save.data.settings.haptics = !save.data.settings.haptics; save.write();
  ui.closeModal(); ui.showPause(game, save.data.settings);
});

// ---- game events -> UI ----

game.onEvent = (name, data) => {
  if (screen !== 'game' && name !== 'finished') return;
  switch (name) {
    case 'combo': ui.showCombo(data.mult); if (data.callout && data.mult >= 2) ui.showCallout(data.callout); break;
    case 'comboEnd': ui.hideCombo(); break;
    case 'newTier': {
      const t = TIERS[data - 1];
      ui.toast(`New mix: ${t.name}! 🍹`);
      if (data >= 8) ui.showCallout(t.name + '!');
      break;
    }
    case 'goalDone': ui.toast('Signature drink mixed! 🌟'); break;
    case 'bankMerge': ui.showCallout('Wall Kiss!'); break;
    case 'orderServed': ui.toast('Order served! +' + data.pts); break;
    case 'spilled': ui.toast('Spilled! 🌊', 900); break;
    case 'washed': ui.toast('Washed away!', 900); break;
    case 'autoServed': ui.toast('Auto-served ☀', 900); break;
    case 'atlasClink': ui.showCallout('LEGENDARY CLINK!'); break;
    case 'flick': if (game.flicksLeft === 8 && !game.zen) ui.toast('8 drinks left in the cooler!'); break;
    case 'finished':
      input.enabled = false;
      setTimeout(() => { screen = 'result'; ui.showResult(game, data); }, data.won ? 1300 : 900);
      break;
  }
};

// ---- input wiring ----

input.onAim = a => {
  if (screen !== 'game' || paused) { game.aim = null; return; }
  if (a) game.setAim(a.dirX, a.dirZ, a.power);
  else game.aim = null;
};
input.onFlick = () => {
  if (screen !== 'game' || paused) return;
  const before = game.maxTierMade;
  if (game.flick() && save.data.seenTutorial && before === 0 && currentLevel.id === 1) {
    setTimeout(() => ui.showTutorial(2), 900);
  }
};

// ---- loop ----

const FIXED = 1 / 120;
let last = performance.now();
let acc = 0;
let uiTick = 0;

function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.25) dt = 0.25;

  if (screen === 'game' && !paused) {
    acc += dt;
    while (acc >= FIXED) {
      game.update(FIXED);
      acc -= FIXED;
    }
    fx.update(dt);
  } else if (screen === 'result') {
    game.update(dt > FIXED ? FIXED : dt);   // let the celebration physics run
    fx.update(dt);
  }

  backdrop.update(dt);

  // main canvas
  ctx.clearRect(0, 0, W, H);
  if (game.level && (screen === 'game' || screen === 'result' || screen === 'intro')) {
    ctx.save();
    if (fx.shake > 0) ctx.translate(fx.shakeX * DPR, fx.shakeY * DPR);
    renderer.draw(ctx, game, now / 1000);
    fx.draw(ctx, view);
    drawFloatingTexts();
    ctx.restore();
    if (fx.flash > 0) {
      ctx.globalAlpha = fx.flash;
      ctx.fillStyle = fx.flashColor;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  if (screen === 'game' && !paused) {
    uiTick += dt;
    if (uiTick > 0.1) { uiTick = 0; ui.updateHud(game); }
  }
}

function drawFloatingTexts() {
  for (const t of fx.texts) {
    const p = view.project(t.x, t.y, t.z);
    ctx.globalAlpha = Math.min(1, t.life * 1.6);
    ctx.font = `800 ${Math.round(26 * t.size * p.s * 2.2)}px "Baloo 2", sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(20,30,45,0.75)';
    ctx.strokeText(t.str, p.x, p.y);
    ctx.fillStyle = t.color;
    ctx.fillText(t.str, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

// ---- lifecycle ----

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (screen === 'game') game.autosave();
    save.write();
  }
});
addEventListener('pointerdown', () => audio.unlock(), { once: true });

// service worker (only when served over http(s))
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// ---- boot ----

// QA / debug hook (harmless in production, invaluable for automated testing)
window.__ft = {
  game, view, renderer, physics, fx, save, audio, backdrop,
  startLevel, showMap,
  async spawn(tier, x, z, vx = 0, vz = 0) {
    const { makeBody } = await import('./physics.js');
    const { TIERS } = await import('./config.js');
    const b = physics.add(makeBody(tier, x, z, TIERS[tier - 1].r));
    b.vx = vx; b.vz = vz; b.sleeping = !(vx || vz); b.immunity = 1.5;
    return b.id;
  },
  state() {
    return {
      screen, score: game.score, flicks: game.flicksLeft, combo: game.combo,
      maxTier: game.maxTierMade, goalDone: game.goalDone, state: game.state,
      bodies: physics.bodies.filter(b => !b.dead).map(b => ({
        id: b.id, tier: b.tier, x: Math.round(b.x), z: Math.round(b.z),
        sp: Math.round(Math.hypot(b.vx, b.vz)), sleeping: b.sleeping, kind: b.kind,
      })),
    };
  },
  retune(camH, camZ, pitch, nearFrac, baseFrac) {
    view.camH = camH; view.camZ = camZ; view.pitch = pitch;
    view.fit(W, H, TABLE.halfW, nearFrac ?? 0.97, baseFrac ?? 0.965);
    if (currentLevel) renderer.setLevel(currentLevel, W, H);
    return [view.project(0, 0, TABLE.length).y / H, view.project(0, 0, TABLE.foulLine).y / H];
  },
};

resize();
preload();

const saved = Game.savedRun();
if (saved && levelById(saved.level)) {
  // resume mid-run: jump straight back to the table
  currentLevel = levelById(saved.level);
  backdrop.set(currentLevel.backdrop);
  renderer.setLevel(currentLevel, W, H);
  game.loadLevel(currentLevel, { seed: saved.seed, restore: saved });
  screen = 'game';
  ui.showHud(game);
  input.enabled = true;
  audio.music(musicFor(currentLevel));
} else {
  showTitle();
}
requestAnimationFrame(frame);
