// Drag-back slingshot input (primary control, per the design brief):
// touch anywhere, pull back/down, release to launch opposite the drag with
// sqrt power response. A tiny drag cancels. Direction is computed on the
// table plane through the camera so aim matches what the thumb does.

import { FLICK } from './config.js';

export class Slingshot {
  constructor(canvas, view) {
    this.canvas = canvas;
    this.view = view;
    this.enabled = false;
    this.active = false;
    this.start = null;
    this.onAim = null;     // ({dirX, dirZ, power}) or null
    this.onFlick = null;   // () => bool — reads the last aim from the game
    this.onTap = null;

    canvas.addEventListener('pointerdown', e => this.down(e), { passive: false });
    canvas.addEventListener('pointermove', e => this.move(e), { passive: false });
    canvas.addEventListener('pointerup', e => this.up(e), { passive: false });
    canvas.addEventListener('pointercancel', () => this.cancel(), { passive: false });
  }

  pos(e) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (this.canvas.width / r.width),
      y: (e.clientY - r.top) * (this.canvas.height / r.height),
    };
  }

  down(e) {
    if (!this.enabled) return;
    e.preventDefault();
    try { this.canvas.setPointerCapture(e.pointerId); } catch {}
    this.active = true;
    this.start = this.pos(e);
    this.startT = performance.now();
  }

  move(e) {
    if (!this.active) return;
    e.preventDefault();
    const p = this.pos(e);
    this.report(p);
  }

  report(p) {
    const dx = p.x - this.start.x, dy = p.y - this.start.y;
    const dist = Math.hypot(dx, dy);
    if (dist < FLICK.cancelDrag) { if (this.onAim) this.onAim(null); return; }
    // world direction: unproject both points on the plane, launch OPPOSITE
    const w0 = this.view.unproject(this.start.x, this.start.y);
    const w1 = this.view.unproject(p.x, p.y);
    if (!w0 || !w1) { if (this.onAim) this.onAim(null); return; }
    const dirX = w0.x - w1.x, dirZ = w0.z - w1.z;
    const frac = Math.min(1, dist / (FLICK.maxDrag * (this.canvas.width / 720)));
    const power = Math.sqrt(frac) * FLICK.maxSpeed;
    if (this.onAim) this.onAim({ dirX, dirZ, power });
  }

  up(e) {
    if (!this.active) return;
    e.preventDefault();
    this.active = false;
    const p = this.pos(e);
    const dx = p.x - this.start.x, dy = p.y - this.start.y;
    const dist = Math.hypot(dx, dy);
    if (dist < FLICK.cancelDrag) {
      if (performance.now() - this.startT < 300 && this.onTap) this.onTap(p);
      if (this.onAim) this.onAim(null);
      return;
    }
    this.report(p);
    if (this.onFlick) this.onFlick();
  }

  cancel() {
    this.active = false;
    if (this.onAim) this.onAim(null);
  }
}
