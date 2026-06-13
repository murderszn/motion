![lumen·local splash](header.png?v=2)

# lumen·local — generative shader studio

A self-contained, browser-based **graphics generation studio** for creating looping
motion graphics (images, videos, and GIFs) with WebGL shaders. Inspired by
[lumenshaders.vercel.app](https://lumenshaders.vercel.app/). Everything lives in a
single file: **`studio.html`** — no build step, no server, no dependencies to install.

## Quick start

```sh
open studio.html        # macOS — or just double-click it
```

The studio runs entirely locally in the browser. Internet is only needed for two
optional things: Google Fonts (UI typography) and the GIF encoder library
(fetched from a CDN on first GIF export).

> Chrome/Edge recommended. Safari has spotty WebM (video export) support —
> PNG and GIF work everywhere.

## What's in this folder

| File / Dir | What it is |
|---|---|
| `studio.html` | **The studio.** The tool you open to design graphics. |
| `index.html` | The front door — a full-screen splash with a live wave-field shader background and a link into the studio. |
| `lumen-reeded-9015.png` / `.gif` | Original inspiration images downloaded from Lumen. |
| `lumen-*-*.png/webm/gif` | Anything you export from the studio lands here (via browser downloads) with this naming scheme. |
| `.claude/skills/motion-studio/` | Agent skills for **Claude Code** — studio guide, parameter tables, architect notes, design principles. |
| `.opencode/skills/motion-studio/` | Agent skills for **opencode** — same content in opencode frontmatter format. |
| `.agents/skills/motion-studio/` | Agent skills for **Codex CLI** — same content with Codex metadata and references directory. |

---

## For humans — how to use it

The layout: canvas preview on the left, control panel on the right, status bar
(resolution / fps / seed / mode) at the bottom.

1. **Pick a preset** — 14 generative shader modes:
   - `reeded` — vertical reeded-glass rods refracting drifting color blobs (the original inspiration)
   - `flow` — domain-warped liquid noise gradients
   - `orbs` — soft metaballs drifting on orbits
   - `waves` — flowing contour bands
   - `halftone` — animated dot-grid over a flow field
   - `grain` — soft grainy gradient washes
   - `glass` — glassmorphism: drifting frosted panes refracting a colour backdrop
   - `aurora` — wavy glowing curtains of light undulating across a dark night sky
   - `electric` — branching, flickering lightning filaments
   - `kaleidoscope` — mirrored radial symmetry slices
   - `rings` — concentric glowing rings modulated by noise
   - `plasma` — classic multi-frequency sine wave plasma
   - `displace` — image texture warped by noise
   - `melt` — vertical dripping liquid distortion
2. **Set a seed** — a 4-digit number that deterministically positions/offsets
   everything. The same seed + preset + settings always reproduces the same
   graphic. Hit the dice (⚄) for a random one.
3. **Choose colors** — a 4-stop gradient (dark → mid → bright → highlight).
   Edit each swatch directly or shuffle (⟳) through 11 curated palettes.
4. **Tune the sliders** — `speed`, `scale`, `density`, `distortion`, `detail`,
   `grain` (all 0–1; each preset interprets them in its own way).
5. **Pick a canvas size** — social-ready: `1:1` (1080²), `16:9` (1920×1080),
   `9:16` (Reels/TikTok), `4:5` (Instagram feed).
6. **Set loop duration** — 2–10 s. All animation runs on a circular phase, so
   every loop is **seamless** (the last frame flows perfectly into the first).
7. **Export** —
   - `image` → PNG of the current frame at full canvas resolution
   - `video` → WebM, records exactly one loop at 60 fps
   - `gif` → renders one loop frame-by-frame at 30 fps, downscaled to ≤640 px
     for shareable file size

Exports are named `lumen-{preset}-{seed}.{ext}` (e.g. `lumen-reeded-9015.png`),
so a filename is enough to recreate the graphic.

**Keyboard shortcuts:** `space` pause/play · `r` randomize everything · `s` save PNG.

---

## Agent skills (AI-assisted development)

This repo ships with skill files for three AI coding tools. Each skill set teaches
the agent how the studio works so it can answer questions, make modifications, and
give design advice without context-switching.

| Platform | Location | Format |
|----------|----------|--------|
| **Claude Code** | `.claude/skills/motion-studio/` | YAML frontmatter + Markdown |
| **opencode** | `.opencode/skills/motion-studio/` | YAML frontmatter + Markdown |
| **Codex CLI** | `.agents/skills/motion-studio/` | Codex frontmatter + Markdown + `agents/openai.yaml` metadata |

**What's in each skill set:**

| File | What it teaches |
|------|----------------|
| `SKILL.md` | Full studio overview — 9 presets, 6 sliders, seed/palette/export/loop mechanics, keyboard shortcuts. |
| `SKILL_parameters.md` / `references/parameters.md` | Per-preset slider outcome tables — exactly what each value produces visually. |
| `SKILL_architect.md` / `references/architect.md` | Extending the studio — adding presets/sliders/sizes, shader editing, GLSL constraints, loop invariant rules. |
| `SKILL_design.md` / `references/design.md` | Generative design principles from ShaderToy, Processing, Tyler Hobbs, Dave Whyte, Ryoji Ikeda, and others. |

---

## Design philosophy

This studio is built on principles drawn from the shader art, creative coding,
and generative design communities:

- **Paint with math.** Shaders describe every pixel simultaneously — compose from
  small functions (`hash21` → `vnoise` → `fbm` → `grad4`).
- **Design the output space.** Presets, seeds, and slider ranges define what *can*
  happen. The GPU explores the possibility space.
- **Seamless loops are a contract.** `u_phase` drives all animation. Integer
  multiples only. When the first frame equals the last, the frame disappears.
- **Noise is the engine.** FBM, domain warping, ridged noise — these are the
  primary generative primitives.
- **Constraints breed creativity.** 4-digit seed, 6 sliders, 4 palette stops.
  Limitations force strong choices.
- **Immediate feedback.** Every slider change re-renders at 60fps. No save/preview
  mode. The `r` key randomizes everything instantly.
- **Add analog imperfections.** Grain, vignette, rim lights — digital perfection
  is lifeless.
- **Export is a feature.** Zero-friction PNG/WebM/GIF at social-ready sizes.
  `lumen-{preset}-{seed}.{ext}` means the filename alone recreates the graphic.

*Inspired by Inigo Quilez, Book of Shaders, Casey Reas / Processing Foundation,
Tyler Hobbs, Matt DesLauriers, Dave Whyte (beesandbombs), Ryoji Ikeda / teamLab,
FIELD.IO, and Universal Everything.*

---

## For agents — architecture notes

`studio.html` is a single HTML file with three sections: CSS (UI styling),
HTML (panel markup), and one IIFE `<script>` containing all logic. There is no
framework, no modules, no build — edit the file directly.

### Structure of the script

- **STATE** — `PRESETS`, `SIZES`, `PALETTES`, `SLIDERS` config arrays and the
  single mutable params object `P` (mode, seed, colors, slider values, loop,
  sizeIdx). All rendering reads from `P`.
- **WEBGL SETUP** — WebGL1 context (`preserveDrawingBuffer: true`, required for
  PNG/GIF capture), a fullscreen triangle strip, and **one fragment shader**
  containing all nine presets, branched on the `u_mode` int uniform.
  `draw(phase)` pushes all uniforms from `P` and renders one frame.
- **UI WIRING** — buttons/sliders are generated from the config arrays and
  write straight into `P`.
- **RENDER LOOP** — `requestAnimationFrame`; advances `phase` (0…2π over
  `P.loop` seconds) unless paused or exporting.
- **EXPORT** — PNG via `canvas.toBlob`; WebM via `canvas.captureStream` +
  `MediaRecorder` (resets `phase` to 0 and records one loop); GIF via gif.js
  loaded lazily from cdnjs (worker script is fetched and re-served as a blob
  URL to dodge cross-origin worker restrictions).

### The seamless-loop invariant (do not break this)

Animation is driven by `u_phase` ∈ [0, 2π), **not** by raw time. Anything
animated must return to its starting state when `u_phase` wraps:

- Periodic terms must use **integer multiples** of `u_phase`
  (e.g. `sin(x + 2.0*u_phase)` ✓, `sin(x + 1.5*u_phase)` ✗).
- Noise fields drift along a **circular path** via `loopOff()`
  (`vec2(cos(u_phase), sin(u_phase)) * radius`) instead of a linear offset.

This is what makes video/GIF exports loop perfectly. Any new animation that
violates it will produce a visible seam.

### Common modifications

- **Add a preset:** append a name to `PRESETS` (JS), then add an
  `else if (u_mode == N)` branch in the fragment shader producing `col`.
  Use the shared helpers: `hash21`, `vnoise`, `fbm` (5-octave), `grad4(t)`
  (4-stop palette gradient), `metaf` (orbiting metaballs), `loopOff()`.
  Respect the loop invariant above.
- **Add a palette:** append a 4-hex-color array to `PALETTES`
  (order: dark base → deep mid → bright mid → highlight).
- **Add a canvas size:** append `{label, w, h}` to `SIZES`.
- **Add a slider:** append `{id, label, def}` to `SLIDERS`, add the matching
  key to `P`, declare/use a `u_<id>` uniform in the shader, and add the name
  to the uniform-location list in WEBGL SETUP.
- **Seed handling:** `P.seed` is a 0–9999 int; it reaches the shader as
  `u_seed = (seed % 10000) * φ % 4π` and offsets noise domains and orbit
  phases. Determinism depends on the shader using only `u_seed`-derived
  randomness (never `Math.random()` at render time).

### Gotchas

- The shader is **GLSL ES 1.0** (WebGL1): no dynamic loop bounds, no implicit
  int↔float conversion, declare precision.
- A shader compile error throws at load and the page stays black — check the
  browser console.
- `index.html` is a separate splash/front-door page with its own self-contained
  wave-field shader; changes to the studio go in `studio.html` only.
