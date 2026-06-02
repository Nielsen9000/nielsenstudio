# Fonts — Nielsen Studio

**Decision: fonts are self-hosted (woff2 in `/fonts`). We do NOT use Google Fonts
CDN.** Rationale: faster first render (no third-party connection / extra DNS +
TLS), and GDPR-friendly (no visitor IP sent to Google). This is settled — don't
reintroduce a font CDN without asking Simon.

`@font-face` declarations live in [`/css/base.css`](../css/base.css). Paths there
must match the filenames below exactly, or text falls back to the stack defined
in `tokens.css`.

## Expected files

| File | Family | Type | Weights | Used for |
| --- | --- | --- | --- | --- |
| `Fraunces-Variable.woff2` | Fraunces | Variable serif | 300–600 | Headings (h1–h4), brand wordmark |
| `Inter-Variable.woff2` | Inter | Variable sans | 300–600 | Body, UI, lead copy |
| `JetBrainsMono-Regular.woff2` | JetBrains Mono | Static | 400 | Eyebrows, section numbers, small labels |

Two of these are preloaded in `index.html` (Fraunces + Inter) because they paint
immediately above the fold. Mono is not preloaded — it's used for small labels.

## How to produce the woff2 files

Subset to keep them light. Latin + basic punctuation is plenty for an English site.

- **Fraunces** — variable, SIL Open Font License. Source: Google Fonts
  (download family) or the Undeadinstitute GitHub repo. Keep the `opsz` and `wght`
  axes; drop `SOFT`/`WONK` if subsetting to save weight (optional).
- **Inter** — variable, SIL OFL. Source: rsms.me/inter or Google Fonts. Keep `wght`.
- **JetBrains Mono** — SIL OFL. Source: jetbrains.com/lp/mono or Google Fonts.
  Only the Regular (400) weight is needed.

Suggested subsetting tool — `glyphhanger` or `fonttools`:

```bash
# Example (fonttools): subset a variable font to latin + keep wght/opsz axes
pip install fonttools brotli
fonttools varLib.instancer Fraunces.ttf  # only if flattening axes (optional)
pyftsubset Fraunces.ttf \
  --output-file=Fraunces-Variable.woff2 \
  --flavor=woff2 \
  --layout-features='*' \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+2122,U+2212"
```

Target: each woff2 well under ~120 KB after Latin subsetting.

## Licences

All three are SIL Open Font License 1.1 — free for web embedding. Keep the OFL
licence text alongside the fonts if redistributing the source files. The compiled
woff2 on the production site does not need the licence inline, but retain it in the
repo for provenance.

## Adding the files

Drop the three `.woff2` files directly in this `/fonts` folder. No code change
needed — the paths are already wired. Until they exist, the site renders in the
fallback stacks (Georgia / system sans / system mono), so layout is stable.
