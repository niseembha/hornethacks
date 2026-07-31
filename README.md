# HornetHacks Website

Single-page landing site for **HornetHacks** — a 12-hour high school
hackathon on **Saturday, October 10, 2026** at the Valdes STEM + Innovation
Center, Greenhill School, Addison, TX.

The design is ultra-minimal monochrome (black / white / gray, one amber
status dot) in the spirit of vercel.com. The counterpoint is the centerpiece:
a **photoreal 3D hornets' nest** — procedurally generated paper banding,
a bark-textured branch, and tiny hornets that fly in and out of the entrance
or crawl on the surface. It is purely aesthetic: one viewport, no scrolling,
no navigation.

## Running locally

Plain HTML/CSS/JS, no build step — but the 3D nest uses ES modules, so serve
over HTTP (opening `index.html` straight from the filesystem won't load it):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Deploying is just uploading the folder — GitHub Pages, Netlify, Vercel, and
Cloudflare Pages serve it as-is with zero configuration.

## Things you'll want to edit

| What | Where |
| --- | --- |
| **Interest form + sponsor form URLs, contact email** | `js/config.js` — applied to every link at load. (The same placeholder URLs also sit in the HTML `href`s as a no-JS fallback — search for `REPLACE-WITH` when you update them.) |
| Headline / copy / dates | `index.html` |
| Colors / typography | CSS variables at the top of `css/style.css` |
| Nest shape, materials, lighting, hornet behavior | `js/nest.js` (profile, palette, and counts are all near the top of each section) |

> **Placeholders to replace before launch:** both `forms.gle/REPLACE-WITH-…`
> URLs in `js/config.js`, and the `hello@hornethacks.org` contact email.

## Structure

```
index.html            The entire site (one viewport, no scroll)
css/style.css         All styles (monochrome tokens up top)
js/config.js          ← form URLs + contact email live here
js/main.js            Config-driven links, year stamp
js/nest.js            The photoreal nest + hornets (Three.js)
assets/vendor/        Vendored Three.js (no CDN dependency)
assets/fonts/         Self-hosted Geist Sans + Geist Mono
assets/favicon.svg    Monochrome hornet-in-hexagon mark
```

## Notes

- **No external requests at runtime.** Three.js and the fonts are vendored;
  every texture on the nest is generated in-browser on a canvas. Works
  offline and behind school network filters.
- **Fallbacks.** A static nest silhouette renders when JavaScript or WebGL
  is unavailable, so the layout never breaks. With `prefers-reduced-motion`,
  the nest holds still and the flying hornets stay home.
- **Interaction.** The nest is decorative, but you can drag to spin it, and
  it sways gently while idle. On phones, vertical swipes are left alone.
- **No-scroll layout.** The page is designed to fit one viewport at any
  reasonable size; on very short screens (< 540 px) scrolling is re-enabled
  so nothing becomes unreachable.
