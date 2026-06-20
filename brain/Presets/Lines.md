# Lines

> Rotated parallel bands with wave distortion.

## Technique
- Space rotated by `ang` (driven by distortion + time)
- Sinusoidal waves modulate band position
- Multiple frequency layers for complexity
- FBM overlay for organic texture

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Rotation and wave animation |
| scale | Spatial frequency |
| density | Band count + wave amplitude |
| distort | Rotation angle offset |
| detail | Secondary wave, FBM contribution |

## Key Code Pattern
```glsl
float freq = mix(3.0, 8.0, u_density) + u_distort * 1.4;
float wave = 0.6 * sin(q.y * 0.7 + t * 0.3);
wave += 0.3 * sin(q.y * 1.4 - t * 0.5) * u_detail;
float f = 0.5 + 0.5 * sin(q.x * freq + wave);
```

## Related
- [[WebGL Techniques]] — band/line patterns
- [[Seamless Loop Invariant]] — all waves use integer `u_phase` multiples
