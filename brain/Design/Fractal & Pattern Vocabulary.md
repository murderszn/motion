# Fractal & Pattern Vocabulary

> Mathematical patterns, fractal types, and organic recipes for shader art.

---

## Fractal Types

### Mandelbrot / Julia Set
Escape-time iteration: `z = z² + c`. Mandelbrot uses `z=0, c=pixel`; Julia uses `z=pixel, c=constant`.
Smooth coloring: `float(i) - log2(log2(dot(z,z)))`.

### Burning Ship
`z = z² + c` but with `abs()` applied to `z` before squaring. Creates asymmetric, ship-like forms.

### Apollonian Gasket
Iterative circle packing via fold operations: `p = 2*fract(p*0.5) - 1.0; k = max(1/dot(p,p), 1.0); p *= k`.

### Sierpinski Triangle
Repeated `abs` + fold of coordinates toward三角形 vertices.

### Menger Sponge
3D fold + mod operations producing intricate cross-sections. Key: `abs(mod(p, 2.0) - 1.0)`.

### IFS (Iterated Function System)
Multiple transforms applied probabilistically. Barnsley fern, fractal flames.

---

## Geometric Patterns

### Rose Curve
`r = cos(k * theta)` where k determines petal count. Integer k = k petals; rational k = more complex.

### Lissajous Curves
`x = A*sin(a*t + d), y = B*sin(b*t)`. Ratios a:b create different figures.

### Golden Ratio Spiral
Logarithmic spiral with `phi = 1.618...`. `sin(log(r) / log(phi) - theta)`.

### Flower of Life
Hexagonal tiling of SDF circles at 60-degree intervals.

### Moiré Patterns
Overlap two concentric ring grids at slight offsets: `sin(r1*80) * sin(r2*80)`.

### Penrose Tiling
Aperiodic tiling using two rhombus shapes with golden-ratio-based substitution rules.

---

## Organic Pattern Recipes

### Marble Veins
```glsl
p += vec2(noise(p*3.0), noise(p*3.0 + 100.0));
float v = sin(p.x*10.0 + fbm(p*4.0)*6.0) * 0.5 + 0.5;
```

### Wood Grain
```glsl
float n = noise(p * 4.0);
float grain = sin((p.x + n*2.0) * 20.0) * 0.5 + 0.5;
```

### Water Caustics
```glsl
for (int i = 0; i < 3; i++) {
    vec2 uv = p*(2.0+fi*0.5) + vec2(sin(t+fi), cos(t*0.7+fi));
    c += 1.0 / (1.0 + 60.0*length(fract(uv) - 0.5));
}
```

### Clouds / Smoke
Domain-warped fBM with soft threshold: `smoothstep(0.1, 0.8, f)`.

### Fire
Turbulence + vertical gradient + time: `fbm(vec2(x*3, y*5 - t*2)) * (1-y)`.

---

## Key Operators

### Smooth Union / Subtraction / Intersection
```glsl
float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
return mix(d2, d1, h) - k*h*(1.0-h);  // smooth union
```

### Domain Warping
`fbm(p + fbm(p + fbm(p)))` — the "dream in a dream" technique. Creates organic, fluid distortion.

### Polar Coordinates
`atan(y,x)` + `length(p)` converts Cartesian to radial. Foundation for rose curves, radial symmetry.

### Curl Noise
Divergence-free field from noise derivatives. Produces swirling, fluid-like motion without divergence.

---

## fBM Variants

| Variant | Modification | Visual |
|---------|-------------|--------|
| Standard | `sum(amp * noise(p))` | Clouds, terrain |
| Turbulence | `sum(amp * abs(noise(p)))` | Flame, smoke |
| Ridged | `offset - abs(n); n = n*n` | Mountain ridges, veins |
| Multifractal | Multiply octaves, weight by prior | Eroded terrain |

---

## Related
- [[Shader_Development]] — GLSL implementation details
- [[WebGL Techniques]] — shader art techniques for web
- [[Color Theory for Shaders]] — palette mapping for patterns
- [[Mandelbrot & Julia]] — fractal preset
- [[Voronoi]] — cellular pattern preset
