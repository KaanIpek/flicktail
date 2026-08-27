// 2D circle physics on the table plane (x, z), tuned for the feel of glass
// sliding on wood: exponential damping (per-level friction skin, optionally
// per-zone) plus Coulomb constant deceleration and a hard stop snap.
//
// Collision is swept (time-of-impact ordered) inside each fixed step, so a
// full-strength flick can never tunnel through a small drink or a rail.

import { PHYS, FRICTION } from './config.js';

let nextId = 1;

export function makeBody(tier, x, z, r, opts = {}) {
  return {
    id: nextId++,
    tier, x, z, r,
    vx: 0, vz: 0,
    mass: (r * r) / 400,
    y: 0, vy: 0,          // height off the table, for spawn drops / merge pops
    sleeping: true,
    fixed: false,          // static obstacle (motu island)
    noMerge: false,        // beach ball etc.
    mergeLock: 0,          // seconds this body refuses to merge (post-spawn)
    immunity: 0,           // seconds of overcrowd-check immunity
    justHit: 0,
    dead: false,
    ...opts,
  };
}

export class Physics {
  constructor() {
    this.bodies = [];
    this.walls = [];
    this.frictionK = FRICTION.wood;
    this.frictionAt = null;    // (x, z) => k, for zone levels
    this.restitution = PHYS.restitution;
    this.wallRestitution = PHYS.wallRestitution;
    this.events = [];
  }

  setWalls(walls) { this.walls = walls; }

  add(b) { this.bodies.push(b); return b; }

  clear() { this.bodies.length = 0; this.events.length = 0; }

  anyMoving() {
    return this.bodies.some(b => !b.dead && !b.fixed && (!b.sleeping || b.y > 0));
  }

  step(dt) {
    this.events.length = 0;
    const bodies = this.bodies;

    // ---- integrate friction & height ----
    for (const b of bodies) {
      if (b.dead || b.fixed) continue;
      if (b.mergeLock > 0) b.mergeLock -= dt;
      if (b.immunity > 0) b.immunity -= dt;
      if (b.justHit > 0) b.justHit -= dt;
      if (b.y > 0 || b.vy !== 0) {
        b.vy -= PHYS.gravity * dt;
        b.y += b.vy * dt;
        if (b.y <= 0) {
          if (b.vy < -240) this.events.push({ type: 'land', body: b, impact: -b.vy });
          b.y = 0; b.vy = 0;
        }
      }
      const sp = Math.hypot(b.vx, b.vz);
      if (sp > 0) {
        const k = this.frictionAt ? this.frictionAt(b.x, b.z) : this.frictionK;
        let ns = sp * Math.exp(-k * dt) - PHYS.coulomb * dt;
        if (ns <= PHYS.stopSpeed) {
          b.vx = 0; b.vz = 0;
          if (!b.sleeping) { b.sleeping = true; this.events.push({ type: 'sleep', body: b }); }
        } else {
          const f = ns / sp;
          b.vx *= f; b.vz *= f;
          b.sleeping = false;
        }
      }
    }

    // ---- swept movement with time-of-impact resolution ----
    let remaining = dt;
    let guard = 10;
    while (remaining > 1e-6 && guard-- > 0) {
      let toi = remaining, hit = null;

      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i];
        if (a.dead) continue;
        for (let j = i + 1; j < bodies.length; j++) {
          const b = bodies[j];
          if (b.dead) continue;
          if (a.fixed && b.fixed) continue;
          const t = sweepCircles(a, b, remaining);
          if (t !== null && t < toi) { toi = t; hit = { kind: 'pair', a, b }; }
        }
        if (!a.fixed && (a.vx !== 0 || a.vz !== 0)) {
          for (const w of this.walls) {
            const t = sweepWall(a, w, remaining);
            if (t !== null && t < toi) { toi = t; hit = { kind: 'wall', a, w }; }
          }
        }
      }

      for (const b of bodies) {
        if (b.dead || b.fixed) continue;
        b.x += b.vx * toi;
        b.z += b.vz * toi;
      }
      remaining -= toi;

      if (hit) {
        if (hit.kind === 'pair') this.resolvePair(hit.a, hit.b);
        else this.resolveWall(hit.a, hit.w);
      }
    }

    // ---- overlap correction (spawns, merge pops) ----
    for (let iter = 0; iter < 2; iter++) {
      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i];
        if (a.dead) continue;
        for (let j = i + 1; j < bodies.length; j++) {
          const b = bodies[j];
          if (b.dead || (a.fixed && b.fixed)) continue;
          const dx = b.x - a.x, dz = b.z - a.z;
          const rr = a.r + b.r;
          const d2 = dx * dx + dz * dz;
          if (d2 > 1e-9 && d2 < rr * rr) {
            const d = Math.sqrt(d2);
            const push = (rr - d) * 0.8;
            const nx = dx / d, nz = dz / d;
            if (a.fixed) { b.x += nx * push; b.z += nz * push; }
            else if (b.fixed) { a.x -= nx * push; a.z -= nz * push; }
            else {
              a.x -= nx * push / 2; a.z -= nz * push / 2;
              b.x += nx * push / 2; b.z += nz * push / 2;
            }
            this.maybeMerge(a, b);
          }
        }
        if (!a.fixed) {
          for (const w of this.walls) {
            const pen = wallPenetration(a, w);
            if (pen > 0) { a.x += w.nx * pen; a.z += w.nz * pen; }
          }
        }
      }
    }
  }

  resolvePair(a, b) {
    const dx = b.x - a.x, dz = b.z - a.z;
    const d = Math.hypot(dx, dz) || 1e-6;
    const nx = dx / d, nz = dz / d;
    const rvx = b.vx - a.vx, rvz = b.vz - a.vz;
    const vn = rvx * nx + rvz * nz;
    if (vn < 0) {
      const e = this.restitution;
      const im1 = a.fixed ? 0 : 1 / a.mass;
      const im2 = b.fixed ? 0 : 1 / b.mass;
      if (im1 + im2 > 0) {
        const jn = -(1 + e) * vn / (im1 + im2);
        a.vx -= jn * nx * im1; a.vz -= jn * nz * im1;
        b.vx += jn * nx * im2; b.vz += jn * nz * im2;
        const impact = Math.abs(vn);
        if (impact > PHYS.hitEventSpeed) {
          this.events.push({ type: 'hit', a, b, impact, x: a.x + nx * a.r, z: a.z + nz * a.r });
          a.justHit = b.justHit = 0.15;
        }
        if (!a.fixed) a.sleeping = false;
        if (!b.fixed) b.sleeping = false;
      }
    }
    this.maybeMerge(a, b);
  }

  resolveWall(a, w) {
    const vn = a.vx * w.nx + a.vz * w.nz;
    if (vn < 0) {
      const e = this.wallRestitution;
      a.vx -= (1 + e) * vn * w.nx;
      a.vz -= (1 + e) * vn * w.nz;
      a.banks = (a.banks || 0) + 1;
      if (Math.abs(vn) > PHYS.hitEventSpeed) {
        this.events.push({ type: 'rail', body: a, impact: Math.abs(vn), x: a.x, z: a.z, wall: w });
      }
    }
  }

  maybeMerge(a, b) {
    if (a.dead || b.dead || a.fixed || b.fixed) return;
    if (a.noMerge || b.noMerge) return;
    if (a.tier !== b.tier) return;
    if (a.mergeLock > 0 || b.mergeLock > 0) return;
    // Lock both so a triple contact in the same step can't claim a body twice;
    // the game layer executes the merge end-of-step.
    a.mergeLock = b.mergeLock = 999;
    this.events.push({ type: 'merge', a, b });
  }
}

// Earliest time in [0, dt] at which the two swept circles touch, else null.
function sweepCircles(a, b, dt) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const dvx = b.vx - a.vx, dvz = b.vz - a.vz;
  const rr = a.r + b.r;
  const c = dx * dx + dz * dz - rr * rr;
  if (c < 0) return null;                      // already overlapping — handled by correction
  const bq = dx * dvx + dz * dvz;
  if (bq >= 0) return null;                    // separating
  const aq = dvx * dvx + dvz * dvz;
  if (aq < 1e-12) return null;
  const disc = bq * bq - aq * c;
  if (disc < 0) return null;
  const t = (-bq - Math.sqrt(disc)) / aq;
  return (t >= 0 && t <= dt) ? t : null;
}

// Swept circle vs wall segment.
function sweepWall(a, w, dt) {
  const dist = (a.x - w.ax) * w.nx + (a.z - w.az) * w.nz - a.r;
  const vn = a.vx * w.nx + a.vz * w.nz;
  if (vn >= 0) return null;
  if (dist < 0) return null;
  const t = dist / -vn;
  if (t > dt) return null;
  const cx = a.x + a.vx * t, cz = a.z + a.vz * t;
  const ex = w.bx - w.ax, ez = w.bz - w.az;
  const len2 = ex * ex + ez * ez;
  const u = ((cx - w.ax) * ex + (cz - w.az) * ez) / len2;
  const slack = a.r / Math.sqrt(len2);
  if (u < -slack || u > 1 + slack) return null;
  return t;
}

function wallPenetration(a, w) {
  const dist = (a.x - w.ax) * w.nx + (a.z - w.az) * w.nz - a.r;
  if (dist >= 0 || dist < -a.r) return 0;
  const ex = w.bx - w.ax, ez = w.bz - w.az;
  const len2 = ex * ex + ez * ez;
  const u = ((a.x - w.ax) * ex + (a.z - w.az) * ez) / len2;
  if (u < -0.02 || u > 1.02) return 0;
  return -dist;
}

export function wall(ax, az, bx, bz) {
  // normal = left of a->b; wind the felt polygon counter-clockwise so normals
  // point inward.
  const ex = bx - ax, ez = bz - az;
  const len = Math.hypot(ex, ez) || 1;
  return { ax, az, bx, bz, nx: -ez / len, nz: ex / len };
}

// Build wall list from a level definition (rail polyline + inner walls).
export function buildWalls(level) {
  const walls = [];
  const pts = level.rails;
  for (let i = 0; i < pts.length - 1; i++) {
    walls.push(wall(pts[i].x, pts[i].z, pts[i + 1].x, pts[i + 1].z));
  }
  if (level.innerWalls) {
    for (const iw of level.innerWalls) {
      const p = iw.pts;
      for (let i = 0; i < p.length - 1; i++) {
        walls.push(wall(p[i].x, p[i].z, p[i + 1].x, p[i + 1].z));
        if (iw.both) walls.push(wall(p[i + 1].x, p[i + 1].z, p[i].x, p[i].z));
      }
    }
  }
  return walls;
}
