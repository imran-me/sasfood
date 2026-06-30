/* ============================================================================
   featured.js — Featured products rotating deck (home page)
   ----------------------------------------------------------------------------
   Renders the "Featured Selection" row from the live catalogue (products flagged
   featured:true). Shows 5 cards on desktop, 3 on mobile, and quietly rotates
   through the whole featured pool with a gold crossfade — so a client with 10
   featured products sees them all cycle through, a few at a time.

   - Pauses on hover, when the tab is hidden, and when scrolled out of view.
   - Honors prefers-reduced-motion (renders one static set, no rotation).
   - Each card deep-links to the catalogue filtered to its category.
   ========================================================================== */

window.initFeatured = function initFeatured() {
  const row = document.querySelector("[data-featured]");
  if (!row) return;

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const resolveImg = (u) => (window.MEDIA ? window.MEDIA.resolveImg(u) : (u || ""));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Source: published products; prefer those flagged featured.
  const all = (window.Store ? window.Store.getProducts() : (window.PRODUCTS || []))
    .filter((p) => p.status !== "draft");
  let pool = all.filter((p) => p.featured);
  if (pool.length < 3) pool = all;            // fall back so the row is never thin
  if (!pool.length) { row.closest(".featured")?.remove(); return; }

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let deck = shuffle(pool);
  let cursor = 0;

  const visibleCount = () => (window.matchMedia("(max-width: 768px)").matches ? 3 : 5);

  // Pull the next `n` cards from the deck, reshuffling + wrapping when exhausted.
  const nextSet = (n) => {
    const set = [];
    for (let k = 0; k < n; k++) {
      if (cursor >= deck.length) { deck = shuffle(pool); cursor = 0; }
      set.push(deck[cursor++]);
    }
    return set;
  };

  const cardHTML = (p, i) => {
    const im = (p.images && p.images[0]) || { url: "", alt: p.name };
    const ori = (p.origins || []).slice(0, 2).join(" · ");
    return `
      <a class="featured-card has-filigree" style="--i:${i}"
         href="products.html?category=${encodeURIComponent(p.category || "")}"
         aria-label="${esc(p.name)} — view in catalogue">
        <span class="cat">${esc(p.category || "")}</span>
        <div class="ph"><img src="${esc(resolveImg(im.url))}" alt="${esc(im.alt || p.name)}" loading="lazy" decoding="async"></div>
        <div class="plate">
          <div class="name">${esc(p.name)}</div>
          ${ori ? `<div class="ori">${esc(ori)}</div>` : ""}
        </div>
      </a>`;
  };

  const paint = (set) => { row.innerHTML = set.map(cardHTML).join(""); };

  // Initial render.
  let count = visibleCount();
  paint(nextSet(count));

  // Re-fit the number of visible cards when crossing the mobile breakpoint.
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const n = visibleCount();
      if (n !== count) { count = n; cursor = Math.max(0, cursor - count); paint(nextSet(count)); }
    }, 200);
  });

  if (reduce || pool.length <= count) return;   // nothing to rotate

  /* ---- Gentle auto-rotation with a gold crossfade -------------------- */
  let paused = false, timer = null;
  const INTERVAL = 4200, SWAP = 560;

  const tick = () => {
    if (paused) return;
    row.classList.add("is-swapping");           // fade/lift current set out
    setTimeout(() => {
      paint(nextSet(count));                     // swap in the next set
      requestAnimationFrame(() => row.classList.remove("is-swapping")); // fade back in
    }, SWAP);
  };

  const start = () => { if (!timer) timer = setInterval(tick, INTERVAL); };
  const stop = () => { clearInterval(timer); timer = null; };

  row.addEventListener("mouseenter", () => { paused = true; });
  row.addEventListener("mouseleave", () => { paused = false; });
  document.addEventListener("visibilitychange", () => { paused = document.hidden; });

  // Only rotate while the deck is on screen.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { e.isIntersecting ? start() : stop(); });
    }, { threshold: 0.15 });
    io.observe(row);
  } else {
    start();
  }
};
