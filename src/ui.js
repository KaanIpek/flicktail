// DOM overlay: title, world map, HUD, level intro, win/fail, pause, collection.

import { TIERS, COMBO_CALLOUTS, REFILL } from './config.js';
import { LEVELS, ALL_LEVELS, TOURS, tourById, levelsOfTour, tierNameFor } from './levels.js';
import { creatureIcon, ACTIVE_ART } from './render.js';
import { SKINS } from './skins.js';
import { todayKey } from './save.js';

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

  drinkImg(tier, cls = '', level = null) {
    // The UI must show whatever the table is showing: a creature icon if a cast
    // is worn, then the painted skin's art, then the level's own signature,
    // then the house set.
    const art = ACTIVE_ART && ACTIVE_ART[tier];
    const src = creatureIcon(tier)
      || (art ? `assets/signatures/${art.replace(/^sig_/, '')}.png` : null)
      || (level && level.art && level.art[tier])
      || `assets/drinks/tier${String(tier).padStart(2, '0')}.png`;
    return `<img class="drink-icon ${cls}" src="${src}" alt="${TIERS[tier - 1].name}" onerror="this.style.visibility='hidden'">`;
  }

  // A country's own signature bottle when it has been painted, otherwise the
  // generic tier-11 bottle. Never leave the card empty if the art is missing.
  sigImg(tour, cls = '') {
    if (!tour || !tour.sigArt) return this.drinkImg(11, cls);
    return `<img class="drink-icon ${cls}" src="${tour.sigArt}" alt="${tour.special}"
      onerror="this.style.visibility='hidden'">`;
  }

  stars(n, cls = '') {
    return `<span class="stars ${cls}">${[1, 2, 3].map(i => `<span class="star ${i <= n ? 'on' : ''}">★</span>`).join('')}</span>`;
  }

  // ---------- screens ----------

  showTitle(resume = null) {
    const streak = this.save.liveStreak(todayKey());
    const dailyDone = this.save.data.dailyTodayDone === todayKey();
    const endlessBest = this.save.data.endlessBest || 0;
    const rushBest = this.save.data.rushBest || 0;
    const shiftBest = this.save.data.shiftBest || 0;
    this.root.innerHTML = `
    <div class="screen title-screen">
      <button class="btn corner-gear" data-act="about" aria-label="Settings & about">⚙</button>
      <div class="title-block">
        <h1 class="logo">FLICK<span>TAIL</span></h1>
        <p class="tagline">Slide &amp; Merge Cocktails</p>
      </div>
      <div class="title-buttons">
        ${resume ? `<button class="btn big primary resume-btn" data-act="resumeRun">
          <span class="resume-lead">Continue</span>
          <span class="resume-sub">${resume.place} · ${resume.score}</span>
        </button>
        <button class="btn ghost" data-act="play">New game</button>` :
        `<button class="btn big primary" data-act="play">PLAY</button>`}
        <div class="title-row">
          <button class="btn ghost half" data-act="daily">Daily${streak > 0 ? ` 🔥${streak}` : ''}${dailyDone ? ' ✓' : ''}</button>
          <button class="btn ghost half" data-act="endless">Endless${endlessBest ? ` · ${endlessBest}` : ''}</button>
        </div>
        <div class="title-row">
          <button class="btn ghost half" data-act="rush">🍸 Rush${rushBest ? ` · ${rushBest}` : ''}</button>
          <button class="btn ghost half" data-act="shift">🧾 Shift${shiftBest ? ` · ${shiftBest}` : ''}</button>
        </div>
        <div class="title-row">
          <button class="btn ghost half" data-act="collection">Collection</button>
          <button class="btn ghost half" data-act="passport">Passport</button>
        </div>
        <div class="title-row">
          <button class="btn ghost half" data-act="shop">Skins</button>
          <button class="btn ghost half" data-act="about">Settings</button>
        </div>
      </div>
      <p class="title-foot">${TOURS.length - 1} countries &middot; ${ALL_LEVELS.length} stops 🍹</p>
    </div>`;
  }

  // Main map: the tours. World Tour first, then every country.
  showTours() {
    const s = this.save.data;
    const cards = TOURS.map(t => {
      const levels = levelsOfTour(t.id);
      const got = levels.reduce((a, l) => a + (s.stars[l.id] || 0), 0);
      const max = levels.length * 3;
      const open = t.id === 'world' || this.save.totalStars() >= 1;
      const done = levels.filter(l => (s.stars[l.id] || 0) >= 1).length;
      return `
      <div class="tour-card ${open ? '' : 'locked'}" ${open ? `data-act="tour" data-id="${t.id}"` : ''}>
        <div class="tour-thumb" style="background-image:url(assets/backdrops/${t.backdrop}.webp)">
          <div class="tour-flag">${t.flag}</div>
          ${open ? '' : '<div class="lock">🔒</div>'}
        </div>
        <div class="tour-info">
          <div class="tour-name">${t.name}</div>
          <div class="tour-blurb">${open ? t.blurb : 'Earn a star to unlock'}</div>
          <div class="tour-prog">
            <div class="tour-bar"><i style="width:${max ? (got / max * 100) : 0}%"></i></div>
            <span class="tour-count">★ ${got}/${max}</span>
          </div>
          <div class="tour-stops">${done}/${levels.length} stops toasted</div>
        </div>
      </div>`;
    }).join('');
    this.root.innerHTML = `
    <div class="screen map-screen">
      <div class="map-head">
        <button class="btn icon" data-act="title">‹</button>
        <h2>Tours</h2>
        <div class="map-stars">★ ${this.save.totalStars()}</div>
      </div>
      <div class="map-list">${cards}</div>
    </div>`;
  }

  // One tour's stops. A stop opens once the one before it has a star.
  showTour(tourId) {
    const s = this.save.data;
    const tour = tourById(tourId) || TOURS[0];
    const levels = levelsOfTour(tour.id);
    const total = levels.reduce((a, l) => a + (s.stars[l.id] || 0), 0);
    const cards = levels.map((l, i) => {
      const prev = levels[i - 1];
      const unlocked = i === 0 || (s.stars[prev.id] || 0) >= 1;
      const st = s.stars[l.id] || 0;
      const best = s.bestScore[l.id] || 0;
      return `
      <div class="lv-card ${unlocked ? '' : 'locked'}" ${unlocked ? `data-act="level" data-id="${l.id}"` : ''}>
        <div class="lv-thumb" style="background-image:url(assets/backdrops/${l.backdrop}.webp)">
          ${unlocked ? '' : '<div class="lock">🔒</div>'}
          <div class="lv-num">${i + 1}</div>
        </div>
        <div class="lv-info">
          <div class="lv-name">${l.place}</div>
          <div class="lv-country">${l.country}</div>
          ${unlocked ? this.stars(st, 'small') : `<div class="lv-hint">Earn a star in ${prev ? prev.place : ''}</div>`}
          ${best ? `<div class="lv-best">Best ${best}</div>` : ''}
          ${unlocked && st > 0 ? `<button class="btn tiny zen" data-act="zen" data-id="${l.id}">Vacation ☀</button>` : ''}
        </div>
      </div>`;
    }).join('');
    this.root.innerHTML = `
    <div class="screen map-screen">
      <div class="map-head">
        <button class="btn icon" data-act="tours">‹</button>
        <h2>${tour.flag} ${tour.name}</h2>
        <div class="map-stars">★ ${total}/${levels.length * 3}</div>
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
      <div class="col-scroll">
        <div class="col-grid">${rows}</div>
        <p class="col-foot">Highest mix: ${best >= 1 ? TIERS[best - 1].name : '—'}</p>
        <div class="col-sec">Signature pours</div>
        <p class="col-hint">Finish every stop on a country tour to earn its bottle.</p>
        <div class="col-grid">${this.signatureCards()}</div>
      </div>
    </div>`;
  }

  // One trophy per country: earned by taking a star at every stop on its tour.
  signatureCards() {
    const s = this.save.data;
    return TOURS.filter(t => t.id !== 'world').map(t => {
      const levels = levelsOfTour(t.id);
      const done = levels.length > 0 && levels.every(l => (s.stars[l.id] || 0) >= 1);
      // the country's signature creature is the top of its own cast
      return `
      <div class="col-card sig-card ${done ? '' : 'undiscovered'}">
        ${done ? this.sigImg(t) : '<div class="sig-lock">🔒</div>'}
        <div class="col-name">${done ? t.special : '???'}</div>
        <div class="col-tier">${t.flag} ${t.name}</div>
      </div>`;
    }).join('');
  }

  showPassport() {
    const d = this.save.data;
    const toasted = LEVELS.filter(l => (d.stars[l.id] || 0) >= 1).length;
    const stat = (label, value, accent) =>
      `<div class="pass-stat"><div class="pass-val ${accent ? 'accent' : ''}">${value}</div><div class="pass-label">${label}</div></div>`;
    const stamps = LEVELS.map(l => {
      const done = (d.stars[l.id] || 0) >= 1;
      const st = d.stars[l.id] || 0;
      return `<div class="pass-stamp ${done ? 'done' : ''}" title="${l.place}">
        <div class="pass-stamp-thumb" style="background-image:url(assets/backdrops/${l.backdrop}.webp)"></div>
        <div class="pass-stamp-name">${l.place}</div>
        <div class="pass-stamp-stars">${done ? '★'.repeat(st) + '☆'.repeat(3 - st) : '🔒'}</div>
      </div>`;
    }).join('');
    this.root.innerHTML = `
    <div class="screen passport-screen">
      <div class="map-head">
        <button class="btn icon" data-act="title">‹</button>
        <h2>Passport</h2><div></div>
      </div>
      <div class="pass-scroll">
        <div class="pass-stats">
          ${stat('destinations', `${toasted}/12`)}
          ${stat('stars', `${this.save.totalStars()}/36`, true)}
          ${stat('drinks mixed', d.totalMerges || 0)}
          ${stat('best combo', `×${d.maxCombo || 0}`)}
          ${stat('endless best', d.endlessBest || 0)}
          ${stat('daily streak', `🔥${this.save.liveStreak(todayKey())}`, true)}
          ${stat('daily best', d.dailyBest || 0)}
          ${stat('top mix', d.bestTier >= 1 ? TIERS[d.bestTier - 1].name : '—')}
        </div>
        <div class="pass-stamps-title">Destinations toasted</div>
        <div class="pass-stamps">${stamps}</div>
      </div>
    </div>`;
  }

  // Drink skins. Prices are shown honestly: a paid skin says so, but the button
  // only offers what the game can actually deliver today — a star unlock —
  // until a store connection exists (see ui.iapAvailable).
  showShop() {
    const d = this.save.data;
    const stars = this.save.totalStars();
    const cards = SKINS.map(sk => {
      const owned = d.ownedSkins.includes(sk.id);
      const active = d.activeSkin === sk.id;
      const canStar = !owned && sk.stars && stars >= sk.stars;
      const preview = [2, 5, 8, 10].map(t => {
        let src;
        if (sk.kind === 'creature') src = creatureIcon(t, 96, { cast: sk.cast });
        else if (sk.kind === 'art') src = `assets/signatures/${sk.art[t - 1]}.png`;
        else src = `assets/drinks/tier${String(t).padStart(2, '0')}.png`;
        return `<img class="skin-pic" src="${src}" alt="">`;
      }).join('');
      let action;
      if (active) action = '<div class="skin-on">EQUIPPED</div>';
      else if (owned) action = `<button class="btn tiny zen" data-act="equipSkin" data-id="${sk.id}">Wear it</button>`;
      else if (canStar) action = `<button class="btn tiny primary" data-act="unlockSkin" data-id="${sk.id}">Unlock ★ ${sk.stars}</button>`;
      else action = `<div class="skin-locked">★ ${sk.stars} to unlock${sk.price ? ` &middot; or ${sk.price} soon` : ''}</div>`;
      return `
      <div class="skin-card ${owned ? '' : 'locked'}">
        <div class="skin-row">${preview}</div>
        <div class="skin-name">${sk.name}</div>
        <div class="skin-blurb">${sk.blurb}</div>
        ${action}
      </div>`;
    }).join('');
    this.root.innerHTML = `
    <div class="screen shop-screen">
      <div class="map-head">
        <button class="btn icon" data-act="title">‹</button>
        <h2>Drink Skins</h2>
        <div class="map-stars">★ ${stars}</div>
      </div>
      <div class="shop-scroll">
        <p class="shop-note">Skins change how every drink looks. Earn one with stars now
          &mdash; card payment arrives once the store is connected.</p>
        ${cards}
      </div>
    </div>`;
  }

  showAbout(settings) {
    const tg = (act, label, on) =>
      `<button class="btn toggle wide ${on ? 'on' : ''}" data-act="${act}">
         <span>${label}</span><span class="tg-state">${on ? 'On' : 'Off'}</span>
       </button>`;
    this.root.innerHTML = `
    <div class="screen about-screen">
      <div class="map-head">
        <button class="btn icon" data-act="title">‹</button>
        <h2>Settings</h2><div></div>
      </div>
      <div class="about-scroll">
        <div class="settings-rows wide-rows">
          ${tg('tgMusic', 'Music', settings.music)}
          ${tg('tgSfx', 'Sound effects', settings.sfx)}
          ${tg('tgHaptics', 'Haptics', settings.haptics)}
          ${tg('tgAim', 'Bounce guide', settings.aimLine)}
        </div>
        <div class="about-sec-title">About</div>
        <p class="about-blurb">Flick drinks up the table and merge matching cocktails Suika-style, touring twelve real beach destinations from Waikiki to Bora&nbsp;Bora.</p>
        <div class="about-credits">
          <div class="cred-row"><span>Music &amp; ambience</span><span>Stable Audio · Stability AI</span></div>
          <div class="cred-row"><span>Illustrations</span><span>AI-generated for this game</span></div>
          <div class="cred-row"><span>Typefaces</span><span>Baloo 2 &amp; Nunito · OFL</span></div>
          <div class="cred-row"><span>Engine</span><span>Hand-built, zero dependencies</span></div>
        </div>
        <p class="about-ver">Flicktail · v1.0</p>
      </div>
    </div>`;
  }

  showIntro(level, zen) {
    const goal = { ...TIERS[level.goalTier - 1], name: tierNameFor(level, level.goalTier, TIERS) };
    this.root.innerHTML = `
    <div class="screen intro-screen" data-act="start">
      <div class="intro-card">
        <div class="intro-place">${level.place}</div>
        <div class="intro-country">${level.country}</div>
        <div class="intro-goal">
          ${zen ? '<div class="zen-badge">☀ Vacation Mode — no pressure</div>' : `
          <div class="goal-row">${this.drinkImg(level.goalTier, '', level)}<div>Mix a <b>${goal.name}</b></div></div>
          ${level.sideGoal ? `<div class="goal-side">+ ${level.sideGoal.label}</div>` : ''}
          <div class="goal-flicks">${level.flicks} drinks in the cooler</div>`}
        </div>
        ${level.id === 1 && !zen ? `<div class="intro-teach">${level.intro}</div>` : ''}
        <div class="intro-mech">💡 ${level.mechanic}</div>
        <button class="btn big primary" data-act="start">${zen ? 'RELAX' : 'SERVE!'}</button>
      </div>
    </div>`;
  }

  showModeIntro(mode, opts = {}) {
    if (mode === 'shift') {
      this.root.innerHTML = `
      <div class="screen intro-screen" data-act="start">
        <div class="intro-card">
          <div class="intro-place">The Shift</div>
          <div class="intro-country">Fill the board</div>
          <div class="intro-goal">
            <div class="mode-line">Twelve tickets, one cooler. Each ticket names a drink — mix it and
              roll it onto the dock. The orders get taller as the night goes on.</div>
            ${this.save.data.shiftBest ? `<div class="goal-side">Best: ${this.save.data.shiftBest}</div>` : ''}
          </div>
          <div class="intro-mech">💡 Every flick left over at the end pays a bonus.</div>
          <button class="btn big primary" data-act="start">CLOCK IN!</button>
        </div>
      </div>`;
    } else if (mode === 'rush') {
      this.root.innerHTML = `
      <div class="screen intro-screen" data-act="start">
        <div class="intro-card">
          <div class="intro-place">Rush Hour</div>
          <div class="intro-country">Hold the line</div>
          <div class="intro-goal">
            <div class="mode-line">The bar keeps sending drinks whether you are ready or not, faster and faster.
              Flicks are unlimited — the pile is what will beat you.</div>
            ${this.save.data.rushBest ? `<div class="goal-side">Best: ${this.save.data.rushBest}</div>` : ''}
          </div>
          <div class="intro-mech">💡 Never let a drink park past the striped line.</div>
          <button class="btn big primary" data-act="start">OPEN THE BAR!</button>
        </div>
      </div>`;
    } else if (mode === 'endless') {
      this.root.innerHTML = `
      <div class="screen intro-screen" data-act="start">
        <div class="intro-card">
          <div class="intro-place">Bottomless Bar</div>
          <div class="intro-country">Endless survival</div>
          <div class="intro-goal">
            <div class="mode-line">Mix as high as you can. The pours never stop and the drinks keep getting bigger.</div>
            ${this.save.data.endlessBest ? `<div class="goal-side">Best: ${this.save.data.endlessBest}</div>` : ''}
          </div>
          <div class="intro-mech">💡 Don't let the launch line clog — that's the only way out.</div>
          <button class="btn big primary" data-act="start">POUR!</button>
        </div>
      </div>`;
    } else {
      const l = opts.level;
      this.root.innerHTML = `
      <div class="screen intro-screen" data-act="start">
        <div class="intro-card">
          <div class="intro-place">Daily Challenge</div>
          <div class="intro-country">${l.place} · today's board</div>
          <div class="intro-goal">
            <div class="mode-line">Everyone gets the same drinks today. One run for the streak.</div>
            <div class="goal-side">🔥 ${opts.streak || 0} day streak${opts.done ? ' · played today' : ''}</div>
          </div>
          <div class="intro-mech">💡 Score as high as you can before the bar clogs.</div>
          <button class="btn big primary" data-act="start">${opts.done ? 'PLAY AGAIN' : 'START'}</button>
        </div>
      </div>`;
    }
  }

  showHud(game) {
    const l = game.level;
    this.root.innerHTML = `
    <div class="hud">
      <div class="hud-top">
        <button class="btn icon" data-act="pause">II</button>
        <div class="hud-score-wrap"><div id="hudScore" class="hud-score">0</div>
        <div class="hud-place">${l.place}</div>
        <div class="hud-stars ${game.rush || game.shift ? 'hidden' : ''}" id="hudStars">
          <div class="hs-bar"><div class="hs-fill" id="hsFill"></div></div>
          <div class="hs-need" id="hsNeed"></div>
        </div>
        ${game.shift ? '<div class="hud-tickets" id="hudTickets"></div>' : ''}</div>
        <div class="hud-goal" id="hudGoal">
          ${game.rush ? '<span class="goal-icon rush-icon">🍸</span>'
            : game.shift ? '<span class="goal-icon rush-icon">🧾</span>'
            : this.drinkImg(l.goalTier, 'goal-icon', l)}
          <div id="hudFlicks" class="hud-flicks"></div>
        </div>
      </div>
      <div class="hud-missions" id="hudMissions">
        <div class="mission ${game.rush || game.shift ? 'hidden' : ''}" id="missionMain">
          <span class="mission-tick" id="mainTick">○</span>
          <span class="mission-text">Mix a <b>${tierNameFor(l, l.goalTier, TIERS)}</b></span>
        </div>
        <div class="mission hidden" id="sideGoal">
          <span class="mission-tick" id="sideTick">○</span>
          <span class="mission-text"></span>
        </div>
      </div>
      <div id="combo" class="combo hidden"></div>
      <div id="callout" class="callout hidden"></div>
      <div class="hud-bottom">
        <div class="next-wrap">
          <span class="next-label">NEXT</span>
          <div id="nextQueue" class="next-queue"></div>
        </div>
        <button id="finishBtn" class="btn tiny finish hidden" data-act="finishNow">FINISH ✓</button>
      </div>
      <div id="toast" class="toast hidden"></div>
    </div>`;
    this.hudScore = document.getElementById('hudScore');
    this.hsFill = document.getElementById('hsFill');
    this.hsNeed = document.getElementById('hsNeed');
    this.hudTickets = document.getElementById('hudTickets');
    this.lastTickets = -1;
    this.lastNeed = '';
    this.hudFlicks = document.getElementById('hudFlicks');
    this.hudGoal = document.getElementById('hudGoal');
    this.comboEl = document.getElementById('combo');
    this.calloutEl = document.getElementById('callout');
    this.nextQueue = document.getElementById('nextQueue');
    this.sideGoalEl = document.getElementById('sideGoal');
    this.mainTick = document.getElementById('mainTick');
    this.sideTick = document.getElementById('sideTick');
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
    if (this.hudTickets && game.ticketsLeft !== this.lastTickets) {
      const done = (game.result ? game.result.ticketsTotal : 12) - game.ticketsLeft;
      this.hudTickets.textContent = `🧾 ${game.ticketsLeft} left`;
      this.hudTickets.classList.toggle('close', game.ticketsLeft <= 3);
      this.lastTickets = game.ticketsLeft;
    }
    // What the next star costs, and how close the run is to it. Without this you
    // are flicking at an invisible target and every level feels the same.
    if (this.hsNeed) {
      const l = game.level, sc = game.score;
      const endless = game.zen || game.endless || game.rush || game.shift;
      let label, from, to;
      if (endless || !l.star2) { label = ''; from = 0; to = 0; }
      else if (sc >= l.star3) { label = '★★★'; from = l.star3; to = l.star3; }
      else if (sc >= l.star2) { label = `★★★ ${l.star3}`; from = l.star2; to = l.star3; }
      else { label = `★★ ${l.star2}`; from = 0; to = l.star2; }
      if (label !== this.lastNeed) {
        this.hsNeed.textContent = label;
        this.hsNeed.classList.toggle('maxed', label === '★★★');
        this.lastNeed = label;
      }
      const pct = to > from ? Math.max(0, Math.min(1, (sc - from) / (to - from))) : 1;
      this.hsFill.style.width = (label ? pct * 100 : 0).toFixed(1) + '%';
      this.hsFill.classList.toggle('maxed', label === '★★★');
    }
    const unlimited = game.zen || game.endless || game.rush;
    const fl = unlimited ? '∞' : game.flicksLeft;
    if (fl !== this.lastFlicks) {
      this.hudFlicks.textContent = fl;
      this.hudFlicks.classList.toggle('low', !unlimited && game.flicksLeft <= 5);
      this.lastFlicks = fl;
    }
    const q = game.queue.slice(0, 2).join(',');
    if (q !== this.lastQueue) {
      this.nextQueue.innerHTML = game.queue.slice(0, 2)
        .map((t, i) => this.drinkImg(t, i === 0 ? 'next1' : 'next2', game.level)).join('');
      this.lastQueue = q;
    }
    if (game.goalDone) this.hudGoal.classList.add('done');
    // missions live at the TOP: main goal first, then the level's side challenge
    const mainDone = game.goalDone;
    if (this.mainTick && this.mainDoneShown !== mainDone) {
      this.mainDoneShown = mainDone;
      this.mainTick.textContent = mainDone ? '✓' : '○';
      document.getElementById('missionMain')?.classList.toggle('done', mainDone);
    }
    const sg = game.sideGoalProgress();
    if (sg) {
      const cur = Math.min(sg.cur, sg.count), done = cur >= sg.count;
      const label = `${sg.label} ${cur}/${sg.count}`;
      this.sideGoalEl.classList.remove('hidden');
      if (this.sideShown !== label) {
        this.sideShown = label;
        this.sideGoalEl.querySelector('.mission-text').textContent = label;
        this.sideTick.textContent = done ? '✓' : '○';
        this.sideGoalEl.classList.toggle('done', done);
      }
    } else this.sideGoalEl.classList.add('hidden');
    const fb = document.getElementById('finishBtn');
    // Endless/Daily are survival runs — no early "FINISH ✓" cash-out (daily
    // would burn the one scored run on a mis-tap). endless covers daily too.
    if (fb) fb.classList.toggle('hidden', !(game.goalDone && game.sideGoalDone() && !game.zen && !game.endless));
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

  // The payoff for finishing every stop on a country tour: the bottle you just
  // earned, and the cast that poured it taking a bow.
  showTourComplete(tourId) {
    const tour = tourById(tourId);
    if (!tour) return;
    const levels = levelsOfTour(tourId);
    const lv = levels[0];
    const bottle = this.sigImg(tour, 'td-bottle');
    const parade = [2, 4, 6, 8, 10].map((t, i) =>
      `<span class="parade-pet" style="animation-delay:${(i * 0.13).toFixed(2)}s">${this.drinkImg(t)}</span>`
    ).join('');
    const stars = levels.reduce((a, l) => a + (this.save.data.stars[l.id] || 0), 0);
    this.root.innerHTML = `
    <div class="screen tour-done-screen">
      <div class="td-flag">${tour.flag}</div>
      <h2 class="td-title">${tour.name} complete!</h2>
      <p class="td-sub">Every stop toasted &middot; ★ ${stars}/${levels.length * 3}</p>
      ${bottle}
      <div class="td-name">${tour.special}</div>
      <p class="td-note">Added to your Collection</p>
      <div class="td-parade">${parade}</div>
      <button class="btn big primary" data-act="tours">Back to the map</button>
    </div>`;
  }

  showResult(game, result) {
    const l = game.level;
    // next stop WITHIN this tour — ids jump between tours, so ask the tour
    const sibs = levelsOfTour(l.tour || 'world');
    const next = sibs[sibs.findIndex(x => x.id === l.id) + 1];

    if (result.mode === 'endless' || result.mode === 'daily') {
      const isDaily = result.mode === 'daily';
      const title = isDaily ? 'Daily done! 📅' : 'Last call! 🍸';
      const best = result.newBest ? `<div class="result-best newbest">🎉 NEW BEST</div>`
        : `<div class="result-best">Best: ${result.best}</div>`;
      const streak = isDaily ? `<div class="result-next">🔥 ${result.streak} day streak — come back tomorrow</div>` : '';
      this.root.innerHTML = `
      <div class="screen result-screen">
        <div class="result-card ${result.newBest ? 'win' : 'fail'}">
          <div class="result-title">${title}</div>
          <div class="result-score">${result.score}</div>
          ${best}
          ${streak}
          <div class="result-buttons">
            ${isDaily
              ? `<button class="btn big primary" data-act="title">HOME</button><button class="btn ghost" data-act="daily">Play again</button>`
              : `<button class="btn big primary" data-act="${r.mode === 'rush' ? 'rushAgain' : (r.mode === 'shift' ? 'shiftAgain' : 'endlessAgain')}">POUR AGAIN</button><button class="btn ghost" data-act="title">Home</button>`}
          </div>
        </div>
      </div>`;
      return;
    }
    if (result.won) {
      const starLine = result.nextStar
        ? `<div class="result-next">${result.toNextStar} more for ${result.stars + 1}★</div>`
        : `<div class="result-next perfect">Perfect — 3 stars! ⭐</div>`;
      const bestLine = result.newBest
        ? `<div class="result-best newbest">🎉 NEW BEST</div>`
        : `<div class="result-best">Best: ${this.save.data.bestScore[l.id] || result.score}</div>`;
      this.root.innerHTML = `
      <div class="screen result-screen">
        <div class="result-card win">
          <div class="result-title">${l.place} toasted! 🥂</div>
          ${this.stars(result.stars, 'big-stars')}
          <div class="result-score">${result.score}</div>
          ${bestLine}
          ${starLine}
          <div class="result-buttons">
            ${result.tourDone ? `<button class="btn big primary td-claim" data-act="tourDone" data-id="${result.tourDone}">🏆 CLAIM ${(tourById(result.tourDone) || {}).special || 'trophy'}</button>` : ''}
            ${next ? `<button class="btn big primary" data-act="level" data-id="${next.id}">NEXT: ${next.place.toUpperCase()}</button>` : `<button class="btn big primary" data-act="map">WORLD MAP</button>`}
            <button class="btn ghost" data-act="replay">${result.stars < 3 ? 'Replay for ★★★' : 'Replay'}</button>
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
          <div class="result-sub">So close — the ${tierNameFor(l, l.goalTier, TIERS)} is waiting.</div>
          <div class="result-buttons">
            <button class="btn big primary" data-act="retry">RETRY (same drinks)</button>
            <button class="btn ghost" data-act="shuffle">Shuffle drinks</button>
            <button class="btn ghost" data-act="map">Map</button>
          </div>
        </div>
      </div>`;
    }
  }

  // The cooler ran dry but the goal isn't met — offer another round instead of
  // ending the run outright.
  showRefillOffer(game, { gives, used }) {
    const goal = { name: tierNameFor(game.level, game.level.goalTier, TIERS) };
    this.root.insertAdjacentHTML('beforeend', `
    <div class="modal" id="refillModal">
      <div class="modal-card">
        <h3>Out of drinks!</h3>
        <p class="refill-line">You still need a <b>${goal.name}</b>.<br>
          The bar can send <b>${gives} more</b>.</p>
        ${this.drinkImg(game.level.goalTier, 'refill-icon', game.level)}
        <div class="result-buttons">
          <button class="btn big primary" data-act="refillYes">▶ WATCH FOR +${gives}</button>
          <button class="btn ghost" data-act="refillNo">End the run</button>
        </div>
        <p class="credits">Round ${used + 1} of ${REFILL.max}</p>
      </div>
    </div>`);
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

  // Closes whatever modal is open. This used to remove #pauseModal by id only,
  // so the refill offer stayed on screen after you accepted it — the flicks
  // were granted but the "watch or end" card never left, which read as the ad
  // having done nothing (and "End the run" then threw the round away).
  closeModal() {
    for (const m of this.root.querySelectorAll('.modal')) m.remove();
    for (const m of document.querySelectorAll('body > .modal')) m.remove();
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
