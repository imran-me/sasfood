/* ============================================================================
   main.js — Boot orchestrator
   ----------------------------------------------------------------------------
   Runs AFTER all HTML partials are injected (waits on window.__includesReady).
   Order matters: populate config-driven content first, then wire CTAs, then
   start behaviour/animation modules.

   Each init* function is defined in its own file and is a no-op if its target
   markup isn't on the current page — so the same main.js works on every page.
   ========================================================================== */

(async function boot() {
  // Wait for section includes (index.html). Pages without includes resolve
  // immediately because __includesReady still settles on DOMContentLoaded.
  if (window.__includesReady) { try { await window.__includesReady; } catch (_) {} }
  else { await new Promise((r) => document.addEventListener("DOMContentLoaded", r)); }

  // Make sure the local cache is seeded, then (if Firebase is configured) pull
  // the latest published catalogue/settings from Firestore into that cache so
  // the renderers below show every visitor the newest admin edits.
  if (window.Store) window.Store.ready();
  if (window.SASCloud && window.SASCloud.enabled) {
    // Never let a slow/unreachable Firestore block the whole page: race the pull
    // against a short timeout and fall back to the local cache if it's not done.
    try {
      await Promise.race([
        window.SASCloud.pull(),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);
    } catch (e) { console.error("[cloud] pull failed", e); }
  }

  // Apply any admin Settings overrides onto SITE_CONFIG (mutate in place so the
  // reference cached by cta-helper.js stays valid). Only non-empty values win.
  if (window.Store && window.SITE_CONFIG) {
    const s = window.Store.getSettings();
    ["whatsapp", "email", "phone", "address", "mapUrl", "hours", "emblem"].forEach((k) => {
      if (s[k]) window.SITE_CONFIG[k] = s[k];
    });
    if (s.socials) window.SITE_CONFIG.socials = { ...window.SITE_CONFIG.socials, ...s.socials };
  }

  applyEmblem();
  applyContent();

  populateConfig();
  renderMarketChips();
  renderStats();
  renderCerts();

  // Wire every static [data-cta] link/button on the page.
  window.CTA && window.CTA.wireDataAttrs(document);

  // Behaviour / animation modules (guard each — they may not exist on a page).
  [
    "initPreloader", "initNav", "initCursor", "initReveal",
    "initCounters", "initBackground", "initProducts", "initFeatured",
    "initHeroDeck", "initMarketsMap", "initContact",
  ].forEach((fn) => { try { window[fn] && window[fn](); } catch (e) { console.error(fn, e); } });

  initSmoothScroll();
})();

/* ---- Fill config-driven content ------------------------------------- */
// Elements opt in with:
//   data-config="email"            -> sets textContent
//   data-config-href="whatsapp"    -> sets href (wa.me / mailto / map / social)
//   data-config-attr="phone:title" -> sets an arbitrary attribute
function populateConfig() {
  const c = window.SITE_CONFIG || {};
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), c);

  document.querySelectorAll("[data-config]").forEach((el) => {
    const v = get(el.getAttribute("data-config"));
    if (v != null) el.textContent = v;
  });

  document.querySelectorAll("[data-config-href]").forEach((el) => {
    const key = el.getAttribute("data-config-href");
    let href = "#";
    if (key === "whatsapp") href = window.CTA.whatsappUrl({});
    else if (key === "email") href = window.CTA.mailtoUrl({});
    else if (key === "phone") href = `tel:${(c.phone || "").replace(/\s+/g, "")}`;
    else if (key === "map") href = c.mapUrl || "#";
    else if (key === "instagram") href = c.socials?.instagram || "#";
    else if (key === "facebook") href = c.socials?.facebook || "#";
    else if (key === "linkedin") href = c.socials?.linkedin || "#";
    el.setAttribute("href", href);
    // Hide social links that are still unset ({PLACEHOLDER} or empty).
    if (key.match(/instagram|facebook|linkedin/) && (href === "#" || /^\{.*\}$/.test(href))) {
      el.style.display = "none";
    }
    if (key === "whatsapp" || key === "map" || key.match(/instagram|facebook|linkedin/)) {
      el.target = "_blank"; el.rel = "noopener";
    }
  });

  // Current year wherever needed.
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---- Editable section content (admin "Content" tab) -----------------
   Any element with data-content="key" has its text replaced by the matching
   admin-saved value; data-content-src="key" swaps an <img> source. If a value
   is blank/unset the committed default in the HTML is kept, so the site always
   reads well even before the client edits anything. */
function applyContent() {
  const s = (window.Store && window.Store.getSettings && window.Store.getSettings()) || {};
  const content = s.content || {};
  document.querySelectorAll("[data-content]").forEach((el) => {
    const v = content[el.getAttribute("data-content")];
    if (v != null && String(v).trim() !== "") el.textContent = v;
  });
  document.querySelectorAll("[data-content-src]").forEach((el) => {
    const v = content[el.getAttribute("data-content-src")];
    if (v && String(v).trim() !== "") el.src = window.MEDIA ? window.MEDIA.resolveImg(v) : v;
  });
}

/* ---- Brand emblem (admin Branding tab overrides the committed logo) -- */
function applyEmblem() {
  const c = window.SITE_CONFIG || {};
  if (!c.emblem) return;
  const src = window.MEDIA ? window.MEDIA.resolveImg(c.emblem) : c.emblem;
  // Header/footer brand mark + preloader emblem.
  document.querySelectorAll(".brand .mark, .preloader .emblem").forEach((img) => {
    img.src = src;
  });
}

/* ---- Market flag chips (hero, CTA band, footer) --------------------- */
// Source of truth = admin-managed Countries (active), falling back to config.
function renderMarketChips() {
  let markets = [];
  if (window.Store && window.Store.getCountries) {
    markets = window.Store.getCountries()
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((c) => ({ name: c.name.replace(/\s*\(.*\)$/, ""), flag: c.flag || "" }));
  }
  if (!markets.length) markets = (window.SITE_CONFIG || {}).markets || [];

  const LIMIT = 10;   // show at most 10 publicly; the rest live behind "See all"
  const chip = (m, dots) => dots
    ? `<li><span class="flag">${m.flag}</span> ${m.name}</li>`
    : `<span class="chip"><span class="flag">${m.flag}</span> ${m.name}</span>`;

  document.querySelectorAll("[data-markets]").forEach((host) => {
    const asDots = host.hasAttribute("data-markets-dots");
    let html = markets.slice(0, LIMIT).map((m) => chip(m, asDots)).join("");
    if (markets.length > LIMIT) {
      html += asDots
        ? `<li><button type="button" class="see-all-markets">See all ${markets.length} &rarr;</button></li>`
        : `<button type="button" class="see-all-markets chip chip--more">See all ${markets.length} &rarr;</button>`;
    }
    host.insertAdjacentHTML("beforeend", html);
  });

  document.querySelectorAll(".see-all-markets").forEach((b) =>
    b.addEventListener("click", () => openMarketsModal(markets)));
}

/* A simple luxe modal listing every operating country (opened by "See all"). */
function openMarketsModal(markets) {
  let modal = document.querySelector(".markets-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "markets-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    document.body.appendChild(modal);
  }
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  modal.innerHTML = `
    <div class="mm-panel" role="document">
      <button class="mm-close" aria-label="Close">&times;</button>
      <p class="eyebrow">Where We Operate</p>
      <h3>${markets.length} Markets &amp; Growing</h3>
      <ul class="mm-list" role="list">
        ${markets.map((m) => `<li><span class="flag">${m.flag}</span> ${esc(m.name)}</li>`).join("")}
      </ul>
    </div>`;
  requestAnimationFrame(() => modal.classList.add("is-open"));
  document.body.style.overflow = "hidden";
  const close = () => { modal.classList.remove("is-open"); document.body.style.overflow = ""; };
  modal.querySelector(".mm-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", function esc2(ev) {
    if (ev.key === "Escape") { close(); document.removeEventListener("keydown", esc2); }
  });
}

/* ---- Trust-strip stats ---------------------------------------------- */
function renderStats() {
  const stats = (window.SITE_CONFIG || {}).stats || [];
  const host = document.querySelector("[data-stats]");
  if (!host) return;
  // The "Markets" counter is LIVE: it counts the active operating countries the
  // client manages in Admin, so adding a country bumps this number automatically.
  let marketCount = 0;
  if (window.Store && window.Store.getCountries) {
    marketCount = window.Store.getCountries().filter((c) => c.active !== false).length;
  }
  host.innerHTML = stats.map((s) => {
    const isMarkets = /market/i.test(s.label);
    const value = (isMarkets && marketCount) ? marketCount : s.value;
    return `
    <div class="stat" data-reveal>
      <div class="num"><span data-count="${value}" data-suffix="${s.suffix || ""}">0</span></div>
      <div class="label">${s.label}</div>
    </div>`;
  }).join("");
}

/* ---- Certification chips -------------------------------------------- */
function renderCerts() {
  const certs = ((window.SITE_CONFIG || {}).certs || []).filter((c) => c.show);
  const host = document.querySelector("[data-certs]");
  if (!host) return;
  if (!certs.length) { host.remove(); return; }
  host.innerHTML = certs.map((c) => `<span class="chip">✓ ${c.label}</span>`).join("");
}

/* ---- Smooth scroll: native only ------------------------------------
   We deliberately do NOT use a JS smooth-scroll library (e.g. Lenis): it
   hijacks the mouse wheel (preventDefault) which made desktop scrolling feel
   stuck / unresponsive. Native scrolling + `html { scroll-behavior: smooth }`
   (base.css) is reliable on every device and respects reduced-motion. */
function initSmoothScroll() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // In-page anchor smoothing (header is ~80px tall, so offset the target).
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  });
}
