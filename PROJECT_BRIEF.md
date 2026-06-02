# Nielsen Studio — Project Brief

> Read this entire document before writing any code. It defines what we are building,
> the stack, the design system, and the conventions to follow. When in doubt, this
> document wins over default habits.

---

## 0. Kickoff instruction (read first)

You are helping build the portfolio website for **Nielsen Studio** — a freelance web
design studio run by Simon Nielsen (Aalborg, Denmark). Domain: `nielsens.studio`.

Before doing anything:
1. Read this whole brief.
2. Read `TASTE_SKILL_OVERRIDE` (section 7) carefully — it tells you how to use the
   installed taste-skill WITHOUT letting it drag the project into the wrong stack.
3. Do not scaffold a React/Next.js project. This is a **vanilla HTML/CSS/JS + GSAP** build.
4. When you start, propose a file/folder structure and wait for confirmation before
   generating full pages.

---

## 1. What we are building

A premium, conversion-focused portfolio site for Nielsen Studio. It must do three things,
in priority order:
1. **Land clients** (clear positioning, obvious contact path, trust signals).
2. **Show range** — Simon offers both **web design** and **documents/decks** (PDFs,
   PowerPoints). This dual offering is the key differentiator and must be visible.
3. **Demonstrate skill** — one real interactive 3D moment in the hero proves the
   3D-web specialism without bloating the whole site.

Target audience: small businesses and founders who need a professional site or
brand collateral and want someone who clearly has taste and technical ability.

---

## 2. Tech stack (do not deviate without asking)

- **Vanilla HTML, CSS, JavaScript.** No React, no Next.js, no build framework.
- **GSAP + ScrollTrigger** for animation (Simon's established toolset).
- **Three.js** for ONE thing only: the interactive hero material (see section 6).
- Local dev: simple static server. Deploy target: Vercel (same as the NAS project).
- No Tailwind. Plain CSS (or CSS custom properties + a small utility layer if useful).

Rationale: this is a portfolio. The whole point is that Simon built it himself in the
stack he knows. AI-generated framework code from a template would undermine that.

---

## 3. Brand & positioning

- **Name on site:** Nielsen Studio
- **One-liner direction:** something concrete about building sites + brand collateral
  that convert. Avoid filler words ("Elevate", "Seamless", "Unleash", "Next-Gen").
- **Voice:** direct, confident, no fluff. Danish founder; site is in English (confirm
  with Simon if a Danish version is wanted later).

---

## 4. Design system — "Dark & burnt orange" (Direction 1)

### Palette
| Token | Hex | Use |
| --- | --- | --- |
| `--bg` | `#0d0d0f` | Page background (warm near-black — never pure #000) |
| `--surface` | `#1c1c20` | Elevated surfaces, cards when truly needed |
| `--accent` | `#c8643c` | Burnt orange — CTAs, links, hover, 3D rim light |
| `--text` | `#f4f2ec` | Primary text (warm off-white — never pure #fff) |
| `--text-muted` | `#8a8780` | Secondary text, labels |

Discipline: ONE accent color, used sparingly. Orange should feel like a signal, not
wallpaper. Saturation stays restrained.

### Typography
- **Headings:** Fraunces (variable serif — editorial character, the "stop and notice" face).
- **Body / UI:** Inter (screen-optimized, legible).
- **Optional technical accent:** a monospace (JetBrains Mono or Geist Mono) for small
  labels, section numbers ("01 / Work"). Gives dev credibility under the editorial layer.
- Serif headings ARE correct here — this is an editorial/creative studio, which is the
  one context where serif is encouraged.

### Motion principles (translate to GSAP)
- Restrained and weighty, not bouncy.
- Long fade/translate reveals: ~0.8–1.2s, ease `power3.out`.
- Text reveals line-by-line with a small stagger.
- ScrollTrigger pinning to present case studies.
- ONE signature movement reused throughout so the site feels coherent, not like an
  effects buffet. Motion serves readability and flow.
- Animate only `transform` and `opacity`. Never `top/left/width/height`.

---

## 5. Site structure (conversion-first)

Single page or few pages — push visitors toward contact.

1. **Hero** — interactive 3D material (drag to rotate) + Nielsen Studio + one-liner.
2. **Intro / positioning** — short statement of what Simon does and for whom.
3. **Selected work**
   - **NAS** as the large primary case (shows BOTH web and documents/decks in one
     coherent project — site + Company Profile PDF + pitch deck).
   - **BarrierLab** as the second case (brand/design + e-commerce feel).
4. **Services** — web design + documents/decks. This dual offering is the differentiator.
5. **About / process** — short.
6. **Contact CTA** — clear, low-friction.

Layout notes (from taste-skill, stack-agnostic):
- Avoid centered hero text — prefer split / left-aligned-content / asymmetric.
- No generic "3 equal cards in a row" feature section. Use a 2-column zig-zag,
  asymmetric grid, or horizontal scroll instead.
- Cards only when elevation communicates real hierarchy; otherwise use spacing and
  1px dividers.

---

## 6. The 3D hero (Three.js — keep it scoped)

A material the visitor can rotate with the mouse. This is Simon's first real Three.js
project, so keep it bounded and learnable:

- A single geometry (sphere, torus, or a custom/extruded form).
- An interesting material: dark metal/glass-like shader with a burnt-orange rim light
  that matches `--accent`.
- `OrbitControls` (or mouse-parallax) to rotate.
- Dark background so the lighting on the material is the hero element.
- Mobile: provide a lightweight fallback (static render or reduced effect) — do not ship
  a heavy WebGL loop to phones. Respect `prefers-reduced-motion`.

This maps directly to the early lessons of Bruno Simon's "Three.js Journey", which Simon
is working through.

---

## 7. TASTE_SKILL_OVERRIDE (important)

The installed taste-skill is excellent for design quality, but it is written for
**React / Next.js / Tailwind / Framer Motion**. We are NOT using that stack.

**Instruction to Claude Code:**
> Follow the taste-skill's design directives, performance guardrails, and anti-slop
> rules. IGNORE all React / Next.js / Server Component / Tailwind / Framer Motion
> directives. We build vanilla HTML/CSS/JS with GSAP. Translate every Framer Motion
> concept to its GSAP equivalent (e.g. spring/stagger → GSAP timelines with stagger;
> layout transitions → GSAP FLIP if needed; magnetic buttons → GSAP quickTo on
> pointermove). Use GSAP/ScrollTrigger for scroll-telling and Three.js for the hero
> canvas only, wrapped in proper init/cleanup.

**Keep from taste-skill (stack-agnostic, high value):**
- Typography discipline, max 1 accent color < 80% saturation, anti-center bias.
- AI-tells to avoid: never `#000000`, no neon/outer glows, no generic names/numbers,
  no Unsplash (use real assets or reliable placeholders), no emojis in code/markup.
- Performance: animate only `transform`/`opacity`; grain/noise only on fixed
  pointer-events-none layers; restrained z-index.
- The "Creative Arsenal" as inspiration (parallax tilt, sticky scroll stack,
  text mask reveal, kinetic marquee, etc.) — implemented in GSAP, not Framer.

**One apparent conflict, resolved:** the taste-skill bans serif and bans Inter. Our brief
uses Fraunces (serif headings) + Inter (body). This is fine: the skill allows serif for
editorial/creative work (which this is), and the Inter ban targets generic *headings* —
our character comes from Fraunces, so Inter for body is acceptable. The brief wins here.

---

## 8. Visual assets (generated separately, NOT a code dependency)

Assets (hero textures, case mockups, background imagery, any loop video) are generated
ahead of time with an external AI image/video tool and dropped into the project as
finished files. Claude Code does NOT call any asset API — it just consumes files from
an `/assets` (or `/public/assets`) folder.

Planned asset list (to be produced and added):
- Hero environment / texture map for the 3D material (dark, subtle, orange-lit).
- Case study cover images / device mockups for NAS and BarrierLab.
- Optional: a short seamless loop video for a section background.
- Favicon / OG image in the Nielsen Studio palette.

When referencing assets in code, use clear, stable paths and document expected
dimensions so the real files can be swapped in without layout shift.

---

## 9. Conventions & quality bar

- Semantic HTML, accessible (alt text, focus states, reduced-motion support).
- Mobile-first responsiveness; asymmetric desktop layouts collapse cleanly to single
  column under ~768px.
- Clean, readable, commented-where-useful code — this is itself a portfolio piece.
- Full interaction states: hover, active (`:active` tactile press), focus, and any
  loading/empty states for the contact form.
- No placeholder comments or half-finished blocks. Ship complete sections.

---

## 10. How we work

- Simon builds in VS Code with Claude Code. This brief is the shared source of truth.
- Propose structure first, confirm, then build section by section.
- Keep the signature motion consistent across sections.
- Flag any moment where a taste-skill default would conflict with this brief — the
  brief wins unless Simon says otherwise.
