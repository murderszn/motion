# Truchet

> Tile arc maze — hash-based orientation creates infinite connected paths.

## Technique
- Space divided into tiles, each with a random orientation via `hash21`
- Arcs drawn within each tile connecting edges
- Bands animated through arcs using `cos(d * bands * TAU - t)`
- Edge glow from smoothstep on arc boundaries

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Band animation velocity |
| scale | Tile count (2–8) |
| density | Number of concentric bands |
| distort | Band frequency, edge glow intensity |
| detail | FBM overlay contribution |

## Key Code Pattern
```glsl
float h = hash21(ip + sOff);
if (h < 0.5) fp.x = 1.0 - fp.x;  // flip half the tiles
float d = min(length(fp), length(fp - 1.0));
d = abs(d - 0.5);
```

## Related
- [[WebGL Techniques]] — tiling patterns
- [[Seamless Loop Invariant]] — band animation uses `u_phase`
