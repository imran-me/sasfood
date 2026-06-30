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
