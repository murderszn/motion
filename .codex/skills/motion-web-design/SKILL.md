---
name: motion-web-design
description: "Modern web design intelligence for the /motion project. Use when building, reviewing, or advising on HTML/CSS/JS for quality web experiences — including WebGL backgrounds, glassmorphism, shader effects, scroll animations, dark mode design, typography, layout, and sourcing images/icons from free libraries. Covers what makes design 'sexy' and modern, with concrete patterns, anti-patterns, and live resource links."
---

# Motion Web Design Skill

> Every AI agent that touches the /motion project should load this skill to understand what quality web design means here.

## When to Use This Skill

- Building or modifying any HTML page in the project
- Adding WebGL canvas backgrounds or shader effects
- Creating glassmorphism panels, frosted glass, or refraction effects
- Designing symmetrical, mathematically harmonious layouts
- Adding scroll animations, parallax, or micro-interactions
- Choosing colors, fonts, spacing, or layout patterns
- Reviewing CSS for performance or accessibility
- Sourcing images, icons, or illustrations for pages
- Advising on what makes a page feel "modern" and "sexy"
- Debugging WebGL shader issues in a web context

## Design DNA

The /motion project has a specific aesthetic. Internalize these non-negotiables:

### The Dark Mode Formula

```
Surface:   #08080a (near-black, NOT pure black)
Panels:    #0e0e12
Borders:   #1c1c22 (barely visible — gaps > strokes)
Text:      #b8b8c0 (default), #f4f4f6 (bright), #55555e (dim)
Accent:    #e03a3a (one accent, used sparingly)
```

### Typography Rules

- Font: `JetBrains Mono` for UI/data, `Inter` for wordmarks
- Sizes: 9px (micro) → 11px (caption) → 14px (body) → 18px (subhead)
- All UI labels: lowercase, letter-spacing `0.16em`+
- No font-weight below 400 for UI elements
- Monospace for any technical/data content

### Layout Rules

- CSS Grid, not Flexbox, for page layout
- `4px` spacing grid — every measurement is a multiple of 4
- No rounded corners >3px (tool UI) or >8px (marketing cards)
- No shadows (except massive ambient occlusion)
- Thin 1px borders at low contrast, or gap-based separation
- Generous whitespace — 96px+ between major sections

### Motion Rules

- Animate only `transform` and `opacity` (GPU-composited)
- 150–200ms ease-out for UI transitions
- Never longer than 300ms for interactive feedback
- Ambient drift: 10–30s loops for background elements
- Respect `prefers-reduced-motion`

### Anti-Patterns (Never Do These)

- Rainbow gradients, gradient text, neumorphism
- Drop shadows on UI elements
- Auto-playing video/audio
- Parallax on every section
- Thin/light fonts on dark backgrounds
- Icons without labels
- Text on busy images without overlay
- Rounded corners >8px in tool UI
- Centered long-form text
- Skeleton screens that shimmer indefinitely

---

## Glassmorphism Patterns

Glassmorphism creates depth through translucent, blurred panels layered over content. The /motion project supports two approaches.

### CSS-Only Glassmorphism (Recommended for Most Cases)

Use `backdrop-filter` for lightweight frosted panels. No external library needed.

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

.glass-panel:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
}
```

**When to use CSS-only:** Cards, navbars, modals, sidebars, any panel that doesn't need real-time refraction of the content behind it.

### liquidGL Library (For Real-Time Refraction)

When you need the glass to actively refract/distort the content behind it (like Apple's Liquid Glass), use the `liquidGL` library. Load the `liquidgl-glassmorphism` skill for full documentation.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" defer></script>
<script src="assets/liquidGL.js" defer></script>

<div class="glass-pane" style="z-index:9999; position:fixed;">
  <p>Content inside the glass</p>
</div>

<script>
liquidGL({
  target: ".glass-pane",
  snapshot: "body",
  refraction: 0.01,
  bevelDepth: 0.08,
  bevelWidth: 0.15,
  frost: 0,
  shadow: true,
  specular: true,
  reveal: "fade",
  tilt: false,
});
</script>
```

**When to use liquidGL:** Hero cards, featured panels, any element where real-time refraction of the background creates a wow moment.

### Glassmorphism + WebGL Shader Layering

For maximum impact, layer CSS glassmorphism over a WebGL canvas background:

```
Layer 0:  WebGL canvas (fixed, z-index: 0) — shader background
Layer 1:  Vignette overlay (fixed, z-index: 1) — edge darkening
Layer 2:  Content (relative, z-index: 5) — text, UI
Layer 3:  Glass panels (fixed/absolute, z-index: 10) — frosted overlays
```

```css
/* WebGL canvas behind everything */
#shader-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

/* Content scrolls over the canvas */
.content {
  position: relative;
  z-index: 5;
}

/* Glass panels float above content */
.glass-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 20;
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(8, 8, 10, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
```

### Glass Color Variants

| Variant | Background | Border | Use Case |
|---------|-----------|--------|----------|
| **Dark glass** | `rgba(8,8,10,0.6)` | `rgba(255,255,255,0.08)` | Navbars, panels on dark bg |
| **Light glass** | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.12)` | Cards, modals |
| **Accent glass** | `rgba(224,58,58,0.08)` | `rgba(224,58,58,0.2)` | Active states, CTAs |
| **Frosted** | `rgba(255,255,255,0.05)` + `blur(30px)` | `rgba(255,255,255,0.06)` | Heavy frost, privacy panels |

---

## Symmetrical Elegance Patterns

Symmetry creates visual harmony. The /motion project uses mathematical precision in layout.

### Golden Ratio Layout

Use the golden ratio (1.618) for proportional spacing and sizing:

```css
/* Golden ratio split: 61.8% / 38.2% */
.split-golden {
  display: grid;
  grid-template-columns: 1.618fr 1fr;
  gap: 2rem;
}

/* Or inverse: visual weight on the right */
.split-golden-inverse {
  display: grid;
  grid-template-columns: 1fr 1.618fr;
  gap: 2rem;
}
```

### Radial Symmetry

Center elements and use radial patterns for focus:

```css
/* Radial gradient behind focal point */
.radial-focus {
  background: radial-gradient(
    ellipse at 50% 40%,
    rgba(224, 58, 58, 0.08) 0%,
    transparent 60%
  );
}

/* Concentric spacing from center */
.concentric {
  padding: clamp(2rem, 5vw, 6rem);
  /* Inner elements get tighter spacing */
}
```

### Bilateral Symmetry

Mirror layouts create calm, balanced compositions:

```css
/* Centered content with bilateral symmetry */
.bilateral {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 640px;
  margin: 0 auto;
}

/* Mirror grid — elements reflect across center axis */
.mirror-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px; /* Hairline gap as border */
}
```

### Mathematical Spacing

Use a consistent scale derived from a base unit (4px):

```
4 × 1  = 4px    — micro gaps
4 × 2  = 8px    — tight spacing
4 × 3  = 12px   — standard gap
4 × 4  = 16px   — comfortable
4 × 6  = 24px   — component spacing
4 × 8  = 32px   — section gaps
4 × 12 = 48px   — major breaks
4 × 16 = 64px   — section padding
4 × 24 = 96px   — hero sections
4 × 32 = 128px  — page-level breathing
```

### Grid Alignment

Every element should snap to a grid. Use CSS Grid for page-level layout:

```css
/* Full-bleed grid with contained center */
.page-grid {
  display: grid;
  grid-template-columns: 1fr min(64rem, 90vw) 1fr;
}
.page-grid > * {
  grid-column: 2; /* Center column */
}
.page-grid > .full-bleed {
  grid-column: 1 / -1; /* Span all columns */
}
```

---

## WebGL Shader Integration for Standalone Pages

### Fullscreen Shader Background

For any page that needs a living, breathing background:

```html
<canvas id="shader-bg" style="position:fixed;inset:0;z-index:0;width:100%;height:100%;"></canvas>
<div id="vignette" style="position:fixed;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(ellipse at center,transparent 30%,rgba(8,8,10,0.85) 100%);">
</div>
<div id="content" style="position:relative;z-index:5;">
  <!-- page content here -->
</div>
```

### Essential Shader Uniforms

| Uniform | Type | Purpose |
|---------|------|---------|
| `u_time` | float | Continuous animation time (for non-looping backgrounds) |
| `u_resolution` | vec2 | Canvas size for aspect correction |
| `u_mouse` | vec2 | Cursor position (0–1 range) |
| `u_scroll` | float | Scroll progress (0–1) |
| `u_phase` | float | Loop phase for seamless loops |

### Performance Caps

- Fragment shader: <100 instructions on mobile
- Canvas DPR: cap at `Math.min(devicePixelRatio, 2)`
- Use `requestAnimationFrame`, never `setInterval`
- Add `{ passive: true }` to scroll/touch listeners
- Use `IntersectionObserver` to pause off-screen canvases

### Seamless Loop Formula

```glsl
vec2 offset = vec2(cos(phase), sin(phase)) * radius;
float n = fbm(uv * scale + offset);
// phase 0→2π traces a circle → noise is seamless
```

### Shader + Glassmorphism Composition

For pages combining a shader background with glass panels:

```
1. WebGL canvas renders shader (position:fixed, z-index:0)
2. Vignette overlay (position:fixed, z-index:1)
3. Scrollable content with text (position:relative, z-index:5)
4. CSS glass panels float over everything (position:fixed, z-index:10)
5. liquidGL panes refract the shader canvas through glass (z-index:10)
```

The key insight: glassmorphism panels reveal the shader beneath them. Design the shader to have interesting motion that's visible through the glass.

---

## Image & Icon Resources

When a page needs images, icons, or illustrations, use these free/libre resources:

### Icon Libraries (Full Color + Monochrome)

| Library | URL | License | Notes |
|---------|-----|---------|-------|
| **IconsClub** | https://iconsclub.vercel.app/ | Free | Huge library of full-color app/brand logos |
| **Lucide** | https://lucide.dev/ | MIT | Clean line icons, tree-shakeable SVG |
| **Phosphor Icons** | https://phosphoricons.com/ | MIT | 6 weights, 7000+ icons |
| **Heroicons** | https://heroicons.com/ | MIT | Tailwind-designed, outline + solid |
| **Tabler Icons** | https://tabler.io/icons | MIT | 5000+ icons, 3 styles |
| **Iconoir** | https://iconoir.com/ | MIT | Open-source, 1500+ icons |
| **Carbon Icons** | https://carbondesignsystem.com/icons | Apache 2.0 | IBM's icon system |
| **Feather** | https://feathericons.com/ | MIT | 28×24 grid, minimalist |
| **Remix Icon** | https://remixicon.com/ | Apache 2.0 | 2000+ icons, rounded + sharp |
| **Simple Icons** | https://simpleicons.org/ | CC0 | Brand logos as SVG, 3000+ |
| **Boxicons** | https://boxicons.com/ | CC BY 4.0 | 1500+ icons, 2 styles |

### Stock Images (Free / Libre)

| Library | URL | License | Notes |
|---------|-----|---------|-------|
| **Unsplash** | https://unsplash.com/ | Custom (free) | High-res photos, API available |
| **Pexels** | https://pexels.com/ | Custom (free) | Photos + videos, API available |
| **Pixabay** | https://pixabay.com/ | Pixabay License | Photos, illustrations, vectors, video |
| **StockSnap** | https://stocksnap.io/ | CC0 | Creative Commons zero |
| **Burst (Shopify)** | https://burst.shopify.com/ | Free | Business-oriented photography |
| **Kaboompics** | https://kaboompics.com/ | Custom (free) | Lifestyle, color-sorted |
| **Reshot** | https://reshot.com/ | Free | Icons, illustrations, photos |
| **Life of Pix** | https://lifeofpix.com/ | CC0 | High-res, no restrictions |
| **Gratisography** | https://gratisography.com/ | Free | Quirky, creative photography |

### AI-Generated Images

| Library | URL | License | Notes |
|---------|-----|---------|-------|
| **Lexica** | https://lexica.art/ | Free (check per-image) | Stable Diffusion search engine |
| **Playground** | https://playground.com/ | Free tier | AI image generation + community |
| **Craiyon** | https://craiyon.com/ | Free | DALL-E mini, quick generations |
| **Stable Diffusion Online** | https://stablediffusionweb.com/ | Free | Web UI for SD generation |
| **Leonardo AI** | https://leonardo.ai/ | Free tier | Game asset + art generation |
| **Ideogram** | https://ideogram.ai/ | Free tier | Text-in-image, design-focused |
| **Freepik AI** | https://freepik.com/ai-image-generator | Free tier | AI gen + huge stock library |

### Illustrations & Vectors

| Library | URL | License | Notes |
|---------|-----|---------|-------|
| **unDraw** | https://undraw.co/ | Custom (free) | Open-source illustrations, customizable colors |
| **Humaaans** | https://www.humaaans.com/ | CC0 | Mix-and-match human illustrations |
| **Open Peeps** | https://www.openpeeps.com/ | CC0 | Hand-drawn character library |
| **Blush** | https://blush.design/ | Free (some paid) | Customizable illustrations |
| **IRA Design** | https://iradesign.io/ | Free | Gradient illustrations |
| **Absurd Design** | https://absurd.design/ | Free | Surrealist illustrations |
| **Lukasz Adam** | https://illustrations.pw/ | CC0 | Simple, minimalist illustrations |
| **Storyset (Freepik)** | https://storyset.com/ | Free | Animated illustrations |
| **Grotesk Gallery** | https://grotesk.gallery/ | Free | Brutalist/geometric illustrations |

### Sound & Audio (For Audio-Reactive)

| Library | URL | License | Notes |
|---------|-----|---------|-------|
| **Freesound** | https://freesound.org/ | CC0/CC-BY | Community sound database |
| **Zapsplat** | https://zapsplat.com/ | Free tier | Sound effects + music |
| **Mixkit** | https://mixkit.co/ | Free | Music + SFX, no attribution |

---

## Design Review Checklist

When reviewing HTML/CSS/JS in this project, check:

- [ ] Dark mode: background is `#08080a` or similar near-black (not pure `#000`)
- [ ] Text contrast: body text >= 4.5:1 against background
- [ ] Single accent color, used sparingly (active states, CTAs only)
- [ ] Typography: lowercase labels, monospace for data, consistent scale
- [ ] Spacing: all values on 4px grid
- [ ] Borders: 1px at low contrast, or gap-based separation
- [ ] No shadows on UI elements (massive ambient only)
- [ ] No rounded corners >3px in tool UI
- [ ] Animations: only transform/opacity, 150–200ms, ease-out
- [ ] `prefers-reduced-motion` respected
- [ ] WebGL canvas: DPR capped at 2, RAF loop, passive listeners
- [ ] Glassmorphism: backdrop-filter used sparingly, proper z-index layering
- [ ] Symmetry: layout uses mathematical proportions (golden ratio, grid alignment)
- [ ] Images: using free/libre sources with correct attribution
- [ ] Accessibility: focus indicators, semantic HTML, aria-labels on icon buttons
- [ ] Performance: no layout-triggering animations, lazy-loaded images

---

## References

- `brain/Design/Modern Web Design.md` — detailed design patterns and anti-patterns
- `brain/Design/Visual Language Reference.md` — hierarchy, grid, color, typography
- `brain/Design/Composition Guide.md` — aspect ratios, mood mapping
- `brain/Design/WebGL Techniques.md` — shader techniques for web
- `brain/Design/JavaScript & Animation Patterns.md` — motion and interaction patterns
- `brain/Design/Color Theory for Shaders.md` — palette construction
- `.agents/skills/liquidgl-glassmorphism/SKILL.md` — liquidGL glassmorphism library
- `.agents/skills/motion-shaders/SKILL.md` — shader math blueprints
- `.agents/skills/shader-development/SKILL.md` — GLSL recipes and patterns
