/* ============================================================================
   products.js (DATA) — Seed product catalogue (10 samples)
   ----------------------------------------------------------------------------
   This is the SEED the Store loads into localStorage on first run
   (assets/js/store.js). After that, the admin panel owns the data and the
   public site reads it back from the Store — so admin edits show up live.

   To reset to this seed: open the admin panel and click "Reset demo data",
   or run `localStorage.clear()` in the browser console.

   HOW TO EDIT (seed)
     - category MUST be one of: Rice | Oil | Palm Oil | Fruits | Spices | Sugar
     - id + slug must be unique.
     - images: drop files in assets/img/products/ and reference them here.
     - status: "published" (shown) | "draft" (hidden on the public site).

   PHASE 8: this seed will be imported once into Firestore; thereafter Firestore
   is the source of truth. Keep the SHAPE identical.
   ========================================================================== */

window.PRODUCTS = [
  /* ----- Rice ----- */
  {
    id: "p1",
    name: "Basmati Rice — 1121 Steam",
    slug: "basmati-1121-steam",
    category: "Rice",
    shortDesc: "Extra-long grain 1121 basmati, sortex-clean and export-graded.",
    longDesc:
      "Premium 1121 steam basmati with exceptional cooked-grain length and a clean " +
      "aroma. Aged for fluffy, non-sticky results — ideal for biryani and pilaf " +
      "programs across the GCC and South Asia.",
    origins: ["India", "Pakistan"],
    grades: ["1121 Steam", "1121 Sella", "Creamy Sella"],
    packaging: ["5 kg", "25 kg", "50 kg (PP/jute)"],
    moq: "1 x 20ft container",
    specs: { "Avg. grain length": "8.30 mm", "Moisture": "≤ 12.5%", "Broken": "≤ 1%", "Sortex": "Double" },
    images: [{ url: "assets/img/products/basmati.jpg", alt: "Heap of long-grain basmati rice" }],
    featured: true, order: 1, status: "published", tags: ["aromatic", "premium"],
  },
  {
    id: "p2",
    name: "Parboiled Rice (Sella)",
    slug: "parboiled-sella",
    category: "Rice",
    shortDesc: "Golden parboiled long-grain — firm, separate grains at scale.",
    longDesc:
      "Long-grain parboiled (sella) rice with reliable yield and a firm bite, well " +
      "suited to foodservice and institutional buyers. Consistent colour, low broken %.",
    origins: ["India", "Thailand"],
    grades: ["IR64 Parboiled", "Swarna Parboiled"],
    packaging: ["25 kg", "50 kg"],
    moq: "1 x 20ft container",
    specs: { "Broken": "≤ 5%", "Moisture": "≤ 13%", "Polish": "Double" },
    images: [{ url: "assets/img/products/parboiled.jpg", alt: "Golden parboiled rice grains" }],
    order: 2, status: "published", tags: ["foodservice"],
  },

  /* ----- Oil ----- */
  {
    id: "p3",
    name: "Refined Sunflower Oil",
    slug: "sunflower-oil",
    category: "Oil",
    shortDesc: "Light, neutral refined sunflower oil in drums, tins and flexitanks.",
    longDesc:
      "Winterised refined sunflower oil with a clean taste and high smoke point. " +
      "Available bottled, in tins, drums or flexitank for bulk programs.",
    origins: ["Ukraine", "Russia", "Argentina"],
    grades: ["RBD", "Winterised"],
    packaging: ["1 L PET", "5 L jerry", "200 L drum", "Flexitank"],
    moq: "1 x 20ft container",
    specs: { "FFA": "≤ 0.1%", "Moisture": "≤ 0.1%", "Smoke point": "~225°C" },
    images: [{ url: "assets/img/products/sunflower.jpg", alt: "Golden sunflower oil being poured" }],
    featured: true, order: 3, status: "published", tags: ["edible oil"],
  },
  {
    id: "p4",
    name: "Refined Soybean Oil",
    slug: "soybean-oil",
    category: "Oil",
    shortDesc: "Versatile refined soybean oil at consistent quality and scale.",
    longDesc: "Refined, bleached and deodorised soybean oil for frying and food manufacturing. Stable supply, multiple pack sizes.",
    origins: ["Argentina", "Brazil"],
    grades: ["RBD"],
    packaging: ["5 L jerry", "200 L drum", "Flexitank"],
    moq: "1 x 20ft container",
    specs: { "FFA": "≤ 0.1%", "Colour": "≤ 2.0 R" },
    images: [{ url: "assets/img/products/soybean.jpg", alt: "Bottles of refined soybean oil" }],
    order: 4, status: "published", tags: [],
  },

  /* ----- Palm Oil ----- */
  {
    id: "p5",
    name: "RBD Palm Olein (CP8/CP10)",
    slug: "rbd-palm-olein",
    category: "Palm Oil",
    shortDesc: "RBD palm olein for bulk buyers, packed to destination standards.",
    longDesc:
      "Refined, bleached, deodorised palm olein (CP8 / CP10) for frying and " +
      "manufacturing. Packed in jerrycans, drums or flexitank to your market's specs.",
    origins: ["Malaysia", "Indonesia"],
    grades: ["CP8", "CP10"],
    packaging: ["10 L jerry", "20 L jerry", "Flexitank", "Bulk vessel"],
    moq: "1 x 20ft container",
    specs: { "Cloud point": "8°C / 10°C", "FFA": "≤ 0.1%", "IV": "56–60" },
    images: [{ url: "assets/img/products/palm-olein.jpg", alt: "Palm olein in a clear jerrycan" }],
    featured: true, order: 5, status: "published", tags: ["palm"],
  },

  /* ----- Fruits ----- */
  {
    id: "p6",
    name: "Fresh Pomegranate",
    slug: "pomegranate",
    category: "Fruits",
    shortDesc: "Deep-red, high-brix pomegranates, cold-chain from orchard to port.",
    longDesc: "Premium pomegranates with intense colour and sweetness, graded by count and handled through the cold chain for export freshness.",
    origins: ["India", "Egypt"],
    grades: ["Count 8–12", "Count 12–16"],
    packaging: ["3.5 kg carton", "10 kg carton"],
    moq: "1 x 40ft reefer",
    specs: { "Brix": "15–17", "Cold chain": "2–5°C" },
    images: [{ url: "assets/img/products/pomegranate.jpg", alt: "Fresh red pomegranates in a crate" }],
    featured: true, order: 6, status: "published", tags: ["fresh", "reefer"],
  },
  {
    id: "p7",
    name: "Fresh Mango (Seasonal)",
    slug: "mango",
    category: "Fruits",
    shortDesc: "Premium seasonal mangoes — Kesar, Alphonso and more.",
    longDesc: "Seasonal mango varieties hand-selected for aroma and brix, cold-chain handled for export markets across the Gulf.",
    origins: ["India", "Pakistan"],
    grades: ["Kesar", "Alphonso", "Chaunsa"],
    packaging: ["3 kg carton", "5 kg carton"],
    moq: "1 x 40ft reefer",
    specs: { "Brix": "14–20", "Season": "Apr–Aug" },
    images: [{ url: "assets/img/products/mango.jpg", alt: "Ripe mangoes in an export carton" }],
    order: 7, status: "published", tags: ["seasonal"],
  },

  /* ----- Spices ----- */
  {
    id: "p8",
    name: "Whole & Ground Turmeric",
    slug: "turmeric",
    category: "Spices",
    shortDesc: "High-curcumin turmeric with origin traceability and true colour.",
    longDesc: "Bright, high-curcumin turmeric available as fingers, bulbs or ground powder — steam-sterilised options for sensitive markets.",
    origins: ["India"],
    grades: ["Fingers", "Bulbs", "Ground"],
    packaging: ["25 kg PP", "50 kg PP"],
    moq: "Pallet / container",
    specs: { "Curcumin": "2–5%", "Sterilised": "Optional" },
    images: [{ url: "assets/img/products/turmeric.jpg", alt: "Mound of golden turmeric powder" }],
    featured: true, order: 8, status: "published", tags: ["origin traceable"],
  },
  {
    id: "p9",
    name: "Black Pepper",
    slug: "black-pepper",
    category: "Spices",
    shortDesc: "Bold black pepper by density grade, whole or ground.",
    longDesc: "Sun-dried black pepper graded by bulk density (G1/G2), whole or ground, with vivid pungency.",
    origins: ["India", "Vietnam"],
    grades: ["550 g/l", "500 g/l"],
    packaging: ["25 kg"],
    moq: "Pallet / container",
    specs: { "Density": "500–580 g/l", "Moisture": "≤ 12%" },
    images: [{ url: "assets/img/products/pepper.jpg", alt: "Black peppercorns" }],
    order: 9, status: "published", tags: [],
  },

  /* ----- Sugar ----- */
  {
    id: "p10",
    name: "Refined White Sugar (ICUMSA 45)",
    slug: "icumsa-45",
    category: "Sugar",
    shortDesc: "Sparkling refined white sugar, ICUMSA 45, in bulk bags & containers.",
    longDesc:
      "Premium refined white sugar at ICUMSA 45 — bright, free-flowing crystals for " +
      "beverage, bakery and retail packers. Supplied in 50 kg bags or jumbo bags.",
    origins: ["Brazil", "India"],
    grades: ["ICUMSA 45"],
    packaging: ["50 kg PP", "1 MT jumbo bag", "Container"],
    moq: "1 x 20ft container",
    specs: { "ICUMSA": "≤ 45", "Polarisation": "≥ 99.8%", "Moisture": "≤ 0.04%" },
    images: [{ url: "assets/img/products/icumsa45.jpg", alt: "White refined sugar crystals catching light" }],
    featured: true, order: 10, status: "published", tags: ["refined"],
  },
];
