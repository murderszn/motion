# Modification Points

Quick-reference for common modifications in the TypeScript codebase.

## State & Config

| Task | File | Search For |
|------|------|------------|
| Add a preset | `state.ts` | `PRESETS` array |
| Add a palette | `state.ts` | `PALETTES` array |
| Add a size | `state.ts` | `SIZES` array |
| Add a slider | `state.ts` | `SLIDERS` array |
| Change default seed | `state.ts` | `P.seed` |
| Change default palette | `state.ts` | `P.colors` |
| Change default loop time | `state.ts` | `P.loop` |
| Add a new type | `types.ts` | export interface / type |

## WebGL

| Task | File | Search For |
|------|------|------------|
| Change shader helpers | `webgl.ts` | `hash21`, `vnoise`, `fbm` |
| Add uniform location | `webgl.ts` | `UNIFORM_NAMES` |
| Push uniform in draw() | `webgl.ts` | `gl.uniform` |
| Modify grain intensity | `webgl.ts` | `u_grain * 0.22` |
| Modify vignette strength | `webgl.ts` | `dot(v, v) * 0.16` |
| Add shader mode branch | `webgl.ts` | `u_mode ==` |

## UI Modules

| Task | File | Search For |
|------|------|------------|
| Add keyboard shortcut | `ui/keyboard.ts` | `keydown` |
| Add command palette entry | `ui/command_palette.ts` | `COMMANDS` |
| Change export filename | `ui/export.ts` | `fname()` |
| Change GIF max dim | `ui/export.ts` | `maxDim` |
| Modify terminal behavior | `ui/terminal.ts` | `initTerminal` |
| Add status bar info | `ui/statusbar.ts` | `initStatusBar` |

## Entry Point

| Task | File | Search For |
|------|------|------------|
| Add new UI module | `main.ts` | `init` bootstrap |
| Wire up new event | `main.ts` | `addEventListener` |
| Add project save field | `main.ts` | `saveProject` |

## Related

- [[Studio Architecture]] — section-by-section guide
- [[Adding a Preset]] — full walkthrough
- [[Adding a Slider]] — full walkthrough
- [[Adding a Palette]] — full walkthrough
