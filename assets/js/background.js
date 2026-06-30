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

  // The masked SVG monument silhouettes were replaced by real GOLDEN, TRANSPARENT
  // art: a cinematic Dubai scene behind the hero (.bg-scene) plus these faint,
  // floating accents (Burj / camels / panorama) that fade in per section. All are
  // heavily feathered + low-opacity so they enrich without ever competing.
  const DIR = "assets/img/scenes/";
  // Golden monument vectors at the LEFT / RIGHT edge of successive sections,
  // alternating sides — and they SCROLL WITH THE PAGE (each is a child of its
  // section, not the fixed stage). They peek in from the edge and fade up as the
  // section enters view: camel first (hero), then Burj, museum, … one by one.
  const SIDE_ACCENTS = [
    { section: "hero",         file: "camel.webp",  side: "right", w: 34, y: 66, op: 0.18 },
    { section: "trust",        file: "burj.webp",   side: "left",  w: 17, y: 52, op: 0.16 },
    { section: "products",     file: "museum.webp", side: "right", w: 34, y: 38, op: 0.15 },
    { section: "about",        file: "burj.webp",   side: "left",  w: 19, y: 56, op: 0.16 },
    { section: "capabilities", file: "camel.webp",  side: "right", w: 30, y: 56, op: 0.15 },
    { section: "markets",      file: "museum.webp", side: "left",  w: 34, y: 60, op: 0.15 },
    { section: "cta",          file: "burj.webp",   side: "right", w: 19, y: 55, op: 0.16 },
    { section: "contact",      file: "camel.webp",  side: "left",  w: 32, y: 60, op: 0.16 },
  ];

  const used = new Set();
  const placed = [];
  SIDE_ACCENTS.forEach((a) => {
    let host = null;
    document.querySelectorAll(`[data-bg-section="${a.section}"]`).forEach((h) => {
      if (!host && !used.has(h)) host = h;
    });
    if (!host) return;
    used.add(host);
    const el = document.createElement("div");
    el.className = `side-accent ${a.side}`;
    el.setAttribute("aria-hidden", "true");
    Object.assign(el.style, {
      width: a.w + "vmin",
      height: (a.w * 0.82) + "vmin",
      top: a.y + "%",
      backgroundImage: `url(${DIR}${a.file})`,
    });
    el.style.setProperty("--acc-op", a.op);
    host.appendChild(el);
    placed.push(el);
  });

  if (reduce) {
    placed.forEach((el) => el.classList.add("is-in"));
  } else if ("IntersectionObserver" in window && placed.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-in"); });
    }, { threshold: 0.12 });
    placed.forEach((el) => io.observe(el));
  } else {
    placed.forEach((el) => el.classList.add("is-in"));
  }

  // Signature drifting golden "sand" particles on top of everything.
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
