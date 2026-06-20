# SD Rosette

> SDF petal symmetry with pulsing edge glow.

## Technique
- Polar coordinate folding: `mod(angle, sector * 2)` then `abs(angle - sector)`
- Creates N-fold radial symmetry (3–9 petals)
- SDF-like edge distance: `abs(q.y) - thickness`
- Pulse animation through radial frequency
- Edge glow via `exp(-abs(f) * sharpness)`

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Sector rotation |
| scale | Petal thickness |
| density | Number of petals (3–9) |
| distort | Edge sharpness |
| detail | Pulse frequency |

## Key Code Pattern
```glsl
float n = 5.0 + floor(mix(3.0, 9.0, u_density));
float sector = PI / max(n, 2.0);
a = mod(a + u_phase * 0.25, sector * 2.0);
a = abs(a - sector);
float edge = exp(-abs(f) * (18.0 + 40.0 * u_distort));
```

## Related
- [[SD Rosette]] — SDF distance field techniques
- [[Color Theory for Shaders]] — palette mapping on pulse
