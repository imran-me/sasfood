/* ============================================================================
   cursor.js — Custom gold ring cursor (desktop / fine-pointer only)
   ----------------------------------------------------------------------------
   Disabled on touch devices and under prefers-reduced-motion (handled in CSS;
   we also bail early here to avoid attaching listeners).
   ========================================================================== */

window.initCursor = function initCursor() {
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduce) return;

  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(ring);

  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;

  window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });

  // Smooth follow via rAF (lerp).
  (function loop() {
    x += (tx - x) * 0.2;
    y += (ty - y) * 0.2;
    ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  // Grow on interactive elements.
  const interactive = "a, button, .pill, .product-card, input, textarea, select, [role='button']";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactive)) ring.classList.add("is-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactive)) ring.classList.remove("is-hover");
  });
};
