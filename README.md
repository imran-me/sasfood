# Sara Alsalam Foodstuff Trading LLC — Corporate Landing Site

A luxury, inquiry-only corporate showcase for an international wholesale foodstuff
trader. Deep-green canvas, gold accents, and a cinematic Dubai-monument animated
background. **No e-commerce** — every CTA opens a WhatsApp chat or a Gmail draft.

> 📌 Read **`PROJECT_CONTEXT.md`** first — it holds the living project state,
> decisions, and a daily session log. The original brief is
> `Sara-Alsalam-Landing-Page-Prompt.md`.

---

## Quick start (run locally)

The HTML sections are loaded at runtime with `fetch()`, so you **must serve the
folder over HTTP** (opening `index.html` directly via `file://` will block the
includes). Pick any one:

```bash
# Node (recommended)
npx serve .
# or
npx http-server -p 5173 .

# Python 3
python -m http.server 5173
```

Then open <http://localhost:5173>.

---

## Editing the things you'll edit most

| I want to… | Edit this file |
|---|---|
| Change WhatsApp number / email / phone / address / socials | `assets/js/config.js` |
| Add / edit / remove products | `assets/data/products.js` |
| Tweak brand colours, fonts, spacing | `assets/css/tokens.css` |
| Change a section's look | `assets/css/sections/<section>.css` |
| Change a section's markup | `sections/<section>.html` |
| Change the animated monuments | `assets/js/background.js` + `assets/img/silhouettes/` |
| Change WhatsApp/email message templates | `assets/js/config.js` (templates block) |

**Single source of truth for contact details = `assets/js/config.js`.**
Every CTA on the site reads from it via `assets/js/cta-helper.js`.

---

## Project structure

See the file map in `PROJECT_CONTEXT.md` §5. In short:

- `sections/*.html` — individual HTML partials, one per page section.
- `assets/css/` — `tokens` (variables) → `base` → `layout` → `components` →
  `background`, plus one file per section under `assets/css/sections/`.
- `assets/js/` — small focused modules; `main.js` boots them in order.
- `assets/data/products.js` — the product catalogue (seed data).
- `assets/img/silhouettes/` — SVG monuments for the animated background.

---

## How the CTAs work (inquiry-only)

- **WhatsApp:** `https://wa.me/<E164>?text=<encoded message>` built by `cta-helper.js`.
- **Email:** `mailto:` (and an optional Gmail compose deep link on desktop).
- Per-product buttons pre-fill a message naming that product + packaging.
- The contact form validates, (optionally) stores the inquiry, then hands off to
  WhatsApp/Gmail with a pre-filled summary. **It never charges or transacts.**

---

## Admin

`admin.html` is currently a **front-end stub** (UI only) showing the intended
Products / Ads / Inquiries / Settings panels. Real persistence (Firebase Auth +
Firestore + Storage) is Phase 8 — see `PROJECT_CONTEXT.md`. The admin route is not
linked publicly except a tiny gold dot in the footer.

---

## Deploy

Any static host works (Netlify, Vercel, Firebase Hosting, GitHub Pages):

1. Push the repo.
2. Set the publish/root directory to the project root (no build step needed).
3. Ensure HTTPS + gzip/brotli + cache headers (defaults on most hosts).

Before launch, replace every `{CURLY}` placeholder (contact details) in
`assets/js/config.js`, add real product images, and run a Lighthouse pass
(target ≥90).

---

## Accessibility & motion

- Honors `prefers-reduced-motion` (animations disabled / shown as a static frame).
- Gold focus rings, keyboard nav, skip-to-content link, `aria` labels.
- Decorative silhouettes are `aria-hidden`; real images get descriptive `alt`.

---

## License / content

© Sara Alsalam Foodstuff Trading LLC. Product copy and brand assets belong to the
client. Third-party libs (GSAP, Lenis) under their respective licenses.
