# Ridged Multifractal

> Sharp mountain ridges and veins from inverted noise.

## Technique
- fBM with `abs(n); offset - n; n * n` at each octave
- Inverts noise to create sharp ridges instead of valleys
- Squaring sharpens the crests
- Weight factor `w` modulates contribution per octave

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Drift velocity |
| scale | Spatial frequency |
| density | Number of octaves (3–8) |
| distortion | Ridge offset (0.5–1.2) |
| detail | Amplitude gain per octave |

## Key Code
```glsl
float n = cnoise(q) * w;
n = abs(n);
n = offset - n;    // invert creases
n = n * n;          // sharpen
v += n * a;
```

## Related
- [[Fractal & Pattern Vocabulary]] — ridged fBM variant
- [[Shader_Development]] — §10 fBM Variants
