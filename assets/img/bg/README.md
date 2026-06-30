# Background photograph

Save the golden Dubai scene here as **exactly**:

```
assets/img/bg/dubai-gold.jpg
```

That filename is referenced by `assets/css/background.css` (`.bg-scene`). The site
masks, tints and slow-pans it automatically to blend into the deep-green canvas —
no editing needed. If the file is absent, the site simply falls back to the green
glow canvas (nothing breaks).

Tips for the best result:
- A landscape crop (≈3:2) with the skyline in the upper-centre works best — the
  feather mask keeps the centre and fades the edges into green.
- JPG, ~1600–2400px wide, optimised (<500 KB ideally) for fast loading.
- To swap it later, just replace this file (same name) and commit.
