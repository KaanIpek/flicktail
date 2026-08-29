// Level state machine: spawn queue, flicks, merges, combos, orders, hazards,
// win/fail. Physics events are consumed here, end-of-step.

import { TABLE, PHYS, FLICK, TIERS, TOP_TIER_CLINK_BONUS, COMBO, ORDERS, SPAWN, FAIL, COMBO_CALLOUTS, CAT_TIERS, REFILL } from './config.js';
import { makeBody, buildWalls } from './physics.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const S = { AIMING: 'aiming', WON: 'won', FAILED: 'failed', SETTLING: 'settling' };

export class Game {
  constructor(physics, fx, audio, save) {
    this.phys = physics;
    this.fx = fx;
    this.audio = audio;
    this.save = save;
    this.level = null;
    this.reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.onEvent = null;   // (name, data) -> UI hooks
  }

  loadLevel(level, { zen = false, seed = null, restore = null, endless = false, daily = false, dayKey = '' } = {}) {
    this.level = level;
    this.zen = zen;
    this.endless = endless;
    this.daily = daily;
    this.dayKey = dayKey;
    this.seed = seed ?? ((Math.random() * 1e9) | 0);
    this.rng = mulberry32(this.seed);
    this.phys.clear();
    this.phys.setWalls(buildWalls(level));
    this.phys.frictionK = level.friction;
    this.phys.wallRestitution = level.railBounce ?? PHYS.wallRestitution;
    this.phys.restitution = PHYS.restitution;
    this.phys.frictionAt = level.zones ? (x, z) => {
      for (const zn of level.zones) {
        if (x >= zn.xMin && x <= zn.xMax && z >= zn.zMin && z <= zn.zMax) return zn.k;
      }
      return level.friction;
    } : null;

    this.state = S.AIMING;
    this.score = 0;
    this.flicksLeft = (zen || endless) ? Infinity : level.flicks;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxTierMade = 0;
    this.goalDone = false;
    this.bankMerges = 0;
    this.ordersServed = 0;
    this.runMaxCombo = 0;   // best chain this run, for 'combo' side goals
    this.overcrowdT = 0;
    this.time = 0;
    this.result = null;
    this.timeScale = 1;
    this.tScale = { value: 1, target: 1, hold: 0 };
    this.spawnPool = level.spawnTiers || SPAWN.tiers;
    this.bag = null;   // shuffled campaign spawn bag (refilled on demand)
    this.refills = 0;  // ad-granted cooler top-ups used this run
    this.offering = false;

    // hazards
    this.wind = level.wind ? { ...level.wind, t: level.wind.period * 0.55, dir: 1, active: 0 } : null;
    this.tide = level.tide ? { ...level.tide, t: 0, active: 0 } : null;
    this.ball = null;

    // obstacles
    if (level.obstacles) {
      for (const o of level.obstacles) {
        this.phys.add(makeBody(0, o.x, o.z, o.r, { fixed: true, noMerge: true, kind: o.kind }));
      }
    }
    if (level.beachBall) {
      this.ball = this.phys.add(makeBody(0, 0, 520, level.beachBall.r, {
        noMerge: true, kind: 'ball', mass: (level.beachBall.r ** 2) / 400 * 0.2,
      }));
      this.ballWanderT = 0;
    }
    // A restored run's snapshot already contains the preplaced drinks (they are
    // ordinary mergeable bodies), so skip the fresh preplace or they double up.
    if (level.preplace && !restore) {
      for (const p of level.preplace) {
        const b = this.phys.add(makeBody(p.tier, p.x, p.z, TIERS[p.tier - 1].r));
        b.immunity = 0;
      }
    }

    // orders
    this.orders = [];
    if (level.orders) {
      const n = Math.min(ORDERS.maxCards, 2);
      for (let i = 0; i < n; i++) this.pushOrder(i);
    }

    // spawn queue: current tee drink + 2 previews
    this.queue = [this.rollTier(), this.rollTier(), this.rollTier()];
    this.tee = { tier: this.queue[0], ready: true, t: 1 };
    this.aim = null;   // {dirX, dirZ, power} while dragging

    if (restore) this.restoreState(restore);
    this.emit('levelLoaded', level);
  }

  emit(name, data) { if (this.onEvent) this.onEvent(name, data); }

  rollTier() {
    // Endless widens the spawn pool as the run gets long, so a survivor keeps
    // being pushed but is handed bigger drinks to keep the board escalating.
    if (this.endless) {
      const top = Math.min(7, 3 + Math.floor(this.time / 45));  // grows every 45s, capped at 7
      const pool = [];
      for (let t = 1; t <= top; t++) pool.push(t);
      return pool[(this.rng() * pool.length) | 0];
    }
    // Campaign: deal from a shuffled "bag" instead of pure random, so the
    // sequence is fair and PLANNABLE — no cruel five-in-a-row streaks, and
    // always enough low tiers to actually build pairs from.
    if (!this.bag || this.bag.length === 0) this.refillBag();
    return this.bag.pop();
  }

  refillBag() {
    const pool = this.spawnPool;
    const bag = [];
    for (const t of pool) bag.push(t, t);        // each tier twice → pairs exist,
                                                 // but a wide pool spreads them out
    for (let i = bag.length - 1; i > 0; i--) {    // seeded Fisher–Yates
      const j = (this.rng() * (i + 1)) | 0;
      const tmp = bag[i]; bag[i] = bag[j]; bag[j] = tmp;
    }
    this.bag = bag;
  }

  pushOrder(slot) {
    const { minTier, maxTier } = this.level.orders;
    const tier = minTier + ((this.rng() * (maxTier - minTier + 1)) | 0);
    const x = slot === 0 ? -150 : 150;
    this.orders[slot] = { tier, x, z: TABLE.length - 6, t: 0, slot, serveAnim: 0 };
  }

  // ---- input ----

  setAim(dirX, dirZ, power) {
    if (this.state !== S.AIMING || !this.tee.ready) { this.aim = null; return; }
    const len = Math.hypot(dirX, dirZ) || 1;
    this.aim = { dirX: dirX / len, dirZ: dirZ / len, power };
  }

  flick() {
    if (this.state !== S.AIMING || !this.tee.ready || !this.aim) return false;
    // The cooler is empty: no more shots. Without this the count ran negative
    // and the run never ended, because checkEnd only fires once the table
    // settles and another flick kept it moving.
    if (this.flicksLeft <= 0) { this.aim = null; this.emit('outOfDrinks'); return false; }
    const a = this.aim;
    if (a.dirZ <= 0.05) { this.aim = null; return false; }  // never toward the gutter
    const tier = this.queue.shift();
    this.queue.push(this.rollTier());
    const speed = Math.max(FLICK.minSpeed, Math.min(FLICK.maxSpeed, a.power));
    const b = this.phys.add(makeBody(tier, 0, TABLE.launchZ, TIERS[tier - 1].r));
    b.vx = a.dirX * speed;
    b.vz = a.dirZ * speed;
    b.sleeping = false;
    b.immunity = SPAWN.spawnImmunity;
    b.mergeLock = 0.02;
    b.banks = 0;
    b.flicked = true;
    this.aim = null;
    this.tee = { tier: this.queue[0], ready: false, t: 0 };
    if (!this.zen) this.flicksLeft--;
    this.audio.play('flick', { volume: 0.5 + 0.5 * speed / FLICK.maxSpeed });
    this.audio.haptic(8);
    this.emit('flick', { tier, speed });
    this.autosave();
    return true;
  }

  // ---- time scaling: slow-mo / freeze-frame on big merges ----
  // The reveal the design brief calls "the product" resolves in the same
  // instant as a tier-3 without this. A brief dip in simulation speed lets the
  // eye land on it. Audio/haptics are event-fired, so they stay at real time —
  // motion slows, the sound still hits.

  setTimeScale(target, hold) {
    if (this.reducedMotion) { target = Math.max(0.7, target); hold = Math.min(hold, 0.06); }
    this.tScale.target = target;
    this.tScale.hold = hold;
    this.tScale.value = target;   // snap down for the punch
    this.timeScale = target;
  }

  // advanced with UNSCALED dt every frame — running it on scaled time would
  // slow its own recovery and never return to 1.
  advanceTimeScale(rawDt) {
    const ts = this.tScale;
    if (ts.hold > 0) { ts.hold -= rawDt; this.timeScale = ts.value; return; }
    ts.value += (1 - ts.value) * Math.min(1, rawDt / 0.25);
    if (ts.value > 0.995) ts.value = 1;
    this.timeScale = ts.value;
  }

  // ---- per fixed step ----

  advancePopIn(dt) {
    for (const b of this.phys.bodies) {
      if (b.dead) continue;
      if (b.born !== undefined && b.born < 1) b.born = Math.min(1, b.born + dt * 7.5);
      if (b.cheer > 0) b.cheer = Math.max(0, b.cheer - dt * 1.15);
    }
  }

  update(dt) {
    // merge pop-in, advanced on the fixed step (was per render-frame, so it
    // played 2x fast on a 120Hz screen). Runs even after WON/FAILED so a drink
    // that merges during the celebration/result settle still pops to full size.
    this.advancePopIn(dt);

    if (this.state === S.WON || this.state === S.FAILED) {
      this.phys.step(dt);
      this.processEvents();
      this.advancePopIn(dt);   // catch products spawned by this step's merges
      return;
    }
    this.time += dt;

    // tee respawn delay
    if (!this.tee.ready) {
      this.tee.t += dt * 1.8;
      if (this.tee.t >= 1) { this.tee.ready = true; this.tee.t = 1; }
    }

    // hazards
    this.updateHazards(dt);

    this.phys.step(dt);

    // combo decay
    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) { this.combo = 0; this.emit('comboEnd'); }
    }

    this.processEvents();
    this.checkGutter();
    this.checkOrders(dt);
    this.checkOvercrowd(dt);
    this.checkEnd(dt);
  }

  updateHazards(dt) {
    const w = this.wind;
    if (w) {
      w.t += dt;
      const cycle = w.period + w.len;
      if (w.t >= cycle) { w.t -= cycle; w.dir = -w.dir; }
      w.warning = w.t > w.period - w.warn && w.t < w.period;
      w.active = w.t >= w.period ? 1 : 0;
      if (w.active) {
        for (const b of this.phys.bodies) {
          if (b.dead || b.fixed || b.sleeping) continue;
          b.vx += w.accel * w.dir * dt;
        }
      }
    }
    const td = this.tide;
    if (td) {
      td.t += dt;
      const cycle = td.period + td.len;
      if (td.t >= cycle) td.t -= cycle;
      td.warning = td.t > td.period - td.warn && td.t < td.period;
      const was = td.active;
      td.active = td.t >= td.period ? 1 : 0;
      if (td.active && !was) this.audio.play('splash', { volume: 0.7 });
      if (td.active) {
        for (const b of this.phys.bodies) {
          if (b.dead || b.fixed || b.kind === 'ball') continue;
          if (b.sleeping && b.z > td.fromZ) {
            b.dead = true;
            this.fx.burst(b.x, b.z, ['#9fd8e8', '#ffffff', '#4cc9f0'], 16, 90);
            this.emit('washed', b);
          }
        }
      }
    }
    if (this.ball) {
      this.ballWanderT -= dt;
      if (this.ballWanderT <= 0) {
        this.ballWanderT = 1.6 + this.rng() * 1.8;
        const a = this.rng() * Math.PI * 2;
        const s = this.level.beachBall.speed;
        this.ball.vx += Math.cos(a) * s;
        this.ball.vz += Math.sin(a) * s * 0.7;
        this.ball.sleeping = false;
      }
      // keep the ball on the felt, away from the gutter
      if (this.ball.z < TABLE.launchStripZ + 60) { this.ball.vz = Math.abs(this.ball.vz) + 40; }
    }
  }

  processEvents() {
    for (const e of this.phys.events) {
      if (e.type === 'merge') this.doMerge(e.a, e.b);
      else if (e.type === 'hit') {
        this.audio.play('clink', { volume: Math.min(1, e.impact / 500), detune: 0.08 });
        if (e.a.kind === 'ball' || e.b.kind === 'ball') continue;
        this.fx.sparkle(e.x, e.z, 3);
      } else if (e.type === 'rail') {
        this.audio.play('thunk', { volume: Math.min(0.8, e.impact / 600) });
      } else if (e.type === 'land') {
        this.audio.play('thunk', { volume: Math.min(0.6, e.impact / 900), rate: 1.4 });
      }
    }
  }

  doMerge(a, b) {
    const tier = a.tier;
    const t = TIERS[tier - 1];

    if (tier >= 11) {
      // pressure valve: two Paradise Atlas clink and vanish
      a.dead = b.dead = true;
      this.addScore(TOP_TIER_CLINK_BONUS, (a.x + b.x) / 2, (a.z + b.z) / 2, true);
      this.fx.addFlash('#ffd700', 0.35);
      this.fx.addShake(1.2);
      this.fx.burst((a.x + b.x) / 2, (a.z + b.z) / 2, [t.color, t.alt, '#ffffff'], 40, 160, { up: 2 });
      this.setTimeScale(0.04, 0.16);   // near-freeze on the legendary clink
      this.audio.play('fanfare');
      this.emit('atlasClink');
      return;
    }

    const nt = TIERS[tier];        // tier+1 definition
    const m = a.mass + b.mass;
    let nx = (a.x * a.mass + b.x * b.mass) / m;
    let nz = (a.z * a.mass + b.z * b.mass) / m;
    // merge-forgiveness: never spawn on the foul line
    const minZ = TABLE.foulLine + nt.r + 12;
    if (nz < minZ) nz = minZ;
    nx = Math.max(-TABLE.halfW + nt.r + 2, Math.min(TABLE.halfW - nt.r - 2, nx));

    const wasBank = (a.banks || 0) + (b.banks || 0) > 0 && (a.flicked || b.flicked);
    a.dead = b.dead = true;

    const nb = this.phys.add(makeBody(tier + 1, nx, nz, nt.r));
    // momentum conserved, clamped so a merge can never eject anything
    nb.vx = (a.vx * a.mass + b.vx * b.mass) / m * 0.7;
    nb.vz = (a.vz * a.mass + b.vz * b.mass) / m * 0.7;
    const sp = Math.hypot(nb.vx, nb.vz);
    if (sp > 260) { nb.vx *= 260 / sp; nb.vz *= 260 / sp; }
    nb.sleeping = false;
    nb.mergeLock = SPAWN.mergeLock;
    nb.immunity = SPAWN.spawnImmunity;
    nb.vy = 140;                 // little celebratory hop
    nb.born = 0;                 // 0..1 pop-in tween, advanced by advancePopIn()

    // lifetime stats (the dead totalMerges/maxCombo fields, now wired)
    this.save.data.totalMerges = (this.save.data.totalMerges || 0) + 1;

    // scoring
    this.combo = this.comboTimer > 0 || this.combo === 0 ? this.combo + 1 : 1;
    this.comboTimer = COMBO.window;
    if (this.combo > (this.save.data.maxCombo || 0)) this.save.data.maxCombo = this.combo;
    const mult = Math.min(this.combo, COMBO.cap);
    let pts = nt.score * mult;
    if (wasBank) {
      pts += 5;
      this.bankMerges++;
      const sg = this.level.sideGoal;
      if (sg && sg.type === 'bank' && sg.bonus && this.bankMerges === sg.count) {
        pts += sg.bonus; this.emit('sideGoalDone');
      }
      this.emit('bankMerge');
    }
    // 'combo' side goal: pay the bonus once, the first chain to reach the target
    const cg = this.level.sideGoal;
    if (cg && cg.type === 'combo' && cg.bonus && this.combo >= cg.count && this.runMaxCombo < cg.count) {
      pts += cg.bonus; this.emit('sideGoalDone');
    }
    if (this.combo > this.runMaxCombo) this.runMaxCombo = this.combo;
    this.addScore(pts, nx, nz);

    if (tier + 1 > this.maxTierMade) {
      this.maxTierMade = tier + 1;
      this.emit('newTier', tier + 1);
    }
    if (!this.goalDone && tier + 1 >= this.level.goalTier) {
      this.goalDone = true;
      this.emit('goalDone');
    }

    // juice — droplets, a shockwave ring, and a cute sparkle pop that grows
    // with the tier so bigger mixes twinkle more
    this.fx.burst(nx, nz, [t.color, t.alt], 12 + tier * 2, 70 + tier * 8);
    this.fx.ring(nx, nz, nt.color, nt.r * 1.8);
    this.fx.sparkle(nx, nz, 5 + tier * 2);
    // the creatures react: the new one cheers, the neighbours look over
    nb.cheer = 1;
    for (const o of this.phys.bodies) {
      if (o.dead || o.fixed || o === nb) continue;
      if (Math.hypot(o.x - nx, o.z - nz) < 190) o.cheer = Math.max(o.cheer || 0, 0.55);
    }
    if (mult >= 2) this.emit('combo', { mult, callout: COMBO_CALLOUTS[Math.min(mult, 5)] });
    if (mult >= 3) this.audio.play('shaker', { volume: 0.28 + mult * 0.04, detune: 0.05 });
    if (tier + 1 >= 8) {
      this.fx.addShake(0.5 + (tier - 7) * 0.2);
      this.fx.addFlash(nt.color, 0.18);
      this.setTimeScale(0.34, 0.13 + (tier - 7) * 0.03);  // savour the reveal
      this.emit('bigMerge', tier + 1);
    }
    this.audio.play('merge' + (tier + 1), { volume: 0.8 });
    this.audio.play('splashSmall', { volume: 0.5, detune: 0.1 });
    // Big mixes get their own escalating buzz so the top of the chain FEELS rare;
    // the tier-11 finale (Atlas) earns a celebratory five-pulse.
    const made = tier + 1;
    // mixing a CAT glass gets a meow — the legendary Atlas gets the big one
    if (CAT_TIERS.has(made)) {
      this.audio.play(made >= 11 ? 'meowBig' : 'meow', { volume: 0.62, detune: 0.07 });
    }
    this.audio.haptic(
      made >= 11 ? [30, 40, 30, 40, 60] :
      made >= 9 ? [18, 35, 18, 35, 30] :
      this.combo >= 3 ? [10, 30, 20] : 8);
    this.emit('merge', { tier: tier + 1, x: nx, z: nz, mult });
    this.autosave();
  }

  addScore(pts, x, z, big = false) {
    this.score += pts;
    this.fx.text(x, z, '+' + pts, big ? '#ffd700' : '#ffffff', big ? 1.5 : 1);
  }

  checkGutter() {
    for (const b of this.phys.bodies) {
      if (b.dead || b.fixed) continue;
      if (b.z + b.r < TABLE.foulLine) {
        if (b.kind === 'ball') { b.z = 400; b.x = 0; b.vx = 0; b.vz = 0; continue; }
        b.dead = true;
        this.fx.burst(b.x, TABLE.foulLine - 20, ['#9fd8e8', '#ffffff'], 10, 70);
        this.audio.play('splash', { volume: 0.5 });
        this.emit('spilled', b);
      }
    }
  }

  checkOrders(dt) {
    if (!this.level.orders) return;
    for (let i = 0; i < this.orders.length; i++) {
      const o = this.orders[i];
      if (!o) continue;
      o.t += dt;
      if (o.t > ORDERS.softTimer) { this.pushOrder(i); continue; }
      for (const b of this.phys.bodies) {
        if (b.dead || b.fixed || b.noMerge || b.tier !== o.tier) continue;
        const d = Math.hypot(b.x - o.x, b.z - o.z);
        if (d < ORDERS.dockR + b.r) {
          b.dead = true;
          const pts = Math.max(1, TIERS[b.tier - 1].score) * ORDERS.payMult;
          this.addScore(pts, o.x, o.z - 40, true);
          this.ordersServed++;
          this.fx.burst(o.x, o.z - 20, ['#ffd700', '#ffffff'], 14, 90, { up: 1.6 });
          this.fx.ring(o.x, o.z - 20, '#ffd700', 60);
          this.audio.play('order');
          this.audio.play('pour', { volume: 0.5, detune: 0.08 });
          this.audio.haptic([10, 30, 20]);
          this.emit('orderServed', { tier: o.tier, pts });
          this.pushOrder(i);
          break;
        }
      }
    }
  }

  checkOvercrowd(dt) {
    let crowding = false;
    for (const b of this.phys.bodies) {
      if (b.dead || b.fixed || b.kind === 'ball') continue;
      if (b.sleeping && b.immunity <= 0 && b.z - b.r < TABLE.launchStripZ) { crowding = true; break; }
    }
    if (crowding) {
      this.overcrowdT += dt;
      if (this.overcrowdT >= FAIL.dwell) {
        if (this.zen) {
          // vacation mode: auto-serve the offender instead of failing
          let victim = null;
          for (const b of this.phys.bodies) {
            if (!b.dead && !b.fixed && b.kind !== 'ball' && b.sleeping && b.z - b.r < TABLE.launchStripZ) { victim = b; break; }
          }
          if (victim) {
            victim.dead = true;
            this.fx.burst(victim.x, victim.z, ['#ffffff', '#ffd700'], 10, 80);
            this.emit('autoServed', victim);
          }
          this.overcrowdT = 0;
        } else {
          this.finish(false, 'overcrowd');
        }
      }
    } else {
      this.overcrowdT = 0;
    }
  }

  checkEnd(dt) {
    if (this.zen) return;
    // Reaching the goal does NOT end the level — the remaining flicks are
    // the star budget. The player can cash out early via finishNow().
    if (this.offering) return;                 // waiting on the refill answer
    if (this.flicksLeft <= 0 && this.tee.ready) {
      if (!this.phys.anyMoving() && this.comboTimer <= 0) {
        if (this.goalDone && this.sideGoalDone()) this.finish(true);
        else if ((this.refills || 0) < REFILL.max && this.canOfferRefill && this.canOfferRefill()) {
          this.offering = true;                // "one more round?"
          this.emit('offerRefill', { used: this.refills || 0, gives: REFILL.flicks });
        } else this.finish(false, 'flicks');
      }
    }
  }

  // Accepted the refill: top the cooler back up and hand the tee back.
  grantFlicks(n = REFILL.flicks) {
    this.offering = false;
    this.refills = (this.refills || 0) + 1;
    this.flicksLeft += n;
    this.tee = { tier: this.queue[0], ready: true, t: 1 };
    this.emit('refilled', { n, left: this.flicksLeft });
    this.autosave();
  }

  declineRefill() {
    this.offering = false;
    this.finish(false, 'flicks');
  }

  finishNow() {
    if (this.state !== S.AIMING) return;
    // Zen/Endless/Daily have no "cash out" — they end only by clogging the line.
    if (this.zen || this.endless) return;
    if (this.goalDone && this.sideGoalDone()) this.finish(true);
  }

  sideGoalCur() {
    const sg = this.level.sideGoal;
    if (!sg) return 0;
    if (sg.type === 'bank') return this.bankMerges;
    if (sg.type === 'combo') return this.runMaxCombo;
    return this.ordersServed;
  }

  sideGoalDone() {
    const sg = this.level.sideGoal;
    if (!sg || !sg.required) return true;
    return this.sideGoalCur() >= sg.count;
  }

  sideGoalHit() {
    const sg = this.level.sideGoal;
    if (!sg) return false;
    return this.sideGoalCur() >= sg.count;
  }

  sideGoalProgress() {
    const sg = this.level.sideGoal;
    if (!sg) return null;
    return { ...sg, cur: this.sideGoalCur() };
  }

  finish(won, reason = null) {
    if (this.state === S.WON || this.state === S.FAILED) return;
    this.state = won ? S.WON : S.FAILED;

    // Endless / Daily: score-chase runs, no stars, own records. Daily runs on
    // the endless ruleset (endless:true) too, so check daily FIRST.
    if (this.endless || this.daily) {
      let isBest = false, streak = 0;
      if (this.daily) {
        const r = this.save.recordDaily(this.dayKey, this.score);
        isBest = r.isBest; streak = r.streak;
      } else {
        isBest = this.save.recordEndless(this.score);
      }
      this.audio.play(won ? 'win' : 'lose');
      this.result = {
        won, reason, score: this.score, seed: this.seed,
        mode: this.daily ? 'daily' : 'endless',
        newBest: isBest, best: this.daily ? this.save.data.dailyBest : this.save.data.endlessBest,
        streak, maxTier: this.maxTierMade,
      };
      // NOTE: do NOT clearSaved() here. Endless/Daily never write the campaign
      // run slot (autosave skips them), so clearing it would wipe an unrelated
      // in-progress campaign resume the player still expects on the title.
      this.emit('finished', this.result);
      return;
    }

    // Capture the PRIOR records before recordResult overwrites them, so the
    // result screen can honestly say "NEW BEST" and how far the next star is.
    const prevBest = this.save.data.bestScore[this.level.id] || 0;
    const prevStars = this.save.starsFor(this.level.id);
    let stars = 0;
    if (won) {
      stars = 1;
      if (this.score >= this.level.star2) stars = 2;
      if (this.score >= this.level.star3) stars = 3;
      this.save.recordResult(this.level.id, this.score, stars, this.maxTierMade);
      this.audio.play('win');
      this.fx.addFlash('#ffffff', 0.25);
    } else {
      this.audio.play('lose');
    }
    const nextStar = stars >= 3 ? null : (stars >= 2 || this.score >= this.level.star2 ? this.level.star3 : this.level.star2);
    this.result = {
      won, stars, reason, score: this.score, seed: this.seed,
      prevBest, prevStars, newBest: won && this.score > prevBest,
      nextStar, toNextStar: nextStar ? Math.max(0, nextStar - this.score) : 0,
    };
    this.clearSaved();
    this.emit('finished', this.result);
  }

  // ---- mid-run persistence ("picks up right where you left off") ----

  autosave() {
    // Only the campaign is resumable. Zen/Endless/Daily keep their own best-score
    // state and must never be restored through the single-slot campaign run (that
    // would drop the mode flag and reload them as an ordinary level).
    if (this.zen || this.endless || this.state !== S.AIMING) return;
    try {
      const bodies = this.phys.bodies
        .filter(b => !b.dead && !b.fixed && b.kind !== 'ball')
        .map(b => [b.tier, Math.round(b.x), Math.round(b.z)]);
      localStorage.setItem('flicktail.run', JSON.stringify({
        level: this.level.id, seed: this.seed, score: this.score,
        flicksLeft: this.flicksLeft, queue: this.queue, bodies,
        maxTierMade: this.maxTierMade, goalDone: this.goalDone,
        bankMerges: this.bankMerges, ordersServed: this.ordersServed,
        runMaxCombo: this.runMaxCombo,
      }));
    } catch {}
  }

  clearSaved() { try { localStorage.removeItem('flicktail.run'); } catch {} }

  static savedRun() {
    try { return JSON.parse(localStorage.getItem('flicktail.run')); } catch { return null; }
  }

  restoreState(s) {
    this.score = s.score;
    this.flicksLeft = s.flicksLeft;
    this.queue = s.queue;
    this.maxTierMade = s.maxTierMade;
    this.goalDone = s.goalDone;
    this.bankMerges = s.bankMerges || 0;
    this.ordersServed = s.ordersServed || 0;
    this.runMaxCombo = s.runMaxCombo || 0;
    this.tee = { tier: this.queue[0], ready: true, t: 1 };
    for (const [tier, x, z] of s.bodies) {
      const b = this.phys.add(makeBody(tier, x, z, TIERS[tier - 1].r));
      b.immunity = 1.0;
    }
  }
}
