/* ============================================================================
   contact.js — Inquiry form: validation + handoff to WhatsApp/Gmail
   ----------------------------------------------------------------------------
   On submit: validate inline, build a summary message, (optionally) store the
   inquiry, then open WhatsApp with the pre-filled summary and show a toast.
   NEVER transacts. When a backend (Firebase) exists, also write to /inquiries.
   ========================================================================== */

window.initContact = function initContact() {
  const form = document.querySelector(".inquiry-form[data-inquiry]");
  if (!form) return;

  // Keep the "Product interest" dropdown in sync with the admin-managed
  // categories, so it always matches the live catalogue (built safely via DOM).
  const productSel = form.elements["product"];
  if (productSel && window.Store && window.Store.getCategoryNames) {
    const names = window.Store.getCategoryNames();
    if (names.length) {
      productSel.textContent = "";
      const add = (label, val) => {
        const o = document.createElement("option");
        o.textContent = label;
        if (val != null) o.value = val;
        productSel.appendChild(o);
      };
      add("Select a category…", "");
      names.forEach((n) => add(n));
      add("Multiple / Other");
    }
  }

  const field = (name) => form.elements[name];
  const setErr = (name, on) => {
    const wrap = field(name)?.closest(".field");
    wrap && wrap.classList.toggle("is-invalid", on);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // ---- Validate ----
    const data = {
      name: field("name")?.value.trim(),
      company: field("company")?.value.trim(),
      country: field("country")?.value.trim(),
      product: field("product")?.value,
      qty: field("qty")?.value.trim(),
      message: field("message")?.value.trim(),
    };
    let ok = true;
    ["name", "country", "product"].forEach((k) => {
      const empty = !data[k];
      setErr(k, empty);
      if (empty) ok = false;
    });
    if (!ok) { toast("Please complete the required fields.", "err"); return; }

    // ---- Build the summary message ----
    const body =
      `Bulk inquiry from ${data.name}` +
      (data.company ? ` (${data.company})` : "") + `.\n` +
      `Product: ${data.product}\n` +
      `Quantity / MOQ: ${data.qty || "to discuss"}\n` +
      `Destination: ${data.country}\n` +
      (data.message ? `Notes: ${data.message}\n` : "") +
      `Please share FOB/CIF terms.`;

    // ---- Persist the inquiry (Store -> localStorage; shows in admin) ----
    if (window.Store) { try { window.Store.addInquiry(data); } catch (_) {} }
    else if (typeof window.saveInquiry === "function") { try { window.saveInquiry(data); } catch (_) {} }

    // ---- Handoff to WhatsApp (primary) ----
    const waUrl = window.CTA.whatsappUrl({ product: data.product, body });
    window.open(waUrl, "_blank", "noopener");

    toast("Opening WhatsApp with your inquiry…", "ok");
    form.reset();
  });

  // Clear error styling as the user fixes a field.
  form.addEventListener("input", (e) => {
    const wrap = e.target.closest(".field");
    wrap && wrap.classList.remove("is-invalid");
  });

  /* ---- Toast helper (shared) ----------------------------------------- */
  function toast(msg, kind = "ok") {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    const t = document.createElement("div");
    t.className = `toast toast--${kind}`;
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }
  window.toast = window.toast || toast;
};
