/* ============================================================================
   firebase.js — Firestore + Auth backend for the Store  (Phase 8)
   ----------------------------------------------------------------------------
   Turns the localStorage-only site into a cloud-backed one WITHOUT rewriting
   the app: it keeps localStorage as a fast synchronous cache that the renderers
   read, and syncs that cache with Firestore.

     • Public pages  -> SASCloud.pull()  loads published docs into the cache,
                        then main.js renders from it (so everyone sees the
                        latest admin edits — no more export-and-commit step).
     • Admin writes  -> store.js calls SASCloud.mirror(...) on every save/delete,
                        pushing the change up to Firestore.
     • Admin login   -> SASCloud.signIn() uses Firebase Auth so writes pass the
                        security rules (public read, admin-only write).

   Configure credentials in assets/js/firebase-config.js. If they're absent the
   whole module disables itself and the site falls back to localStorage.

   Load order (in each HTML page): the firebase-*-compat SDKs, then
   firebase-config.js, then THIS file — all AFTER store.js, BEFORE main.js.
   ========================================================================== */

window.SASCloud = (function () {
  const cfg = window.FIREBASE_CONFIG || {};
  const hasSDK = typeof window.firebase !== "undefined";
  const enabled = !!(cfg.apiKey && cfg.projectId && hasSDK);

  let db = null, auth = null;

  // Store "kind" -> Firestore collection name.
  const COLL = {
    products: "products", ads: "ads", categories: "categories",
    countries: "countries", inquiries: "inquiries", settings: "settings",
  };
  const SETTINGS_DOC = "site";  // settings live in a single document

  if (enabled) {
    try {
      firebase.initializeApp(cfg);
      db = firebase.firestore();
      auth = firebase.auth();
    } catch (e) {
      console.error("[firebase] init failed — falling back to localStorage.", e);
    }
  } else if (cfg.apiKey && !hasSDK) {
    console.warn("[firebase] config present but SDK not loaded — check the script tags.");
  } else {
    console.info("[firebase] not configured — using localStorage only.");
  }

  const KEYS = (window.Store && window.Store.KEYS) || {};
  const setLocal = (k, v) => { try { if (k) localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };

  /* ---- READ: cloud -> local cache ------------------------------------ */
  // Only overwrites a collection when the cloud actually has documents, so a
  // brand-new (empty) Firestore never wipes the local seed before first publish.
  async function pull(includePrivate = false) {
    if (!db) return false;
    const cols = [
      ["products", KEYS.products], ["ads", KEYS.ads],
      ["categories", KEYS.categories], ["countries", KEYS.countries],
    ];
    try {
      await Promise.all(cols.map(async ([kind, key]) => {
        const snap = await db.collection(COLL[kind]).get();
        if (!snap.empty) setLocal(key, snap.docs.map((d) => d.data()));
      }));
      const doc = await db.collection(COLL.settings).doc(SETTINGS_DOC).get();
      if (doc.exists) setLocal(KEYS.settings, doc.data());
    } catch (e) {
      console.error("[firebase] pull failed", e);
      return false;
    }
    // Inquiries are private (rules require auth) — only the admin reads them.
    if (includePrivate) {
      try {
        const snap = await db.collection(COLL.inquiries).orderBy("createdAt", "desc").get();
        setLocal(KEYS.inquiries, snap.docs.map((d) => d.data()));
      } catch (e) { console.warn("[firebase] inquiries read skipped", e.message); }
    }
    return true;
  }

  /* ---- WRITE: mirror one Store mutation up to Firestore --------------- */
  // Fire-and-forget — called by store.js after it updates localStorage.
  function mirror(kind, action, payload) {
    if (!db) return;
    const coll = COLL[kind];
    if (!coll) return;
    try {
      if (kind === "settings") {
        db.collection(coll).doc(SETTINGS_DOC).set(payload || {}, { merge: true });
      } else if (action === "del") {
        if (payload && payload.id) db.collection(coll).doc(String(payload.id)).delete();
      } else if (payload && payload.id) {
        db.collection(coll).doc(String(payload.id)).set(payload, { merge: true });
      }
    } catch (e) { console.error("[firebase] mirror failed", kind, action, e); }
  }

  /* ---- One-time migration: push the whole local Store to the cloud ---- */
  async function publishAll() {
    if (!db || !window.Store) return;
    const S = window.Store;
    const push = (coll, items) => Promise.all((items || [])
      .filter((it) => it && it.id)
      .map((it) => db.collection(coll).doc(String(it.id)).set(it, { merge: true })));
    await push(COLL.products, S.getProducts());
    await push(COLL.ads, S.getAds());
    await push(COLL.categories, S.getCategories());
    await push(COLL.countries, S.getCountries());
    await db.collection(COLL.settings).doc(SETTINGS_DOC).set(S.getSettings() || {}, { merge: true });
  }

  // Does the cloud already hold a published catalogue?
  async function hasData() {
    if (!db) return false;
    try { return !(await db.collection(COLL.products).limit(1).get()).empty; }
    catch (_) { return false; }
  }

  /* ---- Auth (admin only) --------------------------------------------- */
  const signIn = (email, pass) => (auth
    ? auth.signInWithEmailAndPassword(email, pass)
    : Promise.reject(new Error("Firebase not configured")));
  const signOut = () => (auth ? auth.signOut() : Promise.resolve());
  const onAuth = (cb) => { if (auth) auth.onAuthStateChanged(cb); };
  const currentUser = () => (auth ? auth.currentUser : null);

  return { enabled: !!db, pull, mirror, publishAll, hasData, signIn, signOut, onAuth, currentUser };
})();
