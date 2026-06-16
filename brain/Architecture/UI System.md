# UI System

## Architecture

The UI is **config-driven** — config arrays in `state.ts` generate the panel markup at runtime. Each UI concern lives in its own module under `src/studio/ui/`.

## UI Modules

| Module | File | Purpose |
|--------|------|---------|
| Presets | `ui/presets.ts` | Preset button grid (14 items) |
| Sizes | `ui/sizes.ts` | Size selector (4 items) |
| Palette | `ui/palette.ts` | Palette swatch row + shuffle |
| Sliders | `ui/sliders.ts` | 7 labeled range sliders |
| Seed | `ui/seed.ts` | Seed input + randomize |
| Text | `ui/text.ts` | Text overlay controls |
| Export | `ui/export.ts` | PNG / WebM / GIF export |
| Terminal | `ui/terminal.ts` | xterm.js terminal panel |
| Status Bar | `ui/statusbar.ts` | FPS, seed, mode display |
| Sidebar | `ui/sidebar.ts` | Collapsible sidebar |
| Shader Editor | `ui/shader_editor.ts` | Live GLSL editor |
| Keyboard | `ui/keyboard.ts` | Keyboard shortcut bindings |
| Command Palette | `ui/command_palette.ts` | Cmd+K command palette |

## Layout

```
┌─────────────────────────────────────────┐
│  Header: lumen·local logo + mode label  │
├──────────┬──────────────────┬───────────┤
│          │                  │  Panel:    │
│  Sidebar │   Canvas         │  - Presets │
│  (icons) │   (WebGL viewport)│  - Seed   │
│          │                  │  - Palette │
│          │                  │  - Sliders │
│          │                  │  - Sizes   │
├──────────┴──────────────────┴───────────┤
│  Status: resolution / fps / seed / mode  │
└─────────────────────────────────────────┘
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Pause / play |
| `r` | Randomize everything |
| `s` | Save PNG |
| `Cmd+K` | Open command palette |

## Theme System

4 built-in dark themes (`lumen-dark`, `lumen-dim`, `lumen-contrast`, `lumen-light`), persisted to `localStorage`. Defined in `state.ts` as `THEMES`.

## Related

- [[Studio Architecture]] — how UI connects to state
- [[Parameter System]] — what the sliders control
