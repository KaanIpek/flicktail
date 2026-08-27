// WebAudio: sample playback for SFX, streamed loop for music, unlock on first
// gesture. Falls back to tiny synthesized sounds for anything with no sample,
// so the game is never silent while assets stream in.

export class AudioMan {
  constructor() {
    this.ctx = null;
    this.buffers = new Map();
    this.musicGain = null;
    this.sfxGain = null;
    this.musicSrc = null;
    this.currentMusic = null;
    this.pendingMusic = null;
    this.muted = { music: false, sfx: false };
    this.unlocked = false;
  }

  unlock() {
    if (this.unlocked) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.muted.music ? 0 : 0.55;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.muted.sfx ? 0 : 1;
    this.sfxGain.connect(this.master);
    this.unlocked = true;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.pendingMusic) { const m = this.pendingMusic; this.pendingMusic = null; this.music(m); }
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend(); else this.ctx.resume();
    });
  }

  async load(name, url) {
    try {
      const res = await fetch(url);
      const ab = await res.arrayBuffer();
      // decode lazily once we have a context; stash raw bytes until then
      this.buffers.set(name, { raw: ab, buf: null });
    } catch (e) { /* missing samples fall back to synth */ }
  }

  async buffer(name) {
    const ent = this.buffers.get(name);
    if (!ent || !this.ctx) return null;
    if (!ent.buf && ent.raw) {
      try { ent.buf = await this.ctx.decodeAudioData(ent.raw.slice(0)); } catch { return null; }
      ent.raw = null;
    }
    return ent.buf;
  }

  async play(name, { volume = 1, rate = 1, detune = 0 } = {}) {
    if (!this.unlocked || this.muted.sfx) return;
    const buf = await this.buffer(name);
    if (buf) {
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = rate * (1 + detune * (Math.random() * 2 - 1));
      const g = this.ctx.createGain();
      g.gain.value = volume;
      src.connect(g); g.connect(this.sfxGain);
      src.start();
    } else {
      this.synth(name, volume, rate);
    }
  }

  // Small procedural stand-ins keyed by sound name.
  synth(name, volume = 1, rate = 1) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.connect(this.sfxGain);
    const o = this.ctx.createOscillator();
    o.connect(g);
    const v = 0.22 * volume;
    if (name.startsWith('merge')) {
      const step = parseInt(name.slice(5), 10) || 1;
      const f = 300 * Math.pow(1.12, step);
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 1.8, t + 0.12);
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      o.start(t); o.stop(t + 0.3);
    } else if (name === 'clink') {
      o.type = 'sine';
      o.frequency.setValueAtTime(1900 * rate, t);
      g.gain.setValueAtTime(v * 0.7, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      o.start(t); o.stop(t + 0.1);
    } else if (name === 'flick') {
      o.type = 'sine';
      o.frequency.setValueAtTime(300, t);
      o.frequency.exponentialRampToValueAtTime(90, t + 0.15);
      g.gain.setValueAtTime(v * 0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      o.start(t); o.stop(t + 0.18);
    } else if (name === 'splash') {
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.3);
      g.gain.setValueAtTime(v * 0.6, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      o.start(t); o.stop(t + 0.34);
    } else {
      o.type = 'square';
      o.frequency.setValueAtTime(500 * rate, t);
      g.gain.setValueAtTime(v * 0.4, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      o.start(t); o.stop(t + 0.14);
    }
  }

  async music(name) {
    if (!this.unlocked) { this.pendingMusic = name; return; }
    if (this.currentMusic === name) return;
    this.currentMusic = name;
    const buf = await this.buffer(name);
    const fade = 1.2;
    const t = this.ctx.currentTime;
    if (this.musicSrc) {
      const old = this.musicSrc, oldG = this.musicSrcGain;
      oldG.gain.setValueAtTime(oldG.gain.value, t);
      oldG.gain.linearRampToValueAtTime(0, t + fade);
      setTimeout(() => { try { old.stop(); } catch {} }, fade * 1000 + 60);
      this.musicSrc = null;
    }
    if (!buf) return;
    if (this.currentMusic !== name) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + fade);
    src.connect(g); g.connect(this.musicGain);
    src.start();
    this.musicSrc = src;
    this.musicSrcGain = g;
  }

  setMuted(kind, m) {
    this.muted[kind] = m;
    if (!this.ctx) return;
    if (kind === 'music' && this.musicGain) this.musicGain.gain.value = m ? 0 : 0.55;
    if (kind === 'sfx' && this.sfxGain) this.sfxGain.gain.value = m ? 0 : 1;
  }

  haptic(ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms); } catch {} }
  }
}
