# Assets — Nielsen Studio

Visual assets are **generated separately** with an external AI image/video tool
and dropped here as finished files. The site code never calls an asset API — it
only consumes files from these stable paths.

To avoid layout shift, every asset has a fixed slot with documented dimensions
and aspect ratio. Match them when producing the real files; swap-in needs no code
change. Until a file exists, its slot uses a CSS fallback (solid surface / accent
wash), so layout stays stable.

## Palette reference (for generating on-brand assets)

| | Hex |
| --- | --- |
| Background (warm near-black) | `#0d0d0f` |
| Surface | `#1c1c20` |
| Accent (burnt orange) | `#c8643c` |
| Text (warm off-white) | `#f4f2ec` |

Keep orange restrained — a signal, not wallpaper. Never pure black or white.

## Expected files

### Hero — `assets/img/hero/`
| File | Dimensions | Notes |
| --- | --- | --- |
| `hero-env.hdr` or `hero-env.jpg` | 2048×1024 (equirect) | Environment map for the 3D material. Dark, subtle, with an orange-lit direction. |
| `hero-matcap.png` | 512×512 | Optional matcap fallback for the material on capable-but-modest GPUs. |
| `hero-fallback.jpg` | 1600×1200 (4:3) | Static render shown on mobile / reduced-motion / no-WebGL instead of the live canvas. |

### Selected work — `assets/img/work/`
| File | Dimensions | Aspect | Notes |
| --- | --- | --- | --- |
| `nas-cover.jpg` | 1600×900 | 16:9 | NAS primary case cover — pitch-deck title slide (drone in storm sky, "A new standard in UAV control"). Cinematic blikfang. |
| `nas-hero.jpg` | 1600×900 | 16:9 | NAS website hero screenshot (mountain/cloud bg, REC HUD). Shown as a website detail in a CSS browser frame, proving the web work. |
| `nas-site.jpg` | 1600×900 | 16:9 | NAS site detail — Engineering page blueprint-motor + 6-point grid. Real screenshot, CSS browser frame. |
| `nas-deck.jpg` | 1600×900 | 16:9 | NAS pitch-deck detail (document side of the case). Can reuse the title slide or another spread. |
| `nas-pdf.jpg` | 1400×1050 | 4:3 | NAS Company Profile PDF detail (document side of the case). |
| `royal-nectar-cover.jpg` | 1600×900 | 16:9 | Royal Nectar Ventures cover — Ghanaian alcohol importer, bold/vibrant brand. |
| `royal-nectar-detail.jpg` | 1400×1050 | 4:3 | Royal Nectar Ventures brand / product detail. |

> Case two is **Royal Nectar Ventures**, not BarrierLab (corrects the brief).

### Background video (optional) — `assets/video/`
| File | Dimensions | Notes |
| --- | --- | --- |
| `loop-bg.mp4` (H.264) + `loop-bg.webm` (VP9) | 1920×1080, ≤8 s, silent | Seamless loop for a section background. Provide a `loop-poster.jpg` (1920×1080) as the poster frame. Keep file weight low; never autoplay heavy video on mobile. |

### Open Graph / social — `assets/img/og/`
| File | Dimensions | Notes |
| --- | --- | --- |
| `og-default.png` | 1200×630 | Default share image in the studio palette. Referenced in `index.html`. |

### Favicon — `assets/favicon/`
| File | Dimensions | Notes |
| --- | --- | --- |
| `favicon.svg` | scalable | Primary, in palette. |
| `favicon.ico` | 32×32 (multi-size ok) | Legacy fallback. |
| `apple-touch-icon.png` | 180×180 | iOS home screen. |

### Texture (optional) — `assets/img/`
| File | Dimensions | Notes |
| --- | --- | --- |
| `noise.png` | 256×256, tiling | Grain for the fixed `.grain` overlay. Pointer-events: none; very low opacity. |
| `intro-texture.jpg` | 1600×900 (16:9) | Wide abstract mood image for Intro / Studio section — dark soft material with a single quiet burnt-orange glow, low intensity. Fills the left side behind the text. |

## Conventions

- Format: photographic → `.jpg` (quality ~80); flat/UI → `.png`; icons → `.svg`.
- Naming: lowercase, hyphen-separated, prefixed by case slug (`nas-`, `royal-nectar-`).
- Always export at the documented size (or 2× then downscale) to keep slots stable.
