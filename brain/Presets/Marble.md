# Marble

> Domain-warped sine wave with fBM veining.

## Technique
- Noise-displaced coordinates fed into sine wave
- `sin(x * freq + fbm(q) * turbulence)` creates natural veining
- Domain warping via `cnoise` adds organic displacement
- Vein highlight from high-power sine peaks

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Drift velocity |
| scale | Spatial frequency |
| density | Sine frequency (4–12) |
| distortion | Warp displacement strength |
| detail | fBM turbulence scale (1.5–4.0) |

## Key Code
```glsl
vec2 q = p + vec2(cnoise(p*0.8+off), cnoise(p*0.8+vec2(5.2,1.3)-off)) * distort;
float v = sin(q.x * freq + fbm(q * turb) * 5.0) * 0.5 + 0.5;
```

## Related
- [[Fractal & Pattern Vocabulary]] — marble recipe
- [[Shader_Development]] — §12 Organic Pattern Recipes
