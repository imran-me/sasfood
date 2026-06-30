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
  const ACCENTS = [
    { file: "panorama.webp", section: "about",   x: 78, y: 64, w: 62, op: 0.13, float: "slow" },
    { file: "camels.webp",   section: "products", x: 18, y: 72, w: 44, op: 0.14, float: true },
    { file: "burj.webp",     section: "markets",  x: 86, y: 52, w: 30, op: 0.16, float: "slow" },
    { file: "panorama.webp", section: "cta",      x: 50, y: 76, w: 80, op: 0.12, float: "slow" },
    { file: "camels.webp",   section: "contact",  x: 80, y: 70, w: 40, op: 0.13, float: true },
  ];

  const placed = [];
  ACCENTS.forEach((a) => {
    const el = document.createElement("div");
    el.className = "bg-accent" + (a.float === true ? " float" : a.float === "slow" ? " float float--slow" : "");
    el.setAttribute("aria-hidden", "true");
    el.dataset.section = a.section;
    Object.assign(el.style, {
      left: a.x + "%",
      top: a.y + "%",
      width: a.w + "vmin",
      height: a.w * 0.7 + "vmin",
      transform: "translate(-50%, -50%)",
      backgroundImage: `url(${DIR}${a.file})`,
    });
    el.style.setProperty("--acc-op", a.op);
    stage.appendChild(el);
    placed.push({ el, section: a.section });
  });

  const showFor = (s) => placed.forEach((p) => { if (p.section === s) p.el.classList.add("is-in"); });
  if (reduce) {
    placed.forEach((p) => p.el.classList.add("is-in"));
  } else {
    const secs = document.querySelectorAll("[data-bg-section]");
    if ("IntersectionObserver" in window && secs.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) showFor(e.target.dataset.bgSection); });
      }, { threshold: 0.18 });
      secs.forEach((s) => io.observe(s));
    } else {
      placed.forEach((p) => p.el.classList.add("is-in"));
    }
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
