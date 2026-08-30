# Money: rewarded ads and paid skins

The game side of both is finished and tested. What is missing in each case is an
account connection that only the account holder (kaan.ipek@icloud.com) can make.
Until then the game is honest about it: the ad panel is labelled a placeholder,
and a paid skin shows its price but is only offered for stars.

---

## 1. Rewarded ads — "watch for +6 drinks"

**Already done in the game**

- `src/ads.js` holds a provider interface: `{ name, available(), show() -> Promise<bool> }`.
  `show()` resolves `true` only when the reward was actually earned.
- `game.checkEnd` offers a refill instead of failing, capped at `REFILL.max` (2)
  per level, and only when `ads.available()` is true.
- `admobProvider(adUnitId)` in the same file drives
  `window.Capacitor.Plugins.AdMob` and reports `available() === false` when the
  native plugin isn't there — so the web build and any build without the pod
  quietly fall back.
- `main.js` prefers the real provider whenever `window.FLICKTAIL_AD_UNIT` is set
  and the plugin is present.

**What you need to do**

1. Create an AdMob account and add the app (bundle id must match the shell).
2. Create a **Rewarded** ad unit; copy its id (`ca-app-pub-…/…`).
3. Add the plugin to the shell and install pods:
   `npm i @capacitor-community/admob` in `mobile/`, then `npx cap sync ios`.
4. Put the App ID in `mobile/ios/App/App/Info.plist` as `GADApplicationIdentifier`.
5. Expose the unit id to the web layer — one line in `index.html` before the
   module script, or injected by CI:
   `<script>window.FLICKTAIL_AD_UNIT='ca-app-pub-…/…'</script>`
6. Apple also wants the tracking answer: if you use personalised ads you need
   App Tracking Transparency; the simplest first release is non-personalised
   ads, which needs no ATT prompt.

Nothing in the game changes — the moment the plugin answers, real ads replace
the placeholder.

---

## 2. Paid skins

**Already done in the game**

- `src/skins.js` is the catalogue: id, name, blurb, what it swaps in (a drawn
  creature cast, or a painted set), a star price and a money price.
- **Signature Bar** is the one worth charging for: all eleven tiers repainted
  with the hand-painted country signatures. The drawn creature skins are bonuses
  — they change ears and tails, not the whole cup, and pricing them would be
  charging for the weakest art in the game.
- `save.data.ownedSkins` / `activeSkin` persist ownership; `setActiveCast()`
  applies it to every drink and every UI icon at once.
- The shop (`ui.showShop`) shows each skin with a live preview of its cast.
  Owned → "Wear it". Affordable in stars → "Unlock ★ N". Otherwise it shows the
  star price and "or $X soon".

**What you need to do**

1. In App Store Connect → Flicktail → **In-App Purchases**, create one
   *non-consumable* per paid skin. Start with `skin.signature` ($2.99) — it is
   the only set that looks like a purchase. `skin.critters`, `skin.reef` and
   `skin.safari` can follow if their art is ever repainted.
2. Fill the paid-apps agreement and banking details under Business — purchases
   cannot be tested until that is active.
3. Add a StoreKit bridge (`@capacitor-community/in-app-purchases` or similar),
   then register an `iap` provider the same way ads are registered, and have the
   shop call it for skins that have a `price`.
4. Restore-purchases is required by review: one button in the shop that asks the
   store for owned products and re-adds them to `ownedSkins`.

**Do not ship a Buy button before step 2 is live.** A button that takes a tap
and does nothing is a review rejection, which is exactly why the shop currently
offers stars instead.

---

## Why skins and not gameplay

Selling flicks or stars would make the balance work meaningless — the levels are
tuned so a good run wins without paying. Skins change nothing about difficulty,
so the tuning stays honest and the ad refill stays the only paid shortcut, capped
at two rounds a level.
