# Icon assets

SVGs here are ready to use. The **raster** files below are referenced by
`index.html` / `site.webmanifest` but must be generated from `emblem.svg`
(they can't be created as text). Use any export tool (Figma, Inkscape,
`npx sharp`, realfavicongenerator.net):

| File | Size | Source |
|---|---|---|
| `favicon.ico` | 16/32/48 | `favicon.svg` |
| `apple-touch-icon.png` | 180×180 | `emblem.svg` on #0C3B2E |
| `icon-192.png` | 192×192 | `emblem.svg` |
| `icon-512.png` | 512×512 (maskable) | `emblem.svg`, ~12% safe padding |
| `og-image.png` | 1200×630 | logo + tagline + monument silhouette |

Until these exist, the SVG favicon still works in modern browsers.
