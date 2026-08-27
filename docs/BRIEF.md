# FLICKTAIL — Game Design Brief v1.0

**Platform:** Portrait mobile web (PWA) · **Stack:** zero-dependency vanilla JS + Canvas · **Model:** premium, no ads, no dark patterns, fully offline

---

## 1. Pitch

**Flicktail** is a premium flick-and-merge puzzle: you slingshot cocktails up a fake-3D bar table at twelve world-famous vacation spots, and identical drinks clink together and merge into the next-tier cocktail — shot glass to mojito to tiki mug to a towering champagne fountain — while a living postcard (a catamaran gliding past Diamond Head, club beams sweeping over Es Vedrà) animates behind the table. It is the game millions of players were shown in fake "launch-and-merge drinks" ads and never got: Suika's 11-tier chain-reaction dopamine married to shuffleboard's skill-shot aiming, with physics that never cheat, difficulty that comes from legible level design (curved tables, wind gusts, tides — never rigged odds), and zero interruptions: no ads, no energy, no login, ever.

## 2. Name

**Flicktail** — subtitle **"Slide & Merge Cocktails"** (23 chars, fits Apple's 30-char field).
One-line justification: coined portmanteau that names the core verb + theme in one ownable word; verified clean on App Store, Google Play, and USPTO class 9/41 (the only FLICKTAIL filing is dinnerware, no confusion overlap), unlike Sunsip (live beverage brand) or the descriptive "___ Merge" shelf. Remaining action: 5-minute manual TMview (tmdn.org) check before launch.

## 3. Core Loop & Controls

**Loop:** A drink waits on the tee at the near rail (spawn: tiers 1–5, uniform 1/5, seeded RNG; **next 2 drinks previewed**). Drag back to aim, release to flick it up the table. Identical drinks merge on contact into the next tier, chains cascade and *travel* (merged drinks keep momentum — our twist on Suika). Reach the level's Signature Drink within the flick budget to win the destination and unlock the next postcard.

**Primary control — drag-back slingshot** (precision beats raw swipe for merge placement):

| Parameter | Value |
|---|---|
| Canvas / physics table space | 720×1280 screen · **620×900** top-down world px |
| Max drag distance | **260 px** (screen) |
| Launch speed | `1100 · sqrt(dragDist/260)` table-px/s — sqrt curve = fine control at soft power |
| Clamp | min **150**, max **1100** px/s; drag < **30 px** on release = cancel (snap back with spring) |
| Velocity application | **Set velocity directly, never impulse** — every tier launches identically despite 34× mass range |
| Aim line | Dotted world-space line to first rail impact + one reflected segment (swept-ray TOI), projected onto the table; recompute every other frame |
| Direction rule | Reject launches whose world-y component points off the near edge |

**Alt control (Settings toggle, "Swipe Flick"):** velocity from a **100 ms** trailing ring buffer of coalesced pointer samples (`getCoalescedEvents`), min baseline 30 ms / 3 samples, escape velocity 0.25 px/ms, cap 3.2 px/ms, response exponent 0.85.

**Input plumbing:** Pointer Events on canvas, `touch-action: none`, `setPointerCapture` on pointerdown, `pointercancel` = identical path to cancel + spring back.

## 4. The 11-Tier Drink Chain

Radii in table-space px, geometric ratio ≈1.19 (< √2, so **every merge frees net space**). Tiers 1–5 (r ≤ 37) are the spawnable set. Mass = r²/400. Merge score = points awarded when a merge **creates** that tier (triangular numbers).

| # | Drink | Visual (colors, glass, garnish) | r | Merge score |
|---|---|---|---|---|
| 1 | **Citrus Shot** | Squat shot glass, sunrise-gold gradient `#FFC65C→#FF8C5A`, lime wedge on rim | 18 | — (spawn only) |
| 2 | **Mini Mojito** | Small straight highball, seafoam `#8FE3C0` with crushed ice, mint sprig | 22 | 1 |
| 3 | **Margarita** | Wide double-cone margarita glass, pale lime `#CFEB8F`, white salt rim + lime wheel | 26 | 3 |
| 4 | **Sunset Sling** | Curvy sling glass, orange→crimson gradient `#FF9E4A→#D93B54`, cherry skewer | 31 | 6 |
| 5 | **Piña Colada** | Hurricane glass, creamy ivory `#F7EDD5`, pineapple wedge + red straw | 37 | 10 |
| 6 | **Blue Lagoon** | Oversized balloon goblet, electric blue `#2E9BF0`, paper umbrella + orange wheel | 44 | 15 |
| 7 | **Tiki Mai Tai** | Carved brown tiki-idol mug `#8A5A38`, dark-rum float, pineapple leaf + mint | 52 | 21 |
| 8 | **Coconut Crush** | Whole husked coconut `#6B4A2F`, two striped straws, pink orchid | 62 | 28 |
| 9 | **Pineapple Royale** | Whole hollowed pineapple `#E8B93B` with green leafy crown, two cocktail flags | 74 | 36 |
| 10 | **Fishbowl Fiesta** | Glass fishbowl, teal punch `#2EC4B6`, four straws, gummy fish + umbrellas | 88 | 45 |
| 11 | **Champagne Fountain** | Three-tier gold coupe tower `#FFD97B`, cascading sparkle, lit sparkler on top | 105 | 55 |

**Top-tier rule (pressure valve):** two Champagne Fountains touching → celebratory clink, both vanish, **+100 bonus** (on top of no merge score — they don't create a tier 12).

Every silhouette is distinct at a glance (shot / highball / cone / sling / hurricane / balloon / tiki / coconut / pineapple / bowl / tower) — tier readability IS the strategy layer, and it's the #1 failure of the direct competitor.

## 5. Scoring

- **Merge points:** triangular table above (1, 3, 6, 10, 15, 21, 28, 36, 45, 55; double-Fountain clink +100).
- **Combo:** each merge within **1.5 s** of the previous merge increments a combo counter; that merge's base is multiplied by `min(combo, 5)` (×1, ×2, ×3, ×4, ×5 cap). Counter renders huge in Baloo 2 — it's the dopamine dial. Cascades count because merged drinks keep momentum and physically roll into the next merge.
- **Orders (from Level 3):** serving a drink to a to-go order card pays **2× that tier's triangular value** and removes it from the table (pressure relief). Max 2 order cards; 45 s soft timer — an expired order is silently replaced, **no penalty**.
- **Stars:** 1★ = complete the level goal within the flick budget. 2★/3★ = finish with total score ≥ the thresholds in §6 (tune in playtest; ratios locked at roughly 1 : 1.7).

## 6. Level Design — 12 Destinations, One New Thing Each

Fixed order (world tour: USA → Americas → Europe → Middle East → SE Asia → Polynesia). Friction skins: **sand 0.975/frame · standard wood 0.985 · marble/ice 0.992** (frame-rate-independent forms in §12). Pre-placed drinks rise per level (0 → 14) and are listed in each level's data file.

| # | Destination | Goal (Signature Drink) | Flicks | 2★ / 3★ | NEW mechanic taught |
|---|---|---|---|---|---|
| 1 | Waikiki, Hawaii | Create Tier 5 | 20 | 80 / 140 | **Core loop**: flick, merge, combo meter. Oversized table, sand friction (shots die soft — forgiving). |
| 2 | Miami South Beach | Create Tier 6 | 26 | 150 / 260 | **Bank shots**: chrome deco rails at e=0.85 + a "score 1 bank-shot merge" side goal; flick budget now displayed tightly. |
| 3 | Cancún | Tier 6 + serve 3 orders | 30 | 200 / 350 | **To-go orders**: serve matching drinks off the table for 2× pay — the anti-overflow valve. |
| 4 | Copacabana, Rio | Create Tier 7 | 36 | 300 / 520 | **Curved table**: crescent felt following the beach curve; side rails are arcs — banked aim changes completely. |
| 5 | Nice, France | Create Tier 7 | 38 | 340 / 600 | **Friction zones**: slow pebble band mid-table (0.975), fast promenade lanes along the rails (0.992) — visibly textured. |
| 6 | Positano | Create Tier 7 | 40 | 380 / 680 | **Terraces**: extra-long cliff table with two interior half-rails; thread flicks through the gaps. |
| 7 | Santorini (Oia) | Create Tier 8 | 55 | 600 / 1000 | **Wind gusts**: lateral caldera breeze every 12 s, telegraphed 2 s ahead by fluttering napkins; gusts never wake sleeping drinks — they only deflect drinks in motion. |
| 8 | Ibiza | Create Tier 8 | 58 | 650 / 1100 | **Moving obstacle**: a drifting glowing beach ball (light mass, e=0.9) patrols the table; night level, drinks get neon rim-light. |
| 9 | Dubai | Create Tier 8 | 60 | 700 / 1200 | **Ice physics**: polished marble, global friction 0.992 + table 15% smaller — everything glides, rail play mandatory. |
| 10 | Kata Beach, Phuket | Create Tier 9 | 80 | 1000 / 1700 | **Wider drink set**: spawn pool becomes tiers 1–6 — announced on the level intro card (legible, never hidden odds). |
| 11 | Tanah Lot, Bali | Create Tier 9 | 85 | 1100 / 1900 | **Tide hazard**: far third floods every 25 s, telegraphed 3 s ahead; drinks resting in the zone wash away (lost, no score penalty). |
| 12 | Bora Bora (finale) | Create Tier 11 | 150 | 2000 / 3400 | **Remix**: lagoon table with two motu-island static obstacles + orders + pre-seeded board (incl. two Tier 8s). Hidden 3rd-star flourish: clink two Champagne Fountains. |

**Vacation Mode (Zen):** available on every completed level — no flick budget, no fail; when the table fills, the oldest drink is auto-served. Offline, ambience-only audio. (The one feature the 100K-download competitor leads its store page with.)
**Progression meta:** world-map postcard unlocks, per-destination high scores, and a Collection Book (every cocktail first-created, per destination) — fixes the niche's "zero continuity / nothing after max" complaints.

## 7. Win / Fail / Foul Rules

- **Win:** create the level's Signature Drink (plus any listed side goals) before the flick budget runs out.
- **Fail A — out of flicks** before the goal. Retry instantly, same seed offered ("Retry" replays the identical spawn queue; "Shuffle" reseeds).
- **Fail B — overcrowd:** if any **sleeping** drink intersects the 120-px launch strip at the near rail **continuously for 2.0 s** (Suika's grace rule, translated): warning flash at 0 s, fail at 2 s. Freshly launched or freshly merged drinks carry 1.5 s immunity from this check. Never instantaneous, never during a live cascade.
- **Foul — the gutter:** the table has three bouncy rails (far, left, right). The near edge is open: a drink that fully crosses the near foul line drops into the gutter with a splash and is **removed — losing the drink is the whole penalty** (no score deduction, never a run-fail). Rebounds toward yourself are the risk you manage, exactly like shuffleboard.
- **Merge-forgiveness guarantee (non-negotiable):** merges can never kill or foul you. Merged drinks spawn at 70% radius and tween up (no ejection explosion), merge impulses are clamped, and a merge spawn within one radius of the foul line is nudged fully onto the felt. This is Suika's single most-cited rage point; we design it out.
- Hazards (wind, tide, beach ball) can never push a *sleeping* drink into the gutter.

## 8. Living Backdrop Spec (top ~38% of screen, 3 parallax layers: sky gradient / far landmark / near frame; one ambient mover per scene, 8–25 s loop)

| # | Scene | Time | Palette (key hexes) | Silhouettes | Ambient loop |
|---|---|---|---|---|---|
| 1 | Waikiki | Bright morning | sky `#7EC8E3→#BDE3F0`, sea `#1A9BB8`/`#2EC4B6`, sand `#F2E3C6`, crater `#8A8B5C`, hotel pink `#E8A0A8` | Diamond Head crater; pink Royal Hawaiian block; leaning palms (near) | White catamaran glides across the bay (25 s) |
| 2 | Miami | Sunrise | sky `#F7B2C4→#C9A7E0`, sea `#7FD1C8`, deco mint `#9FE2BF`, flamingo `#F26CA7`, neon cyan `#58E0E6` | One large Art Deco lifeguard tower (near); pastel hotel row; palm promenade | Cruise ship slides along the horizon (25 s) |
| 3 | Cancún | High noon | sky `#4FB8F0`, sea bands `#40E0D0`/`#0E7FA8`, sand `#FBF3E4`, limestone `#C9B08C`, jungle `#2E8B57` | Two-band turquoise sea; white hotel strip; small Mayan pyramid (El Rey) | Red-yellow parasail drifts across the sky |
| 4 | Rio | Golden hour | sky `#FFC65C→#FF8C5A`, sea `#2E7FA0`+`#FFD98E` glints, pavement `#1E1E1E`/`#F5F1E8`, Sugarloaf `#6B7A5E` | Sugarloaf; Burle Marx wave-mosaic strip as near frame; tiny hazy Christ on the ridge | Cable-car cabin climbs the wire and returns |
| 5 | Nice | Azure afternoon | sky `#6FB7E8`, sea `#145DA0→#2E8BC0`, pebbles `#D8CFC0`, Negresco pink `#E5788C`, chair blue `#1F6FB2` | Curving Promenade balustrade; Negresco dome; row of blue chairs | Airliner descends diagonally over the bay (20 s) |
| 6 | Positano | Golden hour | sky `#FFD3A5→#FD9853`, sea `#3D7EA6`, terracotta `#D96C47`, pastels `#F0B9A0`/`#F5E6CE`, dome tiles `#E8C547`/`#3E8E7E`/`#2A6F97` | Stacked pastel cliff houses; majolica dome; lemon pergola (near) | White ferry crosses toward Capri |
| 7 | Santorini | Sunset | sky `#FF9A5C→#C74B77→#5C3C74`, sea `#35516E`, white cubes `#F7F3EE` w/ pink rim `#FFB8A0`, dome `#2A5DAB`, windows `#FFC46B` | Blue domes; the Oia windmill; cascading white cubes | Windmill blades turn; windows flick on one by one |
| 8 | Ibiza | Dusk→night | ember `#E36A3C→#1B2A55→#0C1330`, sea `#14243E`+`#9FD8E8` sparkle, beams `#C77DFF`/`#4CC9F0` | Es Vedrà rock; Cala d'Hort arc; moored party boat | Two club beams sweep and cross; rare shooting star |
| 9 | Dubai | Full night | sky `#0F1B3D→#26154A`, sea `#123C58`+`#F2C14E` gold, sail `#F5F0E6`/`#FFD97B`, windows `#4CC9F0`/`#FFC46B` | Burj Al Arab sail; lit skyline + wheel (static — Ain Dubai rendered non-turning) | Camel caravan walks the waterline; hotel facade color-washes |
| 10 | Phuket | Tropical morning | sky `#8FD5F5`, sea `#23B5A0`/`#7FE3D2`, sand `#F6E7C1`, jungle `#1F7A4D`, hull red `#D14B3C` | Ko Pu islet; jungle headlands; tiny white Big Buddha on ridge | Longtail boat putters across, wake trailing |
| 11 | Bali | Sunset | sky `#FF8E53→#D94A6A→#6D3B77`, sea `#4A3B63`+`#FFB25E` path, silhouette `#241B2F` | Tanah Lot temple rock w/ meru roofs; white wave-bursts | Giant janggan kite sways, long ribbon tail undulating |
| 12 | Bora Bora | Brilliant midday | sky `#62C8F0`, lagoon `#A7F0E0→#43D9C7→#0FA3B1→#0B6E8C`, sand `#FBF4DC`, Otemanu `#3E6B4F`, thatch `#B98A5A` | Mt. Otemanu tooth; overwater bungalow line; banded lagoon | Stingray shadows glide through the shallows |

Table felt + rails tint per level with the scene's accent color (screenshots instantly distinguishable in stores). Backdrop layer animates at 30 fps max on its own canvas.

## 9. Juice & Feedback Checklist

- [ ] **Merge burst:** pooled particle ring (12 droplets in the drink's palette) + liquid splash sprite + score number floats up in Baloo 2 ExtraBold
- [ ] **Pop-in squash-stretch:** merged drink spawns at 70% scale → overshoots 108% → settles 100% over 120 ms (elastic ease)
- [ ] **Launch:** drink squashes 92% on drag, stretches along velocity on release; whoosh pitch scales with power
- [ ] **Rail hit:** 2-frame white flash on the rail segment + soft thunk
- [ ] **Combo callouts:** counter scales up per step; text pops at ×2 "Double Pour!", ×3 "Happy Hour!", ×4 "Tiki Time!", ×5 "TIDAL WAVE!"
- [ ] **Tier ≥8 creation:** 200 ms slow-mo + 4-px screen shake + backdrop glint (sun flare / neon pulse)
- [ ] **Double-Fountain clink:** confetti fountain, sparkler burst, freeze-frame 300 ms
- [ ] **Haptics:** `navigator.vibrate(8)` per merge; `[10,30,20]` combo ≥3; `[15,40,15,40,30]` tier ≥9; iOS via the checkbox-switch hack library, all behind capability checks (progressive enhancement)
- [ ] **Foul/gutter:** sad splash + "Spilled!" — soft, never punishing tone
- [ ] **Overcrowd warning:** launch strip pulses red with a 2 s radial timer — the player always sees the fail coming
- [ ] **Idle delight:** drinks bob micro-sine when settled; garnish sways

## 10. Audio Plan

**SFX map** (all CC0, zero attribution; Freesound CC0 filter trick: `&f=license:%22Creative+Commons+0%22`):

| Event | Source |
|---|---|
| Merge clink | "Glass_Clink.aif" — kbnevel, Freesound CC0 |
| Merge splash (randomized) | "water_splash_10shots.wav" — vibe_crc, Freesound CC0 (10 variants) |
| Merge pop layer | "Bubble Pop UI and Game Sounds" — el_boss, Freesound CC0 |
| Flick whoosh | "Little Whoosh 2" — ch_ase / "Whoosh For Whip Zoom" — BennettFilmTeacher, Freesound CC0 |
| Drink/rail impacts | Kenney **Impact Sounds** (130 files, CC0) — kenney.nl/assets/impact-sounds |
| UI taps, tier-unlock ticks | Kenney **Interface Sounds** (CC0) — kenney.nl/assets/interface-sounds |
| Level win / big-merge fanfare | Kenney **Music Jingles** (CC0) — kenney.nl/assets/music-jingles |
| Order served / coins | Kenney **Casino Audio** (CC0) — kenney.nl/assets/casino-audio |
| New-tier chime | "Level Up" — qubodup, Freesound CC0 |
| Pour (level intro) | "Pouring water into glass" — FillSoko, Freesound CC0 |
| Beach ambience (day levels) | "Gentle ocean waves birdsong and gull" — jackmichaelking, Freesound CC0 |
| Bar ambience (night levels) | "Bar Chatter" — SoundsExciting / HECKFRICKER long loops, Freesound CC0 |
| Deep foley reserve | Sonniss GDC bundles (royalty-free, no attribution) — sonniss.com/gameaudiogdc |

**Music — 4 loop moods** (60–90 s seamless loops, generated on the local Stable Audio 3 install; complete Stability commercial registration before the game goes on sale):
- **A "Morning Tide"** — ukulele/marimba chill: levels 1, 2, 3, 5, 10, 12
- **B "Golden Hour"** — soft bossa: levels 4, 6
- **C "Last Light"** — warm downtempo: levels 7, 11
- **D "Neon Lagoon"** — deep-house chillout: levels 8, 9

Rule from competitor autopsies: **never replace shipped music, only add.** Web Audio: buffers via `fetch`+`decodeAudioData`, one SFX bus + one music bus GainNode; unlock on `pointerup` of the title screen; ship the unmute.js silent-`<audio>`-loop trick for the iOS mute switch; re-arm unlock on `visibilitychange`.

## 11. Asset Plan

**Hand-drawn (vector/canvas code, our premium look):**
- All 11 drink sprites — silhouettes based on **game-icons.net** SVGs (Martini, Glass shot, Mason jar, fruit set; CC BY 3.0 — https://game-icons.net) with proportions cross-checked against **Noto Emoji** (Apache 2.0 — https://github.com/googlefonts/noto-emoji, reference only)
- All 12 backdrops (3-layer parallax painters), table felts, rails, gutter, HUD chrome, world map, particles (with **Good Fruits M484** CC0 sheet — https://opengameart.org/content/good-fruits-m484-games — as confetti/juice flourishes)

**Taken from verified free packs:** audio per §10 (Kenney CC0, Freesound CC0, Sonniss).

**Fonts (bundled, OFL 1.1, keep OFL.txt in repo):** **Baloo 2** SemiBold/ExtraBold — title, tier names, combo pops (https://github.com/google/fonts/tree/main/ofl/baloo2) · **Nunito** Regular/Bold — HUD, settings, tutorial (https://github.com/google/fonts/tree/main/ofl/nunito).

**Do NOT ship:** cecilia Bartender pack (CC BY-ND — no derivatives), OpenMoji derivatives (CC BY-SA share-alike), Pixabay SFX (license ambiguity, unneeded).

**Credits screen total burden — one line:** "Icons by Lorc, Delapouite & contributors — game-icons.net — CC BY 3.0" (+ Apache notice only if Noto tracings ship).

## 12. Tech Architecture

**Physics — custom ~400-line engine** (no Matter.js: no CCD, wrong tool for gravity-less circles; scale is ~30 bodies = brute-force pairs, no broadphase):
- Fixed-timestep accumulator (`dt = 1/60`, frame delta clamped to 250 ms, `prevX/prevY` stored, render interpolates by `alpha`) with **4 substeps always (effective 240 Hz)** — caps motion at ~4.6 px/substep, tunnel-proof; plus **swept TOI**: exact circle-vs-rail time-of-impact (one division, reflect, spend remaining dt, ≤3 impacts/substep) and swept circle-circle (relative-frame ray vs inflated circle) for any body moving > r/substep
- Elastic impulse: `p = (1+e)(v₁·n − v₂·n)/(m₁+m₂)`; **e = 0.5 drink↔drink, 0.8 drink↔rail**; mass `m = r²/400`; positional correction 80% beyond 0.5 px slop, 2 iterations
- Friction blend, frame-rate independent: exponential `v *= exp(-k·dt)` with per-level k (sand 1.52, wood 0.91, marble 0.48 — i.e. 0.975/0.985/0.992 per 60 fps frame) **+** Coulomb `speed = max(0, speed − 40·dt)` **+ stop snap: speed < 8 px/s → zero + sleep** (no creep, no battery drain)
- Merge pipeline: detect during collision pass but **queue and execute end-of-step**; `merging` flag on both bodies kills double-merge races; spawn at mass-weighted midpoint with momentum-conserving velocity `(mₐvₐ+m_bv_b)/(mₐ+m_b)`; 100 ms merge immunity during pop-in; after every merge and immunity expiry, **proximity re-scan** same-tier neighbors (`dist < rₐ+r_b+2`) so cascades never strand a touching pair

**Perspective — physics flat, warp only the render:** world 620×900, y=0 at near rail; `D = 1.6` camera table-lengths; scale `s = D/(D+d)`, `screenY = horizonY + K/(D+d)` (true 1/z, never linear lerp); trapezoid table, painter's sort by world-y descending, sprites anchored bottom-center with squashed shadow ellipse (0.35× width × s), brightness `0.85 + 0.15s`; `unproject` is the algebraic inverse, unit-tested round-trip. Flick screen→world divides by `s(d)` (≈1 at the near rail — 1:1 under the finger).

**Module layout (`/src`, ES modules, zero deps):**
`main.js` (boot, level flow) · `loop.js` (accumulator) · `physics.js` · `merge.js` · `flick.js` · `project.js` · `render.js` · `sprites.js` (atlas baker: each tier pre-rendered at 2 sizes, near/far) · `particles.js` (pooled) · `levels/L01..L12.js` (data: table geometry, friction skin, obstacles, goals, pre-placed drinks, budgets, stars) · `backdrops/B01..B12.js` (scene painters) · `audio.js` · `haptics.js` · `save.js` · `hud.js` (DOM overlay) · `sw.js` + `manifest.webmanifest`

**Rendering:** 3 stacked canvases — `#bg` (backdrop, 30 fps own accumulator), `#table` (rendered once per level, `{alpha:false}`), `#game` (per-frame). DPR = `min(devicePixelRatio, 2)`, auto-drop to 1 if boot-measured avg frame > 20 ms. No `shadowBlur`, no per-frame `fillText`, no save/restore per sprite (`setTransform` direct), `Math.round` draw coords.

**Performance budget:** ≤ 8 ms physics+render per frame on a Moto G-class Android; **zero allocation in the frame loop** (pools for particles/contacts, scratch vectors, ring buffers — flat DevTools memory sawtooth is a release gate); total precached payload ≤ 15 MB (target ~6 MB: OGG audio ~4 MB, atlases ~1.5 MB).

**Platform shell:** viewport meta with `viewport-fit=cover`, safe-area HUD padding, `overscroll-behavior:none`, `touch-action:none` + non-passive `touchmove` preventDefault, iOS edge-swipe guard (~50 px), `visualViewport.resize` + 2 s post-rotation polling, `visibilitychange` → pause rAF + suspend audio + snapshot. PWA: `display: standalone`, `orientation: portrait`, service worker precaches everything cache-first with content-hash revisions. **Autosave table state + score + RNG seed to localStorage every flick and on visibilitychange; restore on boot** — "picks up right where you left off" is a review shield.

## 13. "Better Than Competitors" — Top 6 Commitments

1. **Be the game the fake ads promised.** Tasty Travels trained millions to want "launch drinks, merge them" and never shipped it; the closest clone's own reviews admit they installed it hunting for that ad. Store copy owns those searches: "slide drinks", "merge drinks", "the drink merge game from the ad".
2. **Physics that can never feel rigged.** Deterministic seeded runs, drinks stop where momentum says, merge-forgiveness (no merge can ever eject, foul, or kill you), overcrowd fail only after a visible 2 s dwell timer — and physics constants are frozen post-launch (players caught a competitor's stealth "bouncier" patch instantly).
3. **The full 11-tier chain with unmistakable silhouettes.** The direct concept twin died on "sizes all the same, merging stops after the 4th generation." Every tier is a different glass shape and visibly larger; big-tier reveals are the product.
4. **Real persistent progression.** World-map postcards, per-destination high scores, and a cocktail Collection Book — against the niche's documented "zero continuity" and "once you max, it just ends" voids.
5. **Never interrupt or gate a run.** Premium: zero ads of any kind, fully offline, no accounts or login nags, autosave every move, all purchases (if any: cosmetic drink sets) outside gameplay. Aladdin X proves paid/no-ads earns explicit praise in this exact genre.
6. **Difficulty from legible level design, not stinginess.** Every ramp is an inspectable cause the level card announces — curved tables, friction zones, wind, tides, wider drink sets — never degraded spawn odds behind the player's back; plus Vacation Mode (zen, no-fail) on every level, the one feature the niche's biggest player leads with.
