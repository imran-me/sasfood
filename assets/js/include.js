/* ============================================================================
   include.js — Tiny HTML partial loader
   ----------------------------------------------------------------------------
   Lets us keep every page section in its OWN file under /sections and compose
   pages from them. Any element with [data-include="sections/hero.html"] gets
   its innerHTML replaced by that file's contents.

   NOTE: uses fetch(), so the site MUST be served over HTTP during dev
   (e.g. `npx serve .`). Opening index.html via file:// will block fetch.

   Returns a Promise that resolves once ALL includes (incl. nested) are done,
   so main.js can safely initialise behaviour afterwards.
   ========================================================================== */

(function () {
  async function hydrate(root = document) {
    const nodes = Array.from(root.querySelectorAll("[data-include]"));
    if (!nodes.length) return;

    await Promise.all(nodes.map(async (el) => {
      const url = el.getAttribute("data-include");
      try {
        const res = await fetch(url, { cache: "no-cache" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        el.innerHTML = await res.text();
        el.removeAttribute("data-include");
        // Support nested includes inside a freshly-loaded partial.
        await hydrate(el);
      } catch (err) {
        console.error(`[include] Failed to load ${url}:`, err);
        el.innerHTML =
          `<!-- include failed: ${url} — are you serving over HTTP? -->`;
      }
    }));
  }

  // Expose and also kick off automatically on DOM ready.
  window.Includes = { hydrate };
  window.__includesReady = new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", async () => {
      await hydrate(document);
      resolve();
    });
  });
})();
