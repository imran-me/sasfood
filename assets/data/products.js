/* ============================================================================
   products.js (DATA) — Seed product catalogue
   ----------------------------------------------------------------------------
   The catalogue is now managed entirely from the Admin panel and stored in
   Firebase Firestore (the public site reads it back live). This seed is
   therefore EMPTY on purpose — the site starts with a clean catalogue and you
   add your real products in Admin → Products → "Add Product".

   (If you ever want sample products back as a template, earlier git history has
   the original 10-item seed.)

   Shape of one product (for reference):
     {
       id: "p1", slug: "basmati-1121", name: "1121 Basmati Rice",
       category: "Rice",                 // Rice | Oil | Palm Oil | Fruits | Spices | Sugar
       status: "published",              // "published" (shown) | "draft" (hidden)
       featured: true,
       shortDesc: "…", longDesc: "…",
       origins: ["India"], grades: ["Sella"], packaging: ["25kg bag"], moq: "1 FCL",
       images: [{ url: "https://… or data:… upload", alt: "…" }],
       specs: { Moisture: "≤ 12.5%" }, tags: ["new-crop"]
     }
   ========================================================================== */

window.PRODUCTS = [];
