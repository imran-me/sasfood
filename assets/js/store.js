/* ============================================================================
   store.js — Client-side data layer (localStorage) for the WHOLE site
   ----------------------------------------------------------------------------
   Makes the admin panel fully functional with no server: products, ads,
   inquiries and settings are persisted in the browser's localStorage and the
   public site reads from the same store, so admin edits show up live.

   First run seeds:
     - products  <- window.PRODUCTS (assets/data/products.js) — 10 samples
     - ads       <- one sample hero banner
     - settings  <- window.SITE_CONFIG (assets/js/config.js)
     - inquiries <- [] (filled by the contact form)

   >>> PHASE 8 (Firebase): keep this same public API but back each method with
       Firestore/Storage instead of localStorage. Nothing else needs to change.

   Public API (window.Store):
     Store.ready()                       -> ensure seeded (call once on load)
     Store.getProducts() / saveProduct(p) / deleteProduct(id)
     Store.getAds()      / saveAd(a)      / deleteAd(id)
     Store.getInquiries()/ addInquiry(q)  / updateInquiry(id, patch) / deleteInquiry(id)
     Store.getSettings() / saveSettings(patch)
     Store.resetAll()                     -> wipe + re-seed (admin "reset demo")
   ========================================================================== */

(function () {
  const KEYS = {
    products: "sas_products",
    ads: "sas_ads",
    inquiries: "sas_inquiries",
    settings: "sas_settings",
    // Bump this version to force a re-seed when the seed data / config changes
    // (e.g. real contact details were added from the company letterhead).
    seeded: "sas_seeded_v2",
  };

  /* ---- low-level helpers --------------------------------------------- */
  const read = (k, fallback) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
    catch (_) { return fallback; }
  };
  const write = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { console.error("[store] write failed", k, e); return false; }
  };
  const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e4)}`;

  /* ---- seeding -------------------------------------------------------- */
  function ready() {
    if (localStorage.getItem(KEYS.seeded)) return;

    // Products from the data file (each item gets a stable id if missing).
    const seedProducts = (window.PRODUCTS || []).map((p, i) => ({
      id: p.id || `p${i + 1}`,
      ...p,
    }));
    write(KEYS.products, seedProducts);

    // One sample ad/banner.
    write(KEYS.ads, [{
      id: uid("ad"),
      title: "Bulk Basmati — New Crop Available",
      image: "assets/img/products/basmati.jpg",
      caption: "Fresh-season 1121 basmati, export-graded. Ask for FOB/CIF terms.",
      ctaType: "whatsapp",
      ctaValue: "",
      placement: "hero",
      active: true,
      order: 1,
      startDate: "",
      endDate: "",
    }]);

    // Settings mirror config.js (admin can override these live).
    const c = window.SITE_CONFIG || {};
    write(KEYS.settings, {
      whatsapp: c.whatsapp || "",
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      mapUrl: c.mapUrl || "",
      hours: c.hours || "",
      socials: { ...(c.socials || {}) },
    });

    if (!localStorage.getItem(KEYS.inquiries)) write(KEYS.inquiries, []);
    localStorage.setItem(KEYS.seeded, "1");
  }

  /* ---- Products ------------------------------------------------------- */
  function getProducts() { ready(); return read(KEYS.products, []); }

  function saveProduct(p) {
    const list = getProducts();
    if (p.id) {                                   // update
      const i = list.findIndex((x) => x.id === p.id);
      if (i >= 0) list[i] = { ...list[i], ...p, updatedAt: Date.now() };
      else list.push({ ...p, updatedAt: Date.now() });
    } else {                                      // create
      p.id = uid("p");
      p.createdAt = Date.now();
      list.push(p);
    }
    write(KEYS.products, list);
    return p;
  }

  function deleteProduct(id) {
    write(KEYS.products, getProducts().filter((p) => p.id !== id));
  }

  /* ---- Ads ------------------------------------------------------------ */
  function getAds() { ready(); return read(KEYS.ads, []); }

  function saveAd(a) {
    const list = getAds();
    if (a.id) {
      const i = list.findIndex((x) => x.id === a.id);
      if (i >= 0) list[i] = { ...list[i], ...a };
      else list.push(a);
    } else {
      a.id = uid("ad");
      list.push(a);
    }
    write(KEYS.ads, list);
    return a;
  }

  function deleteAd(id) { write(KEYS.ads, getAds().filter((a) => a.id !== id)); }

  /* ---- Inquiries ------------------------------------------------------ */
  function getInquiries() { ready(); return read(KEYS.inquiries, []); }

  function addInquiry(q) {
    const list = getInquiries();
    const rec = { id: uid("q"), status: "new", createdAt: Date.now(), ...q };
    list.unshift(rec);
    write(KEYS.inquiries, list);
    return rec;
  }

  function updateInquiry(id, patch) {
    const list = getInquiries();
    const i = list.findIndex((q) => q.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...patch }; write(KEYS.inquiries, list); }
  }

  function deleteInquiry(id) {
    write(KEYS.inquiries, getInquiries().filter((q) => q.id !== id));
  }

  /* ---- Settings ------------------------------------------------------- */
  function getSettings() { ready(); return read(KEYS.settings, {}); }

  function saveSettings(patch) {
    const cur = getSettings();
    const next = { ...cur, ...patch, socials: { ...(cur.socials || {}), ...(patch.socials || {}) } };
    write(KEYS.settings, next);
    return next;
  }

  /* ---- Reset (admin demo helper) ------------------------------------- */
  function resetAll() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    ready();
  }

  window.Store = {
    KEYS, ready, resetAll,
    getProducts, saveProduct, deleteProduct,
    getAds, saveAd, deleteAd,
    getInquiries, addInquiry, updateInquiry, deleteInquiry,
    getSettings, saveSettings,
  };
})();
