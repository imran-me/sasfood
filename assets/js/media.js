/* ============================================================================
   media.js — Image URL resolver (Google Drive links + safe fallbacks)
   ----------------------------------------------------------------------------
   The site is hosted as static files on GitHub Pages (no backend), so the
   easiest way for the client to publish a product photo WITHOUT committing the
   file to the repo is to paste a Google Drive "share" link. Drive share links
   are NOT directly embeddable, so we rewrite them into a direct-view URL that
   any visitor's browser can load.

   Supported inputs (all resolved to a hot-link-able image URL):
     - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
     - https://drive.google.com/open?id=FILE_ID
     - https://drive.google.com/uc?id=FILE_ID&export=view
     - https://docs.google.com/.../d/FILE_ID/...
     - a bare Drive FILE_ID (25+ char token)
     - any normal https URL or local repo path -> returned unchanged

   IMPORTANT for the client: the Drive file must be shared as
   "Anyone with the link – Viewer", otherwise browsers can't load it.

   Exposed as window.MEDIA.resolveImg(url).
   ========================================================================== */
(function () {
  // Pull a Drive file id out of any of the common Drive URL shapes.
  function driveId(url) {
    if (!url) return "";
    let m =
      url.match(/\/d\/([a-zA-Z0-9_-]{20,})/) ||           // /file/d/ID/ or /d/ID
      url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);            // ?id=ID / &id=ID
    if (m) return m[1];
    // A bare id pasted on its own.
    if (/^[a-zA-Z0-9_-]{25,}$/.test(url.trim())) return url.trim();
    return "";
  }

  function resolveImg(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";
    if (/drive\.google\.com|docs\.google\.com/.test(raw) || /^[a-zA-Z0-9_-]{25,}$/.test(raw)) {
      const id = driveId(raw);
      // lh3 thumbnail host hot-links reliably and supports a sizing hint.
      if (id) return `https://lh3.googleusercontent.com/d/${id}=w1200`;
    }
    return raw; // normal URL or local path — leave as-is
  }

  // True when a string looks like (or is) a Google Drive reference.
  function isDrive(url) {
    return /drive\.google\.com|docs\.google\.com/.test(String(url || "")) ||
           /^[a-zA-Z0-9_-]{25,}$/.test(String(url || "").trim());
  }

  window.MEDIA = { resolveImg, driveId, isDrive };
})();
