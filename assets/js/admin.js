/* ============================================================================
   admin.js — Fully functional admin panel (backed by Store / localStorage)
   ----------------------------------------------------------------------------
   Manages Products, Ads/Banners, Inquiries and Settings. Everything persists
   via window.Store and reflects on the public site immediately.

   Auth is a DEMO gate only (sessionStorage) — there is no real security here.
   >>> PHASE 8 (Firebase): replace the auth block + keep the Store API, or point
       the render/save calls at Firestore. The UI code below stays the same.

   DEMO login:  admin@saraalsalam.com  /  demo1234
   ========================================================================== */

(function () {
  const DEMO = { email: "admin@saraalsalam.com", pass: "demo1234" };
  const CATS = ["Rice", "Oil", "Palm Oil", "Fruits", "Spices", "Sugar"];

  /* ---- helpers -------------------------------------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const parseList = (s) => String(s || "").split(",").map((x) => x.trim()).filter(Boolean);
  const joinList = (a) => (a || []).join(", ");
  const specsToText = (o) => Object.entries(o || {}).map(([k, v]) => `${k}: ${v}`).join("\n");
  const parseSpecs = (t) => {
    const out = {};
    String(t || "").split("\n").forEach((line) => {
      const i = line.indexOf(":");
      if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    return out;
  };
  const slugify = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function toast(msg, kind = "ok") {
    let wrap = $(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    const t = document.createElement("div");
    t.className = `toast toast--${kind}`;
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  /* ---- boot ----------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    window.Store && window.Store.ready();
    wireLogin();
    wireTabs();
  });

  /* ================= AUTH ============================================== */
  function wireLogin() {
    const form = $("#admin-login-form");
    const loginView = $(".admin-login");
    const shell = $(".admin-shell");

    if (sessionStorage.getItem("sas_admin") === "1") enter();

    form && form.addEventListener("submit", (e) => {
      e.preventDefault();
      const err = form.querySelector(".err");
      if (form.email.value.trim() === DEMO.email && form.password.value === DEMO.pass) {
        sessionStorage.setItem("sas_admin", "1");
        enter();
      } else {
        err.style.display = "block";
        err.textContent = "Invalid credentials. (Demo: admin@saraalsalam.com / demo1234)";
      }
    });

    $(".logout") && $(".logout").addEventListener("click", () => {
      sessionStorage.removeItem("sas_admin");
      shell.classList.remove("is-auth");
      loginView.style.display = "grid";
    });

    function enter() {
      loginView.style.display = "none";
      shell.classList.add("is-auth");
      renderAll();
    }
  }

  function renderAll() {
    renderDashboard();
    renderProductsTable();
    renderAdsTable();
    renderInquiries();
    loadSettings();
  }

  /* ================= TABS ============================================== */
  function wireTabs() {
    const btns = document.querySelectorAll(".admin-nav-btn[data-tab]");
    const go = (tab) => {
      btns.forEach((x) => x.classList.toggle("is-active", x.dataset.tab === tab));
      document.querySelectorAll(".admin-panel").forEach((p) =>
        p.classList.toggle("is-active", p.dataset.panel === tab));
    };
    btns.forEach((b) => b.addEventListener("click", () => go(b.dataset.tab)));
    document.querySelectorAll("[data-jump]").forEach((b) =>
      b.addEventListener("click", () => go(b.dataset.jump)));
  }

  /* ================= DASHBOARD ======================================== */
  function renderDashboard() {
    const products = Store.getProducts();
    const ads = Store.getAds().filter((a) => a.active);
    const inquiries = Store.getInquiries();
    const newCount = inquiries.filter((q) => q.status === "new").length;

    setText("#stat-products", products.length);
    setText("#stat-ads", ads.length);
    setText("#stat-inquiries", newCount);
    const badge = $("#inq-badge"); if (badge) badge.textContent = newCount;

    const tbody = $("#recent-inquiries");
    if (tbody) {
      const rows = inquiries.slice(0, 5);
      tbody.innerHTML = rows.length ? rows.map((q) => `
        <tr><td>${esc(q.name)}</td><td>${esc(q.country || "—")}</td>
        <td>${esc(q.product || "—")}</td><td>${esc(when(q.createdAt))}</td></tr>`).join("")
        : `<tr><td colspan="4" style="color:var(--text-muted-on-dark)">No inquiries yet.</td></tr>`;
    }
  }

  /* ================= PRODUCTS ========================================= */
  function renderProductsTable() {
    const tbody = $("#products-tbody");
    if (!tbody) return;
    const products = Store.getProducts();
    tbody.innerHTML = products.length ? products.map((p) => `
      <tr>
        <td>${esc(p.name)}</td>
        <td>${esc(p.category)}</td>
        <td>${esc(joinList(p.origins))}</td>
        <td>${p.featured ? "★" : "—"}</td>
        <td><span class="status-tag ${p.status || "published"}">${p.status || "published"}</span></td>
        <td>
          <button class="btn btn--ghost btn--sm" data-edit="${p.id}">Edit</button>
          <button class="btn btn--ghost btn--sm" data-del="${p.id}" style="color:#ff9b9b">Delete</button>
        </td>
      </tr>`).join("")
      : `<tr><td colspan="6" style="color:var(--text-muted-on-dark)">No products yet — add your first to bring the showcase to life.</td></tr>`;

    tbody.querySelectorAll("[data-edit]").forEach((b) =>
      b.addEventListener("click", () => openProductEditor(b.dataset.edit)));
    tbody.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => {
        const p = Store.getProducts().find((x) => x.id === b.dataset.del);
        if (p && confirm(`Delete "${p.name}"? This cannot be undone.`)) {
          Store.deleteProduct(p.id); renderProductsTable(); renderDashboard(); toast("Product deleted.");
        }
      }));

    $("#add-product") && ($("#add-product").onclick = () => openProductEditor(null));
    $("#reset-demo") && ($("#reset-demo").onclick = () => {
      if (confirm("Reset to the 10 sample products and clear ads/inquiries/settings?")) {
        Store.resetAll(); renderAll(); toast("Demo data reset.");
      }
    });
  }

  function openProductEditor(id) {
    const editor = $("#product-editor");
    const view = $("#products-view");
    const p = id ? Store.getProducts().find((x) => x.id === id) : null;
    const img = (p && p.images && p.images[0]) || { url: "", alt: "" };

    editor.innerHTML = `
      <div class="admin-topbar">
        <h1>${p ? "Edit Product" : "Add Product"}</h1>
        <button class="btn btn--ghost btn--sm" id="pe-cancel">&larr; Back to list</button>
      </div>
      <div class="editor-grid">
        <form class="card inquiry-form" id="pe-form" style="padding:1.25rem">
          <input type="hidden" name="id" value="${esc(p?.id || "")}">
          <div class="field--row">
            <div class="field"><label>Name *</label><input name="name" value="${esc(p?.name || "")}" required></div>
            <div class="field"><label>Slug</label><input name="slug" value="${esc(p?.slug || "")}" placeholder="auto from name"></div>
          </div>
          <div class="field--row">
            <div class="field"><label>Category *</label><select name="category">${
              CATS.map((c) => `<option ${p?.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
            <div class="field"><label>Status</label><select name="status">
              <option value="published" ${p?.status !== "draft" ? "selected" : ""}>published</option>
              <option value="draft" ${p?.status === "draft" ? "selected" : ""}>draft</option>
            </select></div>
          </div>
          <div class="field"><label>Short description</label><input name="shortDesc" value="${esc(p?.shortDesc || "")}"></div>
          <div class="field"><label>Long description</label><textarea name="longDesc">${esc(p?.longDesc || "")}</textarea></div>
          <div class="field--row">
            <div class="field"><label>Origins (comma-separated)</label><input name="origins" value="${esc(joinList(p?.origins))}"></div>
            <div class="field"><label>Grades / varieties (comma)</label><input name="grades" value="${esc(joinList(p?.grades))}"></div>
          </div>
          <div class="field--row">
            <div class="field"><label>Packaging (comma)</label><input name="packaging" value="${esc(joinList(p?.packaging))}"></div>
            <div class="field"><label>MOQ</label><input name="moq" value="${esc(p?.moq || "")}"></div>
          </div>
          <div class="field--row">
            <div class="field"><label>Image URL</label><input name="imgUrl" value="${esc(img.url)}" placeholder="assets/img/products/your.jpg"></div>
            <div class="field"><label>Image alt text</label><input name="imgAlt" value="${esc(img.alt)}"></div>
          </div>
          <div class="field"><label>Specs (one per line, "Key: Value")</label><textarea name="specs" placeholder="Moisture: ≤ 12.5%">${esc(specsToText(p?.specs))}</textarea></div>
          <div class="field"><label>Tags (comma)</label><input name="tags" value="${esc(joinList(p?.tags))}"></div>
          <label class="row" style="gap:.5rem"><input type="checkbox" name="featured" ${p?.featured ? "checked" : ""} style="width:auto"> Featured</label>
          <div class="submit-row">
            <button class="btn btn--gold" type="submit">${p ? "Save changes" : "Create product"}</button>
            <button class="btn btn--ghost" type="button" id="pe-cancel2">Cancel</button>
          </div>
        </form>

        <div class="preview-col">
          <h4>Live preview</h4>
          <div id="pe-preview"></div>
        </div>
      </div>`;

    view.hidden = true;
    editor.hidden = false;

    const form = $("#pe-form");
    const drawPreview = () => $("#pe-preview").innerHTML = previewCard(readForm(form));
    form.addEventListener("input", drawPreview);
    drawPreview();

    const back = () => { editor.hidden = true; view.hidden = false; editor.innerHTML = ""; };
    $("#pe-cancel").onclick = back;
    $("#pe-cancel2").onclick = back;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = readForm(form);
      if (!data.name) { toast("Name is required.", "err"); return; }
      data.slug = data.slug || slugify(data.name);
      Store.saveProduct(data);
      back(); renderProductsTable(); renderDashboard();
      toast(id ? "Product updated." : "Product created.");
    });
  }

  // Read the product editor form into a product object.
  function readForm(form) {
    const f = (n) => form.elements[n];
    return {
      id: f("id").value || undefined,
      name: f("name").value.trim(),
      slug: f("slug").value.trim(),
      category: f("category").value,
      status: f("status").value,
      shortDesc: f("shortDesc").value.trim(),
      longDesc: f("longDesc").value.trim(),
      origins: parseList(f("origins").value),
      grades: parseList(f("grades").value),
      packaging: parseList(f("packaging").value),
      moq: f("moq").value.trim(),
      images: [{ url: f("imgUrl").value.trim(), alt: f("imgAlt").value.trim() }],
      specs: parseSpecs(f("specs").value),
      tags: parseList(f("tags").value),
      featured: f("featured").checked,
    };
  }

  // A product card mirroring the public showcase look.
  function previewCard(p) {
    const img = (p.images && p.images[0]) || { url: "", alt: p.name };
    const chips = [...(p.origins || []).slice(0, 2), ...(p.packaging || []).slice(0, 1)]
      .map((x) => `<span class="chip">${esc(x)}</span>`).join("");
    return `
      <article class="card product-card has-filigree">
        <div class="media">
          <span class="cat-eyebrow">${esc(p.category || "Category")}</span>
          <img src="${esc(img.url)}" alt="${esc(img.alt || p.name)}">
        </div>
        <div class="body">
          <h3 class="name">${esc(p.name || "Product name")}</h3>
          <p class="desc">${esc(p.shortDesc || "Short description…")}</p>
          <div class="meta">${chips}</div>
        </div>
      </article>`;
  }

  /* ================= ADS / BANNERS ==================================== */
  function renderAdsTable() {
    const tbody = $("#ads-tbody");
    if (!tbody) return;
    const ads = Store.getAds();
    tbody.innerHTML = ads.length ? ads.map((a) => `
      <tr>
        <td>${esc(a.title)}</td>
        <td>${esc(a.placement)}</td>
        <td>${esc(a.ctaType)}</td>
        <td><button class="btn btn--ghost btn--sm" data-toggle="${a.id}">${a.active ? "● Live" : "○ Off"}</button></td>
        <td>
          <button class="btn btn--ghost btn--sm" data-edit-ad="${a.id}">Edit</button>
          <button class="btn btn--ghost btn--sm" data-del-ad="${a.id}" style="color:#ff9b9b">Delete</button>
        </td>
      </tr>`).join("")
      : `<tr><td colspan="5" style="color:var(--text-muted-on-dark)">No banners yet.</td></tr>`;

    tbody.querySelectorAll("[data-toggle]").forEach((b) => b.onclick = () => {
      const a = Store.getAds().find((x) => x.id === b.dataset.toggle);
      Store.saveAd({ ...a, active: !a.active }); renderAdsTable(); renderDashboard();
    });
    tbody.querySelectorAll("[data-edit-ad]").forEach((b) => b.onclick = () => openAdEditor(b.dataset.editAd));
    tbody.querySelectorAll("[data-del-ad]").forEach((b) => b.onclick = () => {
      const a = Store.getAds().find((x) => x.id === b.dataset.delAd);
      if (a && confirm(`Delete banner "${a.title}"?`)) { Store.deleteAd(a.id); renderAdsTable(); toast("Banner deleted."); }
    });
    $("#add-ad") && ($("#add-ad").onclick = () => openAdEditor(null));
  }

  function openAdEditor(id) {
    const editor = $("#ad-editor"), view = $("#ads-view");
    const a = id ? Store.getAds().find((x) => x.id === id) : null;
    editor.innerHTML = `
      <div class="admin-topbar"><h1>${a ? "Edit Banner" : "New Banner"}</h1>
        <button class="btn btn--ghost btn--sm" id="ae-back">&larr; Back</button></div>
      <form class="card inquiry-form" id="ae-form" style="padding:1.25rem;max-width:620px">
        <input type="hidden" name="id" value="${esc(a?.id || "")}">
        <div class="field"><label>Title *</label><input name="title" value="${esc(a?.title || "")}"></div>
        <div class="field"><label>Image URL</label><input name="image" value="${esc(a?.image || "")}"></div>
        <div class="field"><label>Caption</label><input name="caption" value="${esc(a?.caption || "")}"></div>
        <div class="field--row">
          <div class="field"><label>CTA type</label><select name="ctaType">
            ${["whatsapp", "email", "link"].map((t) => `<option ${a?.ctaType === t ? "selected" : ""}>${t}</option>`).join("")}
          </select></div>
          <div class="field"><label>CTA value (URL / leave blank for default)</label><input name="ctaValue" value="${esc(a?.ctaValue || "")}"></div>
        </div>
        <div class="field--row">
          <div class="field"><label>Placement</label><select name="placement">
            ${["hero", "inline", "cta"].map((t) => `<option ${a?.placement === t ? "selected" : ""}>${t}</option>`).join("")}
          </select></div>
          <div class="field"><label>Order</label><input name="order" type="number" value="${esc(a?.order ?? 1)}"></div>
        </div>
        <label class="row" style="gap:.5rem"><input type="checkbox" name="active" ${a?.active ? "checked" : ""} style="width:auto"> Active</label>
        <div class="submit-row">
          <button class="btn btn--gold" type="submit">${a ? "Save banner" : "Create banner"}</button>
        </div>
      </form>`;
    view.hidden = true; editor.hidden = false;
    const back = () => { editor.hidden = true; view.hidden = false; editor.innerHTML = ""; };
    $("#ae-back").onclick = back;
    $("#ae-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const data = {
        id: form.id.value || undefined,
        title: form.title.value.trim(),
        image: form.image.value.trim(),
        caption: form.caption.value.trim(),
        ctaType: form.ctaType.value,
        ctaValue: form.ctaValue.value.trim(),
        placement: form.placement.value,
        order: Number(form.order.value) || 1,
        active: form.active.checked,
      };
      if (!data.title) { toast("Title is required.", "err"); return; }
      Store.saveAd(data); back(); renderAdsTable(); renderDashboard(); toast(id ? "Banner updated." : "Banner created.");
    });
  }

  /* ================= INQUIRIES ======================================== */
  function renderInquiries() {
    const tbody = $("#inquiries-tbody");
    if (!tbody) return;
    const rows = Store.getInquiries();
    tbody.innerHTML = rows.length ? rows.map((q) => `
      <tr>
        <td>${esc(q.name)}</td><td>${esc(q.company || "—")}</td><td>${esc(q.country || "—")}</td>
        <td>${esc(q.product || "—")}</td><td>${esc(q.qty || "—")}</td>
        <td><span class="status-tag ${q.status || "new"}">${q.status || "new"}</span></td>
        <td>
          <button class="btn btn--ghost btn--sm" data-mark="${q.id}">${q.status === "contacted" ? "Mark new" : "Mark contacted"}</button>
          <button class="btn btn--ghost btn--sm" data-del-q="${q.id}" style="color:#ff9b9b">Delete</button>
        </td>
      </tr>`).join("")
      : `<tr><td colspan="7" style="color:var(--text-muted-on-dark)">No inquiries captured yet.</td></tr>`;

    tbody.querySelectorAll("[data-mark]").forEach((b) => b.onclick = () => {
      const q = Store.getInquiries().find((x) => x.id === b.dataset.mark);
      Store.updateInquiry(q.id, { status: q.status === "contacted" ? "new" : "contacted" });
      renderInquiries(); renderDashboard();
    });
    tbody.querySelectorAll("[data-del-q]").forEach((b) => b.onclick = () => {
      if (confirm("Delete this inquiry?")) { Store.deleteInquiry(b.dataset.delQ); renderInquiries(); renderDashboard(); }
    });

    $("#export-csv") && ($("#export-csv").onclick = exportCSV);
  }

  function exportCSV() {
    const rows = Store.getInquiries();
    if (!rows.length) { toast("No inquiries to export.", "err"); return; }
    const cols = ["name", "company", "country", "product", "qty", "message", "status", "createdAt"];
    const csv = [cols.join(",")].concat(rows.map((r) =>
      cols.map((c) => {
        let v = c === "createdAt" ? when(r[c]) : r[c];
        v = String(v ?? "").replace(/"/g, '""');
        return /[",\n]/.test(v) ? `"${v}"` : v;
      }).join(",")
    )).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "inquiries.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("CSV exported.");
  }

  /* ================= SETTINGS ========================================= */
  function loadSettings() {
    const form = $("#settings-form");
    if (!form) return;
    const s = Store.getSettings();
    form.whatsapp.value = s.whatsapp || "";
    form.email.value = s.email || "";
    form.phone.value = s.phone || "";
    form.hours.value = s.hours || "";
    form.address.value = s.address || "";
    form.mapUrl.value = s.mapUrl || "";
    form.instagram.value = s.socials?.instagram || "";
    form.linkedin.value = s.socials?.linkedin || "";

    form.onsubmit = (e) => {
      e.preventDefault();
      Store.saveSettings({
        whatsapp: form.whatsapp.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        hours: form.hours.value.trim(),
        address: form.address.value.trim(),
        mapUrl: form.mapUrl.value.trim(),
        socials: { instagram: form.instagram.value.trim(), linkedin: form.linkedin.value.trim() },
      });
      toast("Settings saved — live on the public site.");
    };
  }

  /* ---- misc ----------------------------------------------------------- */
  function setText(sel, v) { const el = $(sel); if (el) el.textContent = v; }
  function when(ts) {
    if (!ts) return "—";
    try { return new Date(ts).toLocaleString(); } catch (_) { return "—"; }
  }
})();
