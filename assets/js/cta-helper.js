/* ============================================================================
   cta-helper.js — Build WhatsApp / Gmail / mailto links from SITE_CONFIG
   ----------------------------------------------------------------------------
   The ONE place that turns "inquiry intent" into a link. Every button on the
   site should use these helpers so the number/email come from config.js only.

   Public API (on window.CTA):
     CTA.whatsappUrl({product, packaging, country, name})  -> wa.me link
     CTA.mailtoUrl({product, body})                        -> mailto: link
     CTA.gmailUrl({product, body})                         -> Gmail compose link
     CTA.fillTemplate(str, vars)                            -> string
     CTA.wireDataAttrs(root)   -> auto-wire [data-cta] elements within root
   ========================================================================== */

(function () {
  const cfg = window.SITE_CONFIG || {};

  /** Replace {tokens} in a template with provided values (blank if missing). */
  function fillTemplate(str, vars = {}) {
    return String(str || "").replace(/\{(\w+)\}/g, (_, k) =>
      vars[k] != null && vars[k] !== "" ? vars[k] : ""
    ).replace(/\s+/g, " ").trim();
  }

  /** Build the pre-filled message text for a WhatsApp/email inquiry. */
  function buildMessage(opts = {}) {
    const t = cfg.templates || {};
    if (opts.product) {
      return fillTemplate(t.product, {
        product: opts.product,
        packaging: opts.packaging || "bulk",
        country: opts.country || "(destination)",
        name: opts.name || "",
      });
    }
    return opts.body || t.generic || "Hello, I'd like to make a bulk inquiry.";
  }

  /** WhatsApp click-to-chat URL. Falls back to a notice if number missing. */
  function whatsappUrl(opts = {}) {
    const num = (cfg.whatsapp || "").replace(/[^\d]/g, "");
    const text = encodeURIComponent(buildMessage(opts));
    // If the placeholder is still present, the link will be visibly invalid —
    // intentional, so it's caught before launch rather than silently wrong.
    return `https://wa.me/${num}?text=${text}`;
  }

  /** Standard mailto: link. */
  function mailtoUrl(opts = {}) {
    const subject = encodeURIComponent(
      fillTemplate(cfg.templates?.emailSubject, { product: opts.product || "General" })
    );
    const body = encodeURIComponent(buildMessage(opts));
    return `mailto:${cfg.email}?subject=${subject}&body=${body}`;
  }

  /** Gmail compose deep link (nice for desktop Gmail users). */
  function gmailUrl(opts = {}) {
    const su = encodeURIComponent(
      fillTemplate(cfg.templates?.emailSubject, { product: opts.product || "General" })
    );
    const body = encodeURIComponent(buildMessage(opts));
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(cfg.email)}&su=${su}&body=${body}`;
  }

  /**
   * Auto-wire any element with data attributes:
   *   data-cta="whatsapp|email|gmail"
   *   data-product, data-packaging, data-country, data-name (optional)
   * Sets href on <a>, or a click handler otherwise.
   */
  function wireDataAttrs(root = document) {
    root.querySelectorAll("[data-cta]").forEach((el) => {
      const kind = el.getAttribute("data-cta");
      const opts = {
        product: el.getAttribute("data-product") || "",
        packaging: el.getAttribute("data-packaging") || "",
        country: el.getAttribute("data-country") || "",
        name: el.getAttribute("data-name") || "",
        body: el.getAttribute("data-body") || "",
      };
      const url =
        kind === "whatsapp" ? whatsappUrl(opts) :
        kind === "gmail" ? gmailUrl(opts) :
        mailtoUrl(opts);

      if (el.tagName === "A") {
        el.href = url;
        if (kind === "whatsapp" || kind === "gmail") el.target = "_blank";
        el.rel = "noopener";
      } else {
        el.addEventListener("click", () => window.open(url, "_blank", "noopener"));
      }
    });
  }

  window.CTA = { fillTemplate, buildMessage, whatsappUrl, mailtoUrl, gmailUrl, wireDataAttrs };
})();
