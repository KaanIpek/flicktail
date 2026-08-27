# Flicktail — Slide & Merge Cocktails

A premium-feel mobile web game: flick drinks up a beach-bar table and merge
identical ones into ever-bigger cocktails across 12 world-famous vacation
destinations. Suika-style 11-tier chain logic married to shuffleboard
skill-shots, with living painted backdrops, seeded fair physics and zero ads.

## Play

Serve it from any static server and open on a phone (portrait):

```bash
python -m http.server 5610 --directory D:/cowork/Flicktail
```

Installable as a PWA; fully offline after first load. Mid-run state autosaves
on every flick — kill the tab and you resume exactly where you left off.

## Design

- `docs/BRIEF.md` — the full game design brief (synthesized from a six-angle
  research pass; see `docs/research-*.md`).
- Core rules: drag-back slingshot launch (sqrt power curve), tiers 1–5 spawn
  from a seeded queue with 2-drink preview, identical drinks merge on contact
  (momentum-conserving, merge can never foul you), triangular merge scores
  with a ×5 combo cap, to-go order docks pay 2×, three rails + an open near
  edge (the gutter), overcrowd fail only after a visible 2 s dwell timer.
- Every level introduces exactly one legible mechanic: bouncier rails, orders,
  curved rails, friction zones, terraces, wind, a beach ball, marble ice,
  a wider spawn pool, tides, and the motu-island finale.
- Vacation Mode (zen, no-fail) on any completed level.

## Tech

Zero-dependency vanilla JS + Canvas. Physics is a custom swept-circle engine
(120 Hz fixed step, time-of-impact ordered, tunnel-proof) on a flat table
plane; the fake-3D look is a real perspective camera projecting that plane.
Backdrops render on their own canvas at 30 fps with ambient movers (boats,
cable cars, club beams, stingrays). SFX are fully procedural WebAudio; the
four music loops were generated with a local Stable Audio 3 install.

## Art & licences

- Drink sprites and destination paintings: AI-generated for this project.
- Fonts: Baloo 2, Nunito (SIL OFL 1.1, via Google Fonts).
- Music: generated locally with Stable Audio 3 under the Stability Community
  License (register before commercial sale).
- Everything else (code, SFX synthesis): original.

## Dev notes

- `window.__ft` exposes the QA hooks (spawn, state, retune, startLevel).
- `tools/process_art.py` — white-background sticker art → transparent sprite;
  full-bleed painting → WebP backdrop.
- `tools/make_icon.py` — app icons from the tier-4 sprite.
