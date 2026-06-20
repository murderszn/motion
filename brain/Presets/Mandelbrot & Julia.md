# Mandelbrot & Julia

> Escape-time fractal that morphs between Mandelbrot and Julia sets.

## Technique
- Mandelbrot: `z = 0`, `c = pixel coordinate`
- Julia: `z = pixel`, `c = animated constant`
- Blend between them via `sin(u_phase)` for seamless morphing
- Julia constant orbits: `vec2(0.355 + offset * cos(2t), 0.355 + offset * sin(2t))`
- Smooth coloring: `i - log2(log2(dot(z,z)))` for continuous iteration bands
- Edge detection on iteration threshold for border glow

## Slider Mapping
| Slider | Effect |
|--------|--------|
| speed | Julia constant orbit speed |
| scale | Zoom depth (2^(-3 to -9)) |
| density | Max iterations (16–128) |
| distort | Julia constant spread |
| detail | Highlight intensity, edge glow |

## Key Code Pattern
```glsl
float blend = 0.5 + 0.5 * sin(t);
vec2 z = mix(uv2, vec2(0.0), blend);      // Mandelbrot start
vec2 c = mix(uv2, c_julia, blend);        // Julia constant
for (int iter = 0; iter < 128; iter++) {
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
    if (dot(z,z) > 4.0) break;
}
float smooth_i = i - log2(log2(max(dot(z,z), 1.0))) + 4.0;
```

## Variants
- **Burning Ship**: `abs(z)` before squaring
- **Tricorn**: conjugate `z.y` before squaring
- **Multibrot**: `z = complex_pow(z, N)` for higher powers

## Related
- [[Fractal & Pattern Vocabulary]] — fractal types
- [[Color Theory for Shaders]] — smooth coloring palette mapping
