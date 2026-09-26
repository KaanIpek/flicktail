# Flicktail

A slingshot bar puzzle. You pull back and release; the glass runs the length of
a perspective table, banks off the rails and settles where your aim and power
put it. Two glasses that stop touching combine into the next drink up.

- **Live on web:** https://kaanipek.github.io/flicktail (Pages serves `master`
  root — every push to master deploys).
- **iOS:** App Store Connect app id `6806109983`, bundle `com.rldgames.flicktail`.
  TestFlight group "Kaan" auto-distributes every build.
- Zero-dependency vanilla JS + Canvas PWA. No framework, no bundler, no build
  step for the web game — the files in `src/` are what ship.

> **This repository is public.** GitHub Pages and the free macOS CI runner both
> require it. Never commit credentials, API keys, or personal contact details.

---

## Status — 26 September 2026

**Nothing is in App Review.** 1.0.0 reads `DEVELOPER_REJECTED` — it was
removed from review by someone on the account between 14 and 26 September
(the API does not say who or when), not rejected by Apple. Submission
`6e254ac3` is `COMPLETE`. The version still carries build 59, and 59 is the
newest build Apple has.

Build 59 is `905d7b8` (3 September). Master has moved on since: `894829d`
took the genre word out of the game's own copy, dropped the About screen's
false "zero dependencies" claim and moved the `window.__ft` hooks out of the
app. **A resubmission needs a new build from master**, not 59.

Build 56 was **rejected on 2 September under Guideline 4.3(a) — Design: Spam**,
reviewed on an iPad Air 11" (M3). 4.3(a) is not a code scan, it is a judgement:
the reviewer pattern-matched "merge game". Build 59 answers it three ways —
repositioned store copy, a real iPad layout, and a Resolution Center reply with
checkable facts. That reply is on submission `6e254ac3` and is worth re-reading
before writing anything new to Apple.

If it is rejected again, the next step is an **App Review Board appeal**, not
another quiet resubmission.

### Checking the live state

```bash
gh workflow run asc-status --repo KaanIpek/flicktail   # no .p8 needed
node tools/asc.mjs GET "v1/apps/6806109983/reviewSubmissions?limit=5"
```

`tools/asc.mjs` is a small ES256-JWT client for the App Store Connect REST API.
It carries no credentials: it reads `ASC_KEY_ID`, `ASC_ISSUER_ID` and the key
(`ASC_KEY_PATH`, `ASC_KEY_P8` or `ASC_KEY_P8_B64`) from the environment, or
finds `AuthKey_<id>.p8` in `~/Documents/Apple Developer Keys/`. Write the path
without its leading slash and Git Bash has nothing to rewrite.

The `asc-status` workflow prints the submission, version and build states from
a GitHub runner using the repo's own ASC secrets — the route for a machine
without the key, or a cloud session whose network cannot reach apple.com. It
runs by itself when `tools/asc.mjs` or the workflow changes.

(The `qa/` folder that *is* committed holds only two autoplay result files.)

---

## Setting up on a new machine

Needed: **Node 18+**, **Python 3**, **git**, **GitHub CLI** (`gh auth login`),
and Chrome (only for the QA harness).

```bash
git clone https://github.com/KaanIpek/flicktail.git
cd flicktail
python -m http.server 5610          # the whole web game, no build step
```

`.claude/launch.json` hardcodes `--directory D:/cowork/Flicktail`. **Fix that
path on the new machine** or the Browser-pane preview serves nothing.

### Secrets — copy these by hand, never commit them

| What | Where it lives | Used for |
| --- | --- | --- |
| App Store Connect API key `.p8` | `~/Documents/Apple Developer Keys/` | `tools/asc.mjs`, `altool` upload |
| ASC key id + issuer id | env `ASC_KEY_ID` / `ASC_ISSUER_ID`; repo secrets | signing the JWT |
| iOS signing cert + profile | GitHub repo secrets (already set) | CI |
| AdMob unit ids | GitHub repo **variables** (already set) | `mobile/inject-ad-units.mjs` |

The QA harness — puppeteer-core driving the installed Chrome, the autoplay
balance bot, the screenshot and App Store upload scripts — lives in the session
scratchpad rather than in this repo. It does not survive a machine move. If it
is gone it is rebuildable; the load-bearing parts are
`autoplay.mjs` (the greedy bot the star lines were derived from) and
`upload-shots.mjs` (reserve → PUT → commit-with-MD5, the only reliable way to
get screenshots into ASC).

Render screenshots with Chrome's real GPU backend
(`--use-gl=angle --use-angle=d3d11 --enable-gpu`). swiftshader cannot fill a
2048×2732 iPad surface before the CDP screenshot call times out.

### Shipping an iOS build

```bash
gh workflow run ios --repo KaanIpek/flicktail
```

Build number = the workflow run number, so it auto-bumps. The archive is taken
unsigned and signed at export (no Mac needed). Wait for `processingState: VALID`
in ASC before attaching it to a version.

---

## Architecture, the load-bearing parts

| File | What it owns |
| --- | --- |
| `src/main.js` | boot, `resize()`, screen routing, service-worker update handling |
| `src/game.js` | rules, modes, goals, hazards, scoring, autosave |
| `src/physics.js` | swept-circle solver, fixed 120 Hz step |
| `src/view.js` | perspective camera — `fit()` decides the whole framing |
| `src/render.js` | everything drawn on canvas incl. procedural creature cups |
| `src/tours.js` | 21 countries, stop generation, drink sets, star lines |
| `src/ui.js` | DOM overlay screens (title, map, collection, skins, settings) |
| `sw.js` | cache-first service worker |

`window.__ft` exposes `game/view/renderer/physics/fx/save/audio/backdrop/ui/ads/
spawn/startLevel/showMap/startRush/startShift/startSplit/startEndless` — every
automated test drives the game through it.

Current content (all derived by `node tools/verify-store-claims.mjs`):
21 countries · 180 stops · 6 modes · 7 skins · 21 signature pours ·
126 named drinks · 4 regional drink sets · 27 backdrops · 59 creature species.

---

## Decisions that must not be quietly undone

**1. Nothing store-facing calls this a "merge" game.** That wording is what drew
the 4.3(a) rejection. It has to stay consistent in *four* places, and the fourth
is the one everyone forgets:

- `appInfoLocalizations.subtitle` — currently `Slingshot puzzle · 180 stops`
- `appStoreVersionLocalizations` — keywords, description, promotional text
- **`appStoreReviewDetails.notes`** — the first thing a reviewer reads, before
  they ever open the app
- the game's own tagline (`src/ui.js`), `manifest.webmanifest`, `README.md`

**2. Never claim art was hand-painted or hand-drawn.** The images were
generated. A false claim about process is poison in a listing you are
defending as original work.

**3. Phone layout is frozen; tablets widen instead.** `resize()` gives phones
the 9:16 column they were designed for and tablets 0.72, near the table's own
620×1020 proportions. `view.fit()` also caps the scale so the far rail stays at
least 12% down the screen — without that cap a wide stage pushes the far rail
off the top. Verified: the far rail lands at 553px on a 15 Pro Max and 228px on
an SE, unchanged by the tablet work. **Re-measure both if you touch `fit()`.**

**4. Bump `sw.js` `VERSION` on every deploy** (now `flicktail-v47`). The worker
is cache-first; skip the bump and players keep the old build. A user once
reported bugs that had been fixed two builds earlier for exactly this reason.

**5. Star thresholds must stay reachable.** `node tools/check-star-lines.mjs`
proves every 3-star line is inside what the game can actually score. Thresholds
were derived from the autoplay bot's own runs — if you change flick counts,
re-measure *after* the change, because cutting flicks lowers scores and
thresholds computed from the previous run are silently too hard.

**6. Don't casually retune physics constants.** Competitor research says players
detect stealth physics changes and review-bomb them.

**7. Raw art stays out of the shipped bundle.** `assets/raw*` is ~70 MB of
source images with shipped derivatives; `mobile/sync-web.mjs` excludes every
`raw*` folder (37 MB → 11.8 MB when this was fixed).

---

## Next up

1. **Get back into review.** New build from master, attach it to 1.0.0, notes
   and listing re-checked against decision 1, submit. Approved → it
   auto-releases; check AdMob starts serving (limited serving until the app is
   on the store). Rejected again under 4.3 → App Review Board appeal, don't
   just resubmit.
2. **Per-city backdrops — 173 of 180 stops still missing.** Only Italy's seven
   are painted (`CITY_BACKDROP` in `src/tours.js`); every other stop falls back
   to its country view, and Ravello (127) falls back even within Italy. This is
   the user's own deferred item: *"sonra devam ederiz"*.
3. **Port the store-copy gate.** `tools/verify-store-claims.mjs` only checks
   that the *numbers* in the listing match the data. The Rushhouse repo has
   `Tools/check_store_copy.py`, which reads the **live** ASC records and fails
   on genre-commodity phrasing, a first sentence that opens with the category
   name, a keyword list starting with the category word, and unverifiable
   "hand-drawn/hand-painted" claims. Flicktail has no such gate — it should.
4. **More drinks and skins** — standing request, never finished.

## Conventions

- Comments explain *why*, at the density of the surrounding code. No decorative
  headers, no restating the line below.
- Tests and docs derive counts from the data. Hard-coded "12 tours" / "6 skins"
  has rotted four separate times in this project.
- Verify claims by measuring, not by reading code. The QA harness exists
  because the browser pane composites lie about layout.
