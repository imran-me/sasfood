/* ============================================================================
   config.js — SINGLE SOURCE OF TRUTH for contact details + site settings
   ----------------------------------------------------------------------------
   The CLIENT edits this file (later: the Admin > Settings panel writes it).
   Every CTA on the site reads these values via cta-helper.js, so you only
   change the WhatsApp number / email / address ONCE, here.

   IMPORTANT: values wrapped in {CURLY} are placeholders. Replace them with the
   real client-supplied values before launch. Do NOT invent contact details.
   ========================================================================== */

window.SITE_CONFIG = {
  /* ---- Business identity --------------------------------------------- */
  // Real values from the company letterhead (Sara Gold / سارة جولد).
  legalName: "Sara Alsalam Foodstuff Trading L.L.C",
  shortName: "Sara Alsalam",
  brandName: "Sara Gold",                 // sub-brand on the logo (سارة جولد)
  tagline:   "Committed to Quality.",     // from the letterhead
  ethos:     "Trusted Global Food Trading Partner",
  website:   "www.saraalsalam.com",

  /* ---- Contact (from the official letterhead) ------------------------ */
  // WhatsApp number in E.164 WITHOUT '+' or spaces.
  whatsapp: "971567454014",
  email:    "sasfood.ae@gmail.com",
  phone:    "+971 56 745 4014",
  address:  "Office 222, 2nd Floor, RAG Global Business Center, Al Hilal Bank Building, Al Qusais, Dubai, United Arab Emirates",
  mapUrl:   "https://www.google.com/maps/search/?api=1&query=RAG+Global+Business+Center+Al+Hilal+Bank+Building+Al+Qusais+Dubai",
  hours:    "Sun–Thu, 9:00–18:00 (GST)",

  /* ---- Social links (optional — add real URLs when available) -------- */
  socials: {
    instagram: "{INSTAGRAM}",
    facebook:  "{FACEBOOK}",
    linkedin:  "{LINKEDIN}",
  },

  /* ---- Markets (order = display order) ------------------------------- */
  markets: [
    { name: "Dubai",        flag: "🇦🇪" },
    { name: "Qatar",        flag: "🇶🇦" },
    { name: "India",        flag: "🇮🇳" },
    { name: "Bangladesh",   flag: "🇧🇩" },
    { name: "Iraq",         flag: "🇮🇶" },
    { name: "South Africa", flag: "🇿🇦" },
  ],

  /* ---- Trust-strip stats (client to confirm the numbers) ------------- */
  stats: [
    { value: 6,  suffix: "",  label: "Trading Markets" },
    { value: 20, suffix: "+", label: "Premium SKUs" },
    { value: 6,  suffix: "",  label: "Core Categories" },
    { value: 100, suffix: "%", label: "Bulk / Wholesale" },
  ],

  /* ---- Certifications (set show:false to omit if not applicable) ------ */
  certs: [
    { label: "Halal Certified",  show: true  },
    { label: "ISO 22000",        show: true  },
    { label: "HACCP",            show: true  },
  ],

  /* ---- Message templates (used by cta-helper.js) --------------------- */
  // {product}, {packaging}, {country}, {name} are filled in at click time.
  templates: {
    // Generic "Request a Quote" button.
    generic:
      "Hello Sara Alsalam, I'd like to start a bulk inquiry. " +
      "Please share your catalogue and FOB/CIF terms. Thank you.",
    // Per-product inquiry.
    product:
      "Hello Sara Alsalam, I'd like a bulk quote for {product} ({packaging}). " +
      "Destination: {country}. Please share FOB/CIF terms. — {name}",
    // Email subject line.
    emailSubject: "Bulk Inquiry — {product}",
  },
};
