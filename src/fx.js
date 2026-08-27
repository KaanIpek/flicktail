// Particles, floating text, shockwaves, screen shake. Pooled; zero garbage in
// the steady state.

export class Fx {
  constructor() {
    this.parts = [];
    this.texts = [];
    this.rings = [];
    this.shake = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.flash = 0;
    this.flashColor = '#ffffff';
  }

  // Juice droplets bursting out of a merge, in world space on the table.
  burst(x, z, color, count = 14, speed = 55, opts = {}) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.35 + Math.random() * 0.65);
      this.parts.push({
        x, z, y: (opts.y || 2) + Math.random() * 3,
        vx: Math.cos(a) * s, vz: Math.sin(a) * s * 0.6,
        vy: 35 + Math.random() * 55 * (opts.up || 1),
        r: (opts.size || 1) * (1.1 + Math.random() * 1.6),
        color: Array.isArray(color) ? color[(Math.random() * color.length) | 0] : color,
        life: 1, decay: 1.6 + Math.random() * 1.2,
        kind: opts.kind || 'drop',
      });
    }
  }

  sparkle(x, z, count = 8) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 20 + Math.random() * 35;
      this.parts.push({
        x, z, y: 4 + Math.random() * 10,
        vx: Math.cos(a) * s, vz: Math.sin(a) * s * 0.5, vy: 20 + Math.random() * 40,
        r: 0.8 + Math.random() * 1.1,
        color: '#fff6c9', life: 1, decay: 2.2 + Math.random(), kind: 'star',
      });
    }
  }

  ring(x, z, color, maxR = 18) {
    this.rings.push({ x, z, r: 2, maxR, color, life: 1 });
  }

  text(x, z, str, color = '#ffffff', size = 1) {
    this.texts.push({ x, z, y: 8, str, color, size, life: 1, vy: 26 });
  }

  addShake(amount) { this.shake = Math.min(1.6, this.shake + amount); }

  addFlash(color, amount = 0.25) { this.flash = Math.max(this.flash, amount); this.flashColor = color; }

  update(dt) {
    const parts = this.parts;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy -= 220 * dt;
      p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt;
      if (p.y < 0) { p.y = 0; p.vy *= -0.35; p.vx *= 0.6; p.vz *= 0.6; }
      p.life -= p.decay * dt;
      if (p.life <= 0) parts.splice(i, 1);
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.y += t.vy * dt; t.vy *= Math.exp(-2.2 * dt);
      t.life -= 0.85 * dt;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.r += (r.maxR - r.r) * 7 * dt;
      r.life -= 2.4 * dt;
      if (r.life <= 0) this.rings.splice(i, 1);
    }
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - 4.5 * dt);
      const a = this.shake * this.shake * 9;
      this.shakeX = (Math.random() * 2 - 1) * a;
      this.shakeY = (Math.random() * 2 - 1) * a;
    } else { this.shakeX = this.shakeY = 0; }
    if (this.flash > 0) this.flash = Math.max(0, this.flash - 2.8 * dt);
  }

  draw(ctx, view) {
    for (const r of this.rings) {
      const p = view.project(r.x, 0, r.z);
      ctx.globalAlpha = r.life * 0.55;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3 * p.s * r.life;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, r.r * p.s, r.r * p.s * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const p of this.parts) {
      const pr = view.project(p.x, p.y, p.z);
      ctx.globalAlpha = Math.min(1, p.life * 1.4);
      ctx.fillStyle = p.color;
      if (p.kind === 'star') {
        const s = p.r * pr.s;
        ctx.save();
        ctx.translate(pr.x, pr.y);
        ctx.rotate(p.life * 4);
        ctx.fillRect(-s, -s * 0.28, s * 2, s * 0.56);
        ctx.fillRect(-s * 0.28, -s, s * 0.56, s * 2);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, p.r * pr.s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Floating texts are drawn by the UI layer (they use the display font).
}
