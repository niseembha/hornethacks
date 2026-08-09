# HornetHacks Website

Landing site for **HornetHacks** — a 12-hour high school hackathon on
**Saturday, October 10, 2026** at the Valdes STEM + Innovation Center,
Greenhill School, Addison, TX.

The design is dark, clean, and quietly voxel: extruded 3D-block buttons,
isometric cube accents, a pixel-art hornet mark, and a restrained emerald
palette on near-black.

## Running locally

The site is plain HTML/CSS/JS with no build step. Any static server works
(or just open `index.html` — nothing requires a server anymore):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Deploying is just uploading the folder — GitHub Pages, Netlify, Vercel, and
Cloudflare Pages all serve it as-is with zero configuration.

## Things you'll want to edit

| What | Where |
| --- | --- |
| **Interest form + sponsor form URLs, contact email** | `js/config.js` — applied to the relevant buttons and links at load. Matching values also appear in the HTML as a no-JS fallback. |
| Schedule announcement and confirmed event hours | `schedule.html` |
| FAQ answers | `faq.html` |
| Copy on any page | The corresponding `.html` file |
| Colors / typography | CSS variables at the top of `css/style.css` |

The current interest form, sponsor form, and `team@hornethacks.com` contact
address are configured in `js/config.js`. Keep the HTML fallback links aligned
when any of those values change.

## Structure

```
index.html            Landing page (hero, facts, CTA)
about.html            What the event is, what to expect, venue
schedule.html         Confirmed event details and schedule announcement
faq.html              Accordion FAQ
sponsors.html         Sponsor pitch + sponsor interest CTA
contact.html          Email, forms, directions
css/style.css         All styles (design tokens up top)
js/config.js          ← form URLs + contact email live here
js/main.js            Mobile nav, config-driven links
js/voxel-title.js     Renders the hero wordmark as 3D voxel blocks
assets/fonts/         Self-hosted Geist Sans/Mono + Silkscreen
assets/favicon.svg    Pixel hornet favicon
```

## Notes

- **No external requests at runtime.** Fonts are self-hosted, so the site
  works offline and isn't affected by CDN outages or school network filters.
- **Accessibility.** Semantic navigation in the header and footer, visible
  focus states, and decorative animation disabled under
  `prefers-reduced-motion`.
