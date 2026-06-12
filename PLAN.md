# lumen·local — Open-Source Motion Design Studio

**From shader playground → full moving-image studio.**

```
Current state:   browser-based shader toy with 9 presets, text overlay, video/GIF export
Target state:    open-source, extensible motion design application — layers, timeline,
                 node graph, expressions, compositing, multi-format export
```

---

## Why This Matters

The open-source motion graphics ecosystem has a **glaring gap**. After Effects is
$58/mo and closed. Fusion is free but is a compositor, not a motion design tool.
Cavalry was bought by Canva and closed. Friction is single-maintainer. Caddis
proved the "hybrid layer+node" paradigm is what people want — and it's
closed-source, macOS-only, $99.

**No mature, open-source, cross-platform "After Effects replacement" exists.**

lumen·local can fill that gap. It starts as a focused shader studio and grows
into a platform for all moving-image design — from generative loops to kinetic
typography to full compositing.

---

## Product Vision

> lumen·local is the open-source motion design studio for the web era.
> Hybrid layer + node graph. GPU-native. Extensible. Collaborative.
> Designed for artists who think in motion.

### Design pillars

| Pillar | Meaning |
|---|---|
| **Hybrid by default** | A layer timeline for composition — a node graph inside every layer for effects. You never choose one or the other. |
| **GPU-native** | Built on WebGPU (or Metal/Vulkan natively). Every pixel is GPU-accelerated. No CPU fallback. Real-time at 60fps. |
| **Web-first, native everywhere** | Runs in the browser (zero install) and as a native app via Tauri/Electron. Same codebase. |
| **Extensible** | A plugin API from day one. Nodes, effects, importers, exporters, themes — all pluggable. |
| **Open & free** | GPL-3.0. No paid tiers. No feature gating. All code visible. Community-governed. |
| **Moving image, not just video** | Loops, GIFs, interactive exports (Rive-style), Lottie, MOGRTs — designed for where motion lives today: social, web, broadcast, interactive. |

### Core philosophical commitments

| Commitment | What it means in practice |
|---|---|
| **The canvas is the star** | Chrome recedes. Dark UI. No unnecessary chrome animation. The art always comes first. |
| **Deterministic by default** | Seed-based everything. Same project file = same output, every time. Reproducibility is a feature, not an afterthought. |
| **Immediate feedback** | Every change re-renders at 60fps. No save/preview mode. Export is just recording what you already see. |
| **Constraints breed creativity** | 4-digit seed, 6 sliders, 4-stop palette — these are features, not limitations. They force strong design choices. |
| **Export is a first-class citizen** | PNG, video, GIF are just the start. Lottie, SVG, MOGRT, interactive runtime — every export path gets the same care. |

---

## Phase Roadmap

### Phase 0: Foundation (current state)

```
✓ 9 procedural shader presets
✓ Seed-based determinism
✓ 4-stop palette system
✓ 6 parametric sliders
✓ PNG / WebM / GIF export
✓ Seamless loop (circular phase)
✓ Text overlay with drag positioning
✓ xterm.js terminal
✓ VSCode-style layout (activity bar, panel, status bar)
✓ Theme system (4 built-in themes, localStorage persistence)
```

### Phase 1: The Studio Shell (next 3–6 months)

Settings persistence — remember panel state, terminal height,
theme choice, last-used export format.

Proper project format — `.lumen` files (JSON manifest) that capture
every parameter, text element, and export setting. Open in one click.

Plugin API v0 — simple JS plugins that can register a new preset
(shader mode), with a manifest, icon, and parameter definitions.

Export queue — batch export multiple formats at once with a
render progress indicator.

**Milestone:** A self-contained creative sandbox with a modern UX that
feels as good as a native app.

### Phase 2: Timeline & Layers (6–12 months)

Layer system — multiple layers (shader, text, image, solid, video).
Each layer has its own timeline track with transform properties
(position, scale, rotation, opacity).

Keyframe engine — visual keyframes on the timeline per property.
Linear and bezier interpolation. Graph editor for value curves.

Pre-compositions — nest compositions inside other compositions
(AE-style). Essential for complex projects.

Blending modes — multiply, screen, overlay, etc. Stacking order
defines the composite.

Adjustment layers — effects applied globally above affected layers.

**Milestone:** A real motion design tool. You can now compose shader
layers over video, animate text alongside generative graphics, and
pre-compose complex elements.

### Phase 3: Node Graph (12–18 months)

Per-layer node graph — every layer gets a node editor (Caddis-style).
Parameters are wired into nodes; any parameter can be modulated,
replaced, or animated.

Node library — 50+ built-in nodes: color correction, blur, distort,
blend, generate, transform, matte, tracking data.

Shader node — any `.glsl` shader becomes a node in the graph.
Inputs are node ports; outputs feed downstream nodes.

Expression editor — JavaScript expressions on any parameter
(AE-style). Link parameters, add randomness, react to time/data.

Preset browser — community-created node setups as downloadable
presets.

**Milestone:** A professional compositing tool that rivals Fusion and
Cavalry in expressiveness, with the approachability of layers.

### Phase 4: Platform (18–24 months)

Plugin marketplace — built-in browser for discovering and installing
community plugins, node packs, themes, and presets.

Real-time collaboration — multiplayer editing (Figma/Rive-style).
Shared cursors, live parameter sync, comments on compositions.

Data-driven animation — import CSV/JSON/Google Sheets to drive
animation parameters at scale (Cavalry-style).

Interactive export — state-machine-driven output (Rive-style).
Animations that respond to user input at runtime.

Audio-reactive — audio file import drives visual parameters via
spectrum analysis (Astrofox / Trapcode Sound Keys style).

AI utility nodes — depth estimation, segmentation masks, upscale,
video inpainting as pluggable processing nodes (local models via
ONNX/WASM).

**Milestone:** A complete motion design platform — creation,
collaboration, and distribution in one open-source package.

---

## Technical Architecture

### Current tech stack

```
HTML     → single-page app
CSS      → custom properties, CSS Grid layout
GLSL     → WebGL1 fragment shaders
JS       → vanilla IIFE, no framework
xterm.js → terminal emulator
WebSocket→ shell communication via node-pty
```

### Proposed evolution

```
┌─────────────────────────────────────────────────────────┐
│                    Application Shell                      │
│  (Tauri wrapper for native; <script> bootstrap for web)  │
├─────────────────────────────────────────────────────────┤
│  State Manager        │  Theme Engine   │  Settings DB   │
│  (MobX / Zustand)     │  (CSS custom    │  (IndexedDB +  │
│                        │   props + JSON) │   localStorage)│
├─────────────────────────────────────────────────────────┤
│  Render Engine          │  Composition Engine             │
│  (WebGPU / WebGL2)     │  (Layer stack + timeline +      │
│                         │   node graph evaluation)        │
├─────────────────────────────────────────────────────────┤
│  Plugin API            │  Export Pipeline                │
│  (WASM + JS sandbox)   │  (PNG / WebM / GIF / Lottie    │
│                         │   / SVG / MOGRT)               │
├─────────────────────────────────────────────────────────┤
│  File I/O              │  Network Layer                  │
│  (.lumen JSON format)  │  (WebSocket, multiplayer sync)  │
└─────────────────────────────────────────────────────────┘
```

### Key technical decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Rendering** | WebGPU (primary) / WebGL2 (fallback) | WebGPU gives compute shaders, better performance, and maps well to Metal/Vulkan. WebGL2 covers legacy browsers. Single shader language (GLSL → WGSL transpilation or Naga). |
| **Desktop wrapper** | Tauri | Smaller binary than Electron (MBs vs 100+ MB). Rust-based, secure. Native file system access, GPU acceleration. |
| **UI framework** | Lit (web components) or vanilla | Lightweight. No heavy framework. Web components are framework-agnostic and map well to a plugin architecture. |
| **State management** | MobX or Zustand | Simple, reactive, observable. Well-suited for real-time parameter updates. |
| **Plugin system** | WASM + JS sandbox | WASM for perf-sensitive plugins (image processing, particle systems). JS sandbox for expressions and UI extensions. |
| **Node graph** | Custom canvas/WebGL render | Node editors are too idiosyncratic for off-the-shelf solutions. A custom renderer gives control over UX and performance. |
| **Project format** | `.lumen` (JSON manifest) | Human-readable, diff-able, version-controllable. Assets referenced by path or embedded as base64. Inspired by Blender `.blend`'s structured approach but text-based. |
| **File storage** | IndexedDB (web) / local FS (native) | Web version stores projects in IndexedDB. Native uses the file system directly with auto-save. |

### The shader-first DNA

Even as the app grows, the **shader preset** remains lumen·local's unique identity.

```
A "lumen composition" is always:
- A collection of layers
- Where at least one layer uses a generative shader
- With text, images, and video composited on top
- All driven by the same seamless-loop invariant

The loop invariant never goes away.
Every layer's animation is parameterized by phase ∈ [0, 2π).
Exports are always seamless by default.
```

This is the differentiator. AE can't do this. Fusion can't do this. Cavalry
can do loops but not with shader-based generative layers.

---

## Open Source Strategy

### License: GPL-3.0

```
Core application:    GPL-3.0
Plugin SDK:          LGPL-3.0 (allows proprietary plugins)
Documentation:       CC-BY-SA 4.0
Brand assets:        CC-BY-NC-ND 4.0 (logo, wordmark)
```

GPL protects the core from enclosure. LGPL on the SDK enables a plugin
ecosystem (commercial plugins can be built on top). The brand stays under
a non-commercial license to prevent confusion.

### Governance

| Phase | Model | Key People |
|---|---|---|
| 0–1 | BDFL (Josh) | Single vision, fast decisions |
| 2–3 | Core team (3–5 maintainers) | Nominated contributors with commit access |
| 4+ | Foundation (Blender model) | Nonprofit, corporate patrons, community-elected TSC |

### Repository structure (monorepo)

```
lumen/
├── packages/
│   ├── core/            # Render engine, composition, layout
│   ├── ui/              # Web components (panels, timeline, etc.)
│   ├── plugins/         # Built-in plugins (shader presets, nodes)
│   ├── export/          # PNG / WebM / GIF / Lottie exporters
│   ├── project/         # .lumen file format I/O
│   └── runtime/         # Interactive export player (web runtime)
├── apps/
│   ├── studio/          # The main application (web entry point)
│   ├── desktop/         # Tauri shell for native builds
│   └── playground/      # slim embedding for iframe/widget use
├── sdks/
│   ├── plugin-api/      # Plugin SDK documentation + types
│   └── node-api/        # Custom node authoring SDK
├── docs/                # Docusaurus site
├── tests/               # Integration + regression tests
└── scripts/             # Build tooling + CI
```

### Community building

| Channel | Purpose |
|---|---|
| GitHub | Issues, discussions, RFCs, project board |
| Discord | Real-time help, showcase, community chat |
| Bluesky / Mastodon | Announcements, community highlights |
| YouTube | Tutorials, dev diaries, release demos |
| Open Collective | Transparent funding, sponsors, expenses |

### Funding model

```
Tier 1: GitHub Sponsors + Open Collective  (individual donations)
Tier 2: Corporate patrons (Blender-style Development Fund)
Tier 3: Merch + training content (Blender Studio model)
```

No paid tiers, no feature gating, no "Pro" version. The entire application
is free and open-source forever.

### Release cadence

```
Nightly builds       → CI artifacts, for bleeding-edge users
Monthly alpha/beta   → tagged pre-releases for testing
Quarterly stable     → semver bump, changelog, release notes
Annual LTS           → 2-year support window for studio users
```

---

## Getting Started (Contributor Onboarding)

```bash
git clone https://github.com/jahflyx/lumen
cd lumen
npm install
npm run dev          # starts the studio in browser
npm run desktop      # builds + launches Tauri app
```

The `CONTRIBUTING.md` will include:

- How the monorepo is organized
- How to add a new shader preset (the fastest path to a meaningful contribution)
- How to build and test
- Coding standards (prettier, eslint, stylelint)
- PR workflow and review expectations

First-time contributors should start with:

1. **Add a shader preset** — extend `presets/` with a new GLSL mode
2. **Add a theme** — create a JSON theme token file
3. **Fix a bug** — labelled `good first issue` on GitHub
4. **Improve docs** — fix a tutorial, add a FAQ entry, improve a screenshot

---

## Differentiation: Why lumen·local Wins

| Dimension | lumen·local | After Effects | Fusion | Cavalry | Friction |
|---|---|---|---|---|---|
| **Price** | Free (GPL) | $58/mo | Free / $295 | Free (Canva) | Free (GPL) |
| **Generative shaders** | Native | No (plugins) | No | No | Partial (Shadertoy) |
| **Hybrid layer+node** | Planned | No | Node only | Node only | Layers only |
| **Seamless loops** | Built-in | Manual | Manual | Manual | Manual |
| **Web native** | Yes | No | No | No | No |
| **Collaboration** | Planned | No | No | No | No |
| **Plugin ecosystem** | Planned | Mature | OpenFX | Limited | Limited |
| **Modern UX** | Planned | Cluttered | Cluttered | Good | Spartan |
| **Interactive export** | Planned | No | No | No | No |

---

## The 5-Year Vision

An open-source motion design ecosystem:

- **lumen·local studio** — The full desktop and web application for creating
  moving-image content
- **lumen runtime** — A tiny web runtime (<100KB) for playing back
  interactive lumen compositions on any website
- **lumen marketplace** — A community hub for plugins, presets, themes,
  node packs, and learning content
- **lumen format (.lumen)** — An open, version-controlled project format
  that any tool can read and write
- **lumen foundation** — The nonprofit entity that stewards all of the above

Not an After Effects clone. Not a Fusion clone. A new kind of motion design
tool that starts with **generative, seamless, web-native** and builds up to
professional compositing — all free, all open, all community-owned.

---

> This is a living document. As the project evolves, so will this plan.
> Phase boundaries may shift. Features may be reordered based on community
> feedback. The fundamental direction — open, hybrid, generative-first,
> web-native — does not change.
