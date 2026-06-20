# Golden (Phyllotaxis)

> Sunflower spiral pattern using the golden angle.

## Technique
- Polar coordinates: `r` from center, `theta` from `atan`
- Golden angle (2.39996323 rad) drives spiral arms
- `cos(a - n * golden + t)` creates phyllotaxis pattern
- Concentric rings via `cos(n * PI - t)`
- FBM warp adds organic distortion

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Spiral rotation velocity |
| scale | Zoom level (1.5–5.0) |
| density | Spiral tightness |
| distort | Warp intensity |
| detail | FBM overlay, highlight power |

## Key Code Pattern
```glsl
float golden = 2.39996323;
float spiral = cos(a - n * golden + t * 0.2);
float rings  = cos(n * 3.14159265 - t * 0.1);
float f = 0.5 + 0.5 * spiral * rings;
```

## Related
- [[Golden (Phyllotaxis)]] — mathematical basis
- [[Color Theory for Shaders]] — palette mapping
