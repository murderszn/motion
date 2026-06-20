# Triangle Lattice

> Hexagonal triangle grid with animated rotation.

## Technique
- Space rotated continuously via `cos/sin(u_phase)`
- Triangular lattice: `abs(f.x) * 0.866 + f.y * 0.5` for equilateral triangles
- Edge detection via `smoothstep` on triangle distance
- Per-cell color variation from `floor(g)` hash
- FBM overlay for organic texture

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Grid rotation speed |
| scale | Triangle size (zoom) |
| density | Cell count |
| distort | Edge glow intensity |
| detail | Per-cell color variation |

## Key Code Pattern
```glsl
vec2 g = p * (8.0 + 18.0 * u_density);
vec2 f = fract(g) - 0.5;
float tri = abs(f.x) * 0.866 + f.y * 0.5;
float edge = smoothstep(0.08, 0.0, d);
```

## Related
- [[Triangle Lattice]] — tessellation patterns
- [[WebGL Techniques]] — domain repetition
