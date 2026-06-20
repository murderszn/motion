# Turbulence

> Flame-like fBM patterns using absolute noise values.

## Technique
- fBM with `abs(cnoise(p))` at each octave — sharp valleys create flame/ridge effects
- Rotation matrix between octaves to reduce axis-aligned artifacts
- Domain drift via `loopOff()` for seamless animation

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Drift velocity |
| scale | Spatial frequency (zoom) |
| density | Number of octaves (3–8) |
| distortion | N/A (uses detail) |
| detail | Amplitude gain per octave (0.35–0.65) |

## Key Code
```glsl
for (int i = 0; i < 8; i++) {
    v += a * abs(cnoise(q));
    q = rot * q * 2.0 + vec2(100.0);
    a *= gain;
}
```

## Related
- [[Fractal & Pattern Vocabulary]] — fBM turbulence variant
- [[Shader_Development]] — §10 fBM Variants
