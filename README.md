# Ranking public site redesign

New look for the public pages of ranking.bobwork.ai, built as a static prototype. It keeps the app's colors, fonts and copy and is ready to port into the real app.

| File | Replaces |
| --- | --- |
| `index.html` | `/` landing page |
| `pricing.html` | `/pricing` |
| `setup.html` | `/setup` (Set it up for me) |
| `assets/site.css` | Public-page styles (tokens match the app's `:root`) |
| `assets/motion.css` | Motion and 3D layer: tilted hero window, card tilt and spotlight, engine orbit, $1 coin, glow drift |
| `assets/site.js` | Nav, word rotator, reveal on scroll, tabs (auto-advance), billing toggle, cost calculator, 3D scroll tilt, count-ups, sticky phone CTA |

Run locally: `python -m http.server 8791 --directory ranking-site`, then open http://localhost:8791.

Hosted on Vercel at https://bobwork-ranking.vercel.app (project `abdul-haadis-projects/bobwork-ranking`). To redeploy, run `vercel.cmd deploy --prod` from this folder. `vercel.json` turns on clean URLs, so `/pricing.html` redirects to `/pricing`.

## Porting notes

- **Images** load from `https://ranking.bobwork.ai/img/...`. Change them to `/img/...` when moving into the app.
- **Links** to feature pages, blog, login and developers point at the live site. Swap `index.html` / `pricing.html` / `setup.html` for `/`, `/pricing`, `/setup`.
- **Nav and footer** are copied into each page. In the app they belong in the shared layout.
- **Setup platform picker** shows WordPress, Shopify and Wix in full. The live `/setup` has steps for 13 platforms; wire the rest from that data.
- **Calculator prices** are in `site.js` (`PRICES`). Keep them in sync with the price list, or render them from the same source.
- Every page works without JavaScript. Hero text uses a CSS-only entrance, and all motion is off under `prefers-reduced-motion`.
- The feature pages, blog, developers, contact and legal pages aren't redesigned yet. They can use `site.css` as is: the `page-hero dark` header plus `section`, `bento`, `faq` and `table-wrap` blocks.
