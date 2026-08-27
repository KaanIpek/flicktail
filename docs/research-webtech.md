# Engineering recipes: portrait mobile-web "flick & merge drinks" game (HTML5 canvas)

## (a) Physics: custom engine beats Matter.js for this game — and here is the exact engine to write

### Decision: write a ~400-line custom engine

- **Matter.js has no continuous collision detection.** This is a decade-old open issue: fast bodies tunnel through thin bodies and each other ([issue #5](https://github.com/liabru/matter-js/issues/5), [issue #336](https://github.com/liabru/matter-js/issues/336)). A flick game's core input is exactly the worst case. The maintainer's own recommended workaround is sub-stepping (multiple `Engine.update` calls per frame with smaller delta), which you'd be hand-rolling anyway.
- Suika clones use Matter.js ([moonfloof/suika-game](https://github.com/moonfloof/suika-game), [hinata-ya tutorial](https://hinata-ya.tech/games/en/games/suika/tutorial/)) because *gravity stacking with resting contacts* is genuinely hard. Your game has **no gravity, no stacking, no resting contact** — just circles sliding on a plane, 4 axis-aligned rails, and pairwise circle collisions. That is the easy 20% of a physics engine, and it's covered by classic ~100-line pure-JS engines ([slicker.me](https://slicker.me/javascript/physics/physics_engine.htm)).
- **Scale is trivial:** ~30 bodies = 435 pairs/frame brute-force. No broadphase needed; a plain double loop at 60 Hz is microseconds. Don't build a spatial hash.
- Custom gives you exact time-of-impact (needed for "merge at the moment of touch"), deterministic replays, and zero library GC churn.

**If you still choose Matter.js** (fastest path to a playable prototype): `engine.gravity = {x:0, y:0}`; circles via `Bodies.circle`; per-body `frictionAir` is your table friction — default is **0.01** and its effect is non-linear ([Body docs](https://brm.io/matter-js/docs/classes/Body.html)); use ~**0.02–0.035** for a shuffleboard-like glide that dies in ~1.5–2.5 s. Set surface `friction: 0` (tangential friction is meaningless top-down), `restitution: 0.7–0.9`, `frictionStatic: 0`. Engine defaults: `positionIterations: 6`, `velocityIterations: 4`, `constraintIterations: 2`, `enableSleeping: false` (turn it **on**), and `Engine.update(engine, delta)` defaults to **16.666 ms** ([Engine docs](https://brm.io/matter-js/docs/classes/Engine.html)). For flicks, sub-step: call `Engine.update(engine, 16.666/4)` four times per frame while any body exceeds `minRadius*0.5*60` px/s.

### Friction model for "drink sliding on wood" — concrete numbers

Two physically distinct models; **use both together**:

1. **Exponential (viscous) damping** — what every JS pool tutorial uses: `v *= k` each frame. [Yannick Lohse's canvas pool game](https://yannick-lohse.fr/2013/01/03/pool-game-with-canvas.html) multiplies velocity by **0.97**/frame; [statox's p5 pool](https://www.statox.fr/posts/2019/01/p5-pool/) uses **0.99**/frame. At 60 fps, 0.99 ≈ half-life 1.15 s (long, icy glide), 0.97 ≈ half-life 0.38 s (heavy drink on rough wood). Frame-rate-independent form: `v *= Math.exp(-k * dt)` with **k ≈ 0.6** (beach-bar glass on lacquered wood ≈ per-frame 0.990) up to **k ≈ 1.8** (frosty mug, sticky bar ≈ per-frame 0.970). This is a great per-level/per-drink tuning knob (icy table level = lower k).
2. **Constant Coulomb deceleration** — real rolling/sliding balls decelerate *linearly*: `v(t) = v0 − μ·g·t` ([Kiefl's billiards-physics derivation](https://ekiefl.github.io/2020/04/24/pooltool-theory/)). Pure exponential damping never reaches zero and produces an unnatural endless creep. Add `speed = max(0, speed − a*dt)` with **a ≈ 30–60 world-px/s²** (tune so a max-power flick travels ~1.1 table lengths), plus a **hard stop threshold: if speed < 4 px/s → v = (0,0)** and mark the body sleeping. The blend (exponential kills the top end fast, Coulomb snaps it to rest) is what makes shuffleboard pucks feel "weighty then settled".

```js
// per fixed step (dt = 1/60)
const drag = Math.exp(-K_DRAG * dt);            // K_DRAG 0.6..1.8 per level/drink
b.vx *= drag; b.vy *= drag;
const sp = Math.hypot(b.vx, b.vy);
if (sp > 0) {
  const ns = Math.max(0, sp - A_COULOMB * dt);  // A_COULOMB ~40 px/s^2
  if (ns < STOP_EPS) { b.vx = b.vy = 0; b.sleeping = true; }
  else { const s = ns / sp; b.vx *= s; b.vy *= s; }
}
```

### Elastic circle-circle resolution (with per-tier mass)

Use [Eric Leong's circle-circle math](https://ericleong.me/research/circle-circle/) — it conserves momentum and kinetic energy:

- Detect: `(dx*dx + dy*dy) < (r1+r2)^2` (compare squared distances, no sqrt).
- Normal `n` = normalized center-to-center vector. Impulse scalar for two moving circles: **`p = 2 * (v1·n − v2·n) / (m1 + m2)`**, then `v1 −= p * m2 * n`, `v2 += p * m1 * n`.
- **Restitution:** multiply the normal impulse by `(1+e)/2` relative to the perfectly-elastic formula, i.e. use `p = (1+e) * (v1·n − v2·n) / (m1+m2)`; `e = 1` is perfectly elastic, `e = 0` perfectly inelastic ([Spicy Yoghurt physics tutorial](https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics)). For "glassware clink" use **e ≈ 0.55–0.75 drink-vs-drink** and **e ≈ 0.8–0.9 vs rails** (lively rail bounces read as premium; deader drink-drink contact keeps clusters controllable).
- **Mass ∝ r²** for tiers (a tier-8 pitcher should shrug off a tier-1 shot glass). With ~10–12 tiers and radius growth ×1.18/tier, mass ratio between adjacent tiers is ~1.39 — noticeable but not degenerate.
- **Positional correction:** after impulse, push circles apart along `n` proportionally to inverse mass, correcting ~80% of penetration beyond a 0.5 px slop per iteration (standard Baumgarte-style split used by the simple JS engines above). Run 2 resolution iterations per step; with ≤30 bodies this is nothing.

### CCD so a flick never tunnels — exact recipe

Reality check on why you need it: a hard flick is ~2500–3500 screen-px/s → **~50 px of travel per 60 Hz frame**, larger than a small drink's radius (~22–30 px) and far larger than a rail's thickness. Discrete stepping *will* tunnel ([Toptal collision-detection overview](https://www.toptal.com/game/video-game-physics-part-ii-collision-detection-for-solid-objects)).

Two-layer defense (do both; total cost is trivial at this body count):

1. **Substep by max displacement.** `substeps = clamp(ceil(maxBodySpeed * dt / (minRadius * 0.5)), 1, 8)`, then integrate `dt/substeps` per substep with full collision checks. At 3500 px/s, minRadius 22 → 8 substeps of ~7 px each. Only fast frames pay; settled boards run 1 substep.
2. **Swept (time-of-impact) tests inside each substep** for any body moving > its own radius per substep:
   - **Circle vs circle:** reduce to a ray-vs-inflated-circle test — find the closest point `d` on the moving circle's displacement segment to the other center; if `dist(d, c2) < r1+r2`, back up along the movement vector by `backdist = sqrt((r1+r2)² − closestDistSq)` to get the exact contact position ([Eric Leong](https://ericleong.me/research/circle-circle/)). For two movers, subtract velocities to change the frame of reference to one circle (same page).
   - **Circle vs axis-aligned rail:** exact TOI is one division: `t = (railX − r − x) / vx`; if `0 ≤ t ≤ dt`, advance to `t`, reflect the normal velocity component `vx = −e*vx`, spend remaining `dt − t`. Allow up to 3 impacts per substep (corner double-bounce).
   - Feronato's swept-AABB/Minkowski articles are a good grounding for the "advance to TOI, resolve, continue with remaining time" loop pattern ([part 1](https://emanueleferonato.com/2021/10/21/understanding-physics-continuous-collision-detection-using-swept-aabb-method-and-minkowski-sum/), [part 2 — both bodies moving](https://emanueleferonato.com/2021/11/02/understanding-physics-continuous-collision-detection-using-swept-aabb-method-and-minkowski-sum-part-2-both-bodies-are-moving/)).

### Fixed timestep + interpolation (non-negotiable for cross-device feel)

Accumulator loop from [Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/): fixed `dt = 1/60`, accumulate real frame time, run whole physics steps, render with `alpha = accumulator/dt` blending previous↔current positions. **Clamp frame delta to 250 ms** to avoid the spiral of death after tab switches ([fixed-timestep guide](https://simplified.media/guides/fixed-timestep-loops)). Store `prevX/prevY` on each body each step; the renderer never reads raw physics state.

### Merge logic (Suika chain) — the two bugs everyone hits

From the [Matter.js Suika tutorial](https://hinata-ya.tech/games/en/games/suika/tutorial/), the battle-tested pattern:

- On contact (your collision resolver, or `collisionStart` in Matter): check both are drinks, **same tier**, and **neither has `merging = true`** — the flag is what prevents A+B and B+C double-merging in the same tick when three identical drinks touch simultaneously.
- Set `merging` on both immediately; spawn the next tier at the **midpoint** of the two centers; remove both after a tiny delay (~50 ms in the tutorial — in a custom engine, do it at end-of-step instead of `setTimeout`).
- Score the **new** drink's value; give the merged body the **momentum-weighted average velocity** `(m1v1+m2v2)/(m1+m2)` so merges mid-slide look physical.
- Extra rule for your game (no gravity to re-trigger contacts): after spawning the merged drink, re-run the pair check against its neighbors once, so chain reactions cascade in the same visual beat.

## (b) Fake-3D perspective: run physics flat, warp only the render

**Golden rule: the physics world is an undistorted top-down rectangle (e.g., 720×1280 world units). Perspective exists only in the projection function.** This is exactly the 2.5D pattern — top-down logic with angled presentation ([2.5D overview](https://en.wikipedia.org/wiki/2.5D)); pool games like 8 Ball Pool just stay top-down, while premium "table" presentations (and King's Shuffle Cats, which chose portrait explicitly because "it's nice and easy to hold the phone and flick the cards" — [MCV interview](https://mcvuk.com/business-news/king-on-its-multiplayer-focused-card-game-shuffle-cats/)) warp the table into a trapezoid. The same math ships as a "faux 3D perspective" 2D shader in Godot ([godotshaders](https://godotshaders.com/shader/faux-3d-perspective-shader-for-2d-canvas-items/)) — proof this is a projection trick, not a 3D engine.

### The projection (true 1/z, not linear lerp)

Ground-plane projection is `y_screen = y_world * scaling / z` and sprite scale is `1/z` ([Lou's Pseudo 3D page](https://www.extentofthejam.com/pseudo/) — the canonical reference, including the Z-map/lookup-table idea and painter's-algorithm draw order). Concrete recipe for a portrait table:

```js
// world: x in [0,W], y in [0,L]; y=0 is the NEAR rail (player edge)
const D = 1.6;                    // camera distance in table-lengths; smaller = more dramatic
const d = wy / L;                 // depth 0..1
const s = D / (D + d);            // perspective scale: 1.0 near, D/(D+1) far (0.615 at D=1.6)
// screenY: solve K, horizonY once so y(0)=nearY, y(1)=farY:
//   K = (nearY - farY) * D * (D + 1);  horizonY = nearY - K / D;
const sy = horizonY + K / (D + d);
const sx = cx + (wx - W/2) * s * pxPerUnit;
```

- **Do NOT lerp screenY linearly in d** — equal world distances must compress toward the far rail (that's the whole depth illusion). The `K/(D+d)` form gives you that for free and matches Lou's `1/z`.
- **Rails**: the table renders as a trapezoid; near edge width `W*pxPerUnit`, far edge width `W*pxPerUnit*D/(D+1)`. Draw side rails as two straight lines converging toward the implied vanishing point at `horizonY`.
- **Sprite scale = s(d)** exactly (Lou's: "a scaling factor is just 1/z"). Pre-render each drink at native size and scale by `s`; anchor sprites **bottom-center** so glasses "stand" on the plane, with a squashed shadow ellipse at the contact point (ellipse height ≈ 0.35× width, further squashed by another ×s).
- **Draw order**: painter's algorithm — sort drinks by `wy` descending (far first) each frame ([Lou's](https://www.extentofthejam.com/pseudo/)). 30 sprites = trivial sort.
- **Depth cues that sell it cheaply**: multiply sprite brightness by `0.85 + 0.15*s` (subtle atmospheric falloff), and make the living backdrop sit above `horizonY`.
- **Inverse mapping** (touch → world, needed for aiming): `d = K/(sy − horizonY) − D; wx = (sx − cx)/(s*pxPerUnit) + W/2`. Same two lines, algebraically inverted — keep both functions in one module and unit-test that `unproject(project(p)) === p`.
- **Physics consequence:** none. Velocities, radii, collisions all live in world space. The only place screen-space matters is converting flick velocity (screen px/ms) into world velocity: divide by `s(d)` at the launch point — since launches happen at the near rail, `s ≈ 1` and the flick feels 1:1 under the finger.

## (c) Flick gesture: sampling window, clamps, cancel, aim line

### Input plumbing

Use **Pointer Events** on the canvas with CSS `touch-action: none` — MDN is explicit that apps "should also use `touch-action` to ensure the browser knows the intent of the application before any event listeners have been invoked", and that mid-gesture changes have no effect ([MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)). On 120 Hz screens the browser coalesces moves; call **`e.getCoalescedEvents()`** in `pointermove` to recover every raw sample for velocity math ([Pointer Events L3 / TPAC](https://www.w3.org/2023/Talks/TPAC/pointer-events/), [getCoalescedEvents guide](https://www.nutrient.io/blog/using-getcoalescedevents/)). Always compute positions relative to `canvas.getBoundingClientRect()` ([iPhone PWA game guide](https://gist.github.com/fozzedout/5e77925381991a9570151550992baf14)).

### Velocity: 100 ms window, ≥30 ms minimum baseline

Prior art converges on "recent samples only, never whole-gesture average":

- Android's `VelocityTracker` is the platform gold standard — you feed it move events and call `computeCurrentVelocity(1000)` at gesture end; it deliberately uses recently collected points ([Android gesture-movement docs](https://developer.android.com/develop/ui/views/touch-and-input/gestures/movement)).
- Hammer.js recomputes velocity every **`COMPUTE_INTERVAL = 25` ms** as `delta / deltaTime` between interval snapshots — so its reported flick velocity reflects roughly the last 25–50 ms ([Hammer input.js source](https://hammerjs.github.io/jsdoc/input.js.html)).
- ZingTouch keeps a capped stack of recent move events and defines a swipe by `escapeVelocity` in px/ms at release, noting browsers sometimes emit **identical timestamps for consecutive events** — guard every division ([ZingTouch](http://zingchart.github.io/zingtouch/), [Swipe API](https://zingchart.github.io/zingtouch/docs/class/src/gestures/Swipe.js~Swipe.html)).

**Recipe:**

```js
// ring buffer of {x, y, t: e.timeStamp} incl. coalesced samples
onPointerUp(e) {
  const now = e.timeStamp;
  const win = samples.filter(s => now - s.t <= 100);   // 100 ms window
  const a = win[0], b = win[win.length - 1];
  const dt = b.t - a.t;
  if (dt < 30 || win.length < 3) return cancelFlick(); // too little data = tap, not flick
  let vx = (b.x - a.x) / dt, vy = (b.y - a.y) / dt;    // px per ms
  const speed = Math.hypot(vx, vy);
  if (speed < 0.25) return cancelFlick();              // escape velocity (px/ms)
  const capped = Math.min(speed, 3.2);                 // hard cap ~3.2 px/ms ≈ 3200 px/s
  // response curve: give low-end flicks a boost, compress top end
  const outSpeed = 3.2 * Math.pow(capped / 3.2, 0.85);
  launch(vx / speed * outSpeed, vy / speed * outSpeed); // then screen→world via 1/s(d)
}
```

Concrete tuning values: **window 100 ms**, **min baseline 30 ms / 3 samples**, **min launch 0.25 px/ms**, **max 3.0–3.5 px/ms** (a max flick should reach the far rail with ~15% speed left), **exponent 0.8–0.9** so gentle taps still travel satisfyingly. Reject flicks whose direction has a negative y-in-world component (pulling toward yourself off the table).

### Cancel + robustness

- **Cancel gesture:** if the finger drags back so current velocity points toward the player, or release speed < escape velocity, snap the drink back to the tee with a spring animation (ZingTouch's escape-velocity concept, above).
- **Always handle `pointercancel`** (incoming call, edge-swipe steal, browser gesture takeover): abort the flick and restore state — identical code path to cancel.
- **`pointerdown` must `setPointerCapture(e.pointerId)`** so moves that leave the canvas keep arriving.

### Aim line (optional but cheap)

While dragging, run **one swept ray** from the drink along the current drag direction against the 4 rails using the same TOI function from (a): draw a dotted world-space line to the first impact, then a shorter reflected segment (one bounce is enough information; more looks like a cheat tool). Project the dots through the perspective function so the line "lies on the table". Recompute at most every other frame.

## (d) Low-end Android performance

Layering and pre-rendering, straight from [MDN's canvas optimization guide](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) plus [Konva's performance list](https://konvajs.org/docs/performance/All_Performance_Tips.html):

1. **Three stacked canvases** (each its own repaint cadence — Konva's whole layer system exists because "each layer is a separate canvas element" so you refresh only what changed):
   - `#bg` — living backdrop. Animate at **30 fps max** (its own accumulator), or make it a CSS-animated element/`<video>` so the compositor handles it. MDN: use plain CSS for large static backgrounds.
   - `#table` — table art, rails, level decor: **rendered once per level** to this canvas (or an offscreen canvas blitted once). Create with `getContext('2d', { alpha: false })` if it's the bottom layer — MDN lists opaque contexts as a rendering optimization.
   - `#game` — drinks, shadows, particles, aim line: the only per-frame canvas.
2. **Pre-render sprites; never scale in `drawImage` per frame.** MDN: cache multiple sizes at load instead of scaling every frame. For the perspective scale `s(d)` ∈ [0.6, 1.0], bake each drink tier at 2 sizes (far/near) into a single sprite atlas canvas and pick nearest, letting drawImage do only the residual ≤20% scale; snap draw coordinates with `Math.round` — sub-pixel coordinates force extra anti-aliasing work (MDN).
3. **Cap devicePixelRatio at 2** (and drop to 1 on weak devices): `const dpr = Math.min(devicePixelRatio || 1, 2)`. Konva's tip for slow retina devices is literally "set pixelRatio 1"; and iOS shares a ~256 MB combined canvas memory budget, so 3× DPR canvases risk eviction/crashes ([iPhone PWA game guide](https://gist.github.com/fozzedout/5e77925381991a9570151550992baf14)). Adaptive fallback: measure average frame time over 120 frames at boot; >20 ms → rebuild canvases at dpr 1.
4. **Zero allocation in the frame loop.** GC passes between frames blow the frame budget ([memory-consumption tutorial](https://dev.to/kalevski/tutorial-optimizing-memory-consumption-in-html5-games-lkb) measured ~90% GC-pressure reduction from a 300-object pool). Patterns from [web.dev's static-memory/object-pools article](https://web.dev/articles/speed-static-mem-pools): pre-allocate pools for particles (merge sparkles, splash droplets) and contact records; reuse scratch vectors (`TMP_V1`, `TMP_V2`) instead of returning `{x,y}` literals; no `.filter/.map` in the loop; ring buffer for touch samples. Verify with DevTools memory timeline — the sawtooth must be flat during play.
5. Misc MDN wins that matter here: **never use `shadowBlur`** (fake drink shadows with a pre-rendered radial-gradient sprite); batch path ops; avoid `ctx.save()/restore()` per sprite — set `ctx.setTransform(s, 0, 0, s, sx, sy)` directly and reset once; avoid `fillText` per frame (pre-render score digits or use DOM HUD); drive everything from one `requestAnimationFrame`.

## (e) Mobile-web platform hygiene

### Audio unlock

- Policy: "Create or resume context from inside a user gesture." Create the `AudioContext` lazily in the first `click`/`pointerup` handler, or `resume()` it there after checking `state === 'suspended'` ([MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)). **Unlock on `touchend`/`pointerup`, not `touchstart`** — on several iOS versions the autoplay criteria are only met once the finger lifts ([Matt Montag's unlock guide](https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos)). Your "tap to start" level screen is the natural unlock point; also re-attach a one-shot unlock listener on `visibilitychange`, since iOS re-suspends contexts.
- **iOS mute-switch trap:** Web Audio plays on the *ringer* channel, so the hardware silent switch mutes your whole game even after a successful unlock. The fix is playing a short **silent looping HTML `<audio>` element**, which flips routing to the media channel — that is exactly what [unmute.js](https://github.com/swevans/unmute) does (it also handles iOS's buggy page-visibility resume). Ship it or replicate its trick.
- Load SFX with `fetch` + `decodeAudioData` into `AudioBuffer`s (precision + low latency for clinks/merges — MDN best practices), one `GainNode` bus for SFX and one for music.

### Haptics

- `navigator.vibrate(8)` on merge, `vibrate([10, 30, 20])` on big chains — **Android Chrome only**. iOS Safari exposes no vibration API at all ([Interop issue #718](https://github.com/web-platform-tests/interop/issues/718)). On iOS 17.4+/18 there's a non-standard hack routing taps through a hidden `<input type="checkbox" switch>` that emits a system haptic; libraries wrap it ([haptics library](https://haptics.kushagragolash.dev/), [write-up](https://medium.com/@posaune0423/i-open-sourced-an-oss-library-for-arbitrary-haptic-feedback-in-ios-safari-5b8ca74a5f05)). Treat all haptics as progressive enhancement behind `if ('vibrate' in navigator)`.

### Viewport, safe areas, gesture prevention

Battle-tested stack from the [iPhone PWA game guide](https://gist.github.com/fozzedout/5e77925381991a9570151550992baf14) + [Chrome's overscroll-behavior post](https://developer.chrome.com/blog/overscroll-behavior):

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0,
      maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```
```css
html, body { margin:0; overflow:hidden; overscroll-behavior:none;
  touch-action:none; -webkit-user-select:none; height:100vh; /* NOT 100% or 100dvh */ }
.hud { position:fixed; inset:0; pointer-events:none;
  padding: max(20px, env(safe-area-inset-top))  max(16px, env(safe-area-inset-right))
           max(8px,  env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left)); }
```

- Without `viewport-fit=cover`, **every `env(safe-area-inset-*)` resolves to 0** ([Polypane safe-area guide](https://polypane.app/blog/using-safe-area-inset-to-build-mobile-safe-layouts/)). Known portrait inset values: notch iPhones top 44–47 px, Dynamic Island 59–62 px, bottom home bar 34 px — keep score/next-drink HUD inside those (gist tables above).
- Pull-to-refresh: `overscroll-behavior: none` on `html`/`body` kills it declaratively ([Chrome dev blog](https://developer.chrome.com/blog/overscroll-behavior)); double-tap zoom dies via `touch-action: none` on the game surface and `touch-action: manipulation` on DOM buttons ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)). Belt-and-braces: a `touchmove` listener with `{passive:false}` calling `preventDefault()` on the canvas.
- iOS steals **edge swipes** for back/forward navigation — `preventDefault()` on `touchstart` within ~50 px of the left/right edges, and keep the game a single-page app with no history entries (gist).
- Listen to `visualViewport.resize` **and** `orientationchange`, then poll `innerWidth/innerHeight` for up to 2 s because iOS reports stale sizes through several resize events after rotation (gist's interval pattern); rebuild canvas backing stores only when the size actually changed (WebKit canvas-resize memory leak, gist).
- `visibilitychange` → pause the rAF loop, suspend the AudioContext, snapshot game state.

### PWA offline

- Manifest: `"display": "standalone"`, `"orientation": "portrait"` (honored on Android, ignored by iOS but harmless — gist), `"start_url": "/?standalone=true"` so you can detect installed sessions.
- Service worker: this game is a **fully static asset bundle → precache everything at install and serve cache-first**; the standard strategy split is "cache-first (static), network-first (HTML), SWR (content)" ([offline-first strategies](https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies)). Use Workbox / vite-plugin-pwa to generate the **precache manifest with content-hash revisions** so updates replace only changed files ([Vite PWA precache guide](https://vite-pwa-org.netlify.app/guide/service-worker-precache)); total payload (atlases + audio) should stay well under 15 MB for a fast first install.
- **iOS kills backgrounded PWAs cold.** Autosave the run (board state, score, RNG seed) to `localStorage` every ~5 s and on `visibilitychange`, restore on boot (gist). Note iOS PWA storage is isolated from Safari's — don't promise continuity between the two.

## Build-order recommendation

1. Custom engine core (fixed-step accumulator + damping + impulse + rail TOI) — verifiable headless in Node with frame-by-frame asserts.
2. Projection module with `project/unproject` + round-trip unit test; render pass with painter's sort.
3. Flick module (100 ms window + caps + cancel), tuned against the engine on-device early — flick feel is the product.
4. Merge rules with the `merging`-flag guard + chain cascade.
5. Perf hygiene (layers, atlas, DPR cap, pools) once gameplay is locked; platform hygiene shell (meta/CSS/SW/audio unlock) can be written day one — it's independent of gameplay code.
