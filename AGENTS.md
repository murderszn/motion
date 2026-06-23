# Project-Scoped Agent Guidelines for /motion local

This guide provides instructions, architectural rules, and guidelines for AI agents developing or modifying the `/motion` project — both the generative shader studio AND standalone web pages.

---

## 1. Codebase Architecture Quick-Reference

### Studio Application
*   **Shader Source**: All fragment shader presets are in [src/studio/webgl.ts](file:///Users/jahflyx/motion/src/studio/webgl.ts).
*   **State Configuration**: Presets config, sliders, color palettes, and theme CSS variables are in [src/studio/state.ts](file:///Users/jahflyx/motion/src/studio/state.ts).
*   **UI Modules**: Individual widget controls are in [src/studio/ui/](file:///Users/jahflyx/motion/src/studio/ui/).

### Standalone Pages & Examples
*   **Splash Pages**: `index.html` (main landing), `splash.html` (alternate splash)
*   **Example Pages**: `examples/` — self-contained HTML pages with embedded shaders
*   **Chromaverse**: `chromaverse/index.html` — theme gallery and builder
*   **Tour**: `developer-training.html` — 2026 workshop tour (includes agent/CLI education)

### Shared Resources
*   **Documentation Vault**: Structured Obsidian references are in [brain/](file:///Users/jahflyx/motion/brain/).
*   **Agent Skills**: Preloaded guides for shaders, glassmorphism, and web design are in [.agents/skills/](file:///Users/jahflyx/motion/.agents/skills/) and [.opencode/skills/](file:///Users/jahflyx/motion/.opencode/skills/).
*   **Design System**: CSS variables, color tokens, and theme definitions are in `brain/Design/`.

---

## 2. Invariant Rules for Shader Modification

When modifying or adding GLSL presets inside [src/studio/webgl.ts](file:///Users/jahflyx/motion/src/studio/webgl.ts), you must adhere to these rigid rules:

### A. The Seamless Loop Invariant
Animation is driven by phase coordinates, not absolute time. Any motion that creates a seam at loop endings is **unacceptable**.
*   **No raw time variables**: Do not use time variables in the shader logic.
*   **Use `u_phase`**: All periodic components must use integer multiples of `u_phase` (e.g., `sin(p + 2.0 * u_phase)`).
*   **Use `loopOff()`**: Any spatial noise drift must use the circular loop offset function `loopOff()` (e.g., `fbm(p + loopOff())`).

### B. WebGL 1.0 (GLSL ES 1.0) Syntax Restrictions
The WebGL context is configured for WebGL 1.0. The compiler will fail if these conditions are violated:
*   **Constant Loop Bounds**: Loops must use constant integer boundaries (e.g., `for (int i = 0; i < 5; i++)`). Dynamic variables are not allowed in loop conditions.
*   **No Implicit Type Conversions**: You must explicitly declare types (e.g., use `2.0` instead of `2` for floats, and cast with `float(i)`).
*   **Precision Declarations**: All variables must have precision specs. Ensure `precision highp float;` remains at the header.

---

## 3. Building Standalone Pages (Shaders + Glassmorphism + Symmetrical Elegance)

When an agent is asked to build a web page (landing page, splash, portfolio, etc.), follow these guidelines:

### Required Skills to Load
Before building any page, load these skills in order:
1. **motion-web-design** — Design DNA, glassmorphism patterns, symmetrical layout, shader integration
2. **liquidgl-glassmorphism** — If the page needs real-time refraction glass panels
3. **shader-development** — If writing custom GLSL for the page background
4. **motion-shaders** — If using /motion's existing shader helpers (`fbm`, `hash21`, `loopOff`, etc.)

### Design System (Non-Negotiable)
- **Background:** `#08080a` (near-black, never pure `#000`)
- **Text:** `#b8b8c0` (default), `#f4f4f6` (bright), `#55555e` (dim)
- **Accent:** `#e03a3a` (one accent, used sparingly)
- **Font:** `Inter` for UI, `JetBrains Mono` for data/labels
- **Spacing:** 4px grid — every measurement is a multiple of 4
- **Borders:** 1px at low contrast (`#1c1c22`), or gap-based separation
- **Motion:** 150–200ms ease-out, only `transform` and `opacity`

### Shader Background Pattern
For any page with a WebGL background:
```html
<canvas id="bg" style="position:fixed;inset:0;z-index:0;"></canvas>
<div id="vignette" style="position:fixed;inset:0;z-index:1;pointer-events:none;"></div>
<div id="content" style="position:relative;z-index:5;">
  <!-- page content -->
</div>
```

### Glassmorphism Pattern
For glass panels over the shader:
```css
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
}
```

### Symmetrical Layout Pattern
Use mathematical proportions for harmony:
```css
.page {
  display: grid;
  grid-template-columns: 1fr min(64rem, 90vw) 1fr;
}
.page > * { grid-column: 2; }
.page > .full-bleed { grid-column: 1 / -1; }
```

### Z-Index Stack
```
0: WebGL canvas
1: Vignette overlay
5: Scrollable content
10: Glass panels (CSS or liquidGL)
20: Navigation
```

---

## 4. How to Use Workspace References & Skills

Before editing any code, load the following guides to acquire the correct context:

### For Studio Work
*   Studio architecture and slider layout: [motion-studio/SKILL.md](file:///Users/jahflyx/motion/.agents/skills/motion-studio/SKILL.md)
*   Shader structures and math maps: [motion-shaders/SKILL.md](file:///Users/jahflyx/motion/.agents/skills/motion-shaders/SKILL.md)
*   General GLSL functions, shapes, and noise: [shader-development/SKILL.md](file:///Users/jahflyx/motion/.agents/skills/shader-development/SKILL.md)

### For Web Page Building
*   Design system, glassmorphism, symmetry, shader integration: [motion-web-design/SKILL.md](file:///Users/jahflyx/motion/.codex/skills/motion-web-design/SKILL.md)
*   liquidGL glass effects: [liquidgl-glassmorphism/SKILL.md](file:///Users/jahflyx/motion/.agents/skills/liquidgl-glassmorphism/SKILL.md)

### Vault References (Documentation)
*   Mathematical formulas: [Shader_Development.md](file:///Users/jahflyx/motion/brain/References/Shader_Development.md) and [NVIDIA_GPU_Gems.md](file:///Users/jahflyx/motion/brain/References/NVIDIA_GPU_Gems.md)
*   WebGL and Three.js: [WebGL_Reference.md](file:///Users/jahflyx/motion/brain/References/WebGL_Reference.md) and [ThreeJS_Reference.md](file:///Users/jahflyx/motion/brain/References/ThreeJS_Reference.md)
*   Design philosophy: [Modern Web Design.md](file:///Users/jahflyx/motion/brain/Design/Modern%20Web%20Design.md) and [Visual Language Reference.md](file:///Users/jahflyx/motion/brain/Design/Visual%20Language%20Reference.md)

---

## 5. UI Layout & Performance Guidelines

*   **Responsive Ratios**: When modifying canvas dimensions, support aspect ratios `1:1`, `16:9`, `9:16`, and `4:5`. Centering and contain fitting must be managed in CSS using Flexbox or Grid.
*   **DPR Limiting**: High-DPI screens can bottleneck GPU fill rates. Always clamp `window.devicePixelRatio` to `2.0` in render loops to preserve framerates.
*   **CSS Theme Variable Rules**: To add or edit themes, add key-value variable maps to the `THEMES` object inside `src/studio/state.ts` using token variables matching the document layout.
*   **Glassmorphism Performance**: Limit `backdrop-filter` blur to `20px` on mobile. Use `will-change: transform` on glass panels. Pause liquidGL when panels are off-screen.
