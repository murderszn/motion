# Parameter System

## The 7 Sliders

All range 0–1, all default to sensible midpoints.

| Slider | Default | Domain | What it controls |
|--------|---------|--------|-----------------|
| **speed** | 0.50 | Animation velocity | Higher = faster movement |
| **scale** | 0.45 | Spatial frequency | Higher = zoomed in / finer |
| **density** | 0.55 | Element count / intensity | More or less of the primary feature |
| **distortion** | 0.60 | Warping / refraction | Domain warp strength |
| **detail** | 0.50 | Secondary complexity | Texture depth / octave richness |
| **grain** | 0.20 | Film grain overlay | Analog imperfection (post-process) |
| **aberration** | 0.00 | Chromatic aberration | Per-channel radial RGB split (post-process) |

## Per-Preset Interpretation

Each [[Presets|preset]] interprets sliders differently. See individual preset notes for detailed outcome tables.

## The Params Object

```ts
const P: Params = {
    mode: 0, seed: 9015, sizeIdx: 1, loop: 4.0,
    colors: [...PALETTES[0]],
    speed: 0.50, scale: 0.45, density: 0.55,
    distort: 0.60, detail: 0.50, grain: 0.20, aberration: 0,
    mix: 0, pixel: 0,
};
```

## Related

- [[Adding a Slider]] — how to extend the system
- [[Seed-Based Determinism]] — seed as another parameter
- [[Shader Architecture]] — how sliders reach GLSL
