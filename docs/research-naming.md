# Naming report — beach-cocktail flick-merge game

## Method (what was actually searched)

- **App Store (definitive):** iTunes Search API (`itunes.apple.com/search?entity=software`) queried per candidate — returns the real US App Store index, not SEO guesses.
- **Google Play:** `site:play.google.com` web searches per candidate.
- **US trademarks:** web-indexed USPTO records via trademarks.justia.com / uspto.report / trademarkia.com (direct TESS at tmsearch.uspto.gov and Justia fetches are JS/403-blocked to automated fetchers, so records were pulled through search snippets of those databases — every hit below links to the record).
- **EU:** EUIPO eSearch / TMview are JS-only and unfetchable by this pipeline. Proxy signal used instead: zero EU/web footprint for the recommended coined names. **A 5-minute manual TMview check (tmdn.org) of the final pick before launch is the one open action item.**

---

## THE 3 RECOMMENDED NAMES

### 1. FLICKTAIL — top pick
**Store listing:** `Flicktail` + subtitle `Slide & Merge Cocktails` (23 chars, fits Apple's 30-char subtitle field).

Coined portmanteau of *flick* + *cocktail* — it literally names the core verb and the theme in one invented word. Why it's safe:
- **App Store:** iTunes API returns no app named Flicktail or anything close (fuzzy matches were Flickr and camera apps).
- **Google Play:** `site:play.google.com "flicktail"` — no app.
- **USPTO:** the only FLICKTAIL filing is [Serial 99373561 by Hangzhou Yicaibao Cross Border Technology](https://uspto.report/TM/99373561) — for **dinnerware and pet bowls (class 21)**, not software/games (class 9) or entertainment (class 41). No likelihood-of-confusion overlap with a video game. Nearby marks (FLICK, FLEXTAIL, FLICKAT) are unrelated goods.
- **EU/web:** zero footprint anywhere — no company, product, slang meaning, or game uses the word.
- Bonus: as a coined mark it is the strongest of the three if you ever want to register it yourself.

### 2. SUNSLING — cleanest name checked
**Store listing:** `Sunsling` + subtitle `Beach Cocktail Merge` (20 chars).

Coined compound: *sun* + *sling* — a **sling is a real cocktail category** (Singapore Sling) and *slinging* is exactly the flick action. Why it's safe:
- **App Store:** iTunes API for "sunsling" returns only sun-tracker utilities (Sun Seeker, SolarWatch, etc.) — nothing named Sunsling.
- **USPTO:** no SUNSLING filing exists in any class (search returned only SLIP 'N SLIDE, SUNSTOP, SUN* noise).
- **Web:** literally zero footprint — no brand, band, product, or app.
- Variant note: "Sunslide" is equally free of trademarks, but the App Store already has **"Sunslider: Anti-Social Media"** (a live non-game app one letter away), so Sunsling is the safer spelling.
- Caution designed around: the seed "Sunsip" was rejected precisely because [Health-Ade's SunSip soda](https://www.bevindustry.com/articles/96395-health-ade-launches-sunsip-line-of-prebiotic-sodas) is a live national beverage brand — Sunsling has no such beverage collision.

### 3. MOJITO MERGE — descriptive fallback (best ASO readability)
**Store listing:** `Mojito Merge` + subtitle `Beach Bar Slide Puzzle` (22 chars).

Alliterative, instantly communicates cocktails + Suika mechanic. Why it's safe:
- "Mojito" is a **generic cocktail type**, not anyone's drink brand (unlike SunSip/Malibu/Bacardi) — no drink-brand owner to object.
- **USPTO:** the only relevant MOJITO software mark is [Serotonin Inc.'s class-42 SaaS auction-software mark](https://uspto.report/TM/90746097) — not games, not class 9/41. No MOJITO registration in game software surfaced.
- **App Store:** iTunes API "mojito merge" → only unrelated generic merge games (Merge Inn, Merge X3…). **Google Play:** no "Mojito Merge"; the only mojito app is a Spanish drinking-game app "Mojito: Juego para Beber".
- Trade-off, stated honestly: it's the weakest as a *brand* (descriptive, hard to register, lives in the crowded "___ Merge" shelf — note [**"Cocktail Merge" already exists on Google Play**](https://play.google.com/store/apps/details?id=com.ezgievrensel.cocktailmerge), which is exactly why the purely descriptive route is a dead end and Flicktail/Sunsling are ranked above it).

---

## REJECTED CANDIDATES (evidence per name)

| Candidate | Verdict | Evidence |
|---|---|---|
| **Tiki Toss** | HARD REJECT | Live USPTO registration [4201881, Serial 85523202](https://www.trademarkia.com/tiki-toss-85523202) explicitly covering "electronic game software for handheld electronic devices and downloadable computer game software for mobile devices"; the [Tiki Toss mobile game is on the App Store](https://tikitosslife.com/) today (showed up in our own iTunes API results). Textbook infringement. |
| **Sunsip** | HARD REJECT | [SunSip by Health-Ade](https://www.prnewswire.com/news-releases/gut-health-leaders-health-ade-launch-sunsip-a-brand-new-line-of-sodas-with-benefits-302053587.html) is a nationally distributed beverage brand (Whole Foods, Amazon). A *drink-themed* game with a live *drink brand's* name is the worst-case confusion scenario. |
| **Cabana Merge** | REJECT | [CABANA SOFTWARE, Reg. 5703606](https://trademarks.justia.com/868/99/cabana-86899962.html) covers "computer game software for use on mobile and cellular phones"; Mattel also holds/held [CABANA COOL](https://trademarks.justia.com/762/07/cabana-cool-76207368.html) for video game software. "Cabana" + game = collision with a games-class mark. |
| **Beach Blender** | REJECT | BLENDER is a [registered trademark of the Blender Foundation in the EU and USA for computer software](https://www.blender.org/about/trademark-policy/), with an active trademark policy; a second US [BLENDER software registration](https://uspto.report/TM/87090170) also exists. Plus the name reads as a Hamilton Beach kitchen appliance, not a game. |
| **SipStack** | REJECT | [SIPSTACK Inc.](https://sipstack.com/) is an operating Canadian telecom/VoIP company, and "SIP stack" is a generic telecom protocol term — the name is owned in tech and unsearchable (every query returns telephony). |
| **Slide Bar** | REJECT | Hopelessly generic: it's a UI control name, an [Android edge-menu app "Slidebar"](https://apkpure.com/slidebar-%E2%80%93-edge-menu-edge-panel-edge-screen-pro/com.sidebar.easyswitch.slidebarpro), a [slides SaaS (slidebar.io)](https://www.slidebar.io/), and a famous Fullerton bar. Zero distinctiveness, zero ASO discoverability, unprotectable. |
| **Splash Merge** | WEAK — not recommended | No exact store/TM collision, but the shelf is crowded with near-identical names: MobilityWare's "Splash Sort" and ["Stack&Splash: Fruit Merge Game"](https://apps.apple.com/us/app/stack-splash-fruit-merge-game/id6746467268) sit in the same iTunes results. Legally passable, brandless. |
| **Tiki Tumble** (own idea, killed) | REJECT | Existing [Push Gaming real-money slot "Tiki Tumble"](https://www.pushgaming.com/games/tiki-tumble.html) — same-class collision plus a gambling association that poisons a premium family-casual listing. |
| **Swizzle** (own idea, killed) | REJECT | Multiple existing Swizzle games/apps: a [Swizzle shape-puzzle game](https://m.downloadatoz.com/swizzle/com.sureda.theswizzleand/) and a ["Swizzle Apps" Android developer](https://play.google.com/store/apps/developer?id=Swizzle+Apps). |
| **Sipline** (own idea, killed) | REJECT | Two live App Store apps: "Sipline" (bar/café drink-ordering) and "Water Tracker: Sipline" — the drinks-app namespace is occupied. |
| **Sunshaker** (own idea, killed) | REJECT | [Bright Starts "Sun Shaker"](https://www.amazon.com/Bright-Starts-Shaker-Shake-Activity/dp/B08Q1D5N2R) is a live toy product (class 28 — toys/games is adjacent to game software for confusion analysis). |
| **Tropic Toss** (own idea, killed) | REJECT | Exact name free, but it sits one adjective away from the *enforced* TIKI TOSS mark in the same flick/toss micro-genre — inviting a C&D over a name with no upside. |

## Practical next steps

1. Pick Flicktail (or Sunsling), then run the free manual checks this pipeline couldn't automate: [TMview](https://www.tmdn.org/) basic search (EU+worldwide, 2 min) and [USPTO's new search UI](https://tmsearch.uspto.gov/search/search-information) for a final confirmation of "no class 9/41 hits".
2. Register the .com/.app domain and store listings early — both coined names are unclaimed everywhere, which won't last once the game is visible.
3. Keep the pattern **coined brand + descriptive subtitle**: Apple indexes name and subtitle separately, so the subtitle carries the "cocktail merge / beach / slide" search terms while the brand stays ownable.
