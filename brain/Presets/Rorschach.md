# Rorschach

> Bilateral inkblot symmetry — mirrored noise patterns.

## Technique
- Mirror left half horizontally: `abs(uv.x - 0.5) * 2.0`
- Domain-warped fBM creates organic shapes on the mirrored axis
- Paper-white background with dark ink from palette
- Smoothstep thresholds define ink regions with soft bleeding edges

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Pattern drift |
| scale | Pattern zoom (2–6) |
| density | Warp layers |
| distortion | Ink spread / contrast |
| detail | Edge staining intensity |

## Key Code
```glsl
mp.x = abs(mp.x - 0.5) * 2.0;  // mirror
// then apply domain-warped fBM on mirrored coords
float ink = smoothstep(0.2, 0.6, f);
col = mix(paper, inkCol, ink);
```

## Related
- [[Fractal & Pattern Vocabulary]] — domain symmetry
- [[WebGL Techniques]] — symmetry techniques
