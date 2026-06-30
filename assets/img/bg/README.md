# Background photograph

The hero background now ships ready-to-go as **`dubai-scene.webp`** (an optimised,
transparent golden Dubai scene generated from the supplied art) — referenced by
`assets/css/background.css` (`.bg-scene`). No action needed.

To swap it, replace `dubai-scene.webp` (keep the name) with another landscape
golden scene, or point `.bg-scene` at your own file. The site
masks, tints and slow-pans it automatically to blend into the deep-green canvas —
no editing needed. If the file is absent, the site simply falls back to the green
glow canvas (nothing breaks).

Tips for the best result:
- A landscape crop (≈3:2) with the skyline in the upper-centre works best — the
  feather mask keeps the centre and fades the edges into green.
- JPG, ~1600–2400px wide, optimised (<500 KB ideally) for fast loading.
- To swap it later, just replace this file (same name) and commit.
