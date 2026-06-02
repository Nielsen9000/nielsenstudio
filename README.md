# Nielsen Studio

Portfolio site for **Nielsen Studio** — freelance web design by Simon Nielsen,
Aalborg, Denmark. `nielsens.studio`.

Built deliberately in **vanilla HTML / CSS / JS + GSAP**, with **Three.js** for
one interactive hero material. No framework, no build step — the site is itself a
portfolio piece. See [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) for the full brief and
design system (it is the source of truth).

## Stack

- Vanilla HTML, CSS, JavaScript (ES modules)
- [GSAP](https://gsap.com/) + ScrollTrigger — animation (loaded from CDN, pinned)
- [Three.js](https://threejs.org/) — the hero 3D material only (CDN, pinned)
- Self-hosted fonts (woff2) — see [`fonts/FONTS.md`](fonts/FONTS.md)
- Deploy: Vercel (static)

## Local development

No build. Serve the folder with a static server so ES modules and absolute
paths (`/css/...`, `/js/...`) resolve:

```bash
npx serve .
# → http://localhost:3000
```

Open the printed URL. Editing a file + refresh is the whole loop.

> Use `npx serve` (or an equivalent static server), **not**
> `python3 -m http.server` — the Python server doesn't handle HTTP range
> requests well, which breaks video seeking/scrubbing in later sections.

> Open via `http://localhost`, not `file://` — ES modules and the font/asset
> absolute paths require an HTTP origin.

The `serve` config in [`serve.json`](serve.json) mirrors the Vercel clean-URL
and cache behaviour locally.

## Project structure

```
index.html          Single page; all sections, semantic markup
css/
  reset.css         Small modern reset
  tokens.css        Design system: colour, type, spacing, motion (edit here)
  base.css          @font-face, global typography, links, focus, utilities
  sections.css      Per-section layout + the shared reveal mechanic
js/
  main.js           Entry: reduced-motion gate, module init
  animations.js     GSAP/ScrollTrigger — the signature reveal + scroll-telling
  hero3d.js         Three.js hero material (init/cleanup, mobile fallback)
  magnetic.js       Magnetic buttons (GSAP quickTo)
  contact.js        Contact form: validation + states
assets/             Externally generated images/video (see assets/ASSETS.md)
fonts/              Self-hosted woff2 (see fonts/FONTS.md)
vercel.json         Static deploy config (clean URLs, cache headers)
```

## Assets & fonts

Both are **dropped in as finished files** — the code never generates them and
never calls an asset API. Each has a documented slot (path + dimensions) so real
files swap in without layout shift:

- Images / video / favicon / OG → [`assets/ASSETS.md`](assets/ASSETS.md)
- Fonts (self-hosted, GDPR-friendly) → [`fonts/FONTS.md`](fonts/FONTS.md)

Until real files exist, CSS fallbacks keep layout stable.

## Deploy

Push to a Vercel project; it serves the static files directly (no framework
preset needed). `vercel.json` sets clean URLs and long-lived cache headers for
`/fonts` and `/assets`.

## Build order

Section by section, per the brief: foundation (done) → hero (3D + signature
motion) → intro → selected work (NAS primary, Royal Nectar Ventures second) →
services → about → contact.
