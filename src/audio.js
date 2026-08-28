// WebAudio: streamed music loops (mp3 files) + fully procedural SFX, so the
// game needs zero sound-effect assets and always answers instantly.

const PENTA = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.5, 1174.7, 1318.5, 1568.0, 1760.0];

export class AudioMan {
  constructor() {
    this.ctx = null;
    this.buffers = new Map();
    this.musicSrc = null;
    this.currentMusic = null;
    this.pendingMusic = null;
    this.muted = { music: false, sfx: false };
    this.hapticsOn = true;
    this.unlocked = false;
    this.noise = null;
  }

  unlock() {
    if (this.unlocked) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    // iOS mutes WebAudio under the ringer silent switch; a looping <audio>
    // element moves playback to the "media" session, which the switch ignores.
    try {
      const el = document.createElement('audio');
      el.setAttribute('x-webkit-airplay', 'deny');
      el.preload = 'auto';
      el.loop = true;
      // 50ms of silence, wav, ~150 bytes
      el.src = 'data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YS4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
      el.play().catch(() => {});
      this._silentEl = el;
    } catch {}
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.muted.music ? 0 : 0.5;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.muted.sfx ? 0 : 1;
    this.sfxGain.connect(this.master);
    // shared noise buffer for all percussive sounds
    const len = this.ctx.sampleRate;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
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
      if (!res.ok) return;
      this.buffers.set(name, { raw: await res.arrayBuffer(), buf: null });
    } catch {}
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

  // ---------- procedural SFX ----------

  env(gainNode, t, peak, attack, decay) {
    const g = gainNode.gain;
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(Math.max(0.0011, peak), t + attack);
    g.exponentialRampToValueAtTime(0.001, t + attack + decay);
  }

  osc(type, freq, t, dur, peak, { detune = 0, glideTo = null, glideTime = 0 } = {}) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + (glideTime || dur));
    if (detune) o.detune.value = detune;
    const g = this.ctx.createGain();
    this.env(g, t, peak, 0.004, dur);
    o.connect(g); g.connect(this.sfxGain);
    o.start(t); o.stop(t + dur + 0.15);
    return o;
  }

  noiseBurst(t, dur, peak, { type = 'bandpass', freq = 2000, q = 1, sweepTo = null } = {}) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    this.env(g, t, peak, 0.003, dur);
    src.connect(f); f.connect(g); g.connect(this.sfxGain);
    src.start(t); src.stop(t + dur + 0.1);
  }

  play(name, { volume = 1, rate = 1, detune = 0 } = {}) {
    if (!this.unlocked || this.muted.sfx) return;
    const t = this.ctx.currentTime;
    const v = volume;
    const jitter = 1 + (detune ? detune * (Math.random() * 2 - 1) : 0);

    if (name.startsWith('merge')) {
      const tier = Math.min(11, parseInt(name.slice(5), 10) || 2);
      const note = PENTA[Math.min(PENTA.length - 1, tier - 2)];
      // marimba-ish: fundamental + bright partial, plus a watery plip
      this.osc('sine', note * jitter, t, 0.5, 0.32 * v);
      this.osc('sine', note * 4.03 * jitter, t, 0.14, 0.12 * v);
      this.osc('sine', note * 0.5, t + 0.01, 0.4, 0.10 * v);
      this.noiseBurst(t, 0.09, 0.10 * v, { freq: 4200, q: 2, sweepTo: 1800 });
      if (tier >= 7) {
        this.osc('sine', note * 1.5, t + 0.06, 0.5, 0.14 * v);
        this.osc('sine', note * 2, t + 0.12, 0.6, 0.11 * v);
      }
      if (tier >= 10) this.noiseBurst(t + 0.05, 0.7, 0.08 * v, { freq: 6000, q: 0.7, sweepTo: 9000 });
      return;
    }

    switch (name) {
      case 'clink': {
        const f0 = 2800 * jitter;
        this.osc('sine', f0, t, 0.09, 0.20 * v);
        this.osc('sine', f0 * 1.83, t, 0.06, 0.10 * v);
        this.noiseBurst(t, 0.02, 0.12 * v, { freq: 8000, q: 1.4 });
        break;
      }
      case 'thunk':
        this.osc('sine', 190 * rate, t, 0.13, 0.30 * v, { glideTo: 70 * rate });
        this.noiseBurst(t, 0.05, 0.14 * v, { type: 'lowpass', freq: 900 });
        break;
      case 'flick':
        this.noiseBurst(t, 0.16, 0.22 * v, { freq: 900, q: 1.2, sweepTo: 3400 });
        break;
      case 'splash': {
        this.noiseBurst(t, 0.4, 0.30 * v, { type: 'lowpass', freq: 2600, sweepTo: 380 });
        for (let i = 0; i < 4; i++) {
          this.osc('sine', 900 + Math.random() * 1300, t + 0.06 + i * 0.05, 0.05, 0.07 * v, { glideTo: 500 });
        }
        break;
      }
      case 'splashSmall':
        this.noiseBurst(t, 0.16, 0.14 * v, { type: 'lowpass', freq: 2200, sweepTo: 500 });
        this.osc('sine', 1300 * jitter, t + 0.02, 0.06, 0.07 * v, { glideTo: 700 });
        break;
      case 'order': {
        this.osc('sine', 1318.5, t, 0.12, 0.22 * v);
        this.osc('sine', 1760, t + 0.09, 0.25, 0.22 * v);
        this.osc('sine', 2637, t + 0.09, 0.2, 0.08 * v);
        break;
      }
      case 'tap':
        this.osc('sine', 700, t, 0.05, 0.10 * v, { glideTo: 500 });
        break;
      case 'win': {
        const seq = [523.25, 659.25, 783.99, 1046.5];
        seq.forEach((f, i) => {
          this.osc('triangle', f, t + i * 0.11, 0.4, 0.20 * v);
          this.osc('sine', f * 2, t + i * 0.11, 0.25, 0.07 * v);
        });
        this.noiseBurst(t + 0.44, 0.8, 0.06 * v, { freq: 7000, q: 0.6, sweepTo: 10000 });
        break;
      }
      case 'lose': {
        [392, 349.23, 311.13].forEach((f, i) => this.osc('triangle', f, t + i * 0.16, 0.4, 0.16 * v));
        break;
      }
      case 'fanfare': {
        const seq = [659.25, 783.99, 1046.5, 1318.5, 1568];
        seq.forEach((f, i) => {
          this.osc('triangle', f, t + i * 0.09, 0.5, 0.2 * v);
          this.osc('sine', f * 1.5, t + i * 0.09 + 0.03, 0.3, 0.07 * v);
        });
        this.noiseBurst(t, 1.1, 0.07 * v, { freq: 6000, q: 0.5, sweepTo: 11000 });
        break;
      }
      case 'gust':
        this.noiseBurst(t, 1.2, 0.10 * v, { freq: 500, q: 0.8, sweepTo: 1400 });
        break;
      case 'countdown':
        this.osc('sine', 880, t, 0.08, 0.14 * v);
        break;
      default:
        this.osc('square', 500 * rate, t, 0.1, 0.08 * v);
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
    if (kind === 'music' && this.musicGain) this.musicGain.gain.value = m ? 0 : 0.5;
    if (kind === 'sfx' && this.sfxGain) this.sfxGain.gain.value = m ? 0 : 1;
  }

  haptic(pattern) {
    if (!this.hapticsOn) return;
    if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch {} }
  }
}
