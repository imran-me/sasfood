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
  // Categories are admin-managed now — read live from the Store (fallback seed).
  const cats = () => (window.Store && Store.getCategoryNames && Store.getCategoryNames().length)
    ? Store.getCategoryNames()
    : ["Rice", "Oil", "Palm Oil", "Fruits", "Spices", "Sugar"];
  const resolveImg = (u) => (window.MEDIA ? window.MEDIA.resolveImg(u) : (u || ""));

  /* ---- helpers -------------------------------------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const parseList = (s) => String(s || "").split(",").map((x) => x.trim()).filter(Boolean);
  const parseLines = (s) => String(s || "").split("\n").map((x) => x.trim()).filter(Boolean);
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

  /* ================= AUTH ==============================================
     Real Firebase Auth when firebase-config.js is filled in; otherwise the
     original demo gate (sessionStorage). Cloud mode also syncs the catalogue
     to/from Firestore on entry so admin always edits the live data. */
  function wireLogin() {
    const form = $("#admin-login-form");
    const loginView = $(".admin-login");
    const shell = $(".admin-shell");
    const cloud = !!(window.SASCloud && window.SASCloud.enabled);
    let entered = false;

    if (cloud) {
      // Auto-enter if a Firebase session is already active (persists across reloads).
      window.SASCloud.onAuth((user) => { if (user) enter(); });
    } else if (sessionStorage.getItem("sas_admin") === "1") {
      enter();
    }

    form && form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = form.querySelector(".err");
      const email = form.email.value.trim();
      const pass = form.password.value;

      if (cloud) {
        try {
          await window.SASCloud.signIn(email, pass);   // onAuth handler calls enter()
        } catch (e2) {
          err.style.display = "block";
          err.textContent = "Login failed: " + (e2.code || e2.message || "check email & password.");
        }
        return;
      }

      if (email === DEMO.email && pass === DEMO.pass) {
        sessionStorage.setItem("sas_admin", "1");
        enter();
      } else {
        err.style.display = "block";
        err.textContent = "Invalid credentials. (Demo: admin@saraalsalam.com / demo1234)";
      }
    });

    $(".logout") && $(".logout").addEventListener("click", () => {
      sessionStorage.removeItem("sas_admin");
      if (cloud) window.SASCloud.signOut();
      entered = false;
      shell.classList.remove("is-auth");
      loginView.style.display = "grid";
    });

    async function enter() {
      if (entered) return;
      entered = true;
      loginView.style.display = "none";
      shell.classList.add("is-auth");

      if (cloud) {
        try {
          if (await window.SASCloud.hasData()) {
            await window.SASCloud.pull(true);          // cloud is the source of truth
          } else {
            await window.SASCloud.publishAll();         // first run: seed the cloud from local
            toast("Published your catalogue to Firebase.");
          }
        } catch (e) {
          console.error("[cloud] admin sync", e);
          toast("Cloud sync issue — see console.", "err");
        }
      }
      renderAll();
    }
  }

  function renderAll() {
    renderDashboard();
    renderProductsTable();
    renderAdsTable();
    renderInquiries();
    loadSettings();
    renderCategories();
    renderCountries();
    loadBranding();
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
      if (confirm("Reset to the sample products and clear ads/inquiries/settings?")) {
        Store.resetAll(); renderAll(); toast("Demo data reset.");
      }
    });
    $("#export-catalogue") && ($("#export-catalogue").onclick = () => {
      download("products.js", Store.exportProductsFile(), "text/javascript");
      toast("Downloaded products.js — commit it to assets/data/ on GitHub to publish.");
    });
    $("#export-all") && ($("#export-all").onclick = () => {
      download("sas-content-backup.json", Store.exportAll(), "application/json");
      toast("Backup downloaded.");
    });
  }

  // Trigger a client-side file download.
  function download(filename, text, mime) {
    const blob = new Blob([text], { type: mime || "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Resize a picked image file on a canvas and return a compressed JPEG data URL.
  // Keeps the result well under Firestore's ~1 MB document limit so the photo can
  // be stored inline (no paid Storage bucket needed) and shows for every visitor.
  function compressImage(file, maxW, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("read failed"));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("decode failed"));
        image.onload = () => {
          const scale = Math.min(1, maxW / image.width);
          const w = Math.max(1, Math.round(image.width * scale));
          const h = Math.max(1, Math.round(image.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(image, 0, 0, w, h);
          let q = quality;
          let out = canvas.toDataURL("image/jpeg", q);
          while (out.length > 800000 && q > 0.4) { q -= 0.12; out = canvas.toDataURL("image/jpeg", q); }
          resolve(out);
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function openProductEditor(id) {
    const editor = $("#product-editor");
    const view = $("#products-view");
    const p = id ? Store.getProducts().find((x) => x.id === id) : null;
    const img = (p && p.images && p.images[0]) || { url: "", alt: "" };
    const imgIsData = String(img.url || "").startsWith("data:");  // an uploaded (embedded) photo

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
              cats().map((c) => `<option ${p?.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
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
          <div class="field">
            <label>Product image — upload from your computer</label>
            <input name="imgFile" type="file" accept="image/*">
            <input name="imgData" type="hidden" value="${esc(imgIsData ? img.url : "")}">
            <div id="pe-thumb" style="margin:.55rem 0">${(imgIsData || img.url) ? `<img src="${esc(resolveImg(img.url))}" alt="" style="max-width:150px;border-radius:8px;border:1px solid var(--line)">` : ""}</div>
            <span class="form-note">Pick a photo and it's resized &amp; saved automatically — appears on the live site instantly. (Or paste a link below instead.)</span>
          </div>
          <div class="field--row">
            <div class="field"><label>…or image URL / Google&nbsp;Drive link</label><input name="imgUrl" value="${esc(imgIsData ? "" : img.url)}" placeholder="https://…  or a Drive share link"></div>
            <div class="field"><label>Image alt text</label><input name="imgAlt" value="${esc(img.alt)}" placeholder="e.g. 5kg sack of basmati rice"></div>
          </div>
          <div class="field"><label>Additional images (one URL / Drive link per line)</label><textarea name="imgExtra" placeholder="Optional — gallery images">${esc(((p?.images || []).slice(1).map((x) => x.url)).join("\n"))}</textarea></div>
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

    // Upload a photo straight from the computer: resize + embed it as the image.
    const fileInput = form.elements["imgFile"];
    fileInput && fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) { toast("Please choose an image file.", "err"); return; }
      toast("Processing image…");
      try {
        const dataUrl = await compressImage(file, 1200, 0.72);
        form.elements["imgData"].value = dataUrl;
        form.elements["imgUrl"].value = "";          // an uploaded photo wins over a link
        const thumb = $("#pe-thumb");
        if (thumb) thumb.innerHTML = `<img src="${dataUrl}" alt="" style="max-width:150px;border-radius:8px;border:1px solid var(--line)">`;
        drawPreview();
        toast("Image ready — click Save to publish.");
      } catch (e) { console.error(e); toast("Could not read that image.", "err"); }
    });
    // Typing a URL clears any previously uploaded image so the link is used.
    const urlInput = form.elements["imgUrl"];
    urlInput && urlInput.addEventListener("input", () => {
      if (urlInput.value.trim()) form.elements["imgData"].value = "";
    });

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
      images: [
        // An uploaded photo (data URL) takes priority over a typed URL/Drive link.
        { url: (f("imgData") && f("imgData").value) || f("imgUrl").value.trim(), alt: f("imgAlt").value.trim() },
        ...parseLines(f("imgExtra") ? f("imgExtra").value : "").map((u) => ({ url: u, alt: f("imgAlt").value.trim() })),
      ].filter((im) => im.url),
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
      <article class="card product-card">
        <div class="media">
          <span class="cat-eyebrow">${esc(p.category || "Category")}</span>
          <img src="${esc(resolveImg(img.url))}" alt="${esc(img.alt || p.name)}">
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

  /* ================= CATEGORIES ======================================= */
  function renderCategories() {
    const tbody = $("#categories-tbody");
    if (!tbody) return;
    const list = Store.getCategories().sort((a, b) => (a.order || 0) - (b.order || 0));
    const products = Store.getProducts();
    tbody.innerHTML = list.length ? list.map((c, i) => {
      const count = products.filter((p) => p.category === c.name).length;
      return `<tr>
        <td>${i + 1}</td>
        <td><input class="inline-input" data-cat-name="${c.id}" value="${esc(c.name)}"></td>
        <td>${count}</td>
        <td>
          <button class="btn btn--ghost btn--sm" data-cat-save="${c.id}">Save</button>
          <button class="btn btn--ghost btn--sm" data-cat-del="${c.id}" style="color:#ff9b9b">Delete</button>
        </td>
      </tr>`;
    }).join("") : `<tr><td colspan="4" style="color:var(--text-muted-on-dark)">No categories yet.</td></tr>`;

    tbody.querySelectorAll("[data-cat-save]").forEach((b) => b.onclick = () => {
      const id = b.dataset.catSave;
      const input = tbody.querySelector(`[data-cat-name="${id}"]`);
      const name = input.value.trim();
      if (!name) { toast("Category name required.", "err"); return; }
      Store.saveCategory({ id, name });
      renderCategories(); toast("Category saved.");
    });
    tbody.querySelectorAll("[data-cat-del]").forEach((b) => b.onclick = () => {
      const c = Store.getCategories().find((x) => x.id === b.dataset.catDel);
      if (c && confirm(`Delete category "${c.name}"? Its products stay but become uncategorised in the filter.`)) {
        Store.deleteCategory(c.id); renderCategories(); toast("Category deleted.");
      }
    });
    $("#add-category") && ($("#add-category").onclick = () => {
      const name = prompt("New category name:");
      if (name && name.trim()) { Store.saveCategory({ name: name.trim() }); renderCategories(); toast("Category added."); }
    });
  }

  /* ================= COUNTRIES ======================================== */
  function renderCountries() {
    const tbody = $("#countries-tbody");
    if (!tbody) return;
    const list = Store.getCountries().sort((a, b) => (a.order || 0) - (b.order || 0));
    tbody.innerHTML = list.length ? list.map((c) => `
      <tr>
        <td style="font-size:1.3rem">${c.emblem ? `<img src="${esc(resolveImg(c.emblem))}" alt="" style="width:28px;height:20px;object-fit:cover;border-radius:3px">` : esc(c.flag || "—")}</td>
        <td>${esc(c.name)}</td>
        <td style="color:var(--text-muted-on-dark);font-size:.8rem">${Number(c.lat).toFixed(1)}, ${Number(c.lng).toFixed(1)}</td>
        <td>${c.hub ? "★ Hub" : "—"}</td>
        <td><button class="btn btn--ghost btn--sm" data-co-toggle="${c.id}">${c.active !== false ? "● Live" : "○ Off"}</button></td>
        <td>
          <button class="btn btn--ghost btn--sm" data-co-edit="${c.id}">Edit</button>
          <button class="btn btn--ghost btn--sm" data-co-del="${c.id}" style="color:#ff9b9b">Delete</button>
        </td>
      </tr>`).join("") : `<tr><td colspan="6" style="color:var(--text-muted-on-dark)">No countries yet.</td></tr>`;

    tbody.querySelectorAll("[data-co-toggle]").forEach((b) => b.onclick = () => {
      const c = Store.getCountries().find((x) => x.id === b.dataset.coToggle);
      Store.saveCountry({ ...c, active: c.active === false }); renderCountries();
    });
    tbody.querySelectorAll("[data-co-edit]").forEach((b) => b.onclick = () => openCountryEditor(b.dataset.coEdit));
    tbody.querySelectorAll("[data-co-del]").forEach((b) => b.onclick = () => {
      const c = Store.getCountries().find((x) => x.id === b.dataset.coDel);
      if (c && confirm(`Delete "${c.name}" from the map?`)) { Store.deleteCountry(c.id); renderCountries(); toast("Country removed."); }
    });
    $("#add-country") && ($("#add-country").onclick = () => openCountryEditor(null));
  }

  function openCountryEditor(id) {
    const editor = $("#country-editor"), view = $("#countries-view");
    const c = id ? Store.getCountries().find((x) => x.id === id) : null;
    editor.innerHTML = `
      <div class="admin-topbar"><h1>${c ? "Edit Country" : "Add Country"}</h1>
        <button class="btn btn--ghost btn--sm" id="co-back">&larr; Back</button></div>
      <form class="card inquiry-form" id="co-form" style="padding:1.25rem;max-width:620px">
        <input type="hidden" name="id" value="${esc(c?.id || "")}">
        <div class="field--row">
          <div class="field"><label>Country name *</label><input name="name" value="${esc(c?.name || "")}" placeholder="e.g. Oman"></div>
          <div class="field"><label>ISO code</label><input name="code" value="${esc(c?.code || "")}" placeholder="OM" maxlength="3"></div>
        </div>
        <div class="field--row">
          <div class="field"><label>Flag emoji</label><input name="flag" value="${esc(c?.flag || "")}" placeholder="🇴🇲"></div>
          <div class="field"><label>Emblem / flag image (URL or Drive link)</label><input name="emblem" value="${esc(c?.emblem || "")}" placeholder="optional — overrides the emoji"></div>
        </div>
        <div class="field--row">
          <div class="field"><label>Latitude *</label><input name="lat" type="number" step="0.01" value="${esc(c?.lat ?? "")}" placeholder="21.47"></div>
          <div class="field"><label>Longitude *</label><input name="lng" type="number" step="0.01" value="${esc(c?.lng ?? "")}" placeholder="55.98"></div>
        </div>
        <p class="form-note" style="margin-top:-.4rem">Tip: search “&lt;country&gt; lat long” to find coordinates. The pin is placed geographically on the world map.</p>
        <div class="row" style="gap:1.25rem">
          <label class="row" style="gap:.5rem"><input type="checkbox" name="hub" ${c?.hub ? "checked" : ""} style="width:auto"> Trade hub (origin of routes)</label>
          <label class="row" style="gap:.5rem"><input type="checkbox" name="active" ${c?.active !== false ? "checked" : ""} style="width:auto"> Live on map</label>
        </div>
        <div class="submit-row"><button class="btn btn--gold" type="submit">${c ? "Save country" : "Add country"}</button></div>
      </form>`;
    view.hidden = true; editor.hidden = false;
    const back = () => { editor.hidden = true; view.hidden = false; editor.innerHTML = ""; };
    $("#co-back").onclick = back;
    $("#co-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const data = {
        id: form.id.value || undefined,
        name: form.name.value.trim(),
        code: form.code.value.trim().toUpperCase(),
        flag: form.flag.value.trim(),
        emblem: form.emblem.value.trim(),
        lat: parseFloat(form.lat.value),
        lng: parseFloat(form.lng.value),
        hub: form.hub.checked,
        active: form.active.checked,
      };
      if (!data.name) { toast("Country name required.", "err"); return; }
      if (Number.isNaN(data.lat) || Number.isNaN(data.lng)) { toast("Latitude & longitude are required.", "err"); return; }
      Store.saveCountry(data); back(); renderCountries(); toast(id ? "Country updated." : "Country added.");
    });
  }

  /* ================= BRANDING ========================================= */
  function loadBranding() {
    const form = $("#branding-form");
    if (!form) return;
    const s = Store.getSettings();
    form.emblem.value = s.emblem || "assets/img/brand/logo.png";
    const preview = $("#b-preview");
    const draw = () => { if (preview) preview.innerHTML = `<img src="${esc(resolveImg(form.emblem.value))}" alt="Emblem preview">`; };
    draw();
    form.emblem.addEventListener("input", draw);
    form.onsubmit = (e) => {
      e.preventDefault();
      Store.saveSettings({ emblem: form.emblem.value.trim() });
      toast("Branding saved.");
    };
  }

  /* ---- misc ----------------------------------------------------------- */
  function setText(sel, v) { const el = $(sel); if (el) el.textContent = v; }
  function when(ts) {
    if (!ts) return "—";
    try { return new Date(ts).toLocaleString(); } catch (_) { return "—"; }
  }
})();
