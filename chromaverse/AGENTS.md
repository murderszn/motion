# AGENTS.md — Theme Generation Guide

## Overview

This directory contains a theme index (`index.html`) with 65 predefined color palettes (30 original + 17 intermediate + 18 new) and a Python data source (`generate_themes.py`) that defines all theme tokens. Use these to generate complete, production-ready theme HTML files for websites.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Theme gallery — links to individual theme pages |
| `generate_themes.py` | Python data: all 65 themes with colors, fonts, tokens, principles |
| `crimson.html` | Reference implementation — full theme page with light/dark toggle |

## How to Generate a Theme

### Step 1: Pick a theme from the index

Browse `index.html` to find a theme. Each card shows:
- **Swatches** — the 5 core colors (accent primary, accent secondary, dark surface, deep surface, light surface)
- **Name & description**
- **Tags** — use case suggestions (e.g., "Landing pages", "Dashboards", "Editorial")
- **Typography** — the two Google Fonts used

### Step 2: Read the theme data from `generate_themes.py`

Each theme in the Python script contains:

```python
{
    "id": "01",
    "name": "Crimson Horizon",
    "slug": "crimson",           # used for filename: {slug}.html
    "font_import": '<link ...>',  # Google Fonts import tag
    "font_primary": '"Montserrat", ...',
    "font_secondary": '"Josefin Sans", ...',
    "accents": ["#D92D0D", ...],  # 4 accent colors
    "accent_names": ["Crimson", ...],
    "accent_uses": ["Primary accent, rules, CTAs", ...],
    "dark": { ... },              # dark mode surface tokens
    "light": { ... },             # light mode surface tokens
    "eyebrow": "...",
    "title": "...",               # supports <span> for accent coloring
    "lede": "...",
    "tags": ["Landing pages", ...],
    "typography_desc": "...",
    "principles": [ { "number": "01", "name": "...", "desc": "..." }, ... ]
}
```

### Step 3: Use `crimson.html` as the template

`crimson.html` is the canonical reference. To generate a new theme:

1. **Duplicate `crimson.html`** and rename to `{slug}.html`
2. **Replace all Crimson-specific values** with the new theme's tokens:

| What to replace | Where |
|-----------------|-------|
| Accent hex values | `--crimson`, `--crimson-light`, `--crimson-bright`, `--crimson-pale` CSS vars |
| Dark mode tokens | `[data-theme="dark"]` block — all `--bg`, `--text`, `--border`, `--shadow-*` values |
| Light mode tokens | `[data-theme="light"]` block — same tokens |
| Google Fonts link | `<link>` tag in `<head>` |
| Font family declarations | `font-family` in `body`, `.page-header-meta`, `.eyebrow`, etc. |
| Theme name | Title, header brand, footer brand, `document.title` |
| Eyebrow text | `.eyebrow` content in hero panel |
| Hero title & lede | `.hero-title`, `.hero-lede` content |
| Tags | `.tag` elements in hero |
| Typography descriptions | Section 03 copy |
| Design principles | Section 04 principle cards |
| `THEME_TOKENS` JS object | Used for the "Copy CSS variables" button |

### Step 4: Update `index.html`

Add a card linking to the new theme file:

```html
<a href="{slug}.html" class="theme-card">
    <div class="theme-swatches" aria-hidden="true">
        <span style="background:{accent1}"></span>
        <span style="background:{accent2}"></span>
        <span style="background:{dark_surface}"></span>
        <span style="background:{deep_surface}"></span>
        <span style="background:{light_surface}"></span>
    </div>
    <div>
        <div class="theme-name">{Theme Name}</div>
        <div class="theme-meta">{description}</div>
    </div>
    <div class="theme-tags">
        <span class="tag">{use case 1}</span>
        <span class="tag">{font 1}</span>
        <span class="tag">{font 2}</span>
    </div>
</a>
```

## Color Theory Reference

### Hex Color Codes

A hex color is a 6-digit hexadecimal number (base-16) that represents an sRGB color. It encodes three channels — red, green, blue — each ranging from `00` (0) to `FF` (255).

```
#RRGGBB
```

- The first two digits = Red intensity
- The middle two digits = Green intensity
- The last two digits = Blue intensity

**Examples:**
| Hex | Color | Breakdown |
|-----|-------|-----------|
| `#FF0000` | Pure red | R=255, G=0, B=0 |
| `#00FF00` | Pure green | R=0, G=255, B=0 |
| `#0000FF` | Pure blue | R=0, G=0, B=255 |
| `#FFFFFF` | White | All channels at max |
| `#000000` | Black | All channels at zero |
| `#808080` | 50% gray | All channels at 128 |

**Shorthand syntax:** `#RGB` or `#RGBA` — each single digit is doubled: `#F09` = `#FF0099`. The optional 4th/8th digit controls alpha (opacity): `#FF0099AA` = 67% opacity.

Hex is case-insensitive: `#ff0000` equals `#FF0000`.

### Color Models

**HEX (`#RRGGBB`)** — Machine-readable, compact, widely used in CSS and design tools. Best for specifying exact colors.

**RGB (`rgb(255, 0, 0)`)** — Decimal representation of the same sRGB channels. Useful when you need alpha: `rgba(255, 0, 0, 0.5)`.

**HSL (`hsl(0, 100%, 50%)`)** — The most intuitive model for humans:
- **Hue** (0–360°) — the color angle on the color wheel. 0°=red, 120°=green, 240°=blue.
- **Saturation** (0–100%) — how vivid/pure the color is. 0% = gray, 100% = fully saturated.
- **Lightness** (0–100%) — how light or dark. 0% = black, 50% = pure hue, 100% = white.

HSL is ideal for creating color variations: shift hue for analogous colors, reduce saturation for muted tones, adjust lightness for tints/shades.

### Color Terminology

| Term | Definition | How to make it |
|------|-----------|----------------|
| **Hue** | The color itself (red, blue, green, etc.) — the angle on the color wheel | Pick a value on the color wheel |
| **Chroma** | Purity of a color — how much white/black/gray is absent | High chroma = pure hue, low chroma = grayish |
| **Saturation** | Strength or intensity of a hue | High = vivid, low = dull/muted |
| **Value (Lightness)** | How light or dark a color is | High = light, low = dark |
| **Tint** | A hue + white | Makes it lighter and softer (pastel) |
| **Shade** | A hue + black | Makes it darker and deeper |
| **Tone** | A hue + gray | Makes it muted, desaturated, sophisticated |

**Practical rule:** Avoid using multiple pure hues with similar saturation and value together — it creates visual vibration and fatigue. Instead, vary saturation and value to create depth and hierarchy.

### Color Harmony Schemes

These are the traditional relationships on the 12-spoke color wheel. Each produces a different emotional effect.

**Monochromatic** — One hue, varied tints/shades/tones.
- Easiest to build, always cohesive
- Risk: can be boring — add a strong neutral (black/white) or one accent for contrast
- Example: `#1a5276` → `#2980b9` → `#85c1e9` → `#d6eaf8`

**Analogous** — 3 colors adjacent on the wheel (within ~30° of each other).
- Naturally harmonious, found in nature (sunset, ocean, forest)
- Vary saturation/value to avoid flatness
- Example: blue, blue-green, green

**Complementary** — 2 colors opposite each other (180° apart).
- Maximum contrast, high energy
- Warning: placing pure complements side-by-side creates visual vibration — use negative space or a transitional color
- Example: blue (`#0066CC`) + orange (`#CC6600`)

**Split Complementary** — Base hue + the two colors adjacent to its complement.
- Less jarring than direct complementary, more dynamic than analogous
- Good balance of contrast and harmony
- Example: blue + yellow-orange + red-orange

**Triadic** — 3 colors equally spaced (120° apart).
- Very diverse and vibrant
- Use one dominant, two as accents; or mute two and keep one bright
- Example: red, yellow, blue (primary triad)

**Tetradic (Double Complementary)** — 4 colors forming a rectangle on the wheel (2 complementary pairs).
- Most complex, hardest to balance
- Let one color dominate, use others as accents
- Example: red + green + orange + blue

**Practical shortcut for these themes:** The 24 themes in this index primarily use a modified analogous or split-complementary approach — one primary accent, one secondary accent, then tints and shades of the accent family for surface colors. This keeps palettes cohesive while providing enough contrast for UI hierarchy.

### Color Psychology & Meaning

Colors evoke emotional responses. Use these associations intentionally:

| Color | Associations | Best for |
|-------|-------------|----------|
| **Red** | Passion, urgency, power, love, danger | CTAs, alerts, food, entertainment |
| **Orange** | Energy, warmth, creativity, enthusiasm | Tech startups, sports, calls-to-action |
| **Yellow** | Optimism, caution, happiness, warmth | Highlighting, warnings, cheerful brands |
| **Green** | Nature, growth, health, wealth, calm | Eco/organic, finance, wellness |
| **Blue** | Trust, calm, professionalism, sadness | Corporate, SaaS, healthcare, social |
| **Purple** | Royalty, creativity, mystery, luxury | Beauty, creative, premium brands |
| **Pink** | Romance, playfulness, femininity | Fashion, beauty, lifestyle |
| **Black** | Elegance, power, mystery, sophistication | Luxury, fashion, editorial |
| **White** | Purity, cleanliness, simplicity | Minimalist, healthcare, tech |
| **Brown** | Earth, warmth, reliability, organic | Food, outdoor, craft brands |
| **Gray** | Neutrality, balance, formality | Corporate, industrial, understated |

Cultural context matters — red symbolizes prosperity in China but mourning in South Africa; white means purity in the West but death in parts of Asia.

### WCAG Accessibility Contrast Requirements

The W3C WCAG 2.1 standard mandates minimum contrast ratios for legibility:

| Element | Minimum Ratio | WCAG Level |
|---------|--------------|------------|
| Normal text (< 18pt / < 14pt bold) | **4.5:1** | AA |
| Large text (≥ 18pt / ≥ 14pt bold) | **3:1** | AA |
| UI components & graphical objects | **3:1** | AA |
| Normal text (enhanced) | **7:1** | AAA |
| Large text (enhanced) | **4.5:1** | AAA |

**Contrast ratio formula:**
```
(L1 + 0.05) / (L2 + 0.05)
```
Where L1 is the relative luminance of the lighter color, L2 is the darker.

**Relative luminance** (sRGB):
```
L = 0.2126 × R + 0.7152 × G + 0.0722 × B
```
(R, G, B are linearized values after gamma correction)

**Quick reference — guaranteed pass pairs:**
- Black text (`#000000`) on any color lighter than `#767676` passes 4.5:1
- White text (`#FFFFFF`) on any color darker than `#767676` passes 4.5:1
- The threshold `#767676` against white is exactly 4.49:1 — the closest gray that fails

**Verification tools:**
- Chrome DevTools: inspect any element → "Accessibility" panel shows contrast ratio
- https://webaim.org/resources/contrastchecker/
- https://colourcontrast.cc/

### How to Build a Theme Palette

**Step 1 — Choose your accent hue.**
Pick one hue (0–360° on the HSL wheel) that matches the brand's personality. This becomes `--accent`.

**Step 2 — Generate accent variations.**
From that hue, create 4 accent values:
- `--accent` — the base (saturation 70–90%, lightness 45–55%)
- `--accent-light` — slightly lighter for hovers (lightness +10%)
- `--accent-bright` — vivid emphasis version (saturation 90–100%, lightness 55–65%)
- `--accent-pale` — soft tint for decorative use (saturation 40–60%, lightness 75–85%)

**Step 3 — Build dark mode surfaces.**
Dark mode is NOT just black — it uses a colored dark:
- `--bg`: Very dark version of the accent hue (e.g., if accent is red, use a very dark warm brown)
- `--bg-alt`: Slightly lighter surface
- `--bg-deep`: Card headers, wells
- `--text`: Near-white with a tint matching the accent family
- `--text-mid`: Secondary text, slightly muted
- `--text-muted`: Tertiary text, metadata
- `--border`: Semi-transparent accent color (8–22% opacity)
- `--shadow-*`: Accent-colored shadows at various opacities

**Step 4 — Build light mode surfaces.**
Light mode is NOT just white — it uses a tinted background:
- `--bg`: Very light tint of the accent hue (e.g., if accent is blue, use a very pale blue-gray)
- `--bg-alt`: Cards, panels — slightly more saturated tint
- `--bg-deep`: Deep wells, headers
- `--text`: Very dark version of the accent hue (near-black with warmth)
- `--text-mid`: Body text
- `--text-muted`: Labels, metadata
- `--border`: Semi-transparent accent (8–16% opacity, lower than dark mode)
- `--shadow-*`: Lighter shadows (accent at 6–12% opacity)

**Step 5 — Verify contrast.**
Check every text/background combination:
- `--text` on `--bg` ≥ 7:1 (ideal for body text)
- `--text-mid` on `--bg` ≥ 4.5:1 (minimum for body text)
- `--text-muted` on `--bg` ≥ 3:1 (large text / UI components only)
- Accent text on `--bg` ≥ 4.5:1

**Step 6 — Verify cohesion.**
- All accent colors should share the same hue family
- Surface colors should have subtle tinting from the accent hue (not pure gray)
- Shadows should use the accent color, not black (gives a richer, more immersive feel)

### Analyzing the Existing 45 Themes

The themes in `generate_themes.py` follow these patterns:

| Pattern | Example themes |
|---------|---------------|
| Monochromatic accent (single hue family) | Crimson Horizon, Sakura Bloom, Orchid Nebula |
| Analogous accents (2 close hues) | Neon Cyber (magenta + cyan), Sunset Glow (rose + red) |
| Complementary accents (opposite hues) | Cyberpunk Grid (yellow + red), Neon Cyber (magenta + cyan) |
| Neutral-dominant with one accent | Brutalist Concrete, Monochrome Swiss |
| Earthy/natural tones | Desert Dunes, Parchment, Matcha Latte |

**Surface tinting rule:** Every theme's dark and light surfaces are NOT pure gray — they carry a subtle tint from the accent family. This creates a cohesive, immersive feel rather than a generic dark/light mode. For example, Crimson Horizon's dark bg `#0F0A07` is a very dark warm brown (red-tinted), not `#0F0F0F`.

**Shadow color rule:** Shadows use `rgba(accent, opacity)` instead of black. This makes the UI feel like it exists within the accent color's light environment.

## CSS Variable Architecture

Every theme follows this token structure:

```
:root {
    /* Accent colors — shared across modes */
    --accent, --accent-light, --accent-bright, --accent-pale
    /* Spacing, radii, easing */
    --r-sm, --r-md, --r-lg, --sp-1 through --sp-10
}

[data-theme="dark"] {
    /* Surface tokens */
    --black, --ink, --ink-soft, --ink-mid, --ink-muted
    --bg, --bg-alt, --bg-deep
    --text, --text-mid, --text-muted
    --border, --nav-bg
    /* Shadows */
    --shadow-sm, --shadow-md, --shadow-lg
    /* Background gradient */
    --body-gradient
}

[data-theme="light"] {
    /* Same token names, light values */
}
```

Always update both `[data-theme="dark"]` and `[data-theme="light"]` blocks.

## Typography Rules

Each theme uses exactly **2 Google Fonts**:
- **Primary** — headings, display, body (heavier weights)
- **Secondary** — labels, metadata, captions, code (lighter weights or monospace)

Import via the `font_import` value from the theme data. Apply via CSS `font-family`.

## Component Patterns

Every theme page includes these UI components (copy from `crimson.html`):
- **Buttons** — `.btn-primary`, `.btn-outline`, `.btn-ghost`
- **Tags** — `.tag-gold`, `.tag-ink`, `.tag-filled`
- **Navigation** — `.nav-preview` with glassmorphism backdrop
- **Cards** — `.card` with hover lift
- **Metrics** — `.metric` with left accent border
- **Principles** — `.principle-card` with numbered items
- **Code block** — for displaying CSS variable output
- **Toast** — for copy-to-clipboard feedback

## Quick Generation Checklist

- [ ] Pick theme from `index.html`
- [ ] Read theme data from `generate_themes.py`
- [ ] Copy `crimson.html` → `{slug}.html`
- [ ] Replace accent colors (4 hex values)
- [ ] Replace dark mode surface tokens (~15 values)
- [ ] Replace light mode surface tokens (~15 values)
- [ ] Update Google Fonts import + font-family declarations
- [ ] Update theme name, title, description, tags
- [ ] Update typography description
- [ ] Update 3 design principles
- [ ] Update `THEME_TOKENS` JS object
- [ ] Add card to `index.html`
- [ ] Test light/dark toggle works
- [ ] Verify all swatches copy correctly
