/* ============================================================================
   products.js — Render product cards, category filtering, and the detail modal
   ----------------------------------------------------------------------------
   Reads from window.PRODUCTS (assets/data/products.js). Later, swap the data
   source for a Firestore read of published products — the render code stays.

   Mounts into:
     .filter-bar      -> category pills (built from the data)
     .product-grid    -> cards
     .modal           -> detail view (created on demand)
   Each inquiry button is wired through window.CTA so links come from config.js.
   ========================================================================== */

window.initProducts = function initProducts() {
  const grid = document.querySelector(".product-grid");
  if (!grid) return;

  // Read the live catalogue from the Store (localStorage, managed by admin),
  // falling back to the seed data if the Store isn't present on this page.
  const source = window.Store ? window.Store.getProducts() : (window.PRODUCTS || []);
  const products = source.filter((p) => p.status !== "draft");
  if (!products.length && !source.length) return;
  const catNames = (window.Store && window.Store.getCategoryNames && window.Store.getCategoryNames().length)
    ? window.Store.getCategoryNames()
    : ["Rice", "Oil", "Palm Oil", "Fruits", "Spices", "Sugar"];
  const CATS = ["All", ...catNames];

  // Resolve Google-Drive share links (and bare ids) to embeddable image URLs.
  const resolveImg = (u) => (window.MEDIA ? window.MEDIA.resolveImg(u) : (u || ""));

  /* ---- Build filter pills -------------------------------------------- */
  const bar = document.querySelector(".filter-bar");
  if (bar) {
    bar.innerHTML = CATS.map((c, i) =>
      `<button class="pill${i === 0 ? " is-active" : ""}" data-filter="${c}" aria-pressed="${i === 0}">${c}</button>`
    ).join("");
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".pill");
      if (!btn) return;
      bar.querySelectorAll(".pill").forEach((p) => {
        const active = p === btn;
        p.classList.toggle("is-active", active);
        p.setAttribute("aria-pressed", String(active));
      });
      applyFilter(btn.dataset.filter);
    });
  }

  /* ---- Render cards --------------------------------------------------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const cardHTML = (p, i) => {
    const img = (p.images && p.images[0]) || { url: "", alt: p.name };
    const origins = (p.origins || []).slice(0, 2)
      .map((o) => `<span class="chip">${esc(o)}</span>`).join("");
    const packs = (p.packaging || []).slice(0, 2)
      .map((pk) => `<span class="chip">${esc(pk)}</span>`).join("");
    return `
    <article class="card product-card ${i % 2 ? "motif-b" : ""}" data-cat="${esc(p.category)}" data-slug="${esc(p.slug)}" data-reveal>
      <div class="media">
        <span class="cat-eyebrow">${esc(p.category)}</span>
        <img src="${esc(resolveImg(img.url))}" alt="${esc(img.alt || p.name)}" loading="lazy" decoding="async">
      </div>
      <div class="body">
        <h3 class="name">${esc(p.name)}</h3>
        <p class="desc">${esc(p.shortDesc)}</p>
        <div class="meta">${origins}${packs}</div>
        <div class="card-actions">
          <a class="btn btn--whatsapp btn--sm" data-cta="whatsapp"
             data-product="${esc(p.name)}" data-packaging="${esc((p.packaging || [])[0] || "bulk")}">Inquire</a>
          <a class="btn btn--ghost btn--sm" data-cta="email" data-product="${esc(p.name)}">Email</a>
        </div>
      </div>
    </article>`;
  };

  grid.innerHTML = products.length
    ? products.map(cardHTML).join("")
    : `<p class="products-empty">No products yet — add your first to bring the showcase to life.</p>`;

  // Open modal on card body click (but not on the inquiry buttons).
  grid.addEventListener("click", (e) => {
    if (e.target.closest("[data-cta]")) return;
    const card = e.target.closest(".product-card");
    if (card) openModal(card.dataset.slug);
  });

  // Wire the freshly-rendered inquiry buttons.
  window.CTA && window.CTA.wireDataAttrs(grid);

  /* ---- Filtering ------------------------------------------------------ */
  function applyFilter(cat) {
    grid.querySelectorAll(".product-card").forEach((card) => {
      const show = cat === "All" || card.dataset.cat === cat;
      card.classList.toggle("is-hidden", !show);
    });
  }

  /* ---- Detail modal --------------------------------------------------- */
  function openModal(slug) {
    const p = products.find((x) => x.slug === slug);
    if (!p) return;
    let modal = document.querySelector(".modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      document.body.appendChild(modal);
    }
    const img = (p.images && p.images[0]) || { url: "", alt: p.name };
    const specRows = Object.entries(p.specs || {})
      .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
    const list = (arr) => (arr || []).map((x) => `<span class="chip">${esc(x)}</span>`).join("");

    modal.innerHTML = `
      <div class="modal-panel" role="document">
        <button class="modal-close" aria-label="Close">&times;</button>
        <div class="modal-grid">
          <div class="modal-gallery"><img src="${esc(resolveImg(img.url))}" alt="${esc(img.alt || p.name)}"></div>
          <div class="modal-body">
            <span class="eyebrow">${esc(p.category)}</span>
            <h3>${esc(p.name)}</h3>
            <p class="lead" style="font-size:1.05rem">${esc(p.longDesc || p.shortDesc)}</p>
            ${p.grades?.length ? `<div><strong>Varieties / Grades</strong><div class="meta" style="margin-top:.4rem">${list(p.grades)}</div></div>` : ""}
            ${p.origins?.length ? `<div><strong>Origins</strong><div class="meta" style="margin-top:.4rem">${list(p.origins)}</div></div>` : ""}
            ${p.packaging?.length ? `<div><strong>Packaging</strong><div class="meta" style="margin-top:.4rem">${list(p.packaging)}</div></div>` : ""}
            ${p.moq ? `<p><strong>MOQ:</strong> ${esc(p.moq)}</p>` : ""}
            ${specRows ? `<dl class="spec-list">${specRows}</dl>` : ""}
            <div class="modal-actions">
              <a class="btn btn--whatsapp" data-cta="whatsapp" data-product="${esc(p.name)}"
                 data-packaging="${esc((p.packaging || [])[0] || "bulk")}">Inquire on WhatsApp</a>
              <a class="btn btn--ghost" data-cta="gmail" data-product="${esc(p.name)}">Email Trade Desk</a>
            </div>
          </div>
        </div>
      </div>`;

    window.CTA && window.CTA.wireDataAttrs(modal);
    requestAnimationFrame(() => modal.classList.add("is-open"));
    document.body.style.overflow = "hidden";

    const close = () => { modal.classList.remove("is-open"); document.body.style.overflow = ""; };
    modal.querySelector(".modal-close").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", function escClose(ev) {
      if (ev.key === "Escape") { close(); document.removeEventListener("keydown", escClose); }
    });
  }

  /* ---- Deep-link: ?category=Rice or #products-Rice ------------------- */
  const params = new URLSearchParams(location.search);
  const cat = params.get("category");
  if (cat && CATS.includes(cat)) {
    const btn = bar?.querySelector(`[data-filter="${cat}"]`);
    btn && btn.click();
  }
};
