# Contour Waves

> Glowing isoline patterns from noise-modulated sine bands.

## Technique
- Scalar noise field fed into `sin()` to create periodic bands
- `smoothstep` double-pass creates sharp, thin contour lines
- Glow layer adds energy to the lines
- Pulse modulation adds subtle animation within the contours

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Band animation velocity |
| scale | Spatial frequency |
| density | Number of contour bands (6–20) |
| distortion | Pulse intensity |
| detail | Glow brightness (0.5–2.0) |

## Key Code
```glsl
float n = cnoise(p * 1.5 + loopOff() * 0.8);
float waves = sin((n * bands + t * 2.0) * PI);
waves = smoothstep(0.0, 0.1, waves) * smoothstep(0.2, 0.1, waves);
```

## Source
Adapted from Stefan Gustavson's Perlin noise examples — Mode 2: Contour Waves (Isolines).

## Related
- [[Shader_Development]] — noise and sine band techniques
- [[Fractal & Pattern Vocabulary]] — contour/isoline patterns
