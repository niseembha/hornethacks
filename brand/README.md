# HornetHacks brand kit

Everything needed to represent HornetHacks consistently — the pixel bee, the
wordmark lockups, the HH monogram, the color palette, and the typefaces.
All marks are self-contained SVG pixel art (no fonts required to render
them), plus ready-to-drop PNG exports.

## Logos — `logo/`

| File | What it is | Use it for |
| --- | --- | --- |
| `bee.svg` | The pixel bee mark on its own | Avatars, favicons, stickers, tight spaces |
| `lockup-horizontal.svg` | Bee + HORNETHACKS side by side (the site header lockup) | Headers, banners, one-line placements |
| `lockup-stacked.svg` | Large bee centered above HORNETHACKS | Posters, slide title pages, square-ish placements |
| `monogram-hh.svg` | The HH initials in Silkscreen | Tiny spaces where the full wordmark won't fit |
| `png/` | Transparent PNG exports of each mark | Anywhere SVG isn't accepted |

Every mark uses the one brand palette — white `#ededed`, emerald `#34d399`,
black `#000000` — and every letter carries a 1px black pixel outline, the
same treatment as the bee. That outline is what lets a single set of files
work anywhere: it melts into the site's dark surfaces and carries the
letterforms on light ones.

Ground rules: don't recolor, restyle, outline, rotate, or add effects to the
marks; don't set the wordmark in another font. Keep clear space around every
mark of at least the height of one "pixel" cell of the bee.

## Colors — `colors/`

Swatch card: `colors/palette.svg`. Tokens ready to import: `colors/colors.css`.

| Name | Hex | Role |
| --- | --- | --- |
| Background | `#0a0a0a` | Page background |
| Surface | `#101010` | Cards, panels |
| Surface 2 | `#161616` | Raised / hovered surfaces |
| Border | `#222222` | Hairline borders |
| Border strong | `#383838` | Emphasized borders, extrusion steps |
| Text | `#ededed` | Primary text, the wordmark's "HORNET" |
| Text dim | `#9b9b9b` | Secondary text |
| Text faint | `#6b6b6b` | Tertiary text, quiet labels |
| Emerald | `#34d399` | The brand green — accents, "HACKS", the bee's stripes |
| Emerald bright | `#6ee7b7` | Highlights, hover states |
| Emerald deep | `#0e9f6e` | Green on light backgrounds, gradient end |
| Emerald dark | `#0b6b4c` | 3D side faces, deep accents |
| Emerald darker | `#07452f` | Deepest extrusion steps |

Signature gradient: `linear-gradient(100deg, #6ee7b7, #34d399 45%, #0e9f6e)`.

## Fonts — `fonts/`

| Family | Weights | Role |
| --- | --- | --- |
| Silkscreen | 400, 700 | Display pixel type: the wordmark, labels, eyebrows. Render at multiples of 8px (8/16/24…) to stay crisp |
| Geist Sans | 400, 500, 600, 700 | Headings and body copy |
| Geist Mono | 400, 500 | Meta lines, dates, technical details |

All three are open fonts (SIL Open Font License): Silkscreen by Jason
Kottke, Geist Sans and Geist Mono by Vercel. The `.woff2` files here are the
exact builds the site ships.
