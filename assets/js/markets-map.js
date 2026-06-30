/* ============================================================================
   markets-map.js — Plot operating countries on the equirectangular world map
   ----------------------------------------------------------------------------
   The map SVG (sections/markets.html) uses degree-space:
     viewBox 0 0 360 180  →  x = lng + 180,  y = 90 - lat.
   So this module can place every admin-managed country GEOGRAPHICALLY, draw a
   glowing gold pin, and arc an animated trade-route line from the Dubai hub to
   each market. Add a country in Admin → Countries and it appears here on reload.
   ========================================================================== */

window.initMarketsMap = function initMarketsMap() {
  const svg = document.querySelector(".markets svg.world");
  if (!svg) return;

  const routesG = svg.querySelector(".routes");
  const pinsG = svg.querySelector(".pins");
  if (!routesG || !pinsG) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Projection: lng/lat -> map coordinates.
  const px = (lng) => lng + 180;
  const py = (lat) => 90 - lat;

  // Live countries from the Store (fallback to a sensible default set).
  let countries = (window.Store && window.Store.getCountries)
    ? window.Store.getCountries().filter((c) => c.active !== false)
    : [];
  if (!countries.length) {
    countries = [
      { name: "Dubai (UAE)", lat: 25.2, lng: 55.27, hub: true },
      { name: "Qatar", lat: 25.29, lng: 51.53 },
      { name: "India", lat: 20.59, lng: 78.96 },
      { name: "Bangladesh", lat: 23.68, lng: 90.36 },
      { name: "Iraq", lat: 33.22, lng: 43.68 },
      { name: "South Africa", lat: -30.56, lng: 22.94 },
    ];
  }
  countries = countries.filter((c) => isFinite(c.lat) && isFinite(c.lng));

  const hub = countries.find((c) => c.hub) || countries[0];
  if (!hub) return;
  const hx = px(hub.lng), hy = py(hub.lat);

  // Clear any previous render (defensive on re-init).
  routesG.innerHTML = "";
  pinsG.innerHTML = "";

  const make = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  /* ---- Trade-route arcs (hub -> each market) ------------------------- */
  countries.forEach((c) => {
    if (c === hub) return;
    const x = px(c.lng), y = py(c.lat);
    // Control point: midpoint lifted perpendicular for a graceful arc.
    const mx = (hx + x) / 2, my = (hy + y) / 2;
    const dx = x - hx, dy = y - hy;
    const dist = Math.hypot(dx, dy) || 1;
    const lift = Math.min(28, dist * 0.32);
    const cx = mx + (-dy / dist) * lift;
    const cy = my + (dx / dist) * lift - 6; // bias the arc upward
    const path = make("path", { class: "route", d: `M${hx} ${hy} Q${cx} ${cy} ${x} ${y}` });
    routesG.appendChild(path);
    // Dash setup for the draw-in animation.
    const len = (typeof path.getTotalLength === "function") ? path.getTotalLength() : dist * 1.2;
    path.style.setProperty("--len", len.toFixed(1));
    if (!reduce) {
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
    }
  });

  /* ---- Pins (markets + hub) ------------------------------------------ */
  const addPin = (c, isHub) => {
    const x = px(c.lng), y = py(c.lat);
    const g = make("g", { class: "pin-group" + (isHub ? " is-hub" : "") });
    g.appendChild(make("circle", { class: "pin-glow", cx: x, cy: y, r: isHub ? 5 : 4 }));
    g.appendChild(make("circle", { class: "pin-halo", cx: x, cy: y, r: isHub ? 3 : 2.4 }));
    const dot = make("circle", { class: "pin", cx: x, cy: y, r: isHub ? 2.2 : 1.7 });
    const title = make("title", {});
    title.textContent = isHub ? `${c.name} — Hub` : c.name;
    dot.appendChild(title);
    g.appendChild(dot);
    pinsG.appendChild(g);
  };
  countries.forEach((c) => addPin(c, c === hub));

  /* ---- Trigger the draw-in when the map scrolls into view ------------ */
  const draw = () => svg.classList.add("is-drawn");
  if (reduce) { draw(); return; }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { draw(); obs.disconnect(); } });
    }, { threshold: 0.25 });
    io.observe(svg);
  } else {
    draw();
  }
};
