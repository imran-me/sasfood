# PROJECT_CONTEXT.md — Sara Alsalam Foodstuff Trading LLC

> **Purpose of this file:** This is the living context / memory file for the project.
> Claude (and you) read this at the start of every session to instantly recall what
> the project is, what is done, what is next, and any decisions made. **Update the
> "Session Log" at the bottom at the end of each working day.**

---

## 1. What this project is

A **top-tier luxury corporate showcase website** for **Sara Alsalam Foodstuff
Trading LLC**, an international wholesale foodstuff trading company (Dubai-based).

- **NOT an e-commerce site.** No cart, no checkout, no prices, no orders.
- Every "buy/order" intent becomes a **bulk inquiry** routed to **WhatsApp + Gmail**.
- Goal: project **authority, authenticity, scale and trust**; present ~20–25
  products beautifully; make it effortless for a wholesale buyer to start a chat.
- Signature experience: a **cinematic Dubai-themed animated background** — golden/green
  silhouettes of Arabian monuments that drift, parallax and fade in on scroll.

The full source-of-truth spec is `Sara-Alsalam-Landing-Page-Prompt.md` in the repo root.

---

## 2. Company facts (verbatim — do not invent)

- **Legal name:** Sara Alsalam Foodstuff Trading LLC
- **Business:** International export & import — wholesale / bulk only
- **Markets:** Dubai (UAE), Qatar, India, Bangladesh, Iraq, South Africa
- **Hero product categories (6):** Rice, Oil, Palm Oil, Fruits, Spices, Sugar
- **Catalogue:** ~20–25 SKUs (curated, quality over volume)
- **Pages:** Home, Products, About, Contact + hidden Admin

### Client-supplied contact details (from the official letterhead — NOW FILLED in config.js)
| Field | Value | Status |
|---|---|---|
| WhatsApp / Phone | +971 56 745 4014 (E.164 `971567454014`) | ✅ provided |
| Phone 2 | +971 52 605 0655 | ✅ provided |
| Email | sasfood.ae@gmail.com | ✅ provided |
| Address | Office 222, 2nd Floor, RAG Global Business Center, Al Hilal Bank Building, Al Qusais, Dubai, UAE | ✅ provided |
| Website | www.saraalsalam.com | ✅ provided |
| Map | Google Maps search for the RAG Global Business Center | ✅ set |
| Instagram / LinkedIn | `{INSTAGRAM}` / `{LINKEDIN}` | ⏳ still pending |

**Brand:** sub-brand "Sara Gold" (سارة جولد); tagline "Committed to Quality"; ethos
"Trusted Global Food Trading Partner". Real logo + letterhead live in
`assets/img/brand/` (`logo.png`, `letterhead.png`).

**Single source of truth for contact details = `assets/js/config.js`.** Every CTA
reads from there so the client only edits one file (later: from Admin settings).

---

## 3. Brand system (quick reference — full tokens in `assets/css/tokens.css`)

- **Canvas:** deep green (`--green-800 #0C3B2E`) dominant; gold is jewelry (≤10%).
- **Gold:** `--gold-500 #C9A24B` for lines/eyebrows/CTAs; metallic gradient for logo.
- **Light sections:** cream/sand (`--cream-100 #FBF8F0`).
- **Type:** Cinzel (display/H1–H2), Cormorant Garamond (lead/quotes), Manrope (body/UI).
- **Eyebrows:** Manrope 600, UPPERCASE, letter-spacing .18em, gold.
- **Motif:** Islamic 8-point star / arabesque hairline dividers; gold filigree corners.
- Maintain ≥4.5:1 contrast; gold text only on dark green/charcoal.

---

## 4. Tech & architecture decisions

| Area | Decision | Notes |
|---|---|---|
| Front-end | Semantic HTML5 + modern CSS + vanilla JS | No heavy UI kit |
| Structure | **Modular** — each section = own HTML partial + own CSS file | Per client request |
| HTML composition | Section partials in `sections/` loaded via `assets/js/include.js` (fetch) | **Needs a local web server** (fetch fails on `file://`) |
| Smooth scroll | Lenis (loaded via CDN, optional) | Falls back to native |
| Animation | GSAP + ScrollTrigger (CDN) for monument bg, reveals, counters | Respect `prefers-reduced-motion` |
| Background | Layered SVG silhouettes, 3 parallax depths | `assets/js/background.js` |
| Admin / backend | **Firebase** (Auth + Firestore + Storage) — planned | Currently a front-end-only stub in `admin.html` |
| Hosting | Static host (Netlify / Vercel / Firebase Hosting) + CDN | HTTPS, gzip/brotli |

> ⚠️ Because HTML sections are fetched at runtime, **run a local server** during dev:
> `npx serve .` or `python -m http.server`. Opening `index.html` via `file://`
> will block the fetch includes (browser CORS).

---

## 5. File / folder map

```
sas/
├── Sara-Alsalam-Landing-Page-Prompt.md   # original master spec (source of truth)
├── PROJECT_CONTEXT.md                     # THIS FILE — read first each session
├── README.md                              # how to run / deploy / edit
├── index.html        products.html  about.html  contact.html  admin.html
├── site.webmanifest  robots.txt    sitemap.xml
├── sections/                              # individual HTML section partials
│   ├── header.html        hero.html       trust.html      about.html
│   ├── products.html      capabilities.html  markets.html  cta.html
│   ├── contact.html       footer.html     mobile-menu.html  background.html
├── assets/
│   ├── css/
│   │   ├── tokens.css   base.css   layout.css   components.css   background.css
│   │   ├── admin.css
│   │   └── sections/  (header hero trust about products capabilities markets cta contact footer).css
│   ├── js/
│   │   ├── config.js       # contact details + site settings (SINGLE SOURCE)
│   │   ├── include.js      # fetch + inject section partials
│   │   ├── cta-helper.js   # build WhatsApp / Gmail / mailto links
│   │   ├── preloader.js    nav.js   cursor.js   reveal.js   counters.js
│   │   ├── background.js    products.js   contact.js   admin.js
│   │   └── main.js         # boot: init everything in order
│   ├── data/
│   │   └── products.js     # seed product catalogue (6 categories, sample SKUs)
│   └── img/
│       ├── silhouettes/    # SVG monuments (burj-khalifa, dhow, camel, falcon, …)
│       └── icons/          # favicon set, og image (to add)
```

---

## 6. Build phases & status

- [x] **Phase 0** — Context file + README
- [x] **Phase 1** — CSS foundation (tokens, base, layout, components, background)
- [x] **Phase 2** — Per-section CSS (+ admin.css)
- [x] **Phase 3** — JS modules (config, helpers, animation, products, contact, include, main, admin)
- [x] **Phase 4** — Product seed data (~17 published SKUs + 1 draft)
- [x] **Phase 5** — HTML section partials + include system (fetch loader)
- [x] **Phase 6** — Pages (index, products, about, contact, separate admin.html)
- [x] **Phase 7** — SVG silhouettes (13) + emblem/favicon, manifest, robots, sitemap
- [ ] **Phase 8** — Firebase wiring (admin real backend) — FUTURE
- [ ] **Phase 9** — Polish, a11y, Lighthouse ≥90, real client content/images — FUTURE

> ⚠️ **Still needed before launch:** raster icons (favicon.ico, apple-touch-icon,
> icon-192/512, og-image — see `assets/img/icons/README.md`), real product photos
> (`assets/img/products/`), brand photos (`assets/img/photos/`), and the `{CURLY}`
> contact values in `assets/js/config.js`.

---

## 7. Open questions / TODO for the client

1. Provide all `{CURLY}` contact values (WhatsApp, email, phone, address, map, socials).
2. Confirm trust-strip numbers (markets count, SKU count, MOQ, certs).
3. Confirm certifications to display (Halal / ISO 22000 / HACCP) or omit.
4. Supply real product photography (warm editorial grade) + final SKU list.
5. Confirm logo direction (S·A monogram vs wheat-sheaf + crescent).
6. Decide backend: Firebase (recommended) vs Supabase vs Node/SQLite.

---

## 8. Conventions

- **Never invent contact details.** Leave `{CURLY}` defaults until the client provides.
- Keep the "inquiry-only, no e-commerce" rule sacred — no prices, cart, or checkout.
- All CTAs go through `cta-helper.js` so the number/email come from `config.js`.
- Every file has a top comment explaining its role and how to edit it.
- Decorative SVGs are `aria-hidden`; real images get descriptive `alt`.

---

## 9. Session Log (append newest at top — update at end of each day)

### 2026-06-30 — Session 7 (mobile overflow fix, products 2-col, FIREBASE wired)
Client report: on mobile the page rendered **wider than the screen** (right-edge
icons clipped; zooming out "fixed" it). Plus: keep section order identical on
desktop/phone, keep the 3-col animated Featured row, make Products **2 per row**
on mobile, and **connect Firebase Firestore** so admin edits are instantly public.

- **Overflow root cause + fix:** the per-section golden `.side-accent` monuments
  were `opacity:0` on mobile but **still in layout**, anchored to the section edge
  and pushed ~42% outward (`museum.webp` at 34vmin) → horizontal overflow. And
  `overflow-x:hidden` was only on `<body>`, not the real scroll container `<html>`.
  Fixed: `.side-accent { display:none }` ≤760px (`background.css`) + `overflow-x:
  hidden` on `<html>` and `max-width:100%` on `<body>` (`base.css`).
- **Section order:** already identical desktop/mobile (one shared HTML, no CSS
  reordering). Kept Featured **below** the numbers/trust strip (client's choice).
- **Products 2-up on mobile:** `products.css` — `@media (max-width:640px)` forces
  `grid-template-columns: repeat(2, minmax(0,1fr))`, compacts padding/fonts,
  3-line clamped desc, stacks the Inquire/Email buttons. (Featured row untouched.)
- **Firebase Firestore backend (Phase 8) — WIRED, optional/graceful:**
  - New `assets/js/firebase-config.js` (paste keys here) + `assets/js/firebase.js`
    (`window.SASCloud`: `pull/mirror/publishAll/hasData/signIn/onAuth`).
  - Kept the synchronous `Store` API. `store.js` now `mirror()`s every save/delete
    to Firestore (products/ads/categories/countries/inquiries/settings; settings =
    single doc id `site`). Public pages `await SASCloud.pull()` in `main.js` boot
    (after includes, before render) so visitors see latest admin edits.
  - Admin login uses **Firebase Auth** when configured (else the old demo gate).
    First admin login `publishAll()`s the local catalogue to seed an empty cloud.
  - Firebase compat SDK (10.12.2) script tags + the two new files added to all 5
    pages after `store.js`. If `apiKey` is blank → fully disabled, site = as before.
  - Setup steps + Firestore security rules in **`FIREBASE_SETUP.md`**.
  - All JS passes `node --check`.

  **Firebase now LIVE (client completed console setup this session):**
  - Project **`sasfood-1088f`** (Spark plan), separate from the client's other
    project `meimran`/OppTracker (shared GitHub Pages host `imran-me.github.io`,
    but isolated by config keys — that domain is authorized in both projects).
  - Real keys are in `assets/js/firebase-config.js` (committed; web keys are safe
    to expose — Firestore rules do the protecting). Firestore created (default db),
    Email/Password auth on, admin user added, rules published, domain authorized.
  - Admin login = the Firebase user **epal.imran@gmail.com** (client to ROTATE the
    password — it was shared in chat/URL during setup). Login page demo-cred hints
    removed from `admin.html`.
  - **Desktop image upload added** (`admin.js` `compressImage()` + file input in
    the product editor): picks a photo, canvas-resizes to ≤1200px JPEG q≤.72,
    embeds as a `data:` URL kept <800KB (under Firestore's 1MB doc limit), stored
    inline → shows for everyone, no Storage bucket / Blaze plan needed. URL/Drive
    link still supported; an uploaded photo wins. `media.js resolveImg` passes
    `data:` URLs through untouched.
  - **Catalogue cleared to empty** (`assets/data/products.js` → `window.PRODUCTS=[]`)
    so the public site no longer shows the 10 placeholder sample cards; **Store
    seed bumped v3→v4** to drop old samples from existing browsers. Public shows
    "No products yet" until the client adds real products in Admin.
  - ⚠️ GOTCHA hit this session: the IDE (file open in VS Code) saved an empty
    buffer over `assets/js/admin.js` AFTER an Edit, and the emptied file got
    committed (broke login → native GET submit leaked password into URL). Fixed by
    `git checkout d9eb41e -- assets/js/admin.js` + re-applying the auth edit. If a
    just-edited file looks wrong, check the user's open editor isn't clobbering it.
  - ⏳ Client TODO next: log into admin (hard-refresh first), confirm the "Published
    to Firebase" toast, add real products with photos; rotate the admin password.
  - Note (future scale): inline `data:` images live in Firestore docs + localStorage
    cache; fine for a small catalogue (~20 products). If it grows large, move photos
    to Firebase Storage (needs Blaze plan) or keep using Google Drive links.

### 2026-06-30 — DAY RECAP (client task list, all done + pushed to GitHub)
All work pushed to `https://github.com/imran-me/sasfood.git` (branch `main`,
HEAD `68704a8`). Tasks the client asked for today, in order, and their status:

1. ✅ **Admin product upload functional for GitHub hosting** — CRUD works; added
   **"⤓ Export catalogue"** (downloads `assets/data/products.js` to commit) +
   JSON backup. **Google Drive photo links** supported (`media.js`).
2. ✅ **Admin content management** — new sidebar group: **Categories, Countries
   (lat/lng + flag/emblem), Branding/Emblem**.
3. ✅ **Real golden world map** (markets) — equirectangular; admin countries plot
   geographically with animated trade-route lines from the Dubai hub.
4. ✅ **Featured Products** rotating deck (5-col desktop / 3-col mobile, View-all);
   moved to **right after the numbers strip**.
5. ✅ **Cards** — golden arabesque + alternate khatam motif, faint & edge-feathered
   (border stays crisp), **3.5px borders**, **floating** shadow + **gold hover**.
6. ✅ **Spacing reduced** (section padding, gaps, compacted trust strip ~50%).
7. ✅ **Desktop mouse-wheel scroll fixed** — removed Lenis (it hijacked the wheel);
   native scroll now. **Mobile fixed inline menu** (Home/Products/About).
8. ✅ **Background redone** — crude SVG silhouettes replaced by the **golden Dubai
   photo** (hero) + **per-section golden monuments** (camel/Burj/museum) that
   **scroll** and alternate sides. Client's transparent PNGs optimised to webp.
9. ✅ **Background pop-in fixed** — bg canvas inlined (was a late-loading partial).
- See Sessions 5 & 6 below for detail. Tuning knobs noted in Session 6.
- ⏳ Open: client to optionally add their own hero photo (a default ships); higher-
  fidelity world-map continents if wanted; Firebase (Phase 8) to drop the
  export-and-commit step.


### 2026-06-30 — Session 6 (photo background, golden monuments, card polish, layout)
- **Background art:** removed the crude SVG monument silhouettes. Hero now uses a
  transparent golden **Dubai scene** (`assets/img/bg/dubai-scene.webp`), feathered
  + green-veiled + slow Ken-Burns. Client-supplied transparent PNGs (in
  `assets/vector/`) were optimised to webp in `assets/img/scenes/` (`camel`,
  `burj`, `museum` — museum & camel had baked white/checker backgrounds, keyed out
  with PIL by saturation). These are placed as **per-section SIDE monuments** that
  **scroll with the page**, alternate left/right, fade+slide in per section
  (`background.js` SIDE_ACCENTS → `.side-accent`), hidden < 760px.
- **Pop-in fix:** the background canvas (`.bg-stage/.bg-scene/.bg-veil/.bg-grain/
  .bg-vignette`) is now **inlined into each page** instead of fetched via
  `sections/background.html` — so the edge vignette/scene paint on the first frame
  (the fetched partial used to pop in a moment late). `sections/background.html`
  is now unused (kept for reference).
- **Cards:** two motifs alternate (`arabesque-gold.svg` / new `geo-gold.svg` khatam
  star) via `.motif-b` + `nth-child`. Pattern is faint (`.card::before` opacity
  ~.17) and **radially feathered so it never touches the border**. Borders **3.5px**.
  Cards **float** (layered shadow) with a gold-glow **hover lift**. Corner filigree
  dropped on cards.
- **Layout:** home order is now hero → **trust (numbers+certs, compacted ~50%, one
  row)** → **Featured (View all)** → divider → Our Story (about) → products → … .
  Section padding + divider gap tightened again (`--section-pad`).
- Smooth-scroll: still native (Lenis removed in session 5b) — wheel works.
- Knobs: card pattern `.card::before {opacity}`; side-art strength = `op:` in
  `background.js` SIDE_ACCENTS; hero photo = `.bg-scene {opacity}`.


### 2026-06-30 — Session 5 (admin content mgmt, featured deck, golden world map, vectors, scroll/menu)

**Client prompt (verbatim, for the record):**
> 1. Can I upload product via the admin page now? If not, make it functional. As for now, I will host it in github. So, product data and photos should be there. Also make another option while uploading products, that I can give a drive link of a photo there, and it should be visible if anyone opens the site.
> 2. The background is perfect with the golden dust type things moving across, but the vector of dubai, camel is not matching. That's why I have given some vectors in the assets folder, I don't know if they are transparent background or not, if not then make them transparent, and then use them. Also if you can make fully new vectors of the given vectors by yourself, actually same to same, and maintaining the current luxurious golden color, then do that too.
> 3. In the vector there are golden patterns too... If not make transparent, then use them on the cards. All cards are green now, with golden border. Still there will be green, but there will be the patterns, especially the flower pattern most. Make the cards border 25% more.
> 4. Reduce the distance between items. And there should be a featured products section just after the first view of the about home, and there will be option to click view all products → navigate to all products page. Featured products in one row, 5 column desktop, 1 row 3 column mobile, with a loop where featured products animate/change randomly (rich, luxurious feel).
> 5. In desktop, mouse scroll is not smooth (sticks); mobile is great. Solve it. In mobile, there should be a fixed menu in the hero (not collapsible) — Home, Product, About.
> 6. In admin, add option to add countries where we operate. Make a dedicated section in the menu to control all items, categories, countries, emblem.
> 7. Make all cards border 25% more width.
> 8. In the markets "where we operate" view, put a real flat world map, golden vector, same theme; indicate operating countries. Adding a new operating country (with emblem/flag) in admin should make an indication line appear on the map.

**Decisions & what was built:**
- **Hosting model for admin data (important):** the site is static (GitHub Pages, no backend). `localStorage` is per-browser, so admin edits are NOT automatically visible to other visitors. Model implemented: admin edits live in the Store (localStorage) for instant preview, plus **Admin → Products → "⤓ Export catalogue"** downloads a regenerated `assets/data/products.js` to **commit to GitHub** (that committed file is what every visitor loads). Also **"⤓ Backup (JSON)"** exports everything.
- **Google Drive photos:** new `assets/js/media.js` → `MEDIA.resolveImg(url)` converts Drive share links / ids → `https://lh3.googleusercontent.com/d/<id>=w1200`. Used by the product renderer, featured deck, admin preview, country emblems, branding. Product editor has a Drive-link field + "Additional images (one per line)". Drive file must be shared "Anyone with the link – Viewer".
- **Admin Content group:** new sidebar group → **Categories** (inline rename/add/delete), **Countries** (full editor: name, ISO, flag emoji, emblem/flag image, lat/lng, hub flag, live toggle), **Branding/Emblem** (emblem image/Drive link, applied site-wide via `applyEmblem()` in main.js). Backed by new Store APIs: `getCategories/saveCategory/deleteCategory/getCategoryNames`, `getCountries/saveCountry/deleteCountry`, `exportProductsFile/exportAll`. **Store seed bumped to `sas_seeded_v3`** (re-seeds categories+countries+emblem).
- **Featured Products deck:** `sections/featured.html` + `featured.css` + `featured.js` (`initFeatured`). Sits after About on the home page. 5 cols desktop / 3 cols mobile, auto-rotates through all `featured:true` products with a gold crossfade (pauses on hover/offscreen/hidden-tab; honors reduced-motion). "View All Products" → `products.html`; cards deep-link `products.html?category=…`.
- **Cards:** faint gold **arabesque flower damask** (`assets/img/patterns/arabesque-gold.svg`, seamless tile, soft-light blend) on every `.card`; border widened `1px → 1.25px` (+25%). Removed card `backdrop-filter` (big scroll-perf win). Spacing tightened (`--section-pad`, section-head margin, product grid gap).
- **Vectors:** authored refined **camel** (`silhouettes/camel.svg`) and new **Dubai skyline** (`silhouettes/dubai-skyline.svg`); hero now uses the skyline. These are shape masks (inherently transparent, tinted gold by `background.js`). The supplied `assets/vector/*.zip` are EPS+JPG (raster, no alpha) — not used directly; clean SVGs match the luxe look and tint correctly.
- **World map:** `sections/markets.html` rewritten as an **equirectangular map** (`viewBox 0 0 360 180` → `x=lng+180, y=90-lat`). `markets-map.js` (`initMarketsMap`) reads `Store.getCountries()`, places **geographic gold pins** + animated **trade-route arcs from the Dubai hub**, and builds the legend. Add a country in admin (with lat/lng) → pin + route appear on reload. Continents are stylised hand-authored golden landmasses (swappable for a higher-fidelity SVG later if desired).
- **Scroll & mobile menu:** Lenis retuned to `lerp:0.1` (less "stuck" on desktop wheel). Mobile header now shows a **fixed inline nav (Home/Products/About)** — hamburger + overlay hidden ≤980px; wordmark hidden ≤560px.
- New scripts added to all relevant pages (`media.js`); `featured.js` + `markets-map.js` added to `index.html` and `main.js` init order. All JS passes `node --check`; new SVGs validate as XML.
- **Still pending / nice-to-have:** higher-fidelity world-map continents; per-product image gallery in the public modal (data supports multiple images now, modal shows the first); Firebase (Phase 8) to remove the export-and-commit step.



### 2026-06-27 — Session 4 (real logo + letterhead info)
- Client supplied the official **logo** (SAS / Sara Gold) and **letterhead**. Saved to
  `assets/img/brand/logo.png` + `letterhead.png`.
- Real logo now used in header, footer, preloader and admin (CSS sized by height,
  width auto, since it's a non-square badge). Favicon updated to read "SAS".
- Filled real contact details into `config.js` (phone, phone2, email, address, map,
  website) — pulled from the letterhead. Updated footer fallback text, contact card
  (2 phones + RAG Global Business Center map embed), and JSON-LD (address + contactPoint).
- Tagline → "Committed to Quality"; ethos → "Trusted Global Food Trading Partner".
- **Bumped Store seed to `sas_seeded_v2`** so existing browsers re-seed and pick up the
  real contact info (inquiries are preserved; products/ads/settings re-seed).
- Pushed to GitHub (see below). Still pending: Instagram/LinkedIn URLs, real product
  photos, raster icon set, Firebase (Phase 8).

### 2026-06-27 — Session 3 (image fallback + pushed to GitHub)
- Added `assets/js/img-fallback.js` — a capture-phase image error handler that
  swaps any missing photo for a branded deep-green/gold SVG placeholder built from
  the alt text. Wired into all 4 public pages + admin. So the public view looks
  intentional and "well arranged" even before real product/brand photos exist.
- Added `.nojekyll` (GitHub Pages serves files as-is) and `.gitignore`.
- **Initialised git and pushed to `origin` = https://github.com/imran-me/sasfood.git**
  (branch `main`, commit fc59ad1). 74 files.
- To go live: GitHub repo → Settings → Pages → Deploy from branch `main` / root.
  The site will be at `https://imran-me.github.io/sasfood/` — relative paths +
  fetch includes work under that subpath.

### 2026-06-27 — Session 2 (admin made FUNCTIONAL)
- Added `assets/js/store.js` — a localStorage data layer (Products/Ads/Inquiries/
  Settings) with first-run seeding from `config.js` + `products.js`. Same public API
  Firebase will later implement (Phase 8 = swap the storage backend, keep the API).
- Trimmed seed to **10 sample products** (each with a stable `id`), spread across all
  6 categories.
- Rewrote `admin.js` → **fully working CRUD**: products (add/edit/delete + live preview
  card), ads/banners (CRUD + toggle live), inquiries (mark contacted/new, delete,
  **Export CSV**), settings (saved live, drives public CTAs). Demo auth unchanged.
- Wired the public site to the Store: `products.js` renders from `Store.getProducts()`,
  `contact.js` writes submissions via `Store.addInquiry()` (they appear in admin),
  `main.js` overlays admin Settings onto `SITE_CONFIG` before rendering CTAs.
- Added `store.js` to all four public pages (after config + data, before the rest).
- ⚠️ Gotcha: once the Store has seeded a visitor's localStorage, edits to `config.js`
  are masked by saved Settings for that browser. Edit contacts via Admin > Settings,
  OR have the visitor click "Reset demo data" in admin. `localStorage.clear()` also resets.
- All JS passes `node --check`.

### 2026-06-27 — Session 1 (scaffold COMPLETE)
- Built the entire modular scaffold end-to-end (Phases 0–7 done). 70+ files.
- CSS: tokens/base/layout/components/background + 10 section files + admin.css.
- JS: config, cta-helper, include, preloader, nav, cursor, reveal, counters,
  background (monument system + particles), products (cards/filter/modal),
  contact (form→WhatsApp handoff), main (orchestrator), admin (stub). All pass `node --check`.
- Data: `assets/data/products.js` — 17 published SKUs + 1 draft across 6 categories.
- Pages: index (assembled from partials), products, about, contact, and a SEPARATE
  `admin.html` (login + dashboard shell, demo creds admin@saraalsalam.com / demo1234).
- Assets: 13 monument SVG silhouettes + emblem.svg + favicon.svg; manifest/robots/sitemap.
- ⚠️ Reminder: must serve over HTTP (`npx serve .`) — includes use fetch().
- **Next session (Phase 8/9):** wire Firebase (auth + Firestore + Storage) into admin;
  generate raster icons + OG image; add real product/brand photos; fill `{CURLY}`
  contact values in config.js; Lighthouse pass (target ≥90).
```
(Add a new dated entry above this line each day.)
```
