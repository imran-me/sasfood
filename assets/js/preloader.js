/* ============================================================================
   preloader.js — Gold-emblem preloader with a shimmer sweep
   ----------------------------------------------------------------------------
   Fades out to reveal the hero. Hard cap of 1.2s so it never blocks the page.
   ========================================================================== */

window.initPreloader = function initPreloader() {
  const el = document.querySelector(".preloader");
  if (!el) return;

  const done = () => el.classList.add("is-done");

  // Hide as soon as the window finishes loading...
  window.addEventListener("load", () => setTimeout(done, 300));
  // ...but never wait longer than 1.2s regardless.
  setTimeout(done, 1200);

  // Remove from the a11y tree / DOM after it has faded.
  el.addEventListener("transitionend", () => {
    if (el.classList.contains("is-done")) el.setAttribute("aria-hidden", "true");
  });
};
