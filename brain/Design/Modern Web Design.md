# Modern Web Design

> What "sexy" contemporary web design looks, feels, and behaves like in 2025+.

---

## The Modern Aesthetic

Modern web design has converged on a specific visual language. It's not about trends — it's about **clarity, depth, and atmosphere**. The best sites share these qualities:

### Dark Mode as Default

Dark interfaces aren't a fad — they're the natural habitat for creative tools and immersive experiences. The reasons are technical and aesthetic:

- **Screens are light sources.** A dark background makes content glow, creating natural depth. Light backgrounds flatten everything.
- **Color pops.** Accent colors vibrate against dark surfaces. A single `#e03a3a` on `#08080a` draws the eye like nothing on white.
- **Eye strain.** Prolonged use in dim environments (studios, late nights) is easier on dark UIs.
- **Perceived sophistication.** Dark = cinematic. Think of film credits, gallery walls, theater stages.

The formula: `near-black surface + soft text (#b8b8c0) + single accent color + thin borders (#1c1c22)`.

### Typography as Structure

The best modern sites use typography as their primary design element — not images, not illustrations, not color blocks:

- **Type scales.** A strict modular scale (1.200× or 1.250×) creates rhythm. Sizes: 11px → 13px → 16px → 20px → 25px → 31px.
- **Variable fonts.** A single weight axis replaces multiple font files. `Inter`, `JetBrains Mono`, `Space Grotesk` — use one family with axis modulation.
- **Letter-spacing as tone.** Wide tracking (`0.16em`) reads as refined and modern. Tight tracking (`-0.02em`) reads as bold and punchy.
- **Lowercase everything.** UI labels, buttons, section headers — lowercase with generous letter-spacing is the signature of modern tool UIs.
- **Monospace for data.** Technical content, code, parameters — monospace font signals precision.

### Generous Whitespace

Space is the most powerful layout tool. It costs nothing and communicates luxury:

- **Breathing room** between elements signals confidence. Cramped layouts feel desperate.
- **Asymmetric whitespace** creates visual hierarchy without extra decoration.
- **The void.** An empty dark background behind a focal element (canvas, hero, product) makes that element the entire world.

### Thin Borders, Not Shadows

Shadows belong to the skeuomorphic era. Modern UIs use **1px borders at barely-visible opacity**:

- Borders define structure: `#1c1c22` on a `#08080a` background is a 14% contrast line — just enough to separate panels.
- **Gaps are borders.** CSS Grid gap is the modern alternative to bordered cards. The empty space between grid cells defines the relationship.
- When shadows are used, they're **massive and diffuse** (e.g., `0 80px 200px rgba(0,0,0,0.6)`) — more like ambient occlusion than drop shadow.

### Micro-Interactions

Every user action should produce an immediate, visible response. Not animation for its own sake — **confirmation**:

- **Hover states:** Border brightens, background tints, color shifts. Always.
- **Active states:** Slight scale-down (0.98×) on click. Tactile feedback.
- **Focus states:** Ring outline on keyboard navigation. Accessibility is not optional.
- **Transitions:** 150–200ms ease-out for everything. Never longer than 300ms.
- **Loading states:** Skeleton screens, not spinners. Progressive content reveal.

### Scroll-Driven Depth

Modern sites create depth through scroll-linked effects:

- **Parallax layers.** Background moves slower than foreground. Simple, effective.
- **Sticky sections.** A section pins to viewport while content scrolls past it.
- **Reveal animations.** Elements fade/slide in as they enter the viewport (`IntersectionObserver`).
- **Scroll-linked color.** Background color shifts as you scroll through sections.
- **Horizontal scroll sections.** A contained area that scrolls horizontally while the page scrolls vertically.

---

## What Makes a Site Feel "Sexy"

"Sexy" in web design means: **it looks effortless but feels considered.** Here's the recipe:

### 1. Restraint

The #1 marker of good design is what you *don't* add. Every element must earn its place:

- One accent color, used sparingly
- One or two font families, maximum
- Minimal chrome — the content IS the interface
- No decoration that doesn't serve a function

### 2. Depth Without Ornament

Create spatial depth through layering, not through decoration:

- Background void → content surface → floating controls
- Subtle radial gradients behind focal points
- CSS `backdrop-filter: blur(8px)` for translucent panels (sparingly)
- Layered z-index creating foreground/midground/background

### 3. Precision

Pixel-perfect alignment, consistent spacing, predictable behavior:

- A spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- All interactive elements on a consistent size grid (multiples of 4)
- Consistent border-radius (or no radius at all)
- Text aligned to a vertical rhythm

### 4. Atmosphere

The best sites have a *mood* — not just a layout:

- A WebGL background that breathes
- Ambient sound (optional, user-triggered)
- Smooth, continuous motion that never stops — even subtle background drift
- Film grain overlay for texture
- Vignette at the edges

### 5. Confidence in Empty Space

A site that can afford to show nothing is a site that knows what it is:

- Splash pages with a single element centered in darkness
- Navigation that collapses to near-invisible until needed
- Content that appears when you look for it, never before

---

## Reference: Anatomy of a Modern Landing Page

```
┌─────────────────────────────────────────────────────┐
│  nav: logo left · links right · blur bg · sticky    │
│  minimal · 48px height · lowercase · 11px          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  hero: centered type · max 600px · 64px heading     │
│  18px body · subheading · CTA button (outlined)     │
│  background: WebGL canvas or video loop              │
│  min-height: 100vh                                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  features: 2–3 columns · icon + type + short copy   │
│  scroll-reveal · generous padding (96–128px)        │
├─────────────────────────────────────────────────────┤
│  showcase: full-width images/video · parallax        │
├─────────────────────────────────────────────────────┤
│  footer: dark · minimal · links · 9px type           │
└─────────────────────────────────────────────────────┘
```

---

## What Modern Is NOT

- **Neumorphism** — looks like clay, bad contrast, inaccessible
- **Glassmorphism everywhere** — beautiful in small doses, awful at scale
- **Bento grids on every page** — a layout, not a design philosophy
- **Gradient text** — fun for heroes, tacky in UI
- **Floating 3D objects** — impressive demo, not a design system
- **Oversized typography as the only idea** — scale without hierarchy is just noise
- **Parallax on everything** — one parallax section per page, maximum
- **Cookie banner modals that cover the entire page** — design fails start here

---

## Key Principles Summary

| Principle | Implementation |
|-----------|---------------|
| Dark mode default | `#08080a` bg, `#b8b8c0` text, `#e03a3a` accent |
| Typography-first | Type scale, variable fonts, monospace data |
| Generous space | 96px+ section padding, 4px grid |
| Thin borders | 1px at 14% contrast, gap > stroke |
| Micro-interaction | 150ms transitions, hover states on everything |
| Depth | Radial gradients, backdrop blur, z-layering |
| Restraint | One accent, one font family, no decoration |
| Confidence | Empty space as design element |
| Atmosphere | WebGL bg, film grain, vignette, drift |
| Precision | 4px spacing grid, pixel alignment, rhythm |

---

## Related

- [[Design Principles]] — lumen·local's shader-specific tenets
- [[Design Philosophy]] — why generative art demands this aesthetic
- [[WebGL Techniques]] — implementation details for web effects
- [[JavaScript & Animation Patterns]] — motion on the web
- [[Fractal & Pattern Vocabulary]] — mathematical patterns for backgrounds

---

## WebGL + Dark Mode

### Why Dark + WebGL Works
- Dark backgrounds (#0a0a0f to #1a1a2e) make shader effects pop
- **Neon glow:** Additive blending (`gl.blendFunc(gl.SRC_ALPHA, gl.ONE)`) with bright colors on dark base
- **OLED efficiency:** Dark pixels use less power on OLED screens
- **Visual contrast:** Shader effects are visually high-impact with low perceptual cost

### Glassmorphism with Shaders
Render to framebuffer, blur it, composite with `mix()` at 0.1-0.3 alpha over dark base. Use `backdrop-filter: blur(8px)` for DOM panels.

---

## Scroll-Mapped Shader Uniforms

Map scroll position to shader parameters. Use `IntersectionObserver` for section-aware mapping:
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) currentSection = entry.target.dataset.section;
    });
}, { threshold: 0.5 });
```
Multiply section-local scroll progress by effect intensity to prevent a 0-10000px page from mapping linearly to a single 0..1 uniform.

---

## Cursor Effects

### Mouse-Following Gradient
```glsl
float dist = distance(uv, uMouse);
vec3 glow = vec3(0.2, 0.5, 1.0) * smoothstep(0.4, 0.0, dist);
```

### Cursor-Reactive Distortion
Displace texture UVs based on mouse proximity:
```glsl
vec2 mouseDelta = uv - uMouse;
float influence = smoothstep(0.3, 0.0, length(mouseDelta)) * uStrength;
uv += normalize(mouseDelta) * influence * 0.05;
```

### Interactive Particles
Attract/repel particles toward mouse. Update in JS for <10K particles, transform feedback for >10K.

---

## Mobile WebGL

### Performance Budget
| Target | Budget |
|--------|--------|
| 60fps frame | 10ms |
| Safe mobile | 16ms |
| Particles (mobile) | 500-1000 |
| Particles (desktop) | 5000+ |

### Touch Interactions
```javascript
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    uMouse[0] = touch.clientX / window.innerWidth;
    uMouse[1] = 1.0 - touch.clientY / window.innerHeight;
}, { passive: false });
```

### Fallback Strategy
- **High:** Full particle system, post-processing, 60fps
- **Low:** Static noise texture, no particles, 30fps cap
- **None:** CSS-only fallback (gradients, `backdrop-filter: blur()`)

### Core Principles
1. Profile on mobile first — if it runs at 60fps on a 2022 mid-range phone, it runs everywhere
2. Keep WebGL as a visual layer, never as a structural dependency
3. Use `IntersectionObserver` to pause off-screen shader rendering
4. Prefer `transform` and `opacity` for DOM animations (compositor-only path)

---

## Glassmorphism

Glassmorphism creates depth by layering translucent, blurred panels over content. It's the signature of modern immersive UI — Apple's Liquid Glass, Linear's sidebar, Vercel's cards.

### The Formula

```css
.glass {
  background: rgba(255, 255, 255, 0.08);       /* translucent fill */
  backdrop-filter: blur(20px) saturate(180%);   /* frosted glass */
  border: 1px solid rgba(255, 255, 255, 0.12);  /* subtle edge */
  border-radius: 8px;                            /* soft corners */
}
```

### Two Approaches

| Approach | When to Use |
|----------|------------|
| **CSS `backdrop-filter`** | Navbars, cards, modals, sidebars — lightweight, no JS |
| **liquidGL library** | Hero panels, featured cards — real-time WebGL refraction |

### Layering Rule

Glass panels must sit ABOVE content, which sits ABOVE the shader background:
```
0: WebGL canvas
1: Vignette
5: Content
10: Glass panels
20: Navigation
```

### Anti-Patterns
- Glass on glass (recursive blur = performance death)
- Glass over busy animated content (unreadable)
- Glass without sufficient contrast behind it
- More than 3-4 glass panels on screen simultaneously

---

## Symmetrical Elevation

Symmetry creates calm, professional, mathematically harmonious layouts. The best sites feel "designed by a mathematician."

### Golden Ratio (1.618)

Use for proportional splits, typography scale, and spacing:

```css
.split {
  display: grid;
  grid-template-columns: 1.618fr 1fr; /* 61.8% / 32.2% */
}
```

### Radial Symmetry

Center focal points and use radial gradients to draw the eye:

```css
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    ellipse at 50% 40%,
    rgba(224, 58, 58, 0.06) 0%,
    transparent 60%
  );
}
```

### Bilateral Symmetry

Mirror layouts create balance. Center everything with `text-align: center` and `max-width` constraints.

### Mathematical Spacing

Every measurement derives from a base unit (4px):
```
4, 8, 12, 16, 24, 32, 48, 64, 96, 128px
```

Never use arbitrary values like `13px` or `37px`. Snap to the grid.

### Visual Weight Balance

A page feels "right" when visual weight is distributed:
- Heavy element (image, video, large type) balanced by whitespace
- Dark elements balanced by light elements
- Busy areas balanced by calm areas
- Left-aligned content balanced by right-aligned content (or centered)
