# Free, commercially usable assets for the drink-merge flick game — verified sources

Everything below was fetched and license-checked on 2026-08-28. Per category the single best pick is marked **BEST PICK**. Summary of the safest stack: **game-icons.net (CC BY 3.0) + Good Fruits (CC0) as vector/reference art, Kenney audio packs (CC0) + named Freesound CC0 sounds for SFX, Baloo 2 + Nunito (both OFL) for fonts.** Total attribution burden: one line for game-icons.net in the credits screen; everything else is zero-obligation.

---

## (a) ART — 2D drink / fruit / tiki art

### BEST PICK: game-icons.net — CC BY 3.0, 4,180 icons, all SVG
- URL: https://game-icons.net/ — states "4180 free icons for your games", license CC BY 3.0 (attribution required — one credit line in-game is enough).
- **Why it wins for this game**: every icon is a clean single-color SVG, i.e. the perfect *base shape* for the code-drawn vector drinks we plan — recolor, add gradients/highlights in canvas, and the whole 10–12-tier chain stays style-consistent. CC BY explicitly allows modification.
- **Verified drink icons** (fetched the glass tag page, https://game-icons.net/tags/glass.html): *Martini* (https://game-icons.net/1x1/lorc/martini.html, author Lorc, SVG+PNG in 4 color variants), *Wine glass*, *Beer stein*, *Glass shot*, *Brandy bottle*, *Square bottle*, *Wine bottle*, *Booze*, *Ice cubes*, *Glass celebration*, *Mason jar* — enough silhouettes for most of a 12-tier cocktail ladder.
- **Verified fruit icons for garnish/low tiers** (https://game-icons.net/tags/fruit.html — 61 icons): *Cherry, Strawberry, Cut lemon, Lemon, Orange slice, Pineapple, Coconuts, Watermelon, Peach, Banana, Grapes, Kiwi fruit, Carambola (star fruit)* — reads like a tropical-cocktail garnish shopping list.
- **Attribution requirement**: CC BY 3.0 — credit the authors (Lorc, Delapouite, et al.) and link game-icons.net; a credits-screen line like "Icons by Lorc, Delapouite & contributors, game-icons.net, CC BY 3.0" satisfies it.

### Kenney Food Kit — CC0, zero obligations
- URL: https://kenney.nl/assets/food-kit — "Creative Commons CC0", ~200 files, food/kitchen themed. Note: it is a **3D kit** (we could render sprites from it, but it is food-centric; drinks are not confirmed in the listing). Kenney's blanket policy confirmed at https://kenney.nl/support: "all game assets on the asset pages are public domain licensed (CC0). You're free to use them, even in commercial projects", attribution optional, logo off-limits.
- Verdict: keep as fallback texture/reference; not the primary drink source.

### OpenGameArt — "Good Fruits (M484 Games)" — CC0
- URL: https://opengameart.org/content/good-fruits-m484-games — verified: **CC0/public domain**, attribution optional ("Master484" credit appreciated). Single PNG sheet (M484GoodFruits.png, 12.2 KB) with apples, cherries, melons, oranges plus candy/ice-cream/stars/coins made for "fruit machine" games. Great as early-tier merge objects or particle confetti.

### Emoji vector sets (reference art / placeholder tiers)
- **Noto Emoji (Google)** — https://github.com/googlefonts/noto-emoji — README license section verified: image resources under **Apache 2.0**, fonts under OFL 1.1. Apache 2.0 = commercial use + modification fine; ship the license text in credits. **This is the safest emoji set** (no share-alike), and it has 🍹🍸🍺🥥🍍 style glyphs to trace proportions from.
- **Twemoji (maintained fork)** — https://github.com/jdecked/twemoji — graphics **CC-BY 4.0**, code MIT; attribution required but they accept "a mention in a project README or an 'About' section".
- **OpenMoji** — https://openmoji.org/faq/ — **CC BY-SA 4.0**; commercial use allowed, but **share-alike: any modified emoji you ship must itself be released under CC BY-SA**. For a premium commercial game with custom-redrawn art this is a legal entanglement — use OpenMoji only as visual reference, don't ship derivatives.

### SVG Repo — mixed licenses, per-icon check required
- URL: https://www.svgrepo.com/page/licensing/ (site rate-limited our fetcher twice; terms confirmed via search excerpts of that page): default collections are "No copyright / CC0 1.0 Universal PD Dedication", attribution appreciated not required, commercial use OK, no reselling as an icon site; **but some collections are CC-BY and each icon page states its own license** — check the badge on every icon you take.

### itch.io drink packs — good haul, one license trap
- Tag index verified: https://itch.io/game-assets/tag-drinks
- **Bartender/Barista Icon Pack (246 icons) by cecilia** — https://cecixp.itch.io/bartenderbarista-icon-pack — the most on-theme pack found: 42 cocktails, 22 alcohol bottles, 30 empty cups, 44 ingredients/accessories (umbrellas, straws, fruits). **WARNING: license is CC BY-ND 4.0 (NoDerivatives)** plus creator's own no-AI/no-NFT/no-resell terms. ND means you may NOT ship recolors/resizes/edits — usable only verbatim, so treat as mood-board reference, not source art.
- **16x16 Sprites — Beers by Pyrefly Studio** — free, nine beers in correct glassware (seen on the tag page); pixel-art style, likely too low-res for our premium look.
- **Free CC0 Food & Drinks by 3dmodelscc0** — https://3dmodelscc0.itch.io/free-cc0-food-drinks — verified **CC0**, free, but 3D and only 10 props (coffee, milk, no cocktails). Marginal.
- Pixel cocktail packs exist ("Cocktail Pixel Asset Pack – 32x32" by Helm3t, via https://itch.io/game-assets/free/tag-drink/tag-pixel-art) but pixel-art fidelity clashes with the fake-3D premium presentation — skip unless we pivot art style.

**Practical art plan**: hand-draw the 10–12 drink tiers as code vectors (as intended), using game-icons SVG silhouettes + Noto Emoji proportions as the base; Good Fruits CC0 for juice/particle flourishes. One CC BY credit line total.

---

## (b) AUDIO SFX

### BEST PICK: Kenney audio packs — all CC0, one download, consistent mastering
Audio catalogue verified at https://kenney.nl/assets/category:Audio; per-pack pages verified CC0:
- **Impact Sounds** — https://kenney.nl/assets/impact-sounds — 130 foley impact files, CC0. Covers glass/wood/metal hits → drink-on-rail and drink-on-drink collisions.
- **Interface Sounds** — https://kenney.nl/assets/interface-sounds — 100 click/button/UI files, CC0 → menu taps, tier-unlock ticks.
- **Music Jingles** — https://kenney.nl/assets/music-jingles — 85 short jingles, CC0 → level-complete and big-merge fanfares.
- **Casino Audio** — https://kenney.nl/assets/casino-audio — 50 files (cards, dice, chips foley), CC0 → coin/score/counter sounds.
- Also in catalogue: UI Audio, Digital Audio, RPG Audio (all Kenney = CC0 per https://kenney.nl/support).
Attribution: none required, ever.

### Freesound.org — named CC0 sounds for the thematic foley Kenney doesn't have
Reproducible trick: append `&f=license:%22Creative+Commons+0%22` to any Freesound search to see **only CC0** results (no attribution needed; free account required to download). All items below were verified CC0 via that filter:
- **Glass clinks** (https://freesound.org/search/?q=glass+clink&f=license:%22Creative+Commons+0%22): "Glass_Clink.aif" by kbnevel (7.8K downloads), "clinking glass.aiff" by TheWah (2.9K), "clink glasses.wav" by Mikes-MultiMedia (1.2K), "shot glasses clinking together" by JohnsonBrandEditing.
- **Liquid pours** (https://freesound.org/search/?q=pouring+drink&f=license:%22Creative+Commons+0%22): "Pouring water into glass" by FillSoko (24.5K downloads, Zoom H6), "Pouring a fizzy drink.wav" by craigglenday (2.9K), "Fizzy Drink Pouring Into Glass" by Rudmer_Rotteveel.
- **Splashes** (https://freesound.org/search/?q=water+splash&f=license:%22Creative+Commons+0%22): "water_splash_10shots.wav" by vibe_crc (9.4K downloads, ten variations — ideal for randomized merge splashes), "Water Splash in Lake 05" by vero.marengere, "Various Water Splashes" by NichelleMedia.
- **Merge pops** (https://freesound.org/search/?q=bubble+pop&f=license:%22Creative+Commons+0%22): "Bubble Pop UI and Game Sounds Multiple Samples" by el_boss (explicitly made "for video games"), "Bubble Pop" by Mafon2 (2.0K), by YehawSnail (1.7K); 237 CC0 matches total.
- **Flick whooshes** (https://freesound.org/search/?q=whoosh&f=license:%22Creative+Commons+0%22): "Whoosh For Whip Zoom" by BennettFilmTeacher (10.9K downloads), "Little Whoosh 2" by ch_ase (7.8K), "whoosh_short_mid.wav" by DJT4NN3R (3.2K).
- **Level-up chime** (https://freesound.org/search/?q=level+up+chime&f=license:%22Creative+Commons+0%22): "Level Up" by qubodup (5.1K downloads, purpose-built game sound).
- **Beach ambience** (https://freesound.org/search/?q=beach+waves+seagulls&f=license:%22Creative+Commons+0%22): "Gentle ocean waves birdsong and gull.WAV" by jackmichaelking (4.6K downloads), "Felixstowe_beach_waves_close_stones_seagulls_stereo.wav" by nickmaysoundmusic, "Seagulls screeching… peruvian shore" by felix.blume (1.7K).
- **Bar crowd murmur** (https://freesound.org/search/?q=bar+crowd+ambience&f=license:%22Creative+Commons+0%22): "Bar Chatter" by SoundsExciting (6.4K downloads), "Bar Ambience, Talking, Music, Glasses, Door Creaking" by BurghRecords (3.9K, Scottish pub), "Spacious Bar Ambience With Music, Medium Crowd 01/02" by HECKFRICKER (~5.7 and ~6.6 min — long enough to loop per level without obvious repeats).

### Sonniss GDC Game Audio Bundles — pro-grade mass, custom royalty-free license
- URL: https://sonniss.com/gameaudiogdc — verified: 8 free annual bundles (2024 = 9 ZIP parts), "No attribution is required and you can use them on an unlimited number of projects for the rest of your lifetime"; royalty-free, commercial games explicitly allowed; editing/modifying allowed; only AI/ML training prohibited. Tens of GB — best mined for polished glass/liquid foley if Freesound picks feel thin.

### Pixabay SFX — usable, with a caveat
- License summary verified: https://pixabay.com/service/license-summary/ — no attribution required; content may not be redistributed "on a Standalone basis"; embedding SFX inside a game is transformative use and fine. Caveat: the summary page doesn't name games explicitly and only the full Content License is binding — with Kenney + Freesound CC0 + Sonniss available, Pixabay is strictly optional; skip it and avoid the ambiguity.

**Practical audio plan**: Kenney Impact+Interface+Jingles as the base kit (CC0, consistent), then layer the named Freesound CC0 foley (FillSoko pour, vibe_crc splashes, el_boss pops, jackmichaelking waves, SoundsExciting bar chatter) for the thematic premium layer. Zero attribution lines required for the whole audio stack.

---

## (c) FONTS — Google Fonts, license-verified

License files verified directly in the google/fonts repo (fonts.google.com pages are JS shells our fetcher can't read; the repo is the canonical source):

| Font | License (verified) | Source | Role |
|---|---|---|---|
| **Baloo 2** | SIL OFL 1.1 — "Copyright 2019 The Baloo 2 Project Authors" | https://raw.githubusercontent.com/google/fonts/main/ofl/baloo2/OFL.txt | **BEST PICK — display** |
| Lilita One | SIL OFL 1.1 — "Copyright (c) 2011 Juan Montoreano… Reserved Font Name Lilita" | https://raw.githubusercontent.com/google/fonts/main/ofl/lilitaone/OFL.txt | display alternative |
| Fredoka | SIL OFL 1.1 — "Copyright 2016 The Fredoka Project Authors" | https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/OFL.txt | display alternative |
| Chewy | **Apache 2.0** (in `apache/chewy` with LICENSE.txt, not OFL) | https://github.com/google/fonts/tree/main/apache/chewy | avoid for UI |
| **Nunito** | SIL OFL 1.1 — "Copyright 2014 The Nunito Project Authors" | https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/OFL.txt | **UI face** |

**Evaluation for small-size readability** (the HUD will show scores, combo counters, level goals at ~12–16 px):
- **Baloo 2 — winner.** Its own description (https://raw.githubusercontent.com/google/fonts/main/ofl/baloo2/DESCRIPTION.en_us.html) confirms **five weights Regular→ExtraBold** designed to work "across different sizes and contexts", from "demanding headlines" to "whispering bylines". Chunky, round, tropical-friendly, and the Regular/Medium weights stay legible small — one family can carry title, buttons, and numbers if we want.
- **Fredoka** — verified variable **weight + width axes** (https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/DESCRIPTION.en_us.html), but self-described as "big, round, bold… perfect for headline or large text" — display-first.
- **Lilita One** — single weight only; punchy for the logo/score pop-ups but nothing for mid-size UI.
- **Chewy** — single weight, bouncy baseline; charming for a logo, poor for numbers; and note it's Apache, not OFL.
- **Nunito (UI face)** — rounded terminals match Baloo's geometry; full weight range for body/UI text.

**Recommended pairing**: **Baloo 2 (SemiBold/ExtraBold) for title, tier names, combo pop-ups + Nunito (Regular/Bold) for HUD, settings, tutorial text.** Both OFL 1.1: free commercial use, embedding/bundling allowed, no attribution in-game required (keep the OFL.txt files alongside the font files in the repo; only restriction is you can't sell the fonts themselves standalone).

---

## Attribution ledger (what actually ships in the credits screen)
1. "Icons by Lorc, Delapouite & contributors — game-icons.net — CC BY 3.0" (only if we base drink vectors on their SVGs).
2. Apache 2.0 notice for Noto Emoji (only if we ship traced derivatives; pure eyeball-reference needs nothing).
3. Nothing for Kenney, Freesound CC0, Sonniss, Good Fruits, or the fonts (keep OFL/Apache text files in the repo, not in-game).
Avoid shipping: OpenMoji derivatives (CC BY-SA share-alike) and anything from the cecilia Bartender pack (CC BY-ND — no modifications allowed).
