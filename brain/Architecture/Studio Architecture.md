# Studio Architecture

The studio is a **TypeScript module system** built with Vite, replacing the original single-file `studio.html`.

## Module Structure

```
src/studio/
├── main.ts        — entry point, wires everything together
├── render.ts      — render loop (requestAnimationFrame, phase tracking)
├── state.ts       — config arrays (PRESETS, PALETTES, SIZES, SLIDERS, THEMES) + mutable P object
├── types.ts       — TypeScript interfaces and type aliases
├── ui/            — 13 UI modules, each owning one panel/feature
│   ├── presets.ts
│   ├── seed.ts
│   ├── palette.ts
│   ├── sliders.ts
│   ├── sizes.ts
│   ├── text.ts
│   ├── export.ts
│   ├── terminal.ts
│   ├── statusbar.ts
│   ├── sidebar.ts
│   ├── shader_editor.ts
│   ├── keyboard.ts
│   └── command_palette.ts
└── webgl.ts       — WebGL context, GLSL shaders (scene + post-process), draw calls
```

## Data Flow

1. `state.ts` holds all config arrays and the mutable `P` (params) object
2. `webgl.ts` reads `P` each frame to set uniforms and draw
3. UI modules import `P` and write directly into it on user interaction
4. `render.ts` drives the RAF loop, advancing `u_phase` and calling `draw()`
5. `main.ts` bootstraps everything and wires cross-module events

## Shader Pipeline

Two-pass rendering in `webgl.ts`:
1. **Scene pass** — all 23 presets (branched on `u_mode`), film grain, vignette → FBO
2. **Post-process pass** — chromatic aberration via per-channel UV offset on FBO texture

Shader hot-swap: `compileNewFS()` recompiles the scene fragment shader at runtime (live editor in sidebar).

## Build

- **Vite** dev server + bundler
- **TypeScript** strict mode with `tsc --noEmit` for type checking
- Entry points: `index.html` (splash) + `studio.html` (studio app)

## Legacy

The original `studio.html` was a single-file IIFE containing all JS, CSS, and HTML. The TypeScript conversion split this into the module structure above while preserving the same WebGL shaders and UI behavior.

## Related

- [[Shader Architecture]] — GLSL details and helpers
- [[UI System]] — config-driven panel generation
- [[Modification Points]] — file-level quick reference
