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
  const DIR = "assets/img/silhouettes/";

  // depth: 0.15 (back) | 0.4 (mid) | 0.7 (front)
  // pos: percentage placement; size in vmin; op: target opacity (.08–.18)
  const MONUMENTS = [
    { file: "burj-khalifa.svg",  section: "hero",     depth: 0.4,  x: 80, y: 20, size: 46, op: 0.16, float: true },
    { file: "dubai-skyline.svg", section: "hero",     depth: 0.15, x: 50, y: 72, size: 96, op: 0.12 },
    { file: "dhow.svg",          section: "about",    depth: 0.7,  x: 20, y: 60, size: 34, op: 0.14, float: true },
    { file: "falcon.svg",        section: "about",    depth: 0.4,  x: 72, y: 22, size: 22, op: 0.12, float: "slow" },
    { file: "camel.svg",         section: "trust",    depth: 0.7,  x: 60, y: 55, size: 26, op: 0.12, float: true },
    { file: "spice-lamp.svg",    section: "products", depth: 0.4,  x: 14, y: 24, size: 22, op: 0.12 },
    { file: "wheat.svg",         section: "products", depth: 0.15, x: 85, y: 60, size: 26, op: 0.10, float: "slow" },
    { file: "mosque.svg",        section: "capabilities", depth: 0.4, x: 80, y: 30, size: 34, op: 0.12 },
    { file: "crescent.svg",      section: "markets",  depth: 0.15, x: 16, y: 18, size: 16, op: 0.14, float: "slow" },
    { file: "dunes.svg",         section: "markets",  depth: 0.7,  x: 50, y: 78, size: 70, op: 0.10 },
    { file: "palm-jumeirah.svg", section: "cta",      depth: 0.4,  x: 24, y: 40, size: 30, op: 0.12, float: true },
    { file: "burj-al-arab.svg",  section: "contact",  depth: 0.4,  x: 80, y: 30, size: 38, op: 0.14, float: true },
    { file: "date-palm.svg",     section: "contact",  depth: 0.7,  x: 14, y: 60, size: 26, op: 0.12, float: "slow" },
  ];

  // Build three depth layers.
  const layers = {};
  [0.15, 0.4, 0.7].forEach((d) => {
    const l = document.createElement("div");
    l.className = "bg-layer";
    l.dataset.depth = d;
    stage.appendChild(l);
    layers[d] = l;
  });

  // Create each monument as a masked div.
  const placed = [];
  MONUMENTS.forEach((m) => {
    const el = document.createElement("div");
    el.className = "monument" + (m.float === true ? " float" : m.float === "slow" ? " float float--slow" : "");
    el.setAttribute("aria-hidden", "true");
    el.dataset.section = m.section;
    const url = `${DIR}${m.file}`;
    Object.assign(el.style, {
      left: m.x + "%",
      top: m.y + "%",
      width: m.size + "vmin",
      height: m.size + "vmin",
      transform: "translate(-50%, -50%)",
      // Tint via mask: shape from the SVG, gold/green gradient as the paint.
      background: "linear-gradient(160deg, var(--gold-500), var(--green-700))",
      WebkitMaskImage: `url(${url})`,
      maskImage: `url(${url})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskSize: "contain",
      maskSize: "contain",
      WebkitMaskPosition: "center",
      maskPosition: "center",
    });
    el.style.setProperty("--mon-opacity", m.op);
    (layers[m.depth] || layers[0.4]).appendChild(el);
    placed.push({ el, conf: m });
  });

  /* ---- Per-section fade-in (IntersectionObserver on the live sections) - */
  const showFor = (section) => {
    placed.forEach((p) => {
      if (p.conf.section === section) p.el.classList.add("is-in");
    });
  };
  // Reduced motion: reveal everything once, statically.
  if (reduce) { placed.forEach((p) => p.el.classList.add("is-in")); }
  else {
    const sections = document.querySelectorAll("[data-bg-section]");
    if ("IntersectionObserver" in window && sections.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) showFor(e.target.dataset.bgSection); });
      }, { threshold: 0.2 });
      sections.forEach((s) => io.observe(s));
    } else {
      placed.forEach((p) => p.el.classList.add("is-in")); // fallback: show all
    }
  }

  /* ---- Parallax (rAF-throttled) -------------------------------------- */
  if (!reduce) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        Object.entries(layers).forEach(([d, layer]) => {
          layer.style.transform = `translate3d(0, ${(-y * (1 - d)).toFixed(1)}px, 0)`;
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Drifting sand-particle field ---------------------------------- */
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
