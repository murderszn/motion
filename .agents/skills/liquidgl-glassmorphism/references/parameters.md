# liquidGL Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | string | `'.liquidGL'` | **Required.** CSS selector for element(s) to glassify |
| `snapshot` | string | `'body'` | CSS selector for area to snapshot |
| `resolution` | number | `2.0` | Snapshot quality (0.1–3.0). Higher = sharper, more memory |
| `refraction` | number | `0.01` | Base refraction offset (0–1) |
| `bevelDepth` | number | `0.08` | Edge bevel intensity (0–1) |
| `bevelWidth` | number | `0.15` | Bevel width as fraction of shortest side (0–1) |
| `frost` | number | `0` | Blur radius in px. 0 = crystal clear |
| `shadow` | boolean | `true` | Soft drop-shadow under pane |
| `specular` | boolean | `true` | Animated light highlights |
| `reveal` | string | `'fade'` | Reveal animation: `'none'` or `'fade'` |
| `tilt` | boolean | `false` | 3D tilt on cursor movement |
| `tiltFactor` | number | `5` | Tilt depth in degrees (0–25 recommended) |
| `magnify` | number | `1` | Lens magnification (0.001–3.0) |
| `on.init` | function | — | Callback after first render. Receives lens instance |

## Instance Methods

After initialisation, the returned lens object supports:

- `setShadow(boolean)` — toggle shadow at runtime
- `setTilt(boolean)` — toggle tilt at runtime
- `updateMetrics()` — recalculate position/size

## Static Methods

- `liquidGL.registerDynamic(selectorOrElements)` — register animated elements
- `liquidGL.syncWith()` — auto-detect and sync with Lenis/Locomotive Scroll

## Z-Index Rules

- All target elements must share the same `z-index`
- Shadow layer sits at `z-index - 2`
- Tilt helper canvas sits at `z-index - 1`
- Shared WebGL canvas sits at `z-index` of highest lens minus 1
