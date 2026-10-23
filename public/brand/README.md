# Haxio brand kit

**A support agent that actually does things.**

The mark is "human in the loop": two linked rings, the **agent** that acts (white) and the **human** who approves (Flare).

## Folders

| Folder | What's inside |
|---|---|
| `logo/` | Horizontal lockup (icon + wordmark): full color, on-dark, all-black, all-white. SVG + PNG (1200 px and @2x). |
| `wordmark/` | Text-only logo in ink, black, white. SVG + PNG. |
| `icon/` | Icon mark (primary, black, white) at 16–1024 px, plus ring-only glyphs without the chip. |
| `icon/themes/` | Alternate color themes: flare, magenta, cobalt, paper (+ primary). |
| `favicon/` | favicon.ico, favicon.svg, apple-touch-icon, Android icons, site.webmanifest, `head-snippet.html`. |
| `colors/` | `colors.css` (CSS variables), `tokens.json`, `tailwind.preset.js`, palette swatches. |
| `fonts/` | Font names and the Google Fonts link. |

All logo SVGs use outlined text, so they render identically without fonts installed.

## Primary palette

| Token | Hex | Use |
|---|---|---|
| Ink | `#0b0f1a` | Wordmark, headings, icon chip, primary buttons |
| Ink 700 | `#1e2433` | Hover, dark cards, chip on dark backgrounds |
| Flare | `#ff6b2c` | Accent on dark and in the mark; never for text on white |
| Flare Deep | `#c2410c` | Accent text, links, accent buttons on white (5.2:1) |
| Flare Deep Hover | `#9a3412` | Hover for Flare Deep |
| Flare Tint | `#fff1e8` | Chips, highlights |
| White | `#ffffff` | Background |
| Neutral 50 / 200 / 400 / 600 | `#fafafa` / `#e5e5e5` / `#a3a3a3` / `#525252` | Surfaces / borders / disabled / body text |

## Usage rules

- Clear space around the logo: half the icon's height on every side.
- Minimum lockup width: 96 px. The icon works down to 16 px.
- Single-color versions cut the rings out of the chip, so the background shows through.
- Don't recolor the rings independently outside the listed themes, add effects, or stretch the mark.

## Quick start (web)

```html
<!-- in <head>: copy favicon/* to your public root first -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

```css
@import "./brand/colors/colors.css";
.btn-primary { background: var(--hx-ink); color: #fff; }
.link { color: var(--hx-flare-deep); }
```
