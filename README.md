# HornetHacks Website

Landing site for **HornetHacks** — a 12-hour high school hackathon on
**Saturday, October 10, 2026** at the Valdes STEM + Innovation Center,
Greenhill School, Addison, TX.

The centerpiece is an interactive, realistic 3D honeycomb on the home page:
drag it to spin, click a cell to navigate. The six cells around the center
link to About, Schedule, FAQ, Sponsors, Contact, and the interest form.

## Running locally

The site is plain HTML/CSS/JS with no build step, but the 3D hive uses ES
modules, so it must be served over HTTP (opening `index.html` directly from
the filesystem won't load the hive). Any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Deploying is just uploading the folder — GitHub Pages, Netlify, Vercel, and
Cloudflare Pages all serve it as-is with zero configuration.

## Things you'll want to edit

| What | Where |
| --- | --- |
| **Interest form + sponsor form URLs, contact email** | `js/config.js` — applied to every button, link, and hive cell at load. (The same placeholder URLs also appear in the HTML `href`s as a no-JS fallback — search for `REPLACE-WITH` when you update them.) |
| Schedule times | `schedule.html` (currently marked tentative) |
| FAQ answers | `faq.html` |
| Copy on any page | The corresponding `.html` file |
| Colors / typography | CSS variables at the top of `css/style.css` |
| Hive cells, links, and materials | `js/hive.js` (`NAV_CELLS` and `DECOR_CELLS` at the top) |

> **Placeholders to replace before launch:** both `forms.gle/REPLACE-WITH-…`
> URLs in `js/config.js`, and the `hello@hornethacks.org` contact email.
> The 8 AM – 8 PM times and day-of schedule are reasonable defaults for a
> 12-hour event — adjust to your real run-of-show.

## Structure

```
index.html            Landing page (hero, 3D hive, facts, CTA)
about.html            What the event is, what to expect, venue
schedule.html         Day-of timeline
faq.html              Accordion FAQ
sponsors.html         Sponsor pitch + sponsor interest CTA
contact.html          Email, forms, directions
css/style.css         All styles (design tokens up top)
js/config.js          ← form URLs + contact email live here
js/main.js            Mobile nav, config-driven links
js/hive.js            The interactive 3D hive (Three.js)
assets/vendor/        Vendored Three.js (no CDN dependency)
assets/fonts/         Self-hosted Geist Sans + Geist Mono
assets/*.svg          Hornet mark + favicon
```

## Notes

- **No external requests at runtime.** Three.js and the fonts are vendored,
  so the site works offline and isn't affected by CDN outages or school
  network filters.
- **Accessibility & fallbacks.** The hive is progressive enhancement: every
  cell's destination is also in the header and footer nav, and a static SVG
  honeycomb with the same links renders when JavaScript or WebGL is
  unavailable. Idle animation is disabled for users with
  `prefers-reduced-motion`.
- **Mobile.** The hive rotates with horizontal drags and keeps vertical
  swipes for page scrolling; taps on cells navigate.
