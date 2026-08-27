# 12 Level Backdrops — World-Tour Progression for the Drink-Flick Merge Game

## Design rules these picks follow

- Portrait mode: the backdrop is a horizontal band above the table's far rail (roughly the top 35–40% of the screen). Every scene below is built as **3 parallax layers**: (a) sky gradient, (b) one far landmark silhouette that reads at ~150 px tall, (c) a near "frame" element (palm frond, parasol edge, string lights) that can overlap the table's back rail.
- Exactly **one** looping ambient mover per scene (8–25 s loop) so it never competes with the physics gameplay.
- Time-of-day is spread deliberately: sunrise ×1, day ×5, golden hour ×2, sunset ×2, night ×2 — no two consecutive levels share the same light except the intentional Santorini→Ibiza "sun goes down" beat.
- Tour logic: start USA-iconic and approachable (Waikiki), sweep east around the globe — Americas → Europe → Middle East → SE Asia — and finish at the most prestigious honeymoon destination on Earth (Bora Bora). Energy and exoticism rise with difficulty.

## Quick reference table

| # | Destination | Time of day | Anchor silhouette | Ambient loop |
|---|---|---|---|---|
| 1 | Waikiki, Hawaii, USA | Bright morning | Diamond Head crater | Catamaran glides by |
| 2 | Miami South Beach, USA | Pastel sunrise | Art Deco hotel row + lifeguard tower | Cruise ship crosses horizon |
| 3 | Cancún, Mexico | High noon | White hotel towers + small Mayan pyramid | Parasail drifts / ferry crosses |
| 4 | Copacabana, Rio, Brazil | Golden hour | Sugarloaf Mountain | Cable car climbs the wire |
| 5 | Nice, France | Azure afternoon | Negresco pink dome + curving Promenade | Airliner descends over the bay |
| 6 | Positano, Amalfi Coast, Italy | Golden hour | Stacked pastel houses + majolica dome | White ferry crosses toward Capri |
| 7 | Santorini (Oia), Greece | Sunset | Blue domes + windmill on caldera cliff | Windmill blades turn |
| 8 | Ibiza, Spain | Dusk → starry night | Es Vedrà rock offshore | Club light beams sweep the sky |
| 9 | Dubai, UAE | Full night | Lit Burj Al Arab "sail" + skyline + wheel | Camel caravan walks the waterline |
| 10 | Kata Beach, Phuket, Thailand | Tropical morning | Ko Pu islet + Big Buddha on the hill | Longtail boat putters across |
| 11 | Tanah Lot, Bali, Indonesia | Sunset | Sea temple on its rock | Giant Balinese kites sway |
| 12 | Bora Bora, French Polynesia | Brilliant midday | Mt. Otemanu + overwater bungalows | Stingray shadows glide in lagoon |

---

## Level 1 — Waikiki Beach, Honolulu, Hawaii (USA)

**Why level 1:** the world's most instantly-legible "easy vacation" beach; gentle, sunny, familiar.

**Signature silhouette elements (verified):**
1. **Diamond Head crater** closing the right side of the bay — "the Pink Palace against Diamond Head remains one of Hawaii's most photographed vistas" ([Historic Hotels of America](https://www.historichotels.org/us/hotels-resorts/the-royal-hawaiian-a-luxury-collection-resort), [Marriott/Royal Hawaiian](https://www.marriott.com/en-us/hotels/hnllc-the-royal-hawaiian-a-luxury-collection-resort-waikiki/overview/)).
2. **The pink Royal Hawaiian hotel** ("Pink Palace of the Pacific", on the sand since 1927) — one small pink block among white towers instantly says Waikiki.
3. **Beginner surfers on long gentle rollers** — Waikiki's waves are famously beginner-friendly ([HS Hawaii guide](https://hshawaii.com/the-ultimate-guide-to-waikiki-beach/)).
4. **Outrigger canoe / catamaran** — beachboys have run outrigger rides and catamaran sails off this exact sand since Duke Kahanamoku's era ([Waikiki Beach Services](https://www.waikikibeachservices.com/), [Go Hawaii — Duke statue](https://www.gohawaii.com/islands/oahu/regions/honolulu/duke-kahanamoku-statue)).
5. Coconut palms leaning over the water (near-frame layer).

**Palette:** sky `#7EC8E3 → #BDE3F0`; sea `#1A9BB8` with turquoise shallows `#2EC4B6`; sand `#F2E3C6`. Accents: Diamond Head khaki-olive `#8A8B5C`, Royal Hawaiian pink `#E8A0A8`, palm green `#2F6B3A`.

**Time of day:** bright mid-morning (the "vacation starts now" light).

**Ambient loop:** a white **catamaran with a colored sail glides slowly across the bay** in front of Diamond Head (catamaran charter sails run off this beach daily — [Waikiki Beach Services](https://www.waikikibeachservices.com/)); tiny surfer dots ride a slow wave as a secondary micro-motion if budget allows.

---

## Level 2 — South Beach, Miami, Florida (USA)

**Why level 2:** stays in familiar USA but shifts the whole mood — pastel Art Deco dawn instead of tropical noon.

**Signature silhouette elements (verified):**
1. **Colorful Art Deco lifeguard towers** — 36 whimsical towers designed by architect William Lane after Hurricane Andrew (1992), now "a cherished symbol of Miami" ([The Truth Traveller](https://www.thetruthtraveller.com/blog/the-iconic-art-deco-miami-beach-lifeguard-towers), [Miamiscapes](https://www.miamiscapes.com/south-beach-lifeguard-towers.html)). Put ONE tower large in the near layer — it's the single strongest Miami icon.
2. **Pastel Art Deco hotel row** (Ocean Drive skyline: stepped facades, porthole windows, neon sign shapes) ([iStock Art Deco district coverage](https://www.istockphoto.com/photos/art-deco-district-miami)).
3. Royal palms in a straight promenade line.
4. **Cruise ship on the horizon** — every ship leaving PortMiami funnels through Government Cut right past the beach's south tip ([Tripadvisor — South Pointe Park](https://www.tripadvisor.com/ShowUserReviews-g34439-d143595-r148549645-South_Pointe_Park-Miami_Beach_Florida.html), [nextbreakout guide](https://nextbreakout.com/blog/south-pointe-park-guide)).

**Palette:** dawn sky `#F7B2C4 → #C9A7E0` (pink→lavender); sea pre-sun teal `#7FD1C8`; sand `#F5E9D0`. Accents: deco mint `#9FE2BF`, flamingo `#F26CA7`, neon cyan `#58E0E6`, deco white `#FAF6EF`.

**Time of day:** sunrise — South Beach faces the Atlantic east; "sunrise spills over the Atlantic, catching pastel lifeguard towers" ([ad-hoc-news South Beach feature](https://www.ad-hoc-news.de/unterhaltung/reisen/south-beach-miami-art-deco-glamour-ocean-light-and-nightlife/69480700)).

**Ambient loop:** a **huge cruise ship silhouette slides slowly along the horizon** (25 s crossing), with a lifeguard-tower flag fluttering as micro-motion.

---

## Level 3 — Cancún (Zona Hotelera), Mexico

**Why level 3:** first passport stamp; the most saturated water color in the set — a reward level visually.

**Signature silhouette elements (verified):**
1. **Two-tone Caribbean turquoise** — the defining feature; parasail operators literally sell "Cancun's matchless water colors" ([Parasail Cancun](https://www.parasailcancun.com/)). Render the sea as two hard bands.
2. **White high-rise hotel strip** curving away along the sandbar ([Xcaret ferry page situates the Hotel Zone](https://www.xcaret.com/en/xailing/ferry-isla-mujeres/)).
3. **A small stepped Mayan pyramid/temple** — genuinely in the Hotel Zone: the El Rey archaeological zone with platforms and a pyramid/temple complex sits between the hotels ([US News — El Rey Ruins](https://travel.usnews.com/Cancun_Mexico/Things_To_Do/El_Rey_Ruins_62410/), [Loco Gringo](https://www.locogringo.com/things-to-do/mayan-ruins/el-rey-ruins-cancun)). Scale it up slightly for readability — grounded stylization, not invention.
4. Isla Mujeres as a low strip on the horizon (the ferry runs to it from Km 4.5 of the Hotel Zone — [Xcaret Xailing](https://www.xailing.com/en/ferry-isla-mujeres/)).

**Palette:** sky `#4FB8F0`; sea bands `#40E0D0` (shallow) / `#0E7FA8` (deep); sand white-coral `#FBF3E4`. Accents: hotel white `#FFFFFF`, jungle green `#2E8B57`, Mayan limestone `#C9B08C`.

**Time of day:** high noon — maximum turquoise saturation.

**Ambient loop:** a **red-and-yellow parasail drifts across the sky** on its towline (parasailing at up to 260 ft over the Hotel Zone is a signature Cancún activity — [Viator Cancun parasailing](https://www.viator.com/Cancun-tours/Parasailing/d631-g17-c105)); alternative: the white Isla Mujeres ferry crossing the horizon band.

---

## Level 4 — Copacabana, Rio de Janeiro, Brazil

**Why level 4:** first big personality shift — urban beach energy, and the set's first golden-hour light.

**Signature silhouette elements (verified):**
1. **Sugarloaf Mountain** closing the far end of the crescent — the classic Copacabana postcard is the beach curve with Sugarloaf on the horizon ([Dreamstime panoramic caption: "iconic Copacabana beach curve" from Sugarloaf](https://www.dreamstime.com/panoramic-view-pao-de-acucar-sugarloaf-mountain-rio-janeiro-brazil-spectacular-capturing-iconic-copacabana-beach-curve-image406707894), [123rf: "Copacabana Beach ... Sugarloaf"](https://www.123rf.com/photo_90839135_view-of-the-copacabana-beach-from-the-sugarloaf-mountain-rio-de-janeiro-brazil.html); Copacabana is visible from the Morro da Urca cable-car station, confirming the sight-line — [Bondinho official](https://bondinho.com.br/en)).
2. **The black-and-white wave-pattern promenade** — Roberto Burle Marx's 4.5 km Portuguese-pavement wave mosaic, completed 1972, his most famous commission ([ArchDaily](https://www.archdaily.com/1000231/the-history-of-the-copacabana-sidewalk-from-its-origin-in-portugal-to-burle-marxs-intervention), [Creative Review](https://www.creativereview.co.uk/robertos-rio-celebrating-the-artist-behind-copacabanas-patterned-pavements/)). Use the wave mosaic as the near-frame strip just behind the table rail — it doubles as a game-branding motif.
3. **Christ the Redeemer as a tiny figure on the distant Corcovado ridge** — the statue "defines Rio's skyline" above the beaches ([christ-the-redeemer.com](https://christ-the-redeemer.com/location/)). Honest note: from beach level the statue is not a guaranteed sight-line; include it small and hazy as accepted stylization — every player expects it.
4. Beach umbrellas + a footvolley net; mosaic-tiled kiosks.

**Palette:** golden sky `#FFC65C → #FF8C5A`; sea `#2E7FA0` with gold glints `#FFD98E`; sand `#EED9A8`. Accents: Sugarloaf gray-green `#6B7A5E`, pavement `#1E1E1E`/`#F5F1E8`.

**Time of day:** golden hour (late afternoon).

**Ambient loop:** the **Sugarloaf cable car (bondinho) climbs its wire** from Urca hill to the summit and returns — the real two-stage cable car has run since 1912 ([Bondinho official history](https://blog.bondinho.com.br/en/sugarloaf-montain/)). A tiny moving cabin on a visible catenary wire is a perfect low-cost loop.

---

## Level 5 — Nice, French Riviera, France

**Why level 5:** arrival in Europe; swaps sand-tropical for chic Mediterranean — pebbles, cobalt water, Belle Époque.

**Signature silhouette elements (verified):**
1. **The curving Promenade des Anglais** with its white balustrade sweeping around the Baie des Anges ([French Riviera Traveller](https://www.frenchrivieratraveller.com/Nice/Sights/Promenade.html), [Wikipedia](https://en.wikipedia.org/wiki/Promenade_des_Anglais)).
2. **Hotel Negresco's pink dome** — "built in 1913 & known for its distinctive pink dome," the symbol of the promenade ([Pocket Wanderings — Nice beaches](https://www.pocketwanderings.com/nice-beaches-and-beach-clubs/)).
3. **The famous blue chairs (chaises bleues)** in a row facing the sea — including the giant tilted blue-chair sculpture ([Travel Curious — Promenade des Anglais](https://travelcurious.com/france/nice/attractions/promenade-des-anglais-AXK6EX)).
4. **Pebble beach, not sand** — the 7 km beach is pebbled ([Pocket Wanderings](https://www.pocketwanderings.com/nice-beaches-and-beach-clubs/)); render gray-beige stones, it's a strong differentiator from every other level.
5. Striped beach-club parasols in neat rows.

**Palette:** azure sky `#6FB7E8`; cobalt sea `#145DA0 → #2E8BC0`; pebbles `#D8CFC0`. Accents: Negresco pink `#E5788C` + white facade `#FAF7F2`, chair blue `#1F6FB2`, parasol red/white `#E63946`/`#FFFFFF`.

**Time of day:** crisp clear afternoon (the Côte d'Azur's trademark "azure" light).

**Ambient loop:** an **airliner descends across the bay toward the runway** at the far end of the Promenade — Nice airport was built into the sea as an extension of the Promenade des Anglais, the approach comes in over the water, and it's been ranked a top-3 most beautiful airport approach in the world ([Air Corsica — Promenade des Anglais](https://www.aircorsica.com/flights/nice/la-promenade-des-anglais.html), [planepics NCE guide](http://planepics.org/cms/index.php/guides/13-guides/europe/26-nice-cote-dazur-ncelfmn)). A plane sinking slowly along a diagonal every ~20 s is distinctive and cheap.

---

## Level 6 — Positano, Amalfi Coast, Italy

**Why level 6:** the set's first *vertical* backdrop — the whole scene is a cliff, which reads beautifully in portrait orientation.

**Signature silhouette elements (verified):**
1. **Pastel houses stacked nearly vertically up the cliff** — Positano is famous for its "nearly vertical setting with colorful villas stacked one on top of another up the cliff side" ([Travel Tales of Life](https://traveltalesoflife.com/positano-church-of-santa-maria-assanto-black-madonna/)).
2. **The majolica-tiled dome of the Church of Santa Maria Assunta** — yellow, green and blue tiles, a short walk from the main beach, "dominates the landscape" and is the most-photographed element of the town ([e-borghi](https://www.e-borghi.com/en/what-to-see/positano-church-of-santa-maria-assunta/), [Alba d'Amare — tile colors](https://www.albadamare.it/the-church-of-santa-maria-assunta-in-positano/)).
3. Bougainvillea spilling over terraces (magenta accent, near layer).
4. Beached wooden fishing boats + ferry pier directly on Spiaggia Grande ([Capri.com — ferries depart from the beach pier](https://www.capri.com/en/t/positano/capri)).
5. Lemon-tree pergola as the near-frame element (Amalfi lemons — table dressing tie-in for a cocktail game).

**Palette:** golden-hour sky `#FFD3A5 → #FD9853`; sea `#3D7EA6`; cliff/houses terracotta `#D96C47`, pastel rose `#F0B9A0`, cream `#F5E6CE`. Dome tiles: yellow `#E8C547`, green `#3E8E7E`, blue `#2A6F97`.

**Time of day:** golden hour — warm light raking across the stacked facades.

**Ambient loop:** a **white ferry crosses the bay toward Capri** — hydrofoils leave from the Spiaggia Grande pier itself, ~40 min to Capri, so boats crossing are the constant view from this beach ([Ferryhopper Positano–Capri](https://www.ferryhopper.com/en/ferry-routes/direct/ferry-positano-capri-traghetti), [Capri.com](https://www.capri.com/en/l/positano-capri-tours)).

---

## Level 7 — Santorini (Oia), Greece

**Why level 7:** the set-piece sunset level, exactly mid-late game. Note: this is a caldera-cliff terrace scene, not a sand beach — the table becomes a cliffside bar table, which is true to how people actually drink here.

**Signature silhouette elements (verified):**
1. **Blue-domed churches** — Oia holds the most-photographed blue domes on the island, stacked above the caldera ([Santorini View — Where are the Blue Domes](https://www.santorini-view.com/where-are-blue-domes/)).
2. **The Oia windmill** — 17th-century windmill standing on the cliff at Oia's western tip, one of the most famous photo spots ([Santorini View — Windmills](https://www.santorini-view.com/santorini-windmills/), [Tripadvisor — Windmill of Oia](https://www.tripadvisor.com/Attraction_Review-g482941-d27182128-Reviews-Windmill_of_Oia-Oia_Santorini_Cyclades_South_Aegean.html)).
3. **Whitewashed cubic houses cascading down the caldera edge**.
4. The caldera sea far below with the silhouette of Thirasia island on the horizon ([Tripadvisor — Blue Dome scenic spot](https://www.tripadvisor.com/Attraction_Review-g482941-d27181742-Reviews-The_Famous_Scenic_Spot_of_the_Blue_Dome-Oia_Santorini_Cyclades_South_Aegean.html)).

**Palette:** sunset sky `#FF9A5C → #C74B77 → #5C3C74`; dusk sea `#35516E`; white cubes `#F7F3EE` picking up pink rim-light `#FFB8A0`; dome blue `#2A5DAB`; window glow `#FFC46B`; volcanic cliff `#6E5A52`.

**Time of day:** sunset — the Oia sunset is arguably the most famous sunset ritual in world tourism ([Earth Trekkers — Oia sunset spots](https://www.earthtrekkers.com/amazing-spots-to-watch-the-sunset-in-oia-santorini/)).

**Ambient loop:** the **windmill's canvas blades rotate slowly**; secondary micro-motion: warm windows flicking on one by one as the sun sinks (the loop can slowly deepen the sky by one gradient stop and reset).

---

## Level 8 — Ibiza, Spain

**Why level 8:** the tour's party apex; first night level, transitioning straight out of Santorini's sunset.

**Signature silhouette elements (verified):**
1. **Es Vedrà** — the 400 m mystical limestone rock rising from the sea off Cala d'Hort, Ibiza's single most iconic natural silhouette, wrapped in UFO/Atlantis/siren legends ([Ibiza Spotlight — Es Vedrà](https://www.ibiza-spotlight.com/guide/es-vedra), [White Ibiza — Es Vedrà sunsets](https://white-ibiza.com/sunsets/es-vedra/)).
2. The arc of **Cala d'Hort beach** with uninterrupted west-facing sunset views that fade "from orange and gold to pink and purple before ... the sky twinkles with stars" ([Ibiza My Villa — viewpoints](https://www.ibizamyvilla.com/blog/es-vedra-viewpoints)).
3. **Beach-club / superclub light beams** raking the night sky from beyond the headland — Ibiza's global identity is its nightlife; the beams localize it without needing any building.
4. A moored party boat with string lights.

**Palette:** sky `#E36A3C` ember band low → `#1B2A55` → `#0C1330` starfield; moonlit sea `#14243E` with sparkle `#9FD8E8`; Es Vedrà silhouette `#202B3A`; dim sand `#C9B48A`. Accents: beam violet `#C77DFF`, beam cyan `#4CC9F0`.

**Time of day:** dusk deepening into starry night (the level literally gets darker over the first minute, then loops the night state).

**Ambient loop:** **two club light beams sweep and cross in the sky** behind the headland while the party boat's lights bob; occasional shooting star over Es Vedrà as a rare delight (the star-filled sky after the Cala d'Hort sunset is documented — [White Ibiza](https://white-ibiza.com/sunsets/es-vedra/)).

---

## Level 9 — Dubai, UAE

**Why level 9:** maximum glamour/artificial spectacle before the finale turns back to nature; second night level but gold-and-neon instead of Ibiza's violet.

**Signature silhouette elements (verified):**
1. **Burj Al Arab's sail shape** — the beach next to it (Kite Beach/Jumeirah public beach) has "a stunning, uninterrupted view of the Burj Al Arab, which acts as a dramatic backdrop" ([Visit Dubai — Kite Beach](https://www.visitdubai.com/en/places-to-visit/kite-beach), [Visit Dubai — best Burj Al Arab views](https://www.visitdubai.com/en/articles/best-places-for-views-of-burj-al-arab), [Tripadvisor — Kite Beach sunset views of Burj Al Arab](https://www.tripadvisor.com/ShowUserReviews-g295424-d8707026-r548390466-Kite_Beach-Dubai_Emirate_of_Dubai.html)).
2. **The lit skyscraper skyline** (Marina towers + a Burj Khalifa needle far off) ([Lonely Planet — Kite Beach](https://www.lonelyplanet.com/united-arab-emirates/dubai/jumeirah/attractions/kite-beach/a/poi-sig/397521/1336053)).
3. **Ain Dubai**, the world's tallest observation wheel (250 m) on Bluewaters next to JBR beach ([The National — Ain Dubai](https://www.thenationalnews.com/lifestyle/things-to-do/2024/12/26/ain-dubai-reopens-tickets/)). Honesty note: the wheel has been closed/stationary for most of 2022–2026 ([TripUAE 2026 status guide](https://tripuae.ru/en/blog/ain-dubai-observation-wheel-tickets)) — keep it as a **lit, static** silhouette rather than a turning one.
4. **A camel on the sand** — guided camel rides on JBR beach with the skyline behind are a signature tourist image ([GetYourGuide — JBR camel ride with skyline views](https://www.getyourguide.com/dubai-l173/dubai-guided-camel-ride-on-jbr-beach-with-skyline-views-t1129878/)).

**Palette:** night sky `#0F1B3D → #26154A`; sea `#123C58` with gold reflections `#F2C14E`; moonlit sand `#E8DCC0`. Accents: Burj Al Arab white-gold `#F5F0E6`/`#FFD97B`, window cyan `#4CC9F0`, warm windows `#FFC46B`.

**Time of day:** full night, city lights on.

**Ambient loop:** a **camel caravan (2–3 camels with riders) walks slowly along the waterline** silhouetted against the lit sea — verified as a real, iconic JBR-beach sight ([Dubai Travel Planner — where to ride a camel](https://www.dubaitravelplanner.com/ride-a-camel-in-dubai/)); micro-motion: Burj Al Arab facade slowly cycling through color washes.

---

## Level 10 — Kata Beach, Phuket, Thailand

**Why level 10:** palate-cleanse after two night levels — lush green tropical daylight, and Southeast Asia enters the tour.

**Signature silhouette elements (verified):**
1. **Longtail boats** with their high curved prows and ribbon-wrapped bows anchored in the shallows — photographed constantly at Kata ([Encircle Photos — longtails at Kata Beach](https://www.encirclephotos.com/image/three-longtail-boats-anchored-at-kata-beach-in-phuket-thailand/), [Phuket Expat Guide — longtail boats](https://phuketexpatguide.com/blog/phuket-longtail-boat-guide/)).
2. **Ko Pu ("Crab Island")**, the round jungle islet just off Kata's northern headland ([Snorkeling Thailand — Kata Beach](https://snorkelingthailand.com/kata-beach/)).
3. **The Big Buddha** — the 45 m white statue on Nakkerd Hill is visible from as far as Kata/Karon beach ([Hotels.com — Phuket Big Buddha](https://www.hotels.com/go/thailand/phuket-big-buddha), [Phuket 101 — hiking from Karon](https://www.phuket101.net/hiking-to-phuket-big-buddha-from-karon-beach/)). Place it tiny and white on the green ridge — a genuine sight-line, and it separates Phuket from every other palm beach in the set.
4. Dense jungle headlands framing both sides; granite boulders at the waterline.

**Palette:** sky `#8FD5F5`; jade sea `#23B5A0` with shallows `#7FE3D2`; pale-gold sand `#F6E7C1`. Accents: jungle `#1F7A4D`, longtail hull red `#D14B3C` + multicolor bow ribbons, Big Buddha white `#F2EFE9`.

**Time of day:** fresh tropical morning.

**Ambient loop:** a **longtail boat putters across the bay toward Ko Pu**, engine wake trailing — longtails genuinely shuttle snorkelers from Kata to Ko Pu ([Tripadvisor — longtails from Kata](https://www.tripadvisor.com/ShowTopic-g293920-i5037-k6129453-Long_tail_boats_from_kata_noir_kata_beach-Phuket.html)).

---

## Level 11 — Tanah Lot, Bali, Indonesia

**Why level 11:** the "spiritual" beat before the finale; the most dramatic pure-silhouette scene in the set.

**Signature silhouette elements (verified):**
1. **Tanah Lot temple on its offshore rock** — "the silhouette of Pura Tanah Lot is one of the most popular iconic features of Bali," a 16th-century sea temple ~300 m offshore, surrounded by water at high tide ([Indonesia.travel — Tanah Lot](https://www.indonesia.travel/gb/en/destination/bali-nusa-tenggara/bali/tanah-lot), [The World Travel Guy — Tanah Lot sunset](https://theworldtravelguy.com/tanah-lot-temple-sunset-bali/)).
2. Multi-tiered **meru pagoda roofs** on the rock's crown (the shape that reads "Bali" at 100 px).
3. Waves exploding white against the rock base.
4. **Giant traditional Balinese kites** high in the sky — bebean (fish), janggan (bird with a long flowing tail), pecukan (leaf), up to 4 m × 10 m, flown en masse over Padang Galak/Sanur every July ([Wikipedia — Bali Kite Festival](https://en.wikipedia.org/wiki/Bali_Kite_Festival), [Hotels.com — Bali Kites Festival](https://www.hotels.com/go/indonesia/bali-kites-festival)). Honest note: the kite festival is on Bali's east coast, Tanah Lot on the west — combining them is deliberate "greatest-hits" stylization of one island, both elements individually verified.

**Palette:** sunset sky `#FF8E53 → #D94A6A → #6D3B77`; dark sea `#4A3B63` with a molten light path `#FFB25E`; temple/rock silhouette `#241B2F`. Accents: kite red/white/black (traditional Balinese kite colors), frangipani `#F7C59F`.

**Time of day:** sunset — "the temple's silhouette against this colourful backdrop creates a mesmerising sight" is *the* Tanah Lot experience ([The World Travel Guy](https://theworldtravelguy.com/tanah-lot-temple-sunset-bali/)).

**Ambient loop:** **a janggan kite's long ribbon tail undulates slowly** high in the sky while the kite sways; secondary: repeating wave-burst of white spray on the temple rock.

---

## Level 12 — Bora Bora, French Polynesia (FINALE)

**Why level 12:** the consensus "most prestigious beach destination on Earth"; after Bali's dark sunset, the finale bursts back into impossible turquoise — the visual reward for finishing the tour.

**Signature silhouette elements (verified):**
1. **Mount Otemanu's jagged basalt tooth** rising behind the lagoon — resorts literally sell rooms by their "breathtaking views of the Bora Bora Lagoon and the majestic Mount Otemanu" ([InterContinental Le Moana — Otemanu-view bungalow](https://lemoana.intercontinental.com/accommodation/overwater-bungalow-otemanu-mountain-view), [Four Seasons Bora Bora](https://www.fourseasons.com/borabora/accommodations/specialty_overwater_bungalows/otemanu_over_water_bungalow_suite_with_plunge_pool/)).
2. **A line of thatched overwater bungalows on stilts** marching across the lagoon ([Sand in My Suitcase — Bora Bora overwater bungalows](https://sandinmysuitcase.com/overwater-bungalows-bora-bora/)).
3. **Banded lagoon water** — the multi-ring turquoise gradient from white sand to the deep pass ([Island Hopper Guides — Bora Bora lagoons](https://islandhopperguides.com/bora-bora/bora-boras-dazzling-lagoons-with-overwater-bungalows/)).
4. A palm-fringed motu (sand islet) strip.

**Palette:** sky `#62C8F0` with white trade-wind clouds; lagoon bands `#A7F0E0 → #43D9C7 → #0FA3B1` with deep pass `#0B6E8C`; motu sand `#FBF4DC`. Accents: Otemanu green-basalt `#3E6B4F`/`#5C6B5A`, thatch `#B98A5A`.

**Time of day:** brilliant late-morning — the finale should be the most saturated frame in the game.

**Ambient loop:** **dark stingray shadows glide slowly through the turquoise shallows** — the water is genuinely so clear that guests watch stingrays from their bungalows ([Sand in My Suitcase](https://sandinmysuitcase.com/overwater-bungalows-bora-bora/), [Trent Ogilvie — swimming with rays/sharks in Bora Bora](https://www.trentogilvie.com/blog/swimming-with-sharks-in-bora-bora)); secondary: an outrigger canoe drifting between bungalows.

---

## Candidates evaluated and cut

- **Maldives** — visually a subset of Bora Bora (overwater bungalows + turquoise) with **no vertical landmark silhouette**; two such levels would read as duplicates. Bora Bora wins on Mt. Otemanu alone.
- **Sydney/Bondi** — the Opera House/Harbour Bridge are not visible from Bondi's sand; Bondi's icon (Icebergs pool) is a low horizontal element with weak silhouette value at backdrop scale.
- **Cape Town/Camps Bay** — Table Mountain is a superb silhouette, but the slot competes with Rio (another "mountain-over-city-beach" composition) and breaks the eastward tour flow. Strongest bench candidate if any of the 12 tests poorly.
- **Copacabana vs Ipanema** — Copacabana chosen because the Burle Marx wave pavement gives a unique near-layer motif and Sugarloaf anchors the horizon.

## Production notes for the art pass

1. **One landmark per scene carries recognition.** In every scene above, element #1 alone must identify the place at 150 px; elements 2–4 are confirmation, not load-bearing.
2. **The sea band doubles as the difficulty tell.** Consider tinting the table felt/rail per level with the scene's accent color so screenshots are instantly distinguishable in stores.
3. **All ambient loops are single-object translations or rotations** (boat, plane, cable car, kite tail, beams, ray shadows) — each implementable as one sprite on a path with a 8–25 s period, near-zero draw cost on canvas.
4. **Verified honesty flags to carry into marketing copy:** Ain Dubai rendered static (closed/intermittent since 2022); Christ the Redeemer rendered small/hazy (skyline icon, not a guaranteed beach sight-line); Bali kites + Tanah Lot are a same-island composite. Everything else is a true from-the-beach view.
