![motion splash](header.png?v=2)

# /motion local — generative shader studio

A browser-based **generative graphics studio** for creating looping motion graphics
(images, videos, GIFs, and standalone HTML pages) with WebGL shaders.

Built with **TypeScript + Vite** — strict types, hot module reload, and a clean
multi-module architecture under `src/`.

---

## Quick start

```sh
git clone https://github.com/murderszn/motion.git
cd motion
npm install

# Dev server (Vite HMR) — open http://localhost:5173
npm run dev

# PTY terminal backend (for the built-in shell panel)
npm run server
```

> Run both commands in separate terminals if you want the live terminal panel
> inside the studio to work. The Vite config proxies `/terminal` WebSocket to
> the node-pty server automatically.

**Browser:** Chrome/Edge recommended. Safari has spotty WebM (video export) support —
PNG and GIF work everywhere.

---

## What's in this repo

| Path | What it is |
|------|------------|
| `src/studio/` | TypeScript source for the studio — 21 typed modules |
| `src/index.ts` | Splash page script |
| `studio.html` | Studio HTML shell (script tag points to `src/studio/main.ts`) |
| `index.html` | Splash page HTML shell |
| `vite.config.ts` | Vite multi-page config + `/terminal` WebSocket proxy |
| `tsconfig.json` | TypeScript config (strict, ES2020, bundler resolution) |
| `server.mjs` | Node.js PTY + WebSocket server (terminal panel backend) |
| `DEVELOPER_AGENT_GUIDE.md` | Integration guide for developers and AI agents |
| `.agents/skills/motion-studio/` | AI agent skill files for the studio |

### Source module map

```
src/
├── index.ts                      # Splash page (roster, timer, WebGL bg, parallax)
└── studio/
    ├── types.ts                  # Shared interfaces (Params, TextElem, Preset, …)
    ├── state.ts                  # Constants + mutable P params object
    ├── webgl.ts                  # Context init, full GLSL shader, draw(), compileNewFS()
    ├── render.ts                 # RAF loop, phase, pause, FPS callback
    └── ui/
        ├── main.ts               # Bootstrap — wires all modules
        ├── presets.ts            # Preset button grid
        ├── seed.ts               # Seed input + dice
        ├── palette.ts            # Color swatches + randomizer
        ├── sliders.ts            # Dynamic slider controls
        ├── sizes.ts              # Canvas size buttons
        ├── text.ts               # Text tool (click-to-place), drag, canvas bake for export
        ├── export.ts             # PNG / WebM / GIF export
        ├── export_embed.ts       # Self-contained HTML splash page exporter
        ├── url_api.ts            # URL query params, shareable link, JSON clipboard ops
        ├── terminal.ts           # xterm.js + WebSocket PTY, resize handle
        ├── sidebar.ts            # Panel/term toggles, theme switcher, responsive chrome
        ├── statusbar.ts          # FPS + status bar
        ├── shader_editor.ts      # Live GLSL editor + problems panel + hotkeys legend
        ├── command_palette.ts    # VS Code-style command palette (Cmd+Shift+P)
        └── keyboard.ts           # Keyboard shortcuts
```

---

## How to use the studio

The layout: canvas preview in the center, control panels on the left and right,
status bar at the bottom.

1. **Pick a preset** — 15 generative shader modes:
   - `reeded` — vertical reeded-glass rods refracting drifting color blobs
   - `flow` — domain-warped liquid noise gradients
   - `orbs` — soft metaballs drifting on orbits
   - `waves` — flowing contour bands
   - `halftone` — animated dot-grid over a flow field
   - `grain` — soft grainy gradient washes
   - `glass` — glassmorphism: drifting frosted panes refracting a colour backdrop
   - `aurora` — wavy glowing curtains of light across a dark night sky
   - `electric` — branching, flickering lightning filaments
   - `kaleidoscope` — mirrored radial symmetry slices
   - `rings` — concentric glowing rings modulated by noise
   - `plasma` — classic multi-frequency sine wave plasma
   - `fractal square` — recursive fractal orbit trap
   - `triangle lattice` — rotating triangular grid
   - `sd rosette` — signed-distance rosette pattern

2. **Set a seed** — a 4-digit number that deterministically positions everything.
   Same seed + preset + settings always reproduces the same graphic. Dice (⚄) for random.

3. **Choose colors** — a 4-stop gradient (dark → mid → bright → highlight).
   Edit swatches directly or shuffle (⟳) through 11 curated palettes.

4. **Tune the sliders** — `speed`, `scale`, `density`, `distortion`, `detail`, `grain`
   (all 0–1; each preset interprets them in its own way).

5. **Pick a canvas size** — `1:1` (1080²), `16:9` (1920×1080), `9:16` (Reels/TikTok),
   `4:5` (Instagram feed).

6. **Set loop duration** — 2–10 s. All animation runs on a circular phase, so every
   loop is **seamless** (the last frame flows perfectly into the first).

7. **Add text** — press `T` or click the text tool button to arm it, then click
   on the canvas to place a text box at that position. Press `Escape` to deactivate.
   Drag placed text to reposition. Edit content, font, size, color, and effects
   in the text panel. Available effects: drop shadow, neon glow, outline, solid box,
   frosted glass.

8. **Export** —
   - `image` → PNG of the current frame at full canvas resolution
   - `video` → WebM, records exactly one loop at 60 fps
   - `gif` → renders one loop frame-by-frame at 30 fps, downscaled to ≤640 px
   - `html splash page` → self-contained HTML file with embedded WebGL shader,
     parameters, textures (base64), and text overlays. Deploy anywhere — no
     dependencies, runs fully offline.

   Exports are named `lumen-{preset}-{seed}.{ext}` (e.g. `lumen-reeded-9015.png`).

9. **Share & collaborate** —
   - **Copy JSON** → copies the full studio state (params + texts) to clipboard
   - **Paste JSON** → restores state from a JSON payload in clipboard
   - **Copy shareable link** → generates a URL with all settings as query parameters

10. **URL API** — launch the studio in any state via query parameters:
    `studio.html?preset=waves&seed=4012&speed=0.8&palette=#000,#f0f,#0ff,#fff`

11. **Project save/load** — save your workspace as a `.lumen` file (JSON) and
    reload it later with all params, texts, and shader state preserved.

12. **13 UI themes** — switch between dark, dim, contrast, light, neon midnight,
    moss forest, arctic frost, synthwave dream, dracula noir, cherry blossom,
    warm espresso, claude cream, and colorblind friendly.

**Keyboard shortcuts:** `space` pause/play · `r` randomize · `s` save PNG · `t` text tool
`f` fullscreen · `g` generator tab · `escape` deactivate text tool
`Cmd+Shift+P` / `F1` command palette · `Ctrl+`` toggle terminal · `Cmd+B` toggle panel

The bottom panel has a **hotkeys** tab with the full shortcut reference.

---

## Architecture notes

### TypeScript modules

The studio was originally a single-file HTML app (one giant IIFE in `studio.html`).
It's now a proper TypeScript project with:

- **Strict types** for all shader params, UI state, text elements, themes
- **Module boundaries** — WebGL, render loop, each UI widget, and export are separate files
- **Custom events** for cross-module communication (no circular imports):
  - `lumen:log` → terminal panel
  - `lumen:selectTab` → sidebar tab switch
  - `lumen:saveProject` → project save

### WebGL

WebGL1 context with `preserveDrawingBuffer: true` (required for PNG/GIF capture).
One fullscreen triangle strip, one fragment shader containing all 15 presets
branched on `u_mode`. `draw(phase)` pushes all uniforms from `P` and renders
one frame. The live shader editor calls `compileNewFS()` to hot-swap the program.

### The seamless-loop invariant

Animation is driven by `u_phase` ∈ [0, 2π), **not** raw time. Every animated term
must return to its starting state when `u_phase` wraps:

- Periodic terms must use **integer multiples** of `u_phase`
  (`sin(x + 2.0*u_phase)` ✓ · `sin(x + 1.5*u_phase)` ✗)
- Noise fields drift along a **circular path** via `loopOff()`
  (`vec2(cos(u_phase), sin(u_phase)) * radius`) instead of a linear offset

This is what makes video/GIF exports loop perfectly. Any new animation that
violates it will produce a visible seam.

### Adding things

- **Preset:** append to `PRESETS` in `state.ts`, add `else if (u_mode == N)` in `webgl.ts`
- **Palette:** append a 4-hex array to `PALETTES` in `state.ts`
- **Slider:** append to `SLIDERS` in `state.ts`, add `u_<id>` uniform to `webgl.ts`
- **Canvas size:** append `{label, w, h}` to `SIZES` in `state.ts`
- **Theme:** append to `THEMES` in `state.ts`

### Gotchas

- GLSL ES 1.0 (WebGL1): no dynamic loop bounds, no implicit int↔float, declare precision
- A shader compile error throws at load — the Problems tab in the studio shows the line
- `index.html` is a separate splash page with its own self-contained wave-field shader

---

---

**Community:** [Join the Discord](https://discord.gg/F9Vy9ByYbB)

*Inspired by Inigo Quilez, Book of Shaders, Casey Reas / Processing Foundation,
Tyler Hobbs, Matt DesLauriers, Dave Whyte (beesandbombs), Ryoji Ikeda / teamLab,
FIELD.IO, and Universal Everything.*
