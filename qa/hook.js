// Test hooks for the local QA harness (puppeteer driving Chrome against a
// plain-http dev server such as `python -m http.server 5610`).
//
// src/main.js imports this file only on http://localhost, http://127.0.0.1 or an
// http origin opened with ?qa, and never inside the Capacitor app. It lives in
// qa/ because mobile/sync-web.mjs copies src/ but not qa/, so none of it ships
// in the iOS bundle.
//
// The import resolves a moment after boot, so a script must wait for the hook
// (for example page.waitForFunction(() => window.__ft)) before calling it.

import { makeBody } from '../src/physics.js';
import { TABLE, TIERS } from '../src/config.js';

export function install(ctx) {
  const { game, view, renderer, physics } = ctx;
  window.__ft = {
    game, view, renderer, physics,
    fx: ctx.fx, save: ctx.save, audio: ctx.audio, backdrop: ctx.backdrop, ui: ctx.ui, ads: ctx.ads,
    startLevel: ctx.startLevel, showMap: ctx.showMap, startRush: ctx.startRush,
    startShift: ctx.startShift, startSplit: ctx.startSplit, startEndless: ctx.startEndless,
    // Stays async so existing callers that await it keep working.
    async spawn(tier, x, z, vx = 0, vz = 0) {
      const b = physics.add(makeBody(tier, x, z, TIERS[tier - 1].r));
      b.vx = vx; b.vz = vz; b.sleeping = !(vx || vz); b.immunity = 1.5;
      return b.id;
    },
    state() {
      return {
        screen: ctx.screen, score: game.score, flicks: game.flicksLeft, combo: game.combo,
        maxTier: game.maxTierMade, goalDone: game.goalDone, state: game.state,
        bodies: physics.bodies.filter(b => !b.dead).map(b => ({
          id: b.id, tier: b.tier, x: Math.round(b.x), z: Math.round(b.z),
          sp: Math.round(Math.hypot(b.vx, b.vz)), sleeping: b.sleeping, kind: b.kind,
        })),
      };
    },
    retune(camH, camZ, pitch, nearFrac, baseFrac) {
      const { W, H, DPR } = ctx.size;
      view.camH = camH; view.camZ = camZ; view.pitch = pitch;
      view.fit(W, H, TABLE.halfW, nearFrac ?? 0.97, baseFrac ?? 0.965, TABLE.length);
      if (ctx.currentLevel) renderer.setLevel(ctx.currentLevel, W, H, DPR);
      return [view.project(0, 0, TABLE.length).y / H, view.project(0, 0, TABLE.foulLine).y / H];
    },
  };
}
