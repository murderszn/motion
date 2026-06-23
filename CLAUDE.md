# CLAUDE.md

> Context for Claude Code working on the /motion project.

## What This Is

**lumen·local** — a browser-based generative shader studio for creating looping motion graphics. Think: ShaderToy meets a video editor. Users pick a preset, tweak sliders, randomize seeds, and export seamless-loop PNG/WebM/GIF at social-ready resolutions.

## Quick Start

```bash
npm install
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # TypeScript check + production build
npm run lint       # ESLint (if configured)
```

Open `studio.html` in the browser (served by Vite). The splash page is `index.html`.

## Architecture

```
src/studio/
├── main.ts        — entry point, wires everything together
├── state.ts       — constants (PRESETS, PALETTES, SLIDERS, THEMES) + mutable P
├── types.ts       — shared TypeScript interfaces
├── render.ts      — RAF loop, phase tracking, FPS, pause
├── webgl.ts       — WebGL context, GLSL shader string, draw(), shader hot-swap
└── ui/            — 13 UI modules (presets, seed, palette, sliders, etc.)
```

- **One fragment shader** — all 23 presets live in a single `FS` string in `webgl.ts`, branched on `u_mode` (alphabetical order)
- **Two-pass rendering** — scene renders to FBO, post-process applies chromatic aberration
- **Config-driven UI** — `PRESETS`, `SLIDERS`, `PALETTES` arrays in `state.ts` generate the panel controls

## Critical Rules

### Seamless Loop Invariant
Animation uses `u_phase ∈ [0, 2π)`, NOT raw time. Every motion must return to origin when phase wraps.
- ✅ `sin(x + 2.0 * u_phase)` — integer multiple
- ✅ `loopOff()` — circular drift that returns to start
- ❌ `sin(x + 1.5 * u_phase)` — non-integer = visible seam
- ❌ `time * speed` — monotonic, never resets

### WebGL 1.0 (GLSL ES 1.0) Constraints
- Constant loop bounds only: `for (int i = 0; i < 5; i++)`
- No implicit int↔float: use `2.0` not `2`, cast with `float(i)`
- `precision highp float;` must remain at shader header
- No bitwise operators, no `discard` in some implementations

## Adding a Preset

1. Add `{ id, icon, full }` to `PRESETS` in `src/studio/state.ts`
2. Add `else if (u_mode == N)` branch in the `FS` shader string in `src/studio/webgl.ts`
3. Available helpers: `hash21`, `vnoise`, `fbm`, `grad4`, `metaf`, `loopOff`
4. Test across all 11 palettes, multiple seeds, all 4 aspect ratios, full slider range
5. Film grain + vignette apply automatically — don't add them per-preset

## Adding a Slider

1. Add to `SLIDERS` in `state.ts`
2. Add key to `SliderKey` type and `Params` interface in `types.ts`
3. Add `uniform float u_<name>;` in the shader
4. Add to `UNIFORM_NAMES` array in `webgl.ts`
5. Push via `gl.uniform1f()` in `draw()`

## Knowledge Base

The `brain/` folder is an Obsidian-compatible knowledge graph with 59 notes:
- `brain/Index.md` — map of content, entry point
- `brain/Presets/` — one note per preset with slider outcomes and techniques
- `brain/Design/` — design principles, color theory, WebGL techniques, fractals
- `brain/References/` — shader dev guide, Three.js, WebGL, resources, glossary
- `brain/Architecture/` — studio, shader, UI, plugin system docs
- `brain/Concepts/` — loop invariant, seed determinism, palette system, params
- `brain/Development/` — how to add presets, sliders, palettes

## Building Standalone Pages

Beyond the studio, this project produces standalone HTML pages with:
- **WebGL shader backgrounds** — fullscreen canvases with procedural animation
- **Glassmorphism panels** — CSS `backdrop-filter` or liquidGL for real-time refraction
- **Symmetrical layouts** — golden ratio, radial/bilateral symmetry, 4px grid

When building a page, load these skills in order:
1. `motion-web-design` — design system, glassmorphism patterns, shader integration
2. `liquidgl-glassmorphism` — if using real-time refraction glass
3. `shader-development` — if writing custom GLSL
4. `motion-shaders` — if using /motion's shader helpers

Examples of standalone pages: `index.html`, `splash.html`, `examples/*.html`

## Building a Beautiful Site (Chromaverse + Motion Shaders)

This is the canonical recipe for generating a premium website on this project.
Compose three layers — **a Chromaverse theme for the surface, a /motion shader for
the movement, glassmorphism to bridge them** — governed by design theory.

**Mental model:** Chromaverse = *what colors* · motion shaders = *what moves* ·
glassmorphism = *how content floats above the motion*.

### The 5-step build

1. **Pick the Chromaverse theme** — browse `chromaverse/index.html`, choose a palette
   that matches the brand mood (e.g. `kyoto-moss` calm, `vaporwave` retro, `swiss`
   editorial). Lift its CSS custom properties as the page's token foundation:
   `--bg`, `--bg-alt`, `--ink`, `--text`, `--text-muted`, `--border`, and the
   `--accent` / `--accent-bright` / `--accent-pale` ladder, plus the shared scale
   (`--sp-1…--sp-10`, `--r-sm/md/lg`, `--ease-out`). Ship both `[data-theme="dark"]`
   and light blocks. The theme owns ALL color — never invent ad-hoc hex values.
2. **Choose the motion shader** — pick one /motion preset for the fullscreen WebGL
   background (`aurora`, `flow`, `plasma`, `marble`, `glass`, …). One preset, slow
   and ambient — the background supports content, it does not compete with it.
3. **Tint the shader to the theme** — feed the Chromaverse palette colors into the
   shader's palette uniforms so motion and surface share one color story. Respect the
   seamless-loop invariant (`u_phase`, `loopOff()`) — see Critical Rules above.
4. **Layer glassmorphism** — float content in frosted panels over the shader
   (`backdrop-filter: blur(20px) saturate(180%)`), or use liquidGL for true
   refraction. Glass tints come from the theme's surface tokens, not white.
5. **Apply design theory** — golden-ratio / 4px-grid layout, radial or bilateral
   symmetry, generous negative space, one accent used sparingly, type pairing from
   the theme, 150–200ms `transform`/`opacity` motion only.

### Skill load order for this build

1. `motion-web-design` — design DNA, glassmorphism, symmetry, shader integration
2. `liquidgl-glassmorphism` — if using real-time refraction glass
3. `shader-development` — if writing/tuning custom GLSL
4. `motion-shaders` — for /motion's shader helpers (`fbm`, `hash21`, `loopOff`, …)

Then read a representative theme file under `chromaverse/` to copy its exact token
block. See `AGENTS.md` §3 for the layered z-index stack and copy-paste patterns.

## Agent Skills

Preloaded guides:
### Studio
- `motion-studio/SKILL.md` — complete studio guide (presets, sliders, export, gotchas)

### Shaders
- `shader-development/SKILL.md` — GLSL recipes, math, noise, shapes
- `motion-shaders/SKILL.md` — /motion shader math blueprints and helpers

### Web Design & Glassmorphism
- `motion-web-design/SKILL.md` — design DNA, glassmorphism, symmetry, shader integration
- `liquidgl-glassmorphism/SKILL.md` — liquidGL library for real-time refraction glass

## File Map (Edit Points)

| Task | File |
|------|------|
| Add/edit shader preset | `src/studio/webgl.ts` |
| Add preset/slider/palette config | `src/studio/state.ts` |
| TypeScript types | `src/studio/types.ts` |
| UI controls | `src/studio/ui/` |
| HTML shell | `studio.html` |
| Splash page | `index.html` |
| Agent guidelines | `AGENTS.md` |
| Knowledge base | `brain/` |
