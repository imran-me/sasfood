/* ============================================================================
   nav.js — Header scroll state, mobile overlay menu, active link, scroll bar,
            back-to-top button.
   ----------------------------------------------------------------------------
   Called by main.js AFTER the header/footer partials are injected.
   ========================================================================== */

window.initNav = function initNav() {
  const header = document.querySelector(".site-header");
  const menu = document.querySelector(".mobile-menu");
  const openBtn = document.querySelector(".hamburger");
  const closeBtn = document.querySelector(".mobile-menu .close");
  const progress = document.querySelector(".scroll-progress");
  const toTop = document.querySelector(".to-top");

  /* ---- Header shrink/frost + scroll progress + back-to-top ----------- */
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 40);
    if (toTop) toTop.classList.toggle("is-shown", y > window.innerHeight);
    if (progress) {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile overlay menu ------------------------------------------- */
  const setMenu = (open) => {
    if (!menu) return;
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (openBtn) openBtn.setAttribute("aria-expanded", String(open));
  };
  openBtn && openBtn.addEventListener("click", () => setMenu(true));
  closeBtn && closeBtn.addEventListener("click", () => setMenu(false));
  menu && menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---- Back-to-top ---------------------------------------------------- */
  toTop && toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  /* ---- Active link by current path ----------------------------------- */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a, .mobile-menu nav a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.endsWith(path) || (path === "index.html" && href === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });
};
