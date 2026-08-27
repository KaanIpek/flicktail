# Merge-Physics Design Research: Suika mechanics + flick-table controls, with concrete starting numbers

## 1. Suika Game — the exact rules to steal

### 1.1 Merge rule
- Two **identical** fruits merge **on contact, instantly, regardless of speed** — collision event fires, both bodies are removed, one next-tier body spawns at the **midpoint** of the two (`midX = (a.x + b.x)/2`), per the working Matter.js tutorial implementation ([hinata-ya tutorial](https://hinata-ya.tech/games/en/games/suika/tutorial/)).
- Chain reactions are emergent, not scripted: the freshly spawned bigger fruit can immediately touch another identical fruit and merge again; a well-placed drop can cascade for 200+ points ([stay-foolish guide](https://stay-foolish-capital.com/Articles/Fruit-Merge-All-11-Fruits-Evolution-Guide-Sizes-Points-and-the-Path-to-Watermelon/index.html), [flywithspa analysis](https://www.flywithspa.com/panthercave/viewtopic.php?p=66888)).
- **11 tiers.** Only the **first 5 tiers spawn from the dropper, uniform 1/5 random, no anti-repeat rule**, with a "next fruit" preview shown ([TouchArcade guide](https://toucharcade.com/2024/03/29/suika-game-tips-and-tricks-guide-watermelon-mobile/)).
- **Top-tier + top-tier = both vanish** and grant a large bonus, freeing the board — this is the game's pressure-release valve and its "infinite score" loop ([Prima Games](https://primagames.com/tips/what-happens-when-you-merge-two-watermelons-in-suika-game-answered), [Followchain](https://www.followchain.org/2-watermelons-suika-game/)). **Adopt this**: two top-tier cocktails clink, vanish in a celebration, big bonus (+100 is what the tutorial implementation uses).

### 1.2 Scoring — triangular numbers
Merge that *creates* tier n+1 awards the (n+1)-th triangular number, `n(n+1)/2`:

| Creates tier | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|
| Points | 1 | 3 | 6 | 10 | 15 | 21 | 28 | 36 | 45 | 55 |

Two tier-11s vanishing: 66 base + ~100 bonus. Confirmed identically by the [Steam community breakdown](https://steamcommunity.com/app/2671970/discussions/0/4039229582008720811/), the [TomboFry open-source clone](https://github.com/TomboFry/suika-game) (`scoreValue: 1,3,6,10,15,21,28,36,45,55,66`), and the [stay-foolish guide](https://stay-foolish-capital.com/Articles/Fruit-Merge-All-11-Fruits-Evolution-Guide-Sizes-Points-and-the-Path-to-Watermelon/index.html). ~3,000 points is regarded as elite-play benchmark ([Shapes](https://shapes.inc/fandom/suika-game/high-scores)). Vanilla Suika has **no combo multiplier** — chains pay via the naturally superlinear values. Popular suika-likes add one: **merges within a 1–2 s window build a combo counter that multiplies subsequent merges, capped ~×5** ([wugames Fruit Merge](https://wugames.io/g/fruit-merge), [Merge Anything](https://omaegames.com/en/play/merge-anything)).

### 1.3 Fail condition — the grace period matters
Game over when a fruit sits above the dead line — but **only if it stays over the line ~2 full seconds** (`GAMEOVER_GRACE = 2000ms`); a momentary bounce over doesn't kill you, and a freshly dropped fruit gets ~1500 ms immunity before the check applies ([hinata-ya tutorial](https://hinata-ya.tech/games/en/games/suika/tutorial/); TomboFry uses a hard `loseHeight = 84px` variant). The grace period is repeatedly cited as what makes the game feel fair. **Design translation for our table game** (no gravity bucket): fail = table overcrowded — e.g. a resting drink intrudes into the launch strip, or covered table area exceeds a cap — *sustained for ~2 s*, never instantaneous.

### 1.4 Why the loop is addictive (design levers to keep)
- **Physics unpredictability**: pieces roll, settle, and destabilize — spatial planning inside a simulation, not tile logic ([flywithspa](https://www.flywithspa.com/panthercave/viewtopic.php?p=66888), [worldfuturesforum](https://www.worldfuturesforum.com/groups/suika-game/forum/discussion/stack-merge-repeat-why-suika-game-turns-simple-fruit-into-addictive-puzzle-fu/)).
- **Delayed consequence**: one careless early placement can end a run ten minutes later ([kokutech analysis](https://www.kokutech.com/blog/gamedev/design-patterns/unique-mechanics/suika-game)) — constant low-grade tension.
- **Chain-reaction jackpots** as the variable-ratio reward, plus **visible size progression** as the satisfaction loop ([suikagame.io](https://suikagame.io/)).
- **A hidden geometric mercy**: official tier sizes grow ~1.15–1.33× per tier — *below* the area-conserving √2 ≈ 1.414 — so **every merge frees net space**. Merging is always relief. Preserve this ratio property.

## 2. Concrete numeric starting points for OUR game

Assume portrait canvas 720×1280, physics simulated in flat top-down "table space" ~**620 × 900 px** (render through the fake-3D projection; keep physics 2D top-down like carrom, never do physics in screen space).

### 2.1 Reference values from shipped implementations
- **Official Suika diameters** (px, ~370-wide board): 24, 32, 40, 50, 62, 76, 92, 110, 132, 156, 180 ([stay-foolish guide](https://stay-foolish-capital.com/Articles/Fruit-Merge-All-11-Fruits-Evolution-Guide-Sizes-Points-and-the-Path-to-Watermelon/index.html)).
- **TomboFry clone radii** (640-wide board): 24, 32, 40, 56, 64, 72, 84, 96, 128, 160, 192; physics `friction: 0.006, frictionStatic: 0.006, frictionAir: 0, restitution: 0.1` ([repo](https://github.com/TomboFry/suika-game)).
- **hinata-ya tutorial**: `restitution 0.2, friction 0.5, density 0.002`, 60 Hz update ([tutorial](https://hinata-ya.tech/games/en/games/suika/tutorial/)).

### 2.2 Recommended 11-tier radius progression (table space px)
Suika's top fruit is ~49% of board width — fine when gravity stacks, fatal on a flick table where you must slide around pieces. Compress the top end; keep geometric ratio ≈ **1.19** (safely under √2 so merges free space):

**r = 18, 22, 26, 31, 37, 44, 52, 62, 74, 88, 105** (top drink = 34% of table width). First 5 tiers (r ≤ 37) are the flickable/spawnable ones, matching Suika's 1-in-5 uniform queue + next-drink preview.

### 2.3 Mass, restitution, friction
| Parameter | Starting value | Rationale |
|---|---|---|
| Mass | `m = r²/400` (constant density, m ∝ area) | Matches clone practice (constant density); tier-11 ≈ 34× tier-1 mass ⇒ big cocktails feel immovable, small ones ricochet — premium heft |
| Restitution drink↔drink | **0.35** | Livelier than Suika's 0.1–0.2 (bucket-settling value); identical pairs merge on contact anyway |
| Restitution drink↔rail | **0.75** | Carrom/shuffleboard rails are bouncy; bank shots become a skill |
| Sliding friction | exponential: `v *= 0.985` per 60fps frame (≈ ×0.40 per second; frame-rate-independent form `v *= exp(-0.91·dt)`) | Air-hockey feel references: 0.997/frame reads "icy" ([allanpope air hockey](https://codepen.io/allanpope/pen/OVxVKj)), Matter.js `frictionAir 0.005` ([steveeeie](https://codepen.io/steveeeie/pen/zjYmjR)); 0.985 gives shuffleboard weight. Box2D docs: damping 0–0.1 typical, use with (not instead of) contact friction ([Box2D](https://box2d.org/documentation/md_simulation.html)) |
| Stop snap | speed < **8 px/s** → 0, sleep body | Exponential damping never reaches zero; endless creep re-triggers merges and murders battery |
| Per-level friction skin | beach sand table 0.975/frame, standard bar 0.985, icy/wet tiki bar 0.992 | Real shuffleboard tunes "wax speed" per skill level ([Wikipedia table shuffleboard](https://en.wikipedia.org/wiki/Table_shuffleboard)); μk for real pucks measured 0.15–0.33 ([homework.study.com example](https://homework.study.com/explanation/in-a-shuffleboard-game-the-puck-slides-a-total-of-12-m-on-a-horizontal-surface-before-coming-to-rest-if-the-coefficient-of-kinetic-friction-between-the-puck-and-board-is-0-33-what-was-the-initial-s.html)) — friction as level personality is authentic |

Sanity check: full-power flick 1100 px/s at 0.985/frame travels `v₀·(k/(1−k))·dt` ≈ **1200 px** ≈ 1.3 table lengths — one rail bounce on a max shot. Correct starting feel.

### 2.4 Flick input and velocity clamps
Aiming schemes in the genre ([Carrom Pool guide](https://support.miniclip.com/hc/en-us/articles/4404675218577-How-to-Start-Playing-Carrom-Pool-A-Beginner-s-Guide), [8 Ball Pool controls](https://support.miniclip.com/hc/en-us/articles/35451942766865-Basic-Controls-Improving-your-skills-8-Ball-Pool)):
1. **Drag-back slingshot** (Carrom Pool): slide the piece laterally along the near edge, pull back for direction+power, guideline appears, release fires. Precise, readable, monetizable (guideline length is a striker stat in Carrom Pool — ([Strikers & Powers](https://support.miniclip.com/hc/en-us/articles/360011901674-Strikers-Powers-Pucks-and-Trails-Carrom))).
2. **Raw swipe-flick**: finger velocity at release becomes launch velocity. Visceral but noisy.

**Recommendation: drag-back slingshot with a short dotted trajectory preview** (first bounce only), because merge placement demands precision. Numbers:
- `maxDrag = 260 px` (≈ 0.2 × screen height); `launchSpeed = 1100 × sqrt(dragDist/maxDrag)` px/s in table space — sqrt curve gives fine control at soft power.
- **Min power threshold**: drag < 30 px on release = cancel (prevents accidental taps).
- Clamp: **min 150 px/s, max 1100 px/s**. Set launch **velocity directly, not impulse**, so every tier launches identically despite the 34× mass range.
- If you offer swipe-flick mode: compute velocity from a **50–100 ms trailing window of touch samples**, not last-two-points (raw deltas are noisy — smoothing technique per [levi.dev multi-touch inertia devlog](https://devlog.levi.dev/2022/04/implementing-multi-touch-camera.html)); gesture APIs report px/ms with flick thresholds ~0.6 px/ms ([react-swipeable](https://github.com/danielecammarata/react-swipeable), [Flick lib](https://github.com/cemolcay/Flick)).

### 2.5 Merge mechanics adapted to the table
- Merge on contact, any speed (Suika rule). Spawn at **mass-weighted midpoint**, and give the new body the **momentum-conserving velocity** `(mₐvₐ + m_bv_b)/(mₐ+m_b)` — this is our twist Suika doesn't have: chains that *travel* across the table.
- **Pop-in growth**: spawn the merged body at ~70% radius and tween to 100% over 120 ms. This prevents the "merge explosion" — a full-size spawn overlapping neighbors makes the solver eject them violently.
- **Spawn immunity**: newly merged body ignores merge checks for ~100 ms (during pop-in), then **re-scan its neighbors** for same-tier contacts to continue the chain (see pitfall 3 below).
- **Combo scoring**: base = triangular values above; each chain step within a **1.5 s window** of the previous merge increments a combo counter that multiplies that merge's base ×1, ×2, ×3 … capped **×5** (pattern from shipped suika-likes: [wugames](https://wugames.io/g/fruit-merge), [Merge Anything](https://omaegames.com/en/play/merge-anything)). Show the counter big — it's the dopamine dial.
- **Difficulty per level**: pre-place drinks (count and tier mix rise per level), shrink free margin, add obstacle props (candles, menus) as static bodies, per-level friction skins (2.3), and goal types: "create a tier-8", "score X in N flicks". Fail = launch strip blocked ≥ 2 s (the Suika grace rule, translated).

## 3. Known pitfalls and standard solutions

1. **Double-merge race (3+ identical touching in one physics step)**: collision batch contains pairs A-B and B-C; naive handling merges B twice or spawns two bodies. **Standard fix — the "popped/merging flag"**: iterate collision pairs, `if (bodyA.popped || bodyB.popped) continue;`, set the flag on both winners immediately; first pair in the batch wins, C simply stays put ([TomboFry implementation](https://github.com/TomboFry/suika-game); hinata-ya uses an identical `merging` flag with a 50 ms removal delay). Also: **queue merges during the collision callback, execute after the step** — mutating the world inside the solver callback corrupts most engines.
2. **Tunneling on fast flicks**: smallest drink diameter 36 px; 1100 px/s ≈ 18 px/frame at 60 fps — safe, but 2× power-ups or 30 fps dips break it. Matter.js has **no CCD at all**; fast bodies pass through walls ([matter-js issue #5](https://github.com/liabru/matter-js/issues/5)). Box2D/planck.js do CCD by default vs static bodies and offer **bullet bodies** for dynamic-vs-dynamic sweeps at a perf cost — flag only the currently flicked drink as a bullet, never all bodies ([Box2D simulation docs](https://box2d.org/documentation/md_simulation.html), [O'Reilly Box2D bullets](https://www.oreilly.com/library/view/box2d-for-flash/9781849519625/ch08s02.html), [planck.js](https://piqnt.com/planck.js/)). If hand-rolling circle physics (viable and fastest for ~30 circles): **fixed timestep with 4 substeps (dt = 1/240)** caps motion at ~4.6 px/substep — tunnel-proof — plus hard clamp `speed ≤ 0.8 × minDiameter × 240`.
3. **The stuck identical pair**: `collisionStart` fires once; if a merge was suppressed (flag/cooldown active), two identical drinks can rest touching forever and never re-trigger. Fix: after every merge and every cooldown expiry, run a **proximity sweep** (`dist < rₐ+r_b+2px`) over same-tier pairs; or listen to `collisionActive` as backup.
4. **Merge-spawn overlap explosion**: covered by pop-in growth (2.5); additionally cap per-step position correction in the solver so overlaps resolve over several frames.
5. **Exponential damping floats forever**: Box2D community explicitly warns damping alone "makes bodies look like they are floating" ([Impact forums](https://impactjs.com/forums/help/box2d-plugin-and-dampening)) — pair the 0.985 multiplier with the 8 px/s stop-snap and sleeping, or resting drinks jiggle and drain battery.
6. **Don't simulate in screen space**: with fake-3D perspective, screen-space physics makes far collisions wrong. Simulate flat top-down; project only for rendering; scale sprites by depth.

## 4. Build recommendation
Hand-rolled circle-circle + circle-AABB physics (this is carrom, not ragdolls): fixed 240 Hz substeps, positional correction, the flag-queue merge pipeline above. Zero deps fits the LUMEN-style stack, guarantees the tunneling/CCD story, and Matter.js is both CCD-less and ~40% of Box2D-JS throughput ([daily.dev engine comparison](https://daily.dev/blog/top-9-open-source-2d-physics-engines-compared/)). If an engine is wanted anyway: **planck.js** (Box2D port, bullet bodies) over Matter.js.
