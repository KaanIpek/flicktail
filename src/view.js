// Perspective camera for the table plane.
//
// World space: x across the table (0 at the center line), z along the table
// (0 at the near/serving edge, growing away from the player), y up off the
// table surface (0 = resting on wood). The physics lives entirely in (x, z);
// y exists so merges, particles and tossed drinks can leave the surface.

export class View {
  constructor() {
    this.camH = 95;      // camera height above the table surface
    this.camZ = -78;     // camera sits behind the near edge
    this.pitch = 0.64;   // radians, tilt down
    this.fpx = 1000;     // focal length in screen px (set by fit())
    this.cx = 0;
    this.cy = 0;
    this.w = 0;
    this.h = 0;
  }

  // Fit the projection to a canvas: the near edge of the table spans
  // `nearFrac` of the screen width and sits at `baseFrac` of screen height.
  //
  // Width alone used to decide the scale. That is correct for a phone column,
  // where height is the abundant axis, but on a tablet stage the same rule
  // blows the table up until its far rail climbs off the top of the glass. So
  // when the caller passes the table's length, the scale is also capped to
  // keep that far rail at least `topFrac` of the way down the screen; whatever
  // width is left over shows more of the bar around the table instead.
  fit(w, h, tableHalfW, nearFrac = 0.985, baseFrac = 0.965, tableLen = 0, topFrac = 0.12) {
    this.w = w; this.h = h;
    this.cx = w / 2;
    const s = Math.sin(this.pitch), c = Math.cos(this.pitch);
    // view-space coords of the near-edge corner (x=halfW, y=0, z=0)
    const dy = -this.camH, dz = -this.camZ;
    const vz = -dy * s + dz * c;
    const vy = dy * c + dz * s;
    let fpx = (w * nearFrac / 2) * vz / tableHalfW;
    if (tableLen > 0) {
      const dzF = tableLen - this.camZ;
      const vyF = dy * c + dzF * s, vzF = -dy * s + dzF * c;
      // negative, because the far rail projects above the near edge
      const rise = vy / vz - vyF / vzF;
      if (rise < 0) fpx = Math.min(fpx, h * (topFrac - baseFrac) / rise);
    }
    this.fpx = fpx;
    // place the near edge line at baseFrac of screen height
    this.cy = h * baseFrac + this.fpx * vy / vz;
  }

  project(wx, wy, wz) {
    const s = Math.sin(this.pitch), c = Math.cos(this.pitch);
    const dx = wx, dy = wy - this.camH, dz = wz - this.camZ;
    const vy = dy * c + dz * s;
    const vz = -dy * s + dz * c;
    const inv = this.fpx / vz;
    return { x: this.cx + dx * inv, y: this.cy - vy * inv, s: inv, vz };
  }

  // Screen point -> table plane (y = plane height, default the table surface).
  unproject(sx, sy, planeY = 0) {
    const s = Math.sin(this.pitch), c = Math.cos(this.pitch);
    const rx = (sx - this.cx) / this.fpx;
    const ry = (this.cy - sy) / this.fpx;
    // ray in world space: origin (0, camH, camZ), dir from view basis
    const dirX = rx;
    const dirY = ry * c - s;      // up*ry + forward
    const dirZ = ry * s + c;
    const t = (planeY - this.camH) / dirY;
    if (t <= 0) return null;
    return { x: dirX * t, z: this.camZ + dirZ * t };
  }
}
