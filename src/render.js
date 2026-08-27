// Everything on and around the table. The table itself is pre-rendered once
// per level into an offscreen canvas and blitted each frame.
//
// Presentation goals: the table reads as REAL wood with raised 3D rails, the
// drinks sit IN the scene (directional soft shadows, glossy reflections, a
// subtle billboard lean toward the camera), and every level gets a light
// grade + vignette so the backdrop and the table feel like one place.

import { TABLE, TIERS, ORDERS, FRICTION } from './config.js';

const RAIL_H = 24;        // world units of rail height
const RAIL_TH = 26;       // world units of rail thickness (outward)

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

    // base wood gradient (darker far away = distance haze)
    const farY = view.project(0, 0, TABLE.length).y;
    const nearY = view.project(0, 0, TABLE.foulLine).y;
    const g = ctx.createLinearGradient(0, farY, 0, nearY);
    g.addColorStop(0, shade('#9a6540', -0.30));
    g.addColorStop(0.5, shade('#ad7449', -0.04));
    g.addColorStop(1, shade('#c08454', 0.10));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();

    // planks with per-plank jitter + grain
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const plankW = 64;
    for (let x = -TABLE.halfW; x < TABLE.halfW; x += plankW) {
      const tone = (rnd() - 0.5) * 0.14;
      const p0 = view.project(x, 0, TABLE.foulLine);
      const p1 = view.project(x, 0, TABLE.length);
      const q0 = view.project(Math.min(x + plankW, TABLE.halfW), 0, TABLE.foulLine);
      const q1 = view.project(Math.min(x + plankW, TABLE.halfW), 0, TABLE.length);
      ctx.fillStyle = tone >= 0 ? `rgba(255,225,190,${tone})` : `rgba(30,10,0,${-tone})`;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(q1.x, q1.y); ctx.lineTo(q0.x, q0.y);
      ctx.closePath(); ctx.fill();
      // plank gap
      ctx.strokeStyle = 'rgba(20,8,2,0.35)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      // grain streaks
      for (let i = 0; i < 3; i++) {
        const gx = x + rnd() * plankW;
        const a0 = view.project(gx, 0, TABLE.foulLine + rnd() * 300);
        const a1 = view.project(gx + (rnd() - 0.5) * 14, 0, TABLE.foulLine + 300 + rnd() * 540);
        ctx.strokeStyle = `rgba(40,18,6,${0.05 + rnd() * 0.08})`;
        ctx.lineWidth = 1 + rnd() * 1.6;
        ctx.beginPath(); ctx.moveTo(a0.x, a0.y);
        ctx.quadraticCurveTo((a0.x + a1.x) / 2 + (rnd() - 0.5) * 20, (a0.y + a1.y) / 2, a1.x, a1.y);
        ctx.stroke();
      }
    }

    // scene stain: the level's felt color as a gentle wash (the wood should
    // stay warm and recognizable; the scene only kisses it)
    ctx.fillStyle = hexToRgba(level.felt, 0.14);
    ctx.fillRect(0, 0, w, h);

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

    // ---- front apron (the table's near face) ----
    const e0 = view.project(nearL.x, 0, TABLE.foulLine);
    const e1 = view.project(nearR.x, 0, TABLE.foulLine);
    const apronH = Math.min(h - Math.min(e0.y, e1.y), 140);
    if (apronH > 4) {
      const ag = ctx.createLinearGradient(0, e0.y, 0, e0.y + apronH);
      ag.addColorStop(0, shade('#7c4e2e', -0.05));
      ag.addColorStop(0.12, shade('#5e3a20', -0.05));
      ag.addColorStop(1, shade('#2e1c0e', -0.2));
      ctx.fillStyle = ag;
      ctx.fillRect(Math.min(e0.x, e1.x) - 30, e0.y - 2, Math.abs(e1.x - e0.x) + 60, apronH + 4);
      // apron grain
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      for (let i = 0; i < 12; i++) {
        const ax = Math.min(e0.x, e1.x) + (i + 0.5) * (Math.abs(e1.x - e0.x) / 12);
        ctx.lineWidth = 1 + (i % 3);
        ctx.beginPath(); ctx.moveTo(ax, e0.y); ctx.lineTo(ax + 4, e0.y + apronH); ctx.stroke();
      }
      // top edge highlight
      ctx.fillStyle = 'rgba(255,230,190,0.25)';
      ctx.fillRect(Math.min(e0.x, e1.x) - 30, e0.y - 2, Math.abs(e1.x - e0.x) + 60, 3);
    }

    this.tableCanvas = c;
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
    if (this.tableCanvas) ctx.drawImage(this.tableCanvas, 0, 0);

    // tide flood overlay
    if (game.tide && (game.tide.active || game.tide.warning)) {
      const t = game.tide;
      const a = t.active ? 0.4 : 0.12 + 0.08 * Math.sin(time * 8);
      ctx.fillStyle = `rgba(80,200,230,${a})`;
      quad(ctx, view, [-TABLE.halfW, t.fromZ], [TABLE.halfW, t.fromZ],
        [TABLE.halfW, TABLE.length], [-TABLE.halfW, TABLE.length]);
    }

    if (game.level.orders) this.drawDocks(ctx, game, time);

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
      if (b.born !== undefined && b.born < 1) b.born = Math.min(1, b.born + 0.09);
      this.drawBody(ctx, b, time, glossA);
    }

    if (game.tee.ready && game.state === 'aiming') this.drawTee(ctx, game, time);

    if (game.wind && (game.wind.warning || game.wind.active)) this.drawWind(ctx, game, time);

    // foreground framing + scene grade + vignette over everything
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

    const tier = TIERS[b.tier - 1];
    const img = this.assets.image('tier' + String(b.tier).padStart(2, '0'));
    const born = b.born === undefined ? 1 : b.born;
    const pop = born < 1 ? 0.7 + 0.38 * easeOutBack(born) : 1;
    const bob = b.sleeping ? Math.sin(time * 2 + b.id) * 0.01 : 0;
    const squash = b.justHit > 0 ? 1 - b.justHit * 0.6 : 1;
    // oversized silhouettes for small tiers; physics footprint stays honest
    const vis = 1.62 - 0.034 * (b.tier - 1);
    const wpx = b.r * 2 * p.s * vis * pop * (1 + bob);
    const hpx = view.project(b.x, b.y, b.z);
    // billboard lean: drinks off-center shear subtly toward the camera axis
    const shear = (this.view.cx - p.x) / this.view.w * 0.12;

    if (img) {
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
      ctx.drawImage(img, -wpx / 2, -ih * 0.96 * squash, wpx, ih * squash);
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
    const b = { tier: game.tee.tier, x: 0, z: TABLE.launchZ, r: TIERS[game.tee.tier - 1].r, y: 0, sleeping: true, id: 0, justHit: 0 };
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
    dotLine(ctx, view, ox, oz, ox + dx * bestT, oz + dz * bestT, `rgba(255,255,255,${0.35 + powFrac * 0.45})`);
    if (hitWall) {
      const vn = dx * hitWall.nx + dz * hitWall.nz;
      const rx = dx - 2 * vn * hitWall.nx, rz = dz - 2 * vn * hitWall.nz;
      const hx = ox + dx * bestT, hz = oz + dz * bestT;
      dotLine(ctx, view, hx, hz, hx + rx * 180, hz + rz * 180, 'rgba(255,255,255,0.25)');
    }

    const p = view.project(0, 0, TABLE.launchZ);
    ctx.strokeStyle = powFrac > 0.85 ? '#ff6d7f' : '#7fe3ff';
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
      const img = this.assets.image('tier' + String(o.tier).padStart(2, '0'));
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
