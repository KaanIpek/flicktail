// The living postcard behind the table: the painted backdrop plus one or two
// code-drawn ambient movers (boats, cable cars, beams, birds), a slow breathing
// zoom, and sea sparkles. Runs on its own canvas at ~30 fps.

// Per-scene ambient spec: sea band (fractions of canvas height) + mover type.
const SCENES = {
  waikiki:   { mover: 'boat',     band: [0.44, 0.52], boatColor: '#ffffff', birds: true, critters: [{ t:'gull', y:0.13, period:24 }, { t:'butterfly', y:0.20, period:19, dir:-1 }, { t:'dolphin', y:0.35, period:31 }] },
  miami:     { mover: 'ship',     band: [0.40, 0.46], boatColor: '#e8e0f0', birds: true, critters: [{ t:'pelican', y:0.12, period:27 }, { t:'butterfly', y:0.22, period:21, dir:-1 }] },
  cancun:    { mover: 'parasail', band: [0.16, 0.30], birds: true, critters: [{ t:'butterfly', y:0.18, period:18 }, { t:'turtle', y:0.34, period:34, dir:-1 }, { t:'fish', y:0.36, period:23 }] },
  rio:       { mover: 'cablecar', band: [0.30, 0.38], birds: true, sparkleColor: '#ffd98e', critters: [{ t:'gull', y:0.14, period:23, dir:-1 }, { t:'butterfly', y:0.24, period:20 }] },
  nice:      { mover: 'plane',    band: [0.14, 0.24], birds: true, critters: [{ t:'butterfly', y:0.19, period:17 }, { t:'gull', y:0.11, period:26, dir:-1 }] },
  positano:  { mover: 'boat',     band: [0.52, 0.60], boatColor: '#f5f1e8', critters: [{ t:'butterfly', y:0.21, period:18, dir:-1 }, { t:'gull', y:0.13, period:25 }] },
  santorini: { mover: 'boat',     band: [0.52, 0.62], boatColor: '#f7f3ee', sparkleColor: '#ffb87a', windows: true, critters: [{ t:'gull', y:0.12, period:24 }, { t:'butterfly', y:0.23, period:20, dir:-1 }] },
  ibiza:     { mover: 'beams',    band: [0.52, 0.62], night: true, shootingStars: true, critters: [{ t:'bat', y:0.15, period:21, dir:-1 }, { t:'bat', y:0.22, period:28 }] },
  dubai:     { mover: 'shimmer',  band: [0.50, 0.62], night: true, sparkleColor: '#f2c14e', critters: [{ t:'gull', y:0.13, period:26, dir:-1 }, { t:'fish', y:0.36, period:24 }] },
  phuket:    { mover: 'longtail', band: [0.48, 0.58], boatColor: '#d14b3c', birds: true, critters: [{ t:'butterfly', y:0.20, period:18 }, { t:'dolphin', y:0.35, period:29, dir:-1 }] },
  bali:      { mover: 'kite',     band: [0.10, 0.28], sparkleColor: '#ffb25e', critters: [{ t:'butterfly', y:0.19, period:17, dir:-1 }, { t:'fish', y:0.35, period:25 }] },
  borabora:  { mover: 'ray',      band: [0.55, 0.68], birds: true, critters: [{ t:'dolphin', y:0.34, period:27 }, { t:'turtle', y:0.37, period:36, dir:-1 }, { t:'butterfly', y:0.18, period:19 }] },
  okinawa:   { mover: 'boat',     band: [0.46, 0.54], boatColor: '#f4f0e8', birds: true, critters: [{ t:'gull', y:0.12, period:25 }, { t:'butterfly', y:0.21, period:19, dir:-1 }, { t:'fish', y:0.36, period:24 }] },
  algarve:   { mover: 'boat',     band: [0.50, 0.58], boatColor: '#ffffff', birds: true, critters: [{ t:'gull', y:0.13, period:23, dir:-1 }, { t:'dolphin', y:0.35, period:30 }, { t:'butterfly', y:0.22, period:20 }] },
  whitsundays:{ mover: 'ray',     band: [0.52, 0.64], birds: true, critters: [{ t:'turtle', y:0.36, period:34 }, { t:'pelican', y:0.12, period:26, dir:-1 }, { t:'fish', y:0.34, period:22 }] },
  halong:    { mover: 'boat',     band: [0.48, 0.58], boatColor: '#c8442e', birds: true, critters: [{ t:'gull', y:0.12, period:24 }, { t:'butterfly', y:0.22, period:19, dir:-1 }, { t:'fish', y:0.35, period:23 }] },
};

export class Backdrop {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assets = assets;
    this.key = null;
    this.scene = null;
    this.t = 0;
    this.accum = 0;
    this.stars = [];
  }

  set(key) {
    this.key = key;
    this.scene = SCENES[key] || { band: [0.4, 0.5] };
    this.t = 0;
  }

  update(dt) {
    this.accum += dt;
    if (this.accum < 1 / 30) return;
    const step = this.accum;
    this.accum = 0;
    this.t += step;
    this.render();
  }

  render() {
    const { ctx, canvas } = this;
    const w = canvas.width, h = canvas.height;
    const img = this.assets.image('bg_' + this.key);
    ctx.clearRect(0, 0, w, h);

    if (img) {
      // cover fit + slow breathing zoom
      const zoom = 1.02 + 0.018 * Math.sin(this.t * 0.10);
      const ia = img.naturalWidth / img.naturalHeight;
      const ca = w / h;
      let dw, dh;
      if (ia > ca) { dh = h * zoom; dw = dh * ia; }
      else { dw = w * zoom; dh = dw / ia; }
      const dx = (w - dw) / 2 + Math.sin(this.t * 0.07) * 4;
      const dy = (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#7EC8E3'); g.addColorStop(0.55, '#BDE3F0'); g.addColorStop(1, '#F2E3C6');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    const s = this.scene;
    if (!s) return;
    const bandY = (s.band[0] + s.band[1]) / 2 * h;
    const bandH = (s.band[1] - s.band[0]) * h;

    // sea sparkles
    ctx.fillStyle = s.sparkleColor || 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 14; i++) {
      const ph = (this.t * (0.25 + (i % 5) * 0.07) + i * 0.617) % 1;
      const a = Math.sin(ph * Math.PI);
      if (a <= 0) continue;
      ctx.globalAlpha = a * 0.5;
      const x = ((i * 0.173 + Math.sin(i * 7.3) * 0.05) % 1) * w;
      const y = s.band[0] * h + ((i * 0.317) % 1) * bandH;
      ctx.fillRect(x, y, 3 + (i % 3), 1.6);
    }
    ctx.globalAlpha = 1;

    this.drawMover(ctx, w, h, bandY);

    if (s.birds) this.drawBirds(ctx, w, h);
    this.drawCritters(ctx, w, h);
    if (s.shootingStars) this.drawShootingStar(ctx, w, h);
    if (s.night) this.drawFireflies(ctx, w, h);
    else this.drawLightRays(ctx, w, h);
  }

  // volumetric-ish sun rays sweeping slowly from the top corner (day scenes)
  drawLightRays(ctx, w, h) {
    const t = this.t;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const ang = 0.55 + i * 0.16 + Math.sin(t * 0.11 + i * 2.1) * 0.05;
      const ox = w * 0.92, oy = -h * 0.05;
      const len = h * 0.85;
      const wd = 0.05 + 0.015 * Math.sin(t * 0.17 + i);
      const g = ctx.createLinearGradient(ox, oy, ox - Math.cos(ang) * len, oy + Math.sin(ang) * len);
      g.addColorStop(0, `rgba(255,244,214,${0.10 - i * 0.02})`);
      g.addColorStop(1, 'rgba(255,244,214,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox - Math.cos(ang - wd) * len, oy + Math.sin(ang - wd) * len);
      ctx.lineTo(ox - Math.cos(ang + wd) * len, oy + Math.sin(ang + wd) * len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawFireflies(ctx, w, h) {
    const t = this.t;
    for (let i = 0; i < 9; i++) {
      const px = w * ((0.08 + i * 0.11 + Math.sin(t * 0.14 + i * 1.7) * 0.04) % 1);
      const py = h * (0.18 + 0.34 * ((i * 0.37 + Math.sin(t * 0.1 + i)) % 1 + 1) % 1 * 0.5);
      const a = 0.25 + 0.55 * Math.max(0, Math.sin(t * (0.8 + i * 0.13) + i * 2.3));
      ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(px, py, 0, px, py, 5);
      g.addColorStop(0, '#fff8b0');
      g.addColorStop(0.4, 'rgba(255,240,140,0.6)');
      g.addColorStop(1, 'rgba(255,240,140,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawMover(ctx, w, h, bandY) {
    const s = this.scene;
    const t = this.t;
    switch (s.mover) {
      case 'boat': case 'ship': case 'longtail': {
        const period = s.mover === 'ship' ? 46 : 30;
        const ph = (t % period) / period;
        const dir = Math.floor(t / period) % 2 === 0 ? 1 : -1;
        const x = dir > 0 ? ph * (w + 80) - 40 : w + 40 - ph * (w + 80);
        const y = bandY + Math.sin(t * 1.7) * 2;
        const sc = s.mover === 'ship' ? 1.6 : 1;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(dir * sc, sc);
        ctx.fillStyle = s.boatColor || '#fff';
        ctx.beginPath();               // hull
        ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.lineTo(11, 6); ctx.lineTo(-13, 6);
        ctx.closePath(); ctx.fill();
        if (s.mover === 'longtail') {
          ctx.strokeStyle = s.boatColor; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(24, -6); ctx.stroke();
        } else {
          ctx.beginPath();             // sail
          ctx.moveTo(2, -1); ctx.lineTo(2, -18); ctx.lineTo(12, -3);
          ctx.closePath(); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-1, -1); ctx.lineTo(-1, -14); ctx.lineTo(-9, -3);
          ctx.closePath(); ctx.fill();
        }
        // wake
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-16, 5); ctx.lineTo(-30 - Math.sin(t * 3) * 4, 5); ctx.stroke();
        ctx.restore();
        break;
      }
      case 'cablecar': {
        const ph = (Math.sin(t * 0.12) + 1) / 2;
        const x0 = w * 0.55, y0 = h * 0.30, x1 = w * 0.92, y1 = h * 0.20;
        ctx.strokeStyle = 'rgba(40,40,50,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        const x = x0 + (x1 - x0) * ph, y = y0 + (y1 - y0) * ph;
        ctx.fillStyle = '#3c3c46';
        ctx.fillRect(x - 4, y, 8, 7);
        ctx.strokeStyle = '#3c3c46';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 4); ctx.stroke();
        break;
      }
      case 'plane': {
        const period = 34;
        const ph = (t % period) / period;
        const x = w + 60 - ph * (w + 140);
        const y = h * 0.14 + ph * h * 0.09;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(0.08);
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.lineTo(6, -2); ctx.lineTo(-6, -2);
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-6, 6); ctx.lineTo(-9, 6); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(-6, -8); ctx.lineTo(-9, -8); ctx.closePath(); ctx.fill();
        ctx.restore();
        break;
      }
      case 'parasail': {
        const x = w * 0.5 + Math.sin(t * 0.18) * w * 0.3;
        const y = h * 0.20 + Math.sin(t * 0.4) * 8;
        ctx.fillStyle = '#e84b3c';
        ctx.beginPath();
        ctx.arc(x, y, 11, Math.PI, 0);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffd93b';
        ctx.beginPath(); ctx.arc(x, y, 11, Math.PI * 1.25, Math.PI * 1.75); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(60,60,70,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 9, y + 2); ctx.lineTo(x, y + 14); ctx.lineTo(x + 9, y + 2); ctx.stroke();
        ctx.fillStyle = '#3c3c46';
        ctx.fillRect(x - 2, y + 13, 4, 5);
        break;
      }
      case 'beams': {
        for (let i = 0; i < 2; i++) {
          const ang = Math.sin(t * (0.5 + i * 0.17) + i * 2) * 0.5 - Math.PI / 2;
          const ox = w * (0.3 + i * 0.4), oy = h * 0.62;
          const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(ang) * 300, oy + Math.sin(ang) * 300);
          const col = i === 0 ? '199,125,255' : '76,201,240';
          g.addColorStop(0, `rgba(${col},0.4)`);
          g.addColorStop(1, `rgba(${col},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(ox + Math.cos(ang - 0.09) * 340, oy + Math.sin(ang - 0.09) * 340);
          ctx.lineTo(ox + Math.cos(ang + 0.09) * 340, oy + Math.sin(ang + 0.09) * 340);
          ctx.closePath(); ctx.fill();
        }
        break;
      }
      case 'shimmer': {
        // gold light wash climbing the buildings
        const ph = (t % 9) / 9;
        const y = h * 0.55 - ph * h * 0.35;
        const g = ctx.createLinearGradient(0, y - 30, 0, y + 30);
        g.addColorStop(0, 'rgba(242,193,78,0)');
        g.addColorStop(0.5, 'rgba(242,193,78,0.12)');
        g.addColorStop(1, 'rgba(242,193,78,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, y - 30, w, 60);
        break;
      }
      case 'kite': {
        const x = w * 0.72 + Math.sin(t * 0.35) * 26;
        const y = h * 0.16 + Math.cos(t * 0.5) * 12;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(t * 0.6) * 0.25);
        ctx.fillStyle = '#e84b3c';
        ctx.beginPath();
        ctx.moveTo(0, -12); ctx.lineTo(9, 0); ctx.lineTo(0, 12); ctx.lineTo(-9, 0);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,210,120,0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 12);
        for (let i = 1; i <= 6; i++) {
          ctx.lineTo(Math.sin(t * 2 + i) * 8, 12 + i * 9);
        }
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'ray': {
        const period = 22;
        const ph = (t % period) / period;
        const x = ph * (w + 100) - 50;
        const y = bandY + Math.sin(ph * 6) * 6;
        ctx.fillStyle = 'rgba(20,60,80,0.30)';
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1.3, 0.55);
        ctx.beginPath();
        ctx.moveTo(0, -8); ctx.quadraticCurveTo(16, 0, 0, 8); ctx.quadraticCurveTo(-10, 2, -18, 6);
        ctx.quadraticCurveTo(-12, 0, -18, -6); ctx.quadraticCurveTo(-10, -2, 0, -8);
        ctx.closePath(); ctx.fill();
        ctx.restore();
        break;
      }
    }
  }

  // Little visitors crossing the scene: they enter, cross, and leave, then the
  // pass repeats after a gap so the place feels inhabited rather than busy.
  drawCritters(ctx, w, h) {
    const list = this.scene.critters;
    if (!list) return;
    const t = this.t;
    list.forEach((c, i) => {
      const period = c.period || 22;
      const ph = ((t + i * 7.7) % period) / period;
      if (ph > 0.8) return;                       // off-stage between passes
      const p = ph / 0.8;
      const dir = c.dir || 1;
      const x = dir > 0 ? p * (w + 140) - 70 : w + 70 - p * (w + 140);
      const sz = h * 0.026 * (c.size || 1);
      ctx.save();
      ctx.translate(x, c.y * h);
      if (dir < 0) ctx.scale(-1, 1);
      this.drawCritter(ctx, c.t, sz, t, i, p);
      ctx.restore();
    });
  }

  drawCritter(ctx, kind, s, t, i, p) {
    const wob = Math.sin(t * 3 + i * 2);
    switch (kind) {
      case 'butterfly': {
        ctx.translate(0, wob * s * 0.7);
        const flap = 0.35 + 0.55 * Math.abs(Math.sin(t * 9 + i));
        ctx.fillStyle = 'rgba(255,150,190,0.9)';
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(side * s * 0.42 * flap, -s * 0.16, s * 0.42 * flap, s * 0.3, side * 0.4, 0, 7);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(side * s * 0.34 * flap, s * 0.2, s * 0.3 * flap, s * 0.22, -side * 0.4, 0, 7);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(70,45,60,0.85)';
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.09, s * 0.34, 0, 0, 7); ctx.fill();
        break;
      }
      case 'gull': case 'pelican': {
        const big = kind === 'pelican' ? 1.5 : 1;
        ctx.translate(0, wob * s * 0.5);
        const flap = Math.sin(t * (kind === 'gull' ? 7 : 4.5) + i) * s * 0.5;
        ctx.fillStyle = 'rgba(252,250,248,0.95)';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.5 * big, s * 0.22 * big, 0, 0, 7); ctx.fill();
        ctx.beginPath();                                   // head
        ctx.arc(s * 0.5 * big, -s * 0.1 * big, s * 0.17 * big, 0, 7); ctx.fill();
        ctx.fillStyle = '#ffae3c';
        ctx.beginPath();                                   // beak
        ctx.moveTo(s * 0.62 * big, -s * 0.12 * big);
        ctx.lineTo(s * 0.92 * big, -s * 0.05 * big);
        ctx.lineTo(s * 0.62 * big, s * 0.02 * big);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(230,228,226,0.95)';        // wings
        ctx.lineWidth = s * 0.16 * big; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-s * 0.1, 0); ctx.lineTo(-s * 0.5 * big, -flap * big);
        ctx.stroke();
        break;
      }
      case 'bat': {
        ctx.translate(0, wob * s * 0.9);
        const flap = 0.3 + 0.7 * Math.abs(Math.sin(t * 8 + i));
        ctx.fillStyle = 'rgba(28,20,44,0.9)';
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.2, s * 0.26, 0, 0, 7); ctx.fill();
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.05);
          ctx.quadraticCurveTo(side * s * 0.5, -s * 0.4 * flap, side * s * 0.85, s * 0.1 * flap);
          ctx.quadraticCurveTo(side * s * 0.45, s * 0.02, 0, s * 0.14);
          ctx.closePath(); ctx.fill();
        }
        break;
      }
      case 'dolphin': {
        // leaps: three arcs across the pass
        const leap = Math.sin(p * Math.PI * 3);
        const up = Math.max(0, leap);
        ctx.translate(0, -up * s * 1.9);
        ctx.rotate(Math.cos(p * Math.PI * 3) * 0.5);
        ctx.fillStyle = 'rgba(96,124,150,0.95)';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.78, s * 0.26, 0, 0, 7); ctx.fill();
        ctx.beginPath();                                    // dorsal
        ctx.moveTo(0, -s * 0.16);
        ctx.quadraticCurveTo(s * 0.06, -s * 0.6, s * 0.3, -s * 0.14);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();                                    // tail fluke
        ctx.moveTo(-s * 0.66, 0);
        ctx.lineTo(-s * 1.05, -s * 0.3);
        ctx.lineTo(-s * 1.02, s * 0.28);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(20,26,34,0.85)';
        ctx.beginPath(); ctx.arc(s * 0.6, -s * 0.05, s * 0.05, 0, 7); ctx.fill();
        break;
      }
      case 'fish': {
        const leap = Math.max(0, Math.sin(p * Math.PI * 5));
        ctx.translate(0, -leap * s * 1.1);
        ctx.rotate(Math.cos(p * Math.PI * 5) * 0.6);
        ctx.fillStyle = 'rgba(150,205,225,0.9)';
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.38, s * 0.18, 0, 0, 7); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-s * 0.32, 0);
        ctx.lineTo(-s * 0.58, -s * 0.2);
        ctx.lineTo(-s * 0.56, s * 0.2);
        ctx.closePath(); ctx.fill();
        break;
      }
      case 'turtle': {
        ctx.translate(0, wob * s * 0.25);
        ctx.fillStyle = 'rgba(74,126,92,0.95)';
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.34, 0, Math.PI, 0); ctx.fill();
        ctx.strokeStyle = 'rgba(40,80,58,0.8)'; ctx.lineWidth = s * 0.06;
        for (let k = 1; k <= 2; k++) {
          ctx.beginPath(); ctx.arc(0, 0, s * 0.18 * k, Math.PI, 0); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(110,160,120,0.95)';
        ctx.beginPath(); ctx.arc(s * 0.56, -s * 0.06, s * 0.15, 0, 7); ctx.fill();
        for (const fx2 of [-0.3, 0.3]) {                    // flippers
          ctx.beginPath();
          ctx.ellipse(s * fx2, s * 0.08 + Math.sin(t * 4 + fx2 * 6) * s * 0.05,
            s * 0.18, s * 0.09, 0.4, 0, 7);
          ctx.fill();
        }
        break;
      }
    }
  }

  drawBirds(ctx, w, h) {
    const t = this.t;
    ctx.strokeStyle = 'rgba(40,50,60,0.55)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) {
      const period = 26 + i * 7;
      const ph = ((t + i * 9) % period) / period;
      if (ph > 0.55) continue;
      const x = ph / 0.55 * (w + 60) - 30;
      const y = h * (0.10 + i * 0.05) + Math.sin(t * 2 + i) * 5;
      const flap = Math.sin(t * 9 + i * 2) * 3.2;
      ctx.beginPath();
      ctx.moveTo(x - 5, y - flap);
      ctx.quadraticCurveTo(x, y + 2, x, y);
      ctx.quadraticCurveTo(x, y + 2, x + 5, y - flap);
      ctx.stroke();
    }
  }

  drawShootingStar(ctx, w, h) {
    const t = this.t;
    const period = 13;
    const ph = (t % period) / period;
    if (ph > 0.08) return;
    const p = ph / 0.08;
    const x = w * 0.75 - p * w * 0.3;
    const y = h * 0.06 + p * h * 0.1;
    ctx.strokeStyle = `rgba(255,255,255,${(1 - p) * 0.9})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 26, y - 9);
    ctx.stroke();
  }
}
