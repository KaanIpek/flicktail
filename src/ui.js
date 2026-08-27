// DOM overlay: title, world map, HUD, level intro, win/fail, pause, collection.

import { TIERS, COMBO_CALLOUTS } from './config.js';
import { LEVELS } from './levels.js';

export class UI {
  constructor(root, save, audio) {
    this.root = root;
    this.save = save;
    this.audio = audio;
    this.handlers = {};
    root.addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      this.audio.play('tap', { volume: 0.5 });
      const act = btn.dataset.act;
      if (this.handlers[act]) this.handlers[act](btn.dataset);
    });
  }

  on(act, fn) { this.handlers[act] = fn; }

  drinkImg(tier, cls = '') {
    return `<img class="drink-icon ${cls}" src="assets/drinks/tier${String(tier).padStart(2, '0')}.png" alt="${TIERS[tier - 1].name}" onerror="this.style.visibility='hidden'">`;
  }

  stars(n, cls = '') {
    return `<span class="stars ${cls}">${[1, 2, 3].map(i => `<span class="star ${i <= n ? 'on' : ''}">★</span>`).join('')}</span>`;
  }

  // ---------- screens ----------

  showTitle() {
    this.root.innerHTML = `
    <div class="screen title-screen">
      <div class="title-block">
        <h1 class="logo">FLICK<span>TAIL</span></h1>
        <p class="tagline">Slide &amp; Merge Cocktails</p>
      </div>
      <div class="title-buttons">
        <button class="btn big primary" data-act="play">PLAY</button>
        <button class="btn ghost" data-act="collection">Collection</button>
      </div>
      <p class="title-foot">A world tour in 12 drinks 🍹</p>
    </div>`;
  }

  showMap() {
    const s = this.save.data;
    const total = LEVELS.reduce((a, l) => a + (s.stars[l.id] || 0), 0);
    const cards = LEVELS.map(l => {
      const unlocked = l.id <= s.unlockedLevel;
      const st = s.stars[l.id] || 0;
      const best = s.bestScore[l.id] || 0;
      return `
      <div class="lv-card ${unlocked ? '' : 'locked'}" ${unlocked ? `data-act="level" data-id="${l.id}"` : ''}>
        <div class="lv-thumb" style="background-image:url(assets/backdrops/${l.backdrop}.webp)">
          ${unlocked ? '' : '<div class="lock">🔒</div>'}
          <div class="lv-num">${l.id}</div>
        </div>
        <div class="lv-info">
          <div class="lv-name">${l.place}</div>
          <div class="lv-country">${l.country}</div>
          ${unlocked ? this.stars(st, 'small') : `<div class="lv-hint">Earn a star in ${LEVELS[l.id - 2] ? LEVELS[l.id - 2].place : ''}</div>`}
          ${best ? `<div class="lv-best">Best ${best}</div>` : ''}
          ${unlocked && st > 0 ? `<button class="btn tiny zen" data-act="zen" data-id="${l.id}">Vacation ☀</button>` : ''}
        </div>
      </div>`;
    }).join('');
    this.root.innerHTML = `
    <div class="screen map-screen">
      <div class="map-head">
        <button class="btn icon" data-act="title">‹</button>
        <h2>World Tour</h2>
        <div class="map-stars">★ ${total}/36</div>
      </div>
      <div class="map-list">${cards}</div>
    </div>`;
  }

  showCollection() {
    const best = this.save.data.bestTier;
    const rows = TIERS.map(t => `
      <div class="col-card ${t.id <= best ? '' : 'undiscovered'}">
        ${this.drinkImg(t.id)}
        <div class="col-name">${t.id <= best ? t.name : '???'}</div>
        <div class="col-tier">Tier ${t.id}</div>
      </div>`).join('');
    this.root.innerHTML = `
    <div class="screen collection-screen">
      <div class="map-head">
        <button class="btn icon" data-act="title">‹</button>
        <h2>Collection</h2><div></div>
      </div>
      <div class="col-grid">${rows}</div>
      <p class="col-foot">Highest mix: ${best >= 1 ? TIERS[best - 1].name : '—'}</p>
    </div>`;
  }

  showIntro(level, zen) {
    const goal = TIERS[level.goalTier - 1];
    this.root.innerHTML = `
    <div class="screen intro-screen" data-act="start">
      <div class="intro-card">
        <div class="intro-place">${level.place}</div>
        <div class="intro-country">${level.country}</div>
        <div class="intro-goal">
          ${zen ? '<div class="zen-badge">☀ Vacation Mode — no pressure</div>' : `
          <div class="goal-row">${this.drinkImg(level.goalTier)}<div>Mix a <b>${goal.name}</b></div></div>
          ${level.sideGoal ? `<div class="goal-side">+ ${level.sideGoal.label}</div>` : ''}
          <div class="goal-flicks">${level.flicks} drinks in the cooler</div>`}
        </div>
        <div class="intro-mech">💡 ${level.mechanic}</div>
        <button class="btn big primary" data-act="start">${zen ? 'RELAX' : 'SERVE!'}</button>
      </div>
    </div>`;
  }

  showHud(game) {
    const l = game.level;
    this.root.innerHTML = `
    <div class="hud">
      <div class="hud-top">
        <button class="btn icon" data-act="pause">II</button>
        <div class="hud-score-wrap"><div id="hudScore" class="hud-score">0</div>
        <div class="hud-place">${l.place}</div></div>
        <div class="hud-goal" id="hudGoal">
          ${this.drinkImg(l.goalTier, 'goal-icon')}
          <div id="hudFlicks" class="hud-flicks"></div>
        </div>
      </div>
      <div id="combo" class="combo hidden"></div>
      <div id="callout" class="callout hidden"></div>
      <div class="hud-bottom">
        <div class="next-wrap">
          <span class="next-label">NEXT</span>
          <div id="nextQueue" class="next-queue"></div>
        </div>
        <div id="sideGoal" class="side-goal"></div>
        <button id="finishBtn" class="btn tiny finish hidden" data-act="finishNow">FINISH ✓</button>
      </div>
      <div id="toast" class="toast hidden"></div>
    </div>`;
    this.hudScore = document.getElementById('hudScore');
    this.hudFlicks = document.getElementById('hudFlicks');
    this.hudGoal = document.getElementById('hudGoal');
    this.comboEl = document.getElementById('combo');
    this.calloutEl = document.getElementById('callout');
    this.nextQueue = document.getElementById('nextQueue');
    this.sideGoalEl = document.getElementById('sideGoal');
    this.toastEl = document.getElementById('toast');
    this.lastScore = -1;
    this.lastFlicks = -1;
    this.lastQueue = '';
    this.updateHud(game);
  }

  updateHud(game) {
    if (!this.hudScore) return;
    if (game.score !== this.lastScore) {
      this.hudScore.textContent = game.score;
      this.hudScore.classList.remove('bump');
      void this.hudScore.offsetWidth;
      this.hudScore.classList.add('bump');
      this.lastScore = game.score;
    }
    const fl = game.zen ? '∞' : game.flicksLeft;
    if (fl !== this.lastFlicks) {
      this.hudFlicks.textContent = fl;
      this.hudFlicks.classList.toggle('low', !game.zen && game.flicksLeft <= 5);
      this.lastFlicks = fl;
    }
    const q = game.queue.slice(0, 2).join(',');
    if (q !== this.lastQueue) {
      this.nextQueue.innerHTML = game.queue.slice(0, 2)
        .map((t, i) => this.drinkImg(t, i === 0 ? 'next1' : 'next2')).join('');
      this.lastQueue = q;
    }
    if (game.goalDone) this.hudGoal.classList.add('done');
    const sg = game.sideGoalProgress();
    if (sg) this.sideGoalEl.textContent = `${sg.label}: ${Math.min(sg.cur, sg.count)}/${sg.count}`;
    const fb = document.getElementById('finishBtn');
    if (fb) fb.classList.toggle('hidden', !(game.goalDone && game.sideGoalDone() && !game.zen));
  }

  showCombo(mult) {
    this.comboEl.textContent = '×' + mult;
    this.comboEl.classList.remove('hidden', 'pop');
    void this.comboEl.offsetWidth;
    this.comboEl.classList.add('pop');
  }

  hideCombo() { if (this.comboEl) this.comboEl.classList.add('hidden'); }

  showCallout(text) {
    this.calloutEl.textContent = text;
    this.calloutEl.classList.remove('hidden', 'pop');
    void this.calloutEl.offsetWidth;
    this.calloutEl.classList.add('pop');
    clearTimeout(this._calloutT);
    this._calloutT = setTimeout(() => this.calloutEl.classList.add('hidden'), 1100);
  }

  toast(text, ms = 1600) {
    if (!this.toastEl) return;
    this.toastEl.textContent = text;
    this.toastEl.classList.remove('hidden');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => this.toastEl.classList.add('hidden'), ms);
  }

  showResult(game, result) {
    const l = game.level;
    const next = LEVELS.find(x => x.id === l.id + 1);
    if (result.won) {
      this.root.innerHTML = `
      <div class="screen result-screen">
        <div class="result-card win">
          <div class="result-title">${l.place} toasted! 🥂</div>
          ${this.stars(result.stars, 'big-stars')}
          <div class="result-score">${result.score}</div>
          <div class="result-best">Best: ${this.save.data.bestScore[l.id] || result.score}</div>
          <div class="result-buttons">
            ${next ? `<button class="btn big primary" data-act="level" data-id="${next.id}">NEXT: ${next.place.toUpperCase()}</button>` : `<button class="btn big primary" data-act="map">WORLD MAP</button>`}
            <button class="btn ghost" data-act="replay">Replay</button>
            <button class="btn ghost" data-act="map">Map</button>
          </div>
        </div>
      </div>`;
    } else {
      const msg = result.reason === 'overcrowd' ? 'The bar top overflowed!' : 'Out of drinks!';
      this.root.innerHTML = `
      <div class="screen result-screen">
        <div class="result-card fail">
          <div class="result-title">${msg}</div>
          <div class="result-score">${result.score}</div>
          <div class="result-sub">So close — the ${TIERS[l.goalTier - 1].name} is waiting.</div>
          <div class="result-buttons">
            <button class="btn big primary" data-act="retry">RETRY (same drinks)</button>
            <button class="btn ghost" data-act="shuffle">Shuffle drinks</button>
            <button class="btn ghost" data-act="map">Map</button>
          </div>
        </div>
      </div>`;
    }
  }

  showPause(game, settings) {
    this.root.insertAdjacentHTML('beforeend', `
    <div class="modal" id="pauseModal">
      <div class="modal-card">
        <h3>Paused</h3>
        <div class="settings-rows">
          <button class="btn toggle ${settings.music ? 'on' : ''}" data-act="tgMusic">Music ${settings.music ? 'On' : 'Off'}</button>
          <button class="btn toggle ${settings.sfx ? 'on' : ''}" data-act="tgSfx">Sounds ${settings.sfx ? 'On' : 'Off'}</button>
          <button class="btn toggle ${settings.haptics ? 'on' : ''}" data-act="tgHaptics">Haptics ${settings.haptics ? 'On' : 'Off'}</button>
        </div>
        <div class="result-buttons">
          <button class="btn big primary" data-act="resume">RESUME</button>
          <button class="btn ghost" data-act="replay">Restart level</button>
          <button class="btn ghost" data-act="map">Quit to map</button>
        </div>
        <p class="credits">Backdrops &amp; drink art generated for this game · Fonts: Baloo 2, Nunito (OFL)</p>
      </div>
    </div>`);
  }

  closeModal() {
    const m = document.getElementById('pauseModal');
    if (m) m.remove();
  }

  showTutorial(step) {
    const texts = {
      1: 'Pull back anywhere on the table, then let go — like a slingshot! 🎯',
      2: 'Hit the matching drink to MERGE them into a bigger one!',
      3: 'Careful: past the white line, drinks fall off the front edge!',
    };
    if (!texts[step]) return;
    this.toast(texts[step], 3400);
  }
}
