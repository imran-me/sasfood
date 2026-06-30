/* ============================================================================
   reveal.js — Scroll-triggered reveals, title-rule draw, markets route-draw
   ----------------------------------------------------------------------------
   Uses IntersectionObserver (no GSAP dependency required for the basics, so the
   site degrades gracefully if the CDN is blocked). Fully bypassed under
   prefers-reduced-motion (everything just shows).
   ========================================================================== */

window.initReveal = function initReveal() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Stagger children get an index so CSS can delay them.
  document.querySelectorAll("[data-reveal-stagger]").forEach((group) => {
    Array.from(group.children).forEach((child, i) =>
      child.style.setProperty("--i", i)
    );
  });

  const targets = document.querySelectorAll(
    "[data-reveal], [data-reveal-stagger], .title-rule, .markets"
  );

  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach((t) => {
      t.classList.add("is-visible", "is-drawn");
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("is-visible");
        if (el.classList.contains("title-rule")) el.classList.add("is-drawn");
        if (el.classList.contains("markets")) el.classList.add("is-drawn");
        // Also draw any title-rule inside a revealed section.
        el.querySelectorAll?.(".title-rule").forEach((r) => r.classList.add("is-drawn"));
        io.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((t) => io.observe(t));
};
