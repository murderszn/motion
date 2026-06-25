# Changelog

All notable changes to lumen·local.

## [Unreleased]

### Added
- **Aberration slider** — chromatic aberration post-process effect with two-pass rendering (scene → FBO → per-channel UV offset)
- **Brain graph hotkeys** — `R` reset, `S` search, `Space` toggle auto-rotate, `1-6` focus vault group, `Esc` deselect

### Changed
- **Brain vault updated for TypeScript** — all architecture, development, and reference notes rewritten to reflect modular TS codebase (`state.ts`, `types.ts`, `webgl.ts`, 13 UI modules)
- **Shader Architecture doc** — documents two-pass pipeline (scene FBO + post-process)
- **Adding a Slider doc** — now covers both scene and post-process uniform paths
- **Roadmap** — TS conversion, command palette, live shader editor, text overlays, project save/load marked complete

## [1.0.1] — 2026-06-24

### Added
- **motion × CHROMAVERSE commercial** (`examples/motion-chromaverse-commercial.html`) — 24s kinetic spot with side-by-side `/motion` shaders and CHROMAVERSE themes stats
- **MP4 export script** (`examples/export-commercial-mp4.mjs`) — Playwright + ffmpeg pipeline for 9:16, 16:9, and 1:1 social cuts
- **Social-ready MP4s** in `examples/out/` for TikTok/Reels, Twitter/LinkedIn, and IG feed

### Changed
- Darker nebula background on the commercial spot for stronger contrast with foreground type

## [0.2.0] — 2026-06-12

### Added
- **TypeScript + Vite build pipeline** — 24 typed modules, `tsc --noEmit` strict mode, multi-page Vite build
  - `src/studio/types.ts` — shared interfaces (`Preset`, `Params`, `SliderKey`, `TextElem`, `ThemeDef`, `Command`, `ProjectFile`)
  - `src/studio/state.ts` — constants (`PRESETS`, `SIZES`, `PALETTES`, `SLIDERS`, `THEMES`) + mutable `P` object
  - `src/studio/webgl.ts` — WebGL context, full GLSL shader, `draw()`, `compileNewFS()` hot-swap
  - `src/studio/render.ts` — RAF loop, phase tracking, FPS callback, pause
  - `src/studio/main.ts` — bootstrap, `randomize()`, project save/load
  - `src/studio/ui/` — 13 UI modules: presets, seed, palette, sliders, sizes, text, export, terminal, statusbar, sidebar, shader editor, keyboard, command palette
- **README** rewritten with full source module map, quick start (`npm run dev`), and architecture overview

## [0.1.0] — 2026-06-11

### Added
- **Splash page** (`index.html`) — centered hero, random video/shader background, poster frame
- **Node.js server** (`server.mjs`) — static file server + WebSocket PTY for terminal
- **Studio app** (`studio.html`) — 9→14 procedural shader presets, seed/palette/sliders, PNG/WebM/GIF export, seamless loop
- **Brain vault** (`brain/`) — Obsidian knowledge graph: concepts, presets, architecture, design, development guides, references
- **Design language** (`DESIGN_LANGUAGE.md`) — visual identity system
- **Planning docs** (`PLAN.md`) — phased roadmap from foundation to platform

### Presets
Reeded Glass, Flow, Orbs, Waves, Halftone, Grain, Glass, Aurora, Electric, Kaleidoscope, Rings, Plasma, Displace, Melt
