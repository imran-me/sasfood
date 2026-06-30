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
    categories: "sas_categories",
    countries: "sas_countries",
    // Bump this version to force a re-seed when the seed data / config changes
    // (e.g. real contact details were added from the company letterhead).
    seeded: "sas_seeded_v3",
  };

  // Default category + country seeds (used on first run and "Reset demo data").
  // Countries carry real lat/lng so the world map can place them geographically.
  const SEED_CATEGORIES = ["Rice", "Oil", "Palm Oil", "Fruits", "Spices", "Sugar"]
    .map((name, i) => ({ id: `c${i + 1}`, name, order: i + 1 }));

  const SEED_COUNTRIES = [
    { name: "Dubai (UAE)", code: "AE", flag: "🇦🇪", lat: 25.20, lng: 55.27, hub: true,  order: 1 },
    { name: "Qatar",       code: "QA", flag: "🇶🇦", lat: 25.29, lng: 51.53, hub: false, order: 2 },
    { name: "India",       code: "IN", flag: "🇮🇳", lat: 20.59, lng: 78.96, hub: false, order: 3 },
    { name: "Bangladesh",  code: "BD", flag: "🇧🇩", lat: 23.68, lng: 90.36, hub: false, order: 4 },
    { name: "Iraq",        code: "IQ", flag: "🇮🇶", lat: 33.22, lng: 43.68, hub: false, order: 5 },
    { name: "South Africa",code: "ZA", flag: "🇿🇦", lat: -30.56, lng: 22.94, hub: false, order: 6 },
  ].map((c, i) => ({ id: `co${i + 1}`, emblem: "", active: true, ...c }));

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

  // Mirror a mutation to the cloud (Firestore) if firebase.js is configured.
  // Fire-and-forget + guarded, so the site works identically with no backend.
  const mirror = (kind, action, payload) => {
    try { if (window.SASCloud && window.SASCloud.enabled) window.SASCloud.mirror(kind, action, payload); }
    catch (_) { /* never let cloud sync break a local save */ }
  };

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

    // Categories + countries (admin-managed content).
    write(KEYS.categories, SEED_CATEGORIES);
    write(KEYS.countries, SEED_COUNTRIES);

    // Settings mirror config.js (admin can override these live).
    const c = window.SITE_CONFIG || {};
    write(KEYS.settings, {
      whatsapp: c.whatsapp || "",
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      mapUrl: c.mapUrl || "",
      hours: c.hours || "",
      emblem: c.emblem || "assets/img/brand/logo.png", // brand mark used site-wide
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
    mirror("products", "set", p);
    return p;
  }

  function deleteProduct(id) {
    write(KEYS.products, getProducts().filter((p) => p.id !== id));
    mirror("products", "del", { id });
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
    mirror("ads", "set", a);
    return a;
  }

  function deleteAd(id) {
    write(KEYS.ads, getAds().filter((a) => a.id !== id));
    mirror("ads", "del", { id });
  }

  /* ---- Inquiries ------------------------------------------------------ */
  function getInquiries() { ready(); return read(KEYS.inquiries, []); }

  function addInquiry(q) {
    const list = getInquiries();
    const rec = { id: uid("q"), status: "new", createdAt: Date.now(), ...q };
    list.unshift(rec);
    write(KEYS.inquiries, list);
    mirror("inquiries", "set", rec);
    return rec;
  }

  function updateInquiry(id, patch) {
    const list = getInquiries();
    const i = list.findIndex((q) => q.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...patch }; write(KEYS.inquiries, list); mirror("inquiries", "set", list[i]); }
  }

  function deleteInquiry(id) {
    write(KEYS.inquiries, getInquiries().filter((q) => q.id !== id));
    mirror("inquiries", "del", { id });
  }

  /* ---- Settings ------------------------------------------------------- */
  function getSettings() { ready(); return read(KEYS.settings, {}); }

  function saveSettings(patch) {
    const cur = getSettings();
    const next = { ...cur, ...patch, socials: { ...(cur.socials || {}), ...(patch.socials || {}) } };
    write(KEYS.settings, next);
    mirror("settings", "set", next);
    return next;
  }

  /* ---- Categories ----------------------------------------------------- */
  function getCategories() { ready(); return read(KEYS.categories, []); }

  function saveCategory(cat) {
    const list = getCategories();
    if (cat.id) {
      const i = list.findIndex((x) => x.id === cat.id);
      if (i >= 0) list[i] = { ...list[i], ...cat }; else list.push(cat);
    } else {
      cat.id = uid("c");
      cat.order = list.length + 1;
      list.push(cat);
    }
    write(KEYS.categories, list);
    mirror("categories", "set", cat);
    return cat;
  }

  function deleteCategory(id) {
    write(KEYS.categories, getCategories().filter((c) => c.id !== id));
    mirror("categories", "del", { id });
  }

  // Convenience: plain ["Rice","Oil",…] in display order (used by renderers).
  function getCategoryNames() {
    return getCategories().sort((a, b) => (a.order || 0) - (b.order || 0)).map((c) => c.name);
  }

  /* ---- Countries (operating markets, with geo + flag/emblem) ---------- */
  function getCountries() { ready(); return read(KEYS.countries, []); }

  function saveCountry(co) {
    const list = getCountries();
    if (co.id) {
      const i = list.findIndex((x) => x.id === co.id);
      if (i >= 0) list[i] = { ...list[i], ...co }; else list.push(co);
    } else {
      co.id = uid("co");
      co.order = list.length + 1;
      list.push(co);
    }
    write(KEYS.countries, list);
    mirror("countries", "set", co);
    return co;
  }

  function deleteCountry(id) {
    write(KEYS.countries, getCountries().filter((c) => c.id !== id));
    mirror("countries", "del", { id });
  }

  /* ---- Export (commit these files to GitHub to publish for everyone) -- */
  // Regenerate assets/data/products.js from the current (admin-edited) store.
  function exportProductsFile() {
    const products = getProducts();
    return "/* ============================================================================\n" +
      "   products.js (DATA) — Product catalogue\n" +
      "   ----------------------------------------------------------------------------\n" +
      "   AUTO-GENERATED by the Admin panel (\"Export catalogue\").\n" +
      "   Commit this file to GitHub to publish your changes for every visitor.\n" +
      "   ========================================================================== */\n\n" +
      "window.PRODUCTS = " + JSON.stringify(products, null, 2) + ";\n";
  }

  // A single JSON snapshot of everything (products, categories, countries,
  // settings, ads) — handy as a backup or to seed a future backend.
  function exportAll() {
    return JSON.stringify({
      products: getProducts(),
      categories: getCategories(),
      countries: getCountries(),
      ads: getAds(),
      settings: getSettings(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /* ---- Reset (admin demo helper) ------------------------------------- */
  function resetAll() {
    Object.values(KEYS).forEach((k) => { if (typeof k === "string") localStorage.removeItem(k); });
    ready();
  }

  window.Store = {
    KEYS, ready, resetAll,
    getProducts, saveProduct, deleteProduct,
    getAds, saveAd, deleteAd,
    getInquiries, addInquiry, updateInquiry, deleteInquiry,
    getSettings, saveSettings,
    getCategories, getCategoryNames, saveCategory, deleteCategory,
    getCountries, saveCountry, deleteCountry,
    exportProductsFile, exportAll,
  };
})();
