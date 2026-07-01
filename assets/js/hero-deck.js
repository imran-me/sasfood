/* ============================================================================
   hero-deck.js — Two tilted "product plate" cards in the hero (desktop)
   ----------------------------------------------------------------------------
   Fills the open right-hand space of the hero with two overlapping, gold-framed
   cards that quietly cross-fade through every photo in the live catalogue —
   a luxurious, ever-changing glimpse of the products without a heavy carousel.

   - Reads product images from the Store (admin-managed), falling back to the
     seed data. If there are no product photos yet, the deck removes itself.
   - Each card holds two <img> layers and swaps them with an 0.85s cross-fade.
   - Cards advance one at a time (~1.3s cadence) so something is always gently
     changing. Honors prefers-reduced-motion (shows a static pair, no rotation).
   - The markup + styling live in sections/hero.html and sections/hero.css; the
     whole deck is hidden by CSS below 980px so phones stay clean.
   ========================================================================== */

window.initHeroDeck = function initHeroDeck() {
  const deck = document.querySelector("[data-hero-deck]");
  if (!deck) return;

  const resolveImg = (u) => (window.MEDIA ? window.MEDIA.resolveImg(u) : (u || ""));

  // Collect every product photo (first + gallery) from the live catalogue.
  const products = (window.Store ? window.Store.getProducts() : (window.PRODUCTS || []))
    .filter((p) => p.status !== "draft");
  const imgs = [];
  products.forEach((p) => (p.images || []).forEach((im) => {
    if (im && im.url) imgs.push({ url: resolveImg(im.url), alt: im.alt || p.name || "" });
  }));

  if (!imgs.length) { deck.remove(); return; }   // no photos yet — no deck

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cards = [...deck.querySelectorAll(".hd-card")];

  // Give each card two stacked layers so we can cross-fade between photos.
  const state = cards.map((cardEl, i) => {
    cardEl.innerHTML = `<img alt="" decoding="async"><img alt="" decoding="async">`;
    return {
      layers: [...cardEl.querySelectorAll("img")],
      front: 0,
      idx: (i * Math.max(1, Math.floor(imgs.length / cards.length))) % imgs.length,
    };
  });

  const show = (s, idx) => {
    const im = imgs[((idx % imgs.length) + imgs.length) % imgs.length];
    const back = s.layers[s.front ^ 1];
    const reveal = () => {
      s.layers.forEach((l, k) => l.classList.toggle("is-on", k === (s.front ^ 1)));
      s.front ^= 1;
    };
    back.alt = im.alt;
    back.onload = reveal;
    back.onerror = reveal;
    back.src = im.url;
    if (back.complete && back.src) reveal();
  };

  state.forEach((s) => show(s, s.idx));

  if (reduce || imgs.length < 2) return;   // static pair — nothing to rotate

  // Advance one card per tick (staggered) so the pair never flips in unison.
  let turn = 0;
  setInterval(() => {
    const s = state[turn % state.length];
    s.idx += state.length;                 // step forward, keep the two cards distinct
    show(s, s.idx);
    turn++;
  }, 1300);
};
