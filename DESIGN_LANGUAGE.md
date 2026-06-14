# lumen·local — Design Language

## Vision

The app's own UI should feel like **VSCode and Blender had a child** — the precision,
extensibility, and theme system of VSCode paired with Blender's dark-material,
spatial, tool-oriented feel. The canvas (the art) is always the star; the chrome
exists to serve it, never compete.

---

## Core Principles

1. **Chrome recedes.** UI is dark, thin, typographic. Buttons have no fill until
   hovered. Borders are 1px at `--line`. The canvas sits in a near-black void.
2. **Typographic, not iconic (mostly).** Where possible, use lowercase type
   labels over icons. Icons are allowed in the activity bar and status bar but
   are minimal / unicode.
3. **The accent is the only color.** A single accent (`--accent: #e03a3a`) is used
   sparingly — active tab underlines, toggle states, hovered button borders,
   recording indicators. Never for backgrounds or large areas.
4. **Space is cheap.** No rounded corners >3px. No shadows. No gradients on UI
   elements. Information density is high (VSCode-like status bar with many
   small indicators).
5. **Motion in the canvas, stillness in the UI.** Panels, bars, and buttons do
   not animate except for the recording dot blink and the color picker rings.

---

## Theme System (VSCode-like)

- A `:root` CSS custom property file defines every token (`--bg`, `--panel`,
  `--line`, `--text`, `--dim`, `--accent`, `--term-bg`, `--term-text`, etc.).
- Themes are JSON token maps loaded at runtime — swapping a theme rewrites the
  custom properties on `document.documentElement`.
- **Default theme: `lumen-dark`** — the current near-black palette (`#08080a`
  background, `#0e0e12` panels, `#1c1c22` borders, `#b8b8c0` text,
  `#e03a3a` accent). This ships baked in.
- Additional built-in themes: `lumen-classic` (identical to current), `lumen-dim`
  (slightly lighter panels for easier reading), `lumen-contrast` (higher contrast
  for accessibility).
- User-created themes can be imported as JSON files and stored in `localStorage`.

### Token reference (planned)

| Category | Token | Fallback | Description |
|---|---|---|---|
| Surface | `--bg` | `#08080a` | Main page background (the void) |
| | `--panel-bg` | `#0e0e12` | Sidebar/panel/header backgrounds |
| | `--bar-bg` | `#0a0a0e` | Activity bar & status bar background |
| | `--input-bg` | `transparent` | Text inputs & select backgrounds |
| | `--term-bg` | `#060608` | Terminal background (xterm.js) |
| Borders | `--line` | `#1c1c22` | All 1px dividers and button borders |
| Text | `--text` | `#b8b8c0` | Primary body text |
| | `--text-dim` | `#55555e` | Labels, hints, secondary info |
| | `--text-bright` | `#f4f4f6` | Headings, active labels, logo |
| Accent | `--accent` | `#e03a3a` | Active/hover/selected state |
| | `--accent-alpha` | `#e03a3a44` | Selection backgrounds, translucent overlays |
| Terminal | `--term-text` | `#b8b8c0` | Terminal foreground |
| | `--term-cursor` | `#e03a3a` | Terminal cursor |

(Additional tokens for scrollbar, selection, button-hover, slider-thumb, etc.)

---

## Layout System (VSCode meets Blender)

The current CSS Grid layout (`grid-template-areas`) is the right foundation.
Evolve toward:

```
┌──────────────────────────────────────────────┐
│ header (app logo + mini actions)             │
├──┬──────────┬──────────────────┬──────────────┤
│  │  text    │                  │   panel      │
│ a│  bar     │    stage         │   (presets,  │
│ c│  (slide  │    (canvas)      │    seed,     │
│ t│  out)    │                  │    palette,  │
│  │          │                  │    params,   │
│ b│          │                  │    canvas,   │
│ a│          │                  │    export)   │
│ r│          │                  │              │
├──┴──────────┴──────────────────┴──────────────┤
│ status bar (res | fps | seed | mode)          │
└──────────────────────────────────────────────┘
```

- **Activity bar** (48px left) — VSCode-style vertical icon strip for toggling
  panels: panel toggle, terminal toggle, text tool.
- **Panel** (290px right) — scrollable control panel, closable.
- **Text bar** (240px slide-out from left) — only visible when text tool is active.
- **Stage** — fills remaining space, centers the canvas.
- **Terminal** (bottom, resizable) — xterm.js shell, can be maximized.
- **Status bar** (24px bottom) — reads out current state, clickable items
  (VSCode style).

### Blender-inspired touches

- Canvas sits on a subtle radial gradient void (already done:
  `radial-gradient(ellipse at 50% 40%, #0c0c10 0%, var(--bg) 70%)`).
- Panel sections have lowercase `sect-label` headers with generous letter-spacing
  (already done: `font-size: 9px; letter-spacing: 0.2em; text-transform: lowercase`).
- Slider thumbs are small circles (already done: `9px` diameter, white fill,
  turns accent on hover).
- Status bar items are clickable "buttons" (already done: `.status-btn`).

---

## Component Design

### Header
- Left: app wordmark ("lumen·local"), right: pause + randomize buttons,
  recording indicator.
- Wordmark is uppercase `Inter 500`, `11px`, `0.16em` tracking.
- Accent dot on the "·" separator.

### Activity Bar
- Vertical column of `icon-btn` elements (28×28px, unicode symbols, no label).
- Active tool gets `--accent` color.
- Bottom section has spacer + save icon (mirrors VSCode's gear/account placement).

### Panel (Right Side)
- Sections: Preset, Seed, Palette, Parameters, Canvas, Loop, Export.
- Labels are `9px` uppercase (actual CSS: lowercase with letter-spacing).
- Controls are tightly packed — no wasted vertical space.
- Preset buttons are 3-column grid, small text, `border-radius: 3px`.
- Range sliders have a thin track (`2px`) and small circular thumb (`9px`).
- Color swatches are inline `input[type=color]` elements.

### Terminal
- Darker background than the panels (`--term-bg: #060608`).
- Tab bar with active underline accent.
- Thin resize handle at top (draggable, shows accent stripe on hover).
- Maximize button collapses the stage, terminal fills the space (already done).

### Status Bar
- 24px tall, `--bar-bg`, top border `--line`.
- Left: res, fps, seed, mode — each prefixed with a lowercase label.
- Right: clickable action buttons (panel toggle, terminal toggle).
- VSCode-style: each item is a potential interaction point.

### Buttons & Controls
- **Mini buttons** (header): `10px`, lowercase, border + transparent bg,
  accent on primary action.
- **Icon buttons** (activity bar): 28×28px, no border, dim by default,
  brighten on hover.
- **Range sliders**: 2px track, 9px circular thumb, no fill track.
- **Text inputs**: transparent bg, `--line` border, focus = brighter border,
  monospace font.

---

## Typography

| Role | Font | Size | Weight | Tracking |
|---|---|---|---|---|
| UI text | `JetBrains Mono` | 11px | 400 | `.08em` |
| Labels | `JetBrains Mono` | 10px | 400 | `.08em` |
| Section headers | `JetBrains Mono` | 9px | 400 | `.20em` (uppercase) |
| Logo/wordmark | `Inter` | 11px | 500 | `.16em` |
| Status bar | `JetBrains Mono` | 10px | 400 | `.08em` |
| Canvas text | Inter / JetBrains Mono / user choice | variable | — | — |

- No font-weight below 400 for UI elements. Thin/light weights are reserved for
  the splash page (`index.html`) only.

---

## Color & Material

- Default surface: `#08080a` (near-black with a hint of blue).
- Panel surfaces: `#0e0e12` (one step lighter than the void).
- Borders: `#1c1c22` (barely visible — the UI is defined by gaps, not lines).
- Text: `#b8b8c0` (soft off-white), dim: `#55555e`.
- The void behind the canvas: radial gradient from `#0c0c10` → `#08080a`
  (gives the stage depth without competing with the shader).
- No transparency except `backdrop-filter: blur(4px)` on the splash page buttons
  (the studio itself avoids blur/glassmorphism in its chrome — that's for the
  shader output, not the UI).

---

## Interaction Patterns

| Action | Behavior |
|---|---|
| Hover a button | Border brightens toward `--text` or `--accent` |
| Click a preset | Active state = accent border + tinted background |
| Drag a slider | Thumb turns accent on hover |
| Toggle a panel | CSS class on `<body>` toggles `--right-w` / `--left-w` / `--text-w` between their value and `0px` |
| Maximize terminal | Class swaps grid rows, stage collapses |
| Arm text tool | `T` key or text button — cursor changes to crosshair on canvas |
| Place text | Click canvas while text tool armed — text box drops at click position |
| Deactivate text tool | `Escape` key or click text tool button again |
| Edit text on canvas | Selected element gets accent outline, text bar slides in |
| Export HTML splash | Generates self-contained HTML with embedded shader, params, textures, text |
| Copy JSON | Copies full studio state (params + texts) to clipboard |
| Paste JSON | Restores state from JSON payload in clipboard |
| Copy shareable link | Generates URL with all settings as query parameters |
| URL query params | Launch studio in any state: `?preset=waves&seed=4012&speed=0.8` |
| Status bar click | Opens/closes the associated panel |
| Hotkeys legend | Bottom panel "hotkeys" tab shows all keyboard shortcuts |

---

## Theme Switcher UI (implemented)

- A `◆ theme` button in the status bar cycles through built-in themes.
- **Built-in themes**: `lumen dark`, `lumen dim`, `lumen contrast`, `lumen light`,
  `lumen cyberpunk`, `lumen forest`, `lumen nord`, `lumen synthwave`,
  `lumen dracula`, `lumen sakura`, `lumen coffee`.
- **Persistence**: theme choice saved in `localStorage`.
- Future: settings dropdown with theme picker, import custom JSON themes.

---

## File Organization (eventual)

```
styles/
  tokens.css          # CSS custom properties (theme variables)
  base.css            # Reset, body grid, scrollbars
  header.css          # Top bar
  activity-bar.css    # Left icon strip
  panel.css           # Right control panel
  text-bar.css        # Text tool slide-out
  terminal.css        # Bottom terminal panel
  status-bar.css      # Footer
  controls.css        # Shared button/input/slider styles
  themes/             # JSON theme token files
    lumen-dark.json
    lumen-classic.json
    lumen-dim.json
    lumen-contrast.json

scripts/
  studio.js           # Main app (currently all in studio.html)
  theme.js            # Theme loading & switching
  settings.js         # localStorage persistence

studio.html           # Import maps / module entry point
```

This is aspirational — the current single-file approach is fine for v1. The
design language should be implemented incrementally, starting with the CSS
custom property system and theme switching, without disrupting the single-file
simplicity.

---

## Rationale

**Why VSCode + Blender?** VSCode's layout pattern (activity bar, side panels,
status bar, terminal) is the gold standard for dockable, extensible creative
tools. Blender's dark-material aesthetic (the deep void, the thin borders, the
accent-colored interactive elements) proves that a dense, technical UI can still
feel beautiful and intentional. Together they give lumen·local a UI that is
immediately familiar to developers and designers alike, while keeping the canvas
as the undisputed focal point.
