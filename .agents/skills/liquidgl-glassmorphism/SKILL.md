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

## Presets for /motion Studio

When adding a glassmorphism preset to the /motion shader studio, use the
`glass` preset (mode 4) in `webgl.ts`. The studio's glass shader provides
a similar frosted-pane aesthetic with drifting color blobs refracted behind
frost layers. Combine with liquidGL for DOM-level glass panes overlaid on
the WebGL canvas.

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

## Browser Support

Chrome, Edge, Firefox, Safari (desktop + mobile). Safari may lag on large
panes (>50% viewport). WebGL fallback provides CSS `backdrop-filter` on
older devices.

## References

- `references/parameters.md` — full parameter table
- `references/presets.md` — ready-made configs
- `references/demo-template.html` — minimal working example
