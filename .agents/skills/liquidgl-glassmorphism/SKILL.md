---
name: liquidgl-glassmorphism
description: >
  Use when building glassmorphism UI effects with liquidGL (naughtyduk/liquidGL).
  Covers: adding glass panes to DOM elements, real-time refraction of video/text,
  frosted glass, bevel, specular highlights, tilt interaction, GSAP animation sync,
  smooth-scroll integration (Lenis), presets, and exporting self-contained HTML.
  Trigger on: glassmorphism, liquid glass, glass pane, refraction effect, frosted UI.
---

# liquidGL Glassmorphism Skill

Create Apple-style "Liquid Glass" refraction effects on any DOM element using the
[liquidGL](https://github.com/naughtyduk/liquidGL) library.

## When to Use liquidGL vs CSS-Only

| Approach | Use When | Tradeoff |
|----------|----------|----------|
| **CSS `backdrop-filter`** | Cards, navbars, modals, simple frosted panels | Lightweight, no JS dependency, works everywhere |
| **liquidGL** | Hero panels, featured cards, any element where real-time refraction creates a "wow" moment | Heavier (html2canvas snapshot + WebGL), but visually stunning |

**Rule of thumb:** If the panel is decorative and static, use CSS. If it's the centerpiece of the page and benefits from seeing the background *move through* it, use liquidGL.

## Prerequisites

Include both scripts before initialisation (end of `<body>`):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" defer></script>
<script src="/path/to/liquidGL.js" defer></script>
```

Bundled copies are in `assets/` if you prefer local hosting.

## Minimal Setup

```html
<div class="glass-pane">
  <div class="content"><!-- your content --></div>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
  liquidGL({
    target: ".glass-pane",   // CSS selector for element(s) to glassify
    snapshot: "body",         // area to snapshot for refraction
    refraction: 0.01,         // 0–1
    bevelDepth: 0.08,         // 0–1
    bevelWidth: 0.15,         // 0–1
    frost: 0,                 // 0 = clear, higher = frosted
    shadow: true,
    specular: true,
    reveal: "fade",
    tilt: false,
    magnify: 1,
    on: { init(instance) { console.log("ready", instance); } }
  });
});
</script>
```

## Core Concepts

1. **Snapshot** — liquidGL uses html2canvas to capture the page background, then
   refracts it through a WebGL shader per lens element.
2. **Target** — any CSS selector. All matching elements become glass panes. They
   must share the same `z-index` (shared canvas constraint).
3. **Dynamic content** — videos auto-register. For animated text/CSS, call
   `liquidGL.registerDynamic(selectorOrElements)` after init.
4. **Scroll sync** — call `liquidGL.syncWith()` after init to auto-detect Lenis /
   Locomotive Scroll and sync the render loop.

## Parameters

See `references/parameters.md` for the full table.

Key ones: `target`, `snapshot`, `resolution` (0.1–3), `refraction`, `bevelDepth`,
`bevelWidth`, `frost`, `shadow`, `specular`, `reveal`, `tilt`, `tiltFactor`,
`magnify`, `on.init`.

## Presets

See `references/presets.md` for copy-paste configs (Default, Alien, Pulse, Frost, Edge).

## Dynamic Elements

```js
const glass = liquidGL({ target: ".glass" });

// Register animated text
liquidGL.registerDynamic(".animated-text");

// Register GSAP SplitText lines
const split = SplitText.create(".hero", { type: "lines" });
liquidGL.registerDynamic(split.lines);

// Videos auto-detect — no registration needed
```

## GSAP + Lenis Integration

```js
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const glass = liquidGL({ target: ".glass", reveal: "fade" });

  // Sync with scroll libraries
  liquidGL.syncWith();

  // Animate the target after snapshot
  glass.on.init = (instance) => {
    gsap.from(instance.el, { scaleX: 0, duration: 1.2, ease: "expo.out" });
  };
});
```

## Layering with WebGL Shader Backgrounds

For the /motion project, the typical layer stack is:

```
Layer 0:  WebGL canvas (position:fixed, z-index:0) — shader renders here
Layer 1:  Vignette overlay (position:fixed, z-index:1)
Layer 2:  Scrollable content (position:relative, z-index:5)
Layer 3:  liquidGL glass panes (position:fixed, z-index:10)
```

**Critical:** The `snapshot` option should target the element containing the shader canvas or the body. liquidGL captures what's *behind* the glass pane — so the shader must be rendered before liquidGL initializes.

```html
<!-- Shader canvas (Layer 0) -->
<canvas id="bg" style="position:fixed;inset:0;z-index:0;"></canvas>

<!-- Vignette (Layer 1) -->
<div id="vignette" style="position:fixed;inset:0;z-index:1;pointer-events:none;"></div>

<!-- Content (Layer 2) -->
<div id="content" style="position:relative;z-index:5;">
  <p>Scrollable page content</p>
</div>

<!-- Glass pane (Layer 3) -->
<div class="glass-card" style="position:fixed;z-index:10;">
  <h2>Glass Card</h2>
  <p>This refracts the shader behind it</p>
</div>

<script>
// Initialize liquidGL AFTER the shader canvas is rendering
liquidGL({
  target: ".glass-card",
  snapshot: "#bg",    // or "body" to capture everything
  refraction: 0.015,
  frost: 2,
});
</script>
```

## /motion Design System Integration

When building glassmorphism in the /motion project, use these design tokens:

### Colors
- **Glass background:** `rgba(255, 255, 255, 0.08)` (light glass) or `rgba(8, 8, 10, 0.6)` (dark glass)
- **Glass border:** `1px solid rgba(255, 255, 255, 0.12)`
- **Glass shadow:** `0 8px 32px rgba(0, 0, 0, 0.25)`
- **Accent glass:** `rgba(224, 58, 58, 0.08)` background with `rgba(224, 58, 58, 0.2)` border

### Typography
- Headings inside glass: `Inter`, weight 600, `#f4f4f6`
- Body inside glass: `Inter`, weight 400, `#b8b8c0`
- Labels inside glass: `JetBrains Mono`, weight 500, 0.16em letter-spacing, lowercase

### Spacing
- Glass panel padding: `24px` (comfortable) or `32px` (generous)
- Gap between glass elements: `16px` or `24px`
- Glass margin from viewport edge: `2rem` minimum

### Border Radius
- Tool UI glass: `4px` max
- Marketing/hero glass: `8px` to `12px`
- Never exceed `12px` for glass panels

## Common Patterns

### Preloader exclude
```html
<div class="preloader" data-liquid-ignore>...</div>
```

### Multiple panes (same z-index)
```css
.glass { position: fixed; z-index: 9999; }
```

### Exclude content from lens
Add `z-index: 3` (higher than target) or `data-liquid-ignore` on parent.

### Frosted privacy panel
```js
liquidGL({
  target: ".private-panel",
  frost: 8,           // heavy blur
  refraction: 0.005,  // subtle distortion
  shadow: false,
  specular: false,
});
```

### Interactive tilt card
```js
liquidGL({
  target: ".featured-card",
  tilt: true,
  tiltFactor: 8,
  bevelDepth: 0.12,
  bevelWidth: 0.2,
  specular: true,
});
```

## Browser Support

Chrome, Edge, Firefox, Safari (desktop + mobile). Safari may lag on large
panes (>50% viewport). WebGL fallback provides CSS `backdrop-filter` on
older devices.

## References

- `references/parameters.md` — full parameter table
- `references/presets.md` — ready-made configs
- `references/demo-template.html` — minimal working example
- `assets/liquidGL.js` — bundled library
- `assets/html2canvas.min.js` — bundled dependency
