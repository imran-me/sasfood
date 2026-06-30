/* ============================================================================
   background.js — The signature Dubai animated-monument background
   ----------------------------------------------------------------------------
   Builds the layered silhouette stage, a drifting sand-particle canvas, 3-depth
   parallax on scroll, and per-section motif fade-in. Monuments are SVG files in
   assets/img/silhouettes/ applied as CSS masks so we can tint them gold/green.

   Performance: transform/opacity only (GPU), rAF-throttled scroll, particles
   paused when the tab is hidden. Fully disabled under prefers-reduced-motion
   (a tasteful static arrangement is shown instead — handled by CSS .is-in).

   The mapping below decides WHICH monument appears in WHICH section.
   Each section element should carry a data-bg-section="hero|about|..." attr.
   ========================================================================== */

window.initBackground = function initBackground() {
  const stage = document.querySelector(".bg-stage");
  if (!stage) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // NOTE: the masked SVG monument silhouettes (camel, Burj, dhow, …) were
  // replaced by the cinematic golden Dubai photograph — see
  // sections/background.html (.bg-scene) + background.css. The photo carries the
  // Dubai story now; here we keep only the drifting golden "sand" particles
  // layered on top for the signature moving-gold-dust effect.
  if (!reduce) initParticles(stage);
};

/* Lightweight gold particle field on a <canvas>. */
function initParticles(stage) {
  const canvas = document.createElement("canvas");
  canvas.className = "bg-particles";
  canvas.setAttribute("aria-hidden", "true");
  stage.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let w, h, dots = [], raf, running = true;

  const isSmall = () => window.innerWidth < 768;

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = isSmall() ? 26 : 60; // fewer particles on mobile
    dots = Array.from({ length: count }, (_, i) => ({
      x: ((i * 97) % w),
      y: ((i * 53) % h),
      r: 0.6 + (i % 5) * 0.25,
      sx: 0.1 + (i % 4) * 0.05,
      sy: 0.05 + (i % 3) * 0.04,
    }));
  };
  resize();
  window.addEventListener("resize", resize);

  const draw = () => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(201,162,75,0.5)";
    dots.forEach((d) => {
      d.x += d.sx; d.y -= d.sy;
      if (d.x > w) d.x = 0;
      if (d.y < 0) d.y = h;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  };
  draw();

  // Pause when tab hidden (perf).
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) draw(); else cancelAnimationFrame(raf);
  });
}
