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

  // Apply any admin Settings overrides onto SITE_CONFIG (mutate in place so the
  // reference cached by cta-helper.js stays valid). Only non-empty values win.
  if (window.Store && window.SITE_CONFIG) {
    const s = window.Store.getSettings();
    ["whatsapp", "email", "phone", "address", "mapUrl", "hours"].forEach((k) => {
      if (s[k]) window.SITE_CONFIG[k] = s[k];
    });
    if (s.socials) window.SITE_CONFIG.socials = { ...window.SITE_CONFIG.socials, ...s.socials };
  }

  populateConfig();
  renderMarketChips();
  renderStats();
  renderCerts();

  // Wire every static [data-cta] link/button on the page.
  window.CTA && window.CTA.wireDataAttrs(document);

  // Behaviour / animation modules (guard each — they may not exist on a page).
  [
    "initPreloader", "initNav", "initCursor", "initReveal",
    "initCounters", "initBackground", "initProducts", "initContact",
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
    else if (key === "phone2") href = `tel:${(c.phone2 || "").replace(/\s+/g, "")}`;
    else if (key === "map") href = c.mapUrl || "#";
    else if (key === "instagram") href = c.socials?.instagram || "#";
    else if (key === "linkedin") href = c.socials?.linkedin || "#";
    el.setAttribute("href", href);
    if (key === "whatsapp" || key === "map" || key.match(/instagram|linkedin/)) {
      el.target = "_blank"; el.rel = "noopener";
    }
  });

  // Current year wherever needed.
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---- Market flag chips (hero, CTA band, footer) --------------------- */
function renderMarketChips() {
  const markets = (window.SITE_CONFIG || {}).markets || [];
  document.querySelectorAll("[data-markets]").forEach((host) => {
    const asDots = host.hasAttribute("data-markets-dots");
    host.insertAdjacentHTML("beforeend", markets.map((m) =>
      asDots
        ? `<li><span class="flag">${m.flag}</span> ${m.name}</li>`
        : `<span class="chip"><span class="flag">${m.flag}</span> ${m.name}</span>`
    ).join(""));
  });
}

/* ---- Trust-strip stats ---------------------------------------------- */
function renderStats() {
  const stats = (window.SITE_CONFIG || {}).stats || [];
  const host = document.querySelector("[data-stats]");
  if (!host) return;
  host.innerHTML = stats.map((s) => `
    <div class="stat" data-reveal>
      <div class="num"><span data-count="${s.value}" data-suffix="${s.suffix || ""}">0</span></div>
      <div class="label">${s.label}</div>
    </div>`).join("");
}

/* ---- Certification chips -------------------------------------------- */
function renderCerts() {
  const certs = ((window.SITE_CONFIG || {}).certs || []).filter((c) => c.show);
  const host = document.querySelector("[data-certs]");
  if (!host) return;
  if (!certs.length) { host.remove(); return; }
  host.innerHTML = certs.map((c) => `<span class="chip">✓ ${c.label}</span>`).join("");
}

/* ---- Smooth scroll: Lenis if present, else native ------------------- */
function initSmoothScroll() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && window.Lenis) {
    const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    window.__lenis = lenis;
  }
  // In-page anchor smoothing (works with or without Lenis).
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (window.__lenis) window.__lenis.scrollTo(target, { offset: -80 });
    else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });
}
