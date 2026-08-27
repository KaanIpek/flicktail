// Image loading with progressive availability: the game can start before
// every backdrop has arrived; loaded() answers per-key.

export class Assets {
  constructor() {
    this.images = new Map();
    this.pending = new Map();
  }

  image(key) {
    const img = this.images.get(key);
    return img && img.complete && img.naturalWidth > 0 ? img : null;
  }

  load(key, url) {
    if (this.images.has(key)) return this.pending.get(key);
    const img = new Image();
    img.decoding = 'async';
    const p = new Promise(res => {
      img.onload = () => res(img);
      img.onerror = () => res(null);
    });
    img.src = url;
    this.images.set(key, img);
    this.pending.set(key, p);
    return p;
  }

  async loadAll(entries) {
    await Promise.all(entries.map(([k, u]) => this.load(k, u)));
  }
}
