# Voronoi

> Worley cellular noise — organic cell structures with animated edges.

## Technique
- Space tiled into grid cells
- Each cell has a feature point (hash-based position)
- Per-pixel: find distance to nearest and second-nearest feature points
- Cell color from gradient of nearest distance
- Edge detection: `md2 - md1` (second minus first distance)
- Feature points orbit with `cos/sin(u_phase)` for seamless animation

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Feature point orbit speed |
| scale | Cell count (4–20) |
| density | Fill gradient range |
| distort | Edge glow intensity |
| detail | Edge width, pulse animation |

## Key Code Pattern
```glsl
float cells = mix(4.0, 20.0, u_scale);
vec2 p = uv * cells;
vec2 ip = floor(p), fp = fract(p);
float md1 = 8.0, md2 = 8.0;
for (int y = -1; y <= 1; y++)
    for (int x = -1; x <= 1; x++) {
        vec2 hp = vec2(hash21(id), hash21(id + vec2(7.31, 2.87)));
        hp += 0.12 * vec2(cos(phase), sin(phase)) * u_speed;
        float d = length(neighbor + hp - fp);
        if (d < md1) { md2 = md1; md1 = d; }
        else if (d < md2) { md2 = d; }
    }
float edge = md2 - md1;  // cell border distance
```

## Variations
- **Edge-only**: `smoothstep(0.0, edgeW, edge)` for lines
- **Cell color**: hash cell ID for per-cell hue
- **Distance field**: use `md1` directly for concentric cell gradients

## Related
- [[Voronoi]] — Steven Worley's original paper
- [[Fractal & Pattern Vocabulary]] — cellular noise techniques
