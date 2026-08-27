// Everything on and around the table. The felt itself is pre-rendered once
// per level into an offscreen canvas and blitted each frame.

import { TABLE, TIERS, ORDERS } from './config.js';

export class Renderer {
  constructor(view, assets) {
    this.view = view;
    this.assets = assets;
    this.tableCanvas = null;
    this.level = null;
  }

  setLevel(level, w, h) {
    this.level = level;
    this.prerenderTable(w, h);
  }

  prerenderTable(w, h) {
    const view = this.view;
    const level = this.level;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    const pts = level.rails.map(p => view.project(p.x, 0, p.z));
    const nearL = view.project(-railX(level, 'left'), 0, TABLE.foulLine);
    const nearR = view.project(railX(level, 'right'), 0, TABLE.foulLine);

    // --- rail side faces (drawn as a fat dark underlay behind the felt) ---
    ctx.save();
    ctx.beginPath();
    polyPath(ctx, pts);
    ctx.lineWidth = 26;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = shade(level.rail, -0.35);
    ctx.stroke();
    ctx.lineWidth = 18;
    ctx.strokeStyle = level.rail;
    ctx.stroke();
    ctx.lineWidth = 7;
    ctx.strokeStyle = shade(level.rail, 0.25);
    ctx.stroke();
    ctx.restore();

    // --- felt ---
    const poly = [...pts, nearL];
    ctx.beginPath();
    ctx.moveTo(nearR.x, nearR.y);
    polyPath(ctx, pts, true);
    ctx.lineTo(nearL.x, nearL.y);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, view.project(0, 0, TABLE.length).y, 0, nearL.y);
    g.addColorStop(0, shade(level.felt, -0.22));
    g.addColorStop(1, shade(level.felt, 0.12));
    ctx.fillStyle = g;
    ctx.fill();

    // wood planks with perspective convergence
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    for (let i = -4; i <= 4; i++) {
      const x = i * 76;
      const a = this.view.project(x, 0, TABLE.foulLine);
      const b = this.view.project(x, 0, TABLE.length);
      ctx.lineWidth = Math.max(1, 2.2 * a.s / this.view.project(0, 0, TABLE.foulLine).s);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    // subtle horizontal grain
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let z = 140; z < TABLE.length; z += 90) {
      const a = this.view.project(-TABLE.halfW, 0, z);
      const b = this.view.project(TABLE.halfW, 0, z);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    // friction zones
    if (level.zones) {
      for (const zn of level.zones) {
        ctx.fillStyle = zn.tint;
        ctx.beginPath();
        const q = [
          this.view.project(zn.xMin, 0, zn.zMin), this.view.project(zn.xMax, 0, zn.zMin),
          this.view.project(zn.xMax, 0, zn.zMax), this.view.project(zn.xMin, 0, zn.zMax),
        ];
        ctx.moveTo(q[0].x, q[0].y); ctx.lineTo(q[1].x, q[1].y);
        ctx.lineTo(q[2].x, q[2].y); ctx.lineTo(q[3].x, q[3].y);
        ctx.closePath(); ctx.fill();
      }
    }

    // launch strip + foul line
    const ls = [
      this.view.project(-TABLE.halfW, 0, TABLE.foulLine), this.view.project(TABLE.halfW, 0, TABLE.foulLine),
      this.view.project(TABLE.halfW, 0, TABLE.launchStripZ), this.view.project(-TABLE.halfW, 0, TABLE.launchStripZ),
    ];
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.moveTo(ls[0].x, ls[0].y); ctx.lineTo(ls[1].x, ls[1].y);
    ctx.lineTo(ls[2].x, ls[2].y); ctx.lineTo(ls[3].x, ls[3].y);
    ctx.closePath(); ctx.fill();

    ctx.setLineDash([14, 10]);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    const f0 = this.view.project(-TABLE.halfW, 0, TABLE.launchStripZ);
    const f1 = this.view.project(TABLE.halfW, 0, TABLE.launchStripZ);
    ctx.beginPath(); ctx.moveTo(f0.x, f0.y); ctx.lineTo(f1.x, f1.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // inner walls (terrace rails)
    if (level.innerWalls) {
      for (const iw of level.innerWalls) {
        const p = iw.pts.map(q => this.view.project(q.x, 0, q.z));
        ctx.lineCap = 'round';
        ctx.lineWidth = 16;
        ctx.strokeStyle = shade(level.rail, -0.3);
        ctx.beginPath(); polyPath(ctx, p); ctx.stroke();
        ctx.lineWidth = 10;
        ctx.strokeStyle = level.rail;
        ctx.beginPath(); polyPath(ctx, p); ctx.stroke();
        ctx.lineWidth = 4;
        ctx.strokeStyle = shade(level.rail, 0.3);
        ctx.beginPath(); polyPath(ctx, p); ctx.stroke();
      }
    }

    // near edge: table front face falling to the gutter
    const e0 = this.view.project(-railX(level, 'left'), 0, TABLE.foulLine);
    const e1 = this.view.project(railX(level, 'right'), 0, TABLE.foulLine);
    const fg = ctx.createLinearGradient(0, e0.y, 0, e0.y + 46);
    fg.addColorStop(0, shade(level.felt, -0.1));
    fg.addColorStop(1, 'rgba(6,18,31,0)');
    ctx.fillStyle = fg;
    ctx.fillRect(Math.min(e0.x, e1.x), e0.y, Math.abs(e1.x - e0.x), 48);

    this.tableCanvas = c;
  }

  // ---- per frame ----

  draw(ctx, game, time) {
    const view = this.view;
    if (this.tableCanvas) ctx.drawImage(this.tableCanvas, 0, 0);

    // tide flood overlay
    if (game.tide && (game.tide.active || game.tide.warning)) {
      const t = game.tide;
      const a = t.active ? 0.4 : 0.12 + 0.08 * Math.sin(time * 8);
      const q = [
        view.project(-TABLE.halfW, 0, t.fromZ), view.project(TABLE.halfW, 0, t.fromZ),
        view.project(TABLE.halfW, 0, TABLE.length), view.project(-TABLE.halfW, 0, TABLE.length),
      ];
      ctx.fillStyle = `rgba(80,200,230,${a})`;
      ctx.beginPath();
      ctx.moveTo(q[0].x, q[0].y); ctx.lineTo(q[1].x, q[1].y);
      ctx.lineTo(q[2].x, q[2].y); ctx.lineTo(q[3].x, q[3].y);
      ctx.closePath(); ctx.fill();
    }

    // order docks behind the far rail
    if (game.level.orders) this.drawDocks(ctx, game, time);

    // overcrowd warning pulse
    if (game.overcrowdT > 0) {
      const p = Math.min(1, game.overcrowdT / 2);
      const a = 0.18 + 0.2 * Math.sin(time * 10) + p * 0.25;
      const q = [
        view.project(-TABLE.halfW, 0, TABLE.foulLine), view.project(TABLE.halfW, 0, TABLE.foulLine),
        view.project(TABLE.halfW, 0, TABLE.launchStripZ), view.project(-TABLE.halfW, 0, TABLE.launchStripZ),
      ];
      ctx.fillStyle = `rgba(255,60,60,${Math.max(0, a)})`;
      ctx.beginPath();
      ctx.moveTo(q[0].x, q[0].y); ctx.lineTo(q[1].x, q[1].y);
      ctx.lineTo(q[2].x, q[2].y); ctx.lineTo(q[3].x, q[3].y);
      ctx.closePath(); ctx.fill();
    }

    // aim line
    if (game.aim && game.tee.ready) this.drawAim(ctx, game);

    // bodies far-to-near
    const bodies = game.phys.bodies.filter(b => !b.dead).sort((x, y) => y.z - x.z);
    for (const b of bodies) {
      if (b.born !== undefined && b.born < 1) b.born = Math.min(1, b.born + 0.09);
      this.drawBody(ctx, b, time);
    }

    // tee drink
    if (game.tee.ready && game.state === 'aiming') this.drawTee(ctx, game, time);

    // wind indicator streaks
    if (game.wind && (game.wind.warning || game.wind.active)) this.drawWind(ctx, game, time);
  }

  drawBody(ctx, b, time) {
    const view = this.view;
    const p = view.project(b.x, 0, b.z);

    if (b.fixed) {   // motu island obstacle
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ellipse(ctx, p.x, p.y, b.r * p.s * 1.05, b.r * p.s * 0.5);
      ctx.fillStyle = '#e8d5a8';
      ellipse(ctx, p.x, p.y - 6 * p.s, b.r * p.s, b.r * p.s * 0.55);
      ctx.fillStyle = '#3e8e5e';
      ellipse(ctx, p.x, p.y - 10 * p.s, b.r * p.s * 0.55, b.r * p.s * 0.3);
      return;
    }

    // shadow
    const sh = Math.max(0.25, 1 - b.y / 300);
    ctx.fillStyle = `rgba(10,20,30,${0.28 * sh})`;
    ellipse(ctx, p.x, p.y, b.r * p.s * 0.95 * (2 - sh), b.r * p.s * 0.42 * (2 - sh));

    if (b.kind === 'ball') { this.drawBall(ctx, b, p, time); return; }

    const tier = TIERS[b.tier - 1];
    const img = this.assets.image('tier' + String(b.tier).padStart(2, '0'));
    const born = b.born === undefined ? 1 : b.born;
    const pop = born < 1 ? 0.7 + 0.38 * easeOutBack(born) : 1;
    const bob = b.sleeping ? Math.sin(time * 2 + b.id) * 0.012 : 0;
    const squash = b.justHit > 0 ? 1 - b.justHit * 0.6 : 1;
    // small tiers get an oversize silhouette (physics footprint stays honest)
    const vis = 1.38 - 0.028 * (b.tier - 1);
    const w = b.r * 2 * p.s * vis * pop * (1 + bob);
    const hpx = view.project(b.x, b.y, b.z);   // height-lifted anchor

    if (img) {
      const h = w * (img.naturalHeight / img.naturalWidth);
      ctx.drawImage(img, hpx.x - w / 2, hpx.y - h * (0.96 * squash) + b.r * p.s * 0.35, w, h * squash);
    } else {
      // vector fallback while sprites stream in
      const h = w * 1.35;
      const x = hpx.x, y = hpx.y + b.r * p.s * 0.35;
      ctx.fillStyle = tier.color;
      roundRect(ctx, x - w * 0.36, y - h, w * 0.72, h * 0.92, w * 0.18);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      roundRect(ctx, x - w * 0.36, y - h, w * 0.2, h * 0.92, w * 0.09);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,30,40,0.8)';
      ctx.lineWidth = Math.max(1.5, w * 0.045);
      roundRect(ctx, x - w * 0.36, y - h, w * 0.72, h * 0.92, w * 0.18);
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
  }

  drawTee(ctx, game, time) {
    const b = { tier: game.tee.tier, x: 0, z: TABLE.launchZ, r: TIERS[game.tee.tier - 1].r, y: 0, sleeping: true, id: 0, justHit: 0 };
    // pulsing ring under the tee drink
    const p = this.view.project(0, 0, TABLE.launchZ);
    ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.2 * Math.sin(time * 4)})`;
    ctx.lineWidth = 2.5;
    ellipseStroke(ctx, p.x, p.y, (b.r + 10) * p.s, (b.r + 10) * p.s * 0.45);
    this.drawBody(ctx, b, time);
  }

  drawAim(ctx, game) {
    const view = this.view;
    const a = game.aim;
    const maxLen = 720;
    let ox = 0, oz = TABLE.launchZ;
    let dx = a.dirX, dz = a.dirZ;
    const r = TIERS[game.tee.tier - 1].r;

    // cast against walls & bodies for the first impact
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
      dotLine(ctx, view, hx, hz, hx + rx * 170, hz + rz * 170, 'rgba(255,255,255,0.25)');
    }

    // power meter arc near the tee
    const p = view.project(0, 0, TABLE.launchZ);
    ctx.strokeStyle = powFrac > 0.85 ? '#ff6d7f' : '#7fe3ff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 26, 30, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * powFrac);
    ctx.stroke();
  }

  drawDocks(ctx, game, time) {
    const view = this.view;
    for (const o of game.orders) {
      if (!o) continue;
      const p = view.project(o.x, 0, o.z + 30);
      const s = p.s;
      const w = 150 * s, h = 64 * s;
      // tray
      ctx.fillStyle = 'rgba(30,40,55,0.75)';
      roundRect(ctx, p.x - w / 2, p.y - h, w, h, 12 * s);
      ctx.fill();
      ctx.strokeStyle = '#ffd97b';
      ctx.lineWidth = 2.5 * s;
      roundRect(ctx, p.x - w / 2, p.y - h, w, h, 12 * s);
      ctx.stroke();
      // requested drink mini-sprite
      const img = this.assets.image('tier' + String(o.tier).padStart(2, '0'));
      const iw = 46 * s;
      if (img) ctx.drawImage(img, p.x - iw / 2 - 26 * s, p.y - h + 8 * s, iw, iw);
      // timer ring
      const frac = 1 - o.t / ORDERS.softTimer;
      ctx.strokeStyle = frac < 0.25 ? '#ff6d7f' : '#7fe3ff';
      ctx.lineWidth = 3.5 * s;
      ctx.beginPath();
      ctx.arc(p.x + 34 * s, p.y - h / 2, 14 * s, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
      ctx.stroke();
      // catch glow on the felt
      const cg = view.project(o.x, 0, o.z);
      ctx.strokeStyle = `rgba(255,217,123,${0.3 + 0.15 * Math.sin(time * 3 + o.slot)})`;
      ctx.lineWidth = 3;
      ellipseStroke(ctx, cg.x, cg.y, ORDERS.dockR * cg.s, ORDERS.dockR * cg.s * 0.45);
    }
  }

  drawWind(ctx, game, time) {
    const w = game.wind;
    const alpha = w.active ? 0.5 : 0.25;
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const z = 200 + ((i * 137 + time * 400 * w.dir) % 600 + 600) % 600;
      const x = -TABLE.halfW + ((i * 211 + time * (w.active ? 900 : 300) * w.dir) % (TABLE.halfW * 2) + TABLE.halfW * 2) % (TABLE.halfW * 2);
      const p0 = this.view.project(x - TABLE.halfW - 40 * w.dir, 4, z);
      const p1 = this.view.project(x - TABLE.halfW, 4, z);
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    }
  }
}

// ---- small helpers ----

// lighten (amt>0) or darken (amt<0) a #rrggbb color
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

function railX(level, side) {
  // width of the table at the near edge (first/last rail points)
  const pts = level.rails;
  return side === 'right' ? Math.abs(pts[0].x) : Math.abs(pts[pts.length - 1].x);
}

function polyPath(ctx, pts, continues = false) {
  pts.forEach((p, i) => {
    if (i === 0 && !continues) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
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
    ctx.arc(p.x, p.y, Math.max(1.5, 3.2 * p.s), 0, Math.PI * 2);
    ctx.fill();
  }
}

function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
