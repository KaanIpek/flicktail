// Boot, screens, and the loop.

import { TABLE, TIERS } from './config.js';
import { LEVELS, levelById } from './levels.js';
import { Physics } from './physics.js';
import { View } from './view.js';
import { Slingshot } from './input.js';
import { Game, S } from './game.js';
import { Ads } from './ads.js';
import { Renderer } from './render.js';
import { Backdrop } from './backdrop.js';
import { Fx } from './fx.js';
import { AudioMan } from './audio.js';
import { Assets } from './assets.js';
import { Save, todayKey, daySeed } from './save.js';
import { UI } from './ui.js';

const stage = document.getElementById('stage');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const uiRoot = document.getElementById('ui');

const save = new Save();
const audio = new AudioMan();
audio.muted.music = !save.data.settings.music;
audio.muted.sfx = !save.data.settings.sfx;
audio.hapticsOn = save.data.settings.haptics;
const assets = new Assets();
const view = new View();
const physics = new Physics();
const fx = new Fx();
const game = new Game(physics, fx, audio, save);
const ads = new Ads();
// the game only offers a refill when an ad can actually be shown
game.canOfferRefill = () => ads.available();
game.aimAssist = save.data.settings.aimLine;
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
let pendingUpdate = false;   // a new build is waiting; apply it out of play
let W = 0, H = 0, DPR = 1;

// ---- sizing ----

function resize() {
  const vw = window.visualViewport ? window.visualViewport.width : innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : innerHeight;
  // portrait stage; on landscape/desktop windows allow a slightly wider column
  const aspect = vw > vh ? 0.60 : 9 / 16;
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
  // Pulled-in camera: the near rails run off the bottom corners so the player
  // sits AT the table; the far rail lands around 0.40H under the backdrop.
  view.camH = 1050;
  view.camZ = -460;
  view.pitch = 1.00;
  view.fit(W, H, TABLE.halfW, 1.18, 1.02);
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
  // Only what the player hears on the way in. The other seven tracks and two
  // ambient beds stream in via audio.ensure() when their destination opens —
  // pulling all ~6 MB up front delayed the first flick for audio most
  // sessions never reach.
  audio.load('music_morning', 'assets/audio/music_morning.mp3');
  audio.load('amb_beach_day', 'assets/audio/amb_beach_day.mp3');
  for (const s of SFX) audio.load('sfx_' + s, 'assets/audio/sfx/' + s + '.mp3');
}

audio.urlFor = n => n.startsWith('sfx_')
  ? `assets/audio/sfx/${n.slice(4)}.mp3`
  : `assets/audio/${n}.mp3`;

// sampled one-shots; audio.play falls back to the procedural voice per sound
// until (or unless) its sample has arrived
const SFX = ['meow', 'meow_big', 'purr', 'clink', 'merge_pop', 'slide', 'whoosh',
  'shaker', 'splash', 'pour', 'ice', 'chime', 'fanfare', 'fail'];

// Music is keyed per destination, not just per time of day — Cancún and
// Waikiki shouldn't share a track. Falls back to the time-of-day pick.
const MUSIC_BY_LEVEL = {
  1: 'music_morning', 2: 'music_latin', 3: 'music_latin', 4: 'music_golden',
  5: 'music_riviera', 6: 'music_riviera', 7: 'music_last', 8: 'music_neon',
  9: 'music_desert', 10: 'music_morning', 11: 'music_last', 12: 'music_lagoon',
};

function musicFor(level) {
  if (!level) return 'music_morning';
  if (MUSIC_BY_LEVEL[level.id]) return MUSIC_BY_LEVEL[level.id];
  if (level.time === 'night') return 'music_neon';
  if (level.time === 'sunset') return level.id >= 7 ? 'music_last' : 'music_golden';
  return 'music_morning';
}

function ambientFor(level) {
  if (!level) return 'amb_beach_day';
  if (level.time === 'night') return 'amb_night';
  if (level.time === 'sunset') return 'amb_beach_sunset';
  return 'amb_beach_day';
}

// ---- screen flow ----

function setBgFill(key) {
  const el = document.getElementById('bgfill');
  if (el) el.style.backgroundImage = `url(assets/backdrops/${key}.webp)`;
}

function showTitle() {
  if (pendingUpdate) { location.reload(); return; }
  screen = 'title';
  zenMode = false;
  input.enabled = false;
  backdrop.set('waikiki');
  backdrop.render();
  setBgFill('waikiki');
  const run = Game.savedRun();
  const resume = run && levelById(run.level)
    ? { place: levelById(run.level).place, score: run.score } : null;
  ui.showTitle(resume);
  audio.music('music_morning');
  audio.ambient('amb_beach_day');
}

// Resume the autosaved campaign run straight into play, skipping the intro.
function resumeSaved() {
  const s = Game.savedRun();
  const level = s && levelById(s.level);
  if (!level) { game.clearSaved(); showTitle(); return; }
  audio.unlock();
  currentLevel = level;
  zenMode = false;
  paused = false;
  backdrop.set(level.backdrop); backdrop.render(); setBgFill(level.backdrop);
  renderer.setLevel(level, W, H);
  game.loadLevel(level, { seed: s.seed, restore: s });
  audio.music(musicFor(level)); audio.ambient(ambientFor(level));
  beginPlay();
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
  setBgFill(level.backdrop);
  renderer.setLevel(level, W, H);
  game.loadLevel(level, { zen, seed, restore });
  ui.showIntro(level, zen);
  audio.music(musicFor(level));
  audio.ambient(ambientFor(level));
  // the bar cat greets you once, quietly, as the destination opens
  if (level.barCat) setTimeout(() => audio.play('purr', { volume: 0.3 }), 700);
}

// A clean table for the score-chase modes (Waikiki: no hazards, no orders).
function startEndless() {
  const level = levelById(1);
  currentLevel = level;
  zenMode = false;
  screen = 'intro';
  paused = false;
  backdrop.set(level.backdrop); backdrop.render(); setBgFill(level.backdrop);
  renderer.setLevel(level, W, H);
  game.loadLevel(level, { endless: true });
  ui.showModeIntro('endless');
  audio.music(musicFor(level)); audio.ambient(ambientFor(level));
}

function startDaily() {
  const key = todayKey();
  const level = levelById(1 + (daySeed(key) % LEVELS.length));  // the day picks a destination
  currentLevel = level;
  zenMode = false;
  screen = 'intro';
  paused = false;
  backdrop.set(level.backdrop); backdrop.render(); setBgFill(level.backdrop);
  renderer.setLevel(level, W, H);
  game.loadLevel(level, { endless: true, daily: true, seed: daySeed(key), dayKey: key });
  ui.showModeIntro('daily', { level, streak: save.liveStreak(key), done: save.data.dailyTodayDone === key });
  audio.music(musicFor(level)); audio.ambient(ambientFor(level));
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
ui.on('resumeRun', () => resumeSaved());
ui.on('title', showTitle);
ui.on('map', () => { game.clearSaved(); showMap(); });
ui.on('collection', () => { screen = 'collection'; ui.showCollection(); });
ui.on('passport', () => { screen = 'passport'; ui.showPassport(); });
ui.on('level', d => { audio.unlock(); startLevel(+d.id); });
ui.on('zen', d => { audio.unlock(); startLevel(+d.id, { zen: true }); });
ui.on('endless', () => { audio.unlock(); startEndless(); });
ui.on('daily', () => { audio.unlock(); startDaily(); });
ui.on('endlessAgain', () => startEndless());
ui.on('start', beginPlay);
// Restart the CURRENT run in its own mode — a campaign restart must not silently
// drop an Endless/Daily run back to a finite campaign level (or re-roll the
// day's shared board). game keeps the mode flags from loadLevel.
function restartCurrent(seed = null) {
  ui.closeModal(); paused = false;
  if (game.daily) startDaily();
  else if (game.endless) startEndless();
  else startLevel(currentLevel.id, { zen: zenMode, seed });
}
ui.on('replay', () => restartCurrent());
ui.on('retry', () => restartCurrent(game.result?.seed));
ui.on('shuffle', () => startLevel(currentLevel.id));
ui.on('pause', () => { paused = true; ui.showPause(game, save.data.settings); });
ui.on('finishNow', () => game.finishNow());
ui.on('resume', () => { paused = false; ui.closeModal(); });
ui.on('refillYes', async () => {
  ui.closeModal();
  const rewarded = await ads.show();
  if (rewarded) game.grantFlicks();
  else game.declineRefill();
});
ui.on('refillNo', () => { ui.closeModal(); game.declineRefill(); });
function refreshSettingsUI() {
  // toggles live on both the in-game pause modal and the title About screen
  if (screen === 'about') { ui.showAbout(save.data.settings); }
  else { ui.closeModal(); ui.showPause(game, save.data.settings); }
}
ui.on('about', () => { screen = 'about'; ui.showAbout(save.data.settings); });
ui.on('tgMusic', () => {
  save.data.settings.music = !save.data.settings.music; save.write();
  audio.setMuted('music', !save.data.settings.music);
  refreshSettingsUI();
});
ui.on('tgSfx', () => {
  save.data.settings.sfx = !save.data.settings.sfx; save.write();
  audio.setMuted('sfx', !save.data.settings.sfx);
  refreshSettingsUI();
});
ui.on('tgHaptics', () => {
  save.data.settings.haptics = !save.data.settings.haptics; save.write();
  audio.hapticsOn = save.data.settings.haptics;
  refreshSettingsUI();
});
ui.on('tgAim', () => {
  save.data.settings.aimLine = !save.data.settings.aimLine; save.write();
  game.aimAssist = save.data.settings.aimLine;
  refreshSettingsUI();
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
    case 'goalDone': ui.toast('Signature drink mixed! Keep going for stars 🌟', 2600); break;
    case 'bankMerge': ui.showCallout('Wall Kiss!'); break;
    case 'orderServed': ui.toast('Order served! +' + data.pts); break;
    case 'spilled':
      if (currentLevel.id === 1 && !window.__spillTaught) {
        window.__spillTaught = true;
        ui.showTutorial(3);
      } else ui.toast('Spilled! 🌊', 900);
      break;
    case 'washed': ui.toast('Washed away!', 900); break;
    case 'autoServed': ui.toast('Auto-served ☀', 900); break;
    case 'atlasClink': ui.showCallout('LEGENDARY CLINK!'); break;
    case 'flick': if (game.flicksLeft === 8 && !game.zen) ui.toast('8 drinks left in the cooler!'); break;
    case 'offerRefill':
      input.enabled = false;
      ui.showRefillOffer(game, data);
      break;
    case 'refilled':
      input.enabled = true;
      ui.toast(`+${data.n} drinks in the cooler!`, 1400);
      break;
    case 'outOfDrinks': ui.toast('Cooler empty — let the table settle', 1100); break;
    case 'finished':
      input.enabled = false;
      if (data.won && !game.reducedMotion) { fx.confetti(W, H); setTimeout(() => fx.confetti(W, H, 70), 260); }
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
    game.advanceTimeScale(dt);         // recover slow-mo on REAL time
    const sdt = dt * game.timeScale;   // simulation runs on scaled time
    acc += sdt;
    while (acc >= FIXED) {
      game.update(FIXED);
      acc -= FIXED;
    }
    fx.update(sdt);
    // the sliding bed follows how much is actually moving on the table, so a
    // fast shot is something you hear as well as see
    let motion = 0;
    for (const b of game.phys.bodies) {
      if (b.dead || b.fixed || b.sleeping) continue;
      motion += Math.hypot(b.vx, b.vz);
    }
    audio.setSlideIntensity(motion / 850);
  } else if (screen === 'result') {
    game.advanceTimeScale(dt);
    const sdt = Math.min(FIXED, dt) * game.timeScale;
    game.update(sdt);                  // let the celebration physics run
    fx.update(sdt);
  }

  if (screen !== 'game' || paused) audio.setSlideIntensity(0);

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
  // A cache-first worker keeps serving the build you already have, so a player
  // could sit on an old version indefinitely. When a new worker takes over,
  // reload once (guarded, or the reload races the next activation) — but never
  // mid-run, or it would throw away the table you're playing.
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    if (screen === 'game' || screen === 'result') {
      ui.toast('Update ready — it will apply next time you return here', 2600);
      pendingUpdate = true;
      reloading = false;
      return;
    }
    location.reload();
  });
}

// ---- boot ----

// QA / debug hook (harmless in production, invaluable for automated testing)
window.__ft = {
  game, view, renderer, physics, fx, save, audio, backdrop, ui, ads,
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

// Land on the title. If a campaign run was autosaved, showTitle surfaces a
// "Continue" banner (place · score) that resumes it — a friendlier choice than
// silently dropping the player back into a half-finished table with no way out.
showTitle();
requestAnimationFrame(frame);
