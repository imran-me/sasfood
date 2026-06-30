/* ============================================================================
   img-fallback.js — Elegant placeholder for any image that fails to load
   ----------------------------------------------------------------------------
   Until the client supplies real product/brand photography, the referenced
   .jpg files don't exist. Rather than show broken-image icons, we catch image
   load errors (capture phase, so it also covers images injected later by JS)
   and swap in a branded deep-green + gold SVG placeholder built from the
   image's alt text. Decorative silhouettes/SVGs are skipped.

   Load this EARLY (before partials/products render) on every public page.
   ========================================================================== */

(function () {
  function escXml(s) {
    return String(s || "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
  }

  // Build a branded SVG data-URI placeholder labelled with the alt text.
  function makePlaceholder(label) {
    const text = escXml(String(label || "Sara Alsalam").slice(0, 42));
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>" +
        "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
          "<stop offset='0' stop-color='#0C3B2E'/><stop offset='1' stop-color='#08291E'/>" +
        "</linearGradient></defs>" +
        "<rect width='800' height='600' fill='url(%23g)'/>" +
        "<rect x='22' y='22' width='756' height='556' rx='12' fill='none' stroke='%23C9A24B' stroke-opacity='0.28' stroke-width='2'/>" +
        // wheat/emblem motif
        "<g transform='translate(400 248)' fill='none' stroke='%23C9A24B' stroke-opacity='0.55' stroke-width='4' stroke-linecap='round'>" +
          "<circle r='52'/>" +
          "<path d='M0 -28 V36 M0 -8 q-20 -4 -28 -20 M0 -8 q20 -4 28 -20 M0 8 q-20 -4 -28 -20 M0 8 q20 -4 28 -20'/>" +
        "</g>" +
        "<text x='400' y='372' text-anchor='middle' fill='%23E6C766' font-family='Georgia, serif' font-size='34'>" + text + "</text>" +
        "<text x='400' y='414' text-anchor='middle' fill='%23C9A24B' font-family='Arial, sans-serif' font-size='15' letter-spacing='4'>SARA ALSALAM</text>" +
      "</svg>";
    return "data:image/svg+xml," + svg.replace(/#/g, "%23").replace(/\s{2,}/g, " ");
  }

  function handle(img) {
    if (!img || img.tagName !== "IMG" || img.dataset.fbk) return;
    // Skip SVGs we ship (silhouettes, emblem, favicon) — those aren't "missing".
    if ((img.getAttribute("src") || "").endsWith(".svg")) return;
    img.dataset.fbk = "1";
    img.src = makePlaceholder(img.getAttribute("alt"));
  }

  // Capture phase catches resource errors that don't bubble.
  window.addEventListener("error", (e) => handle(e.target), true);

  window.ImgFallback = { makePlaceholder };
})();
