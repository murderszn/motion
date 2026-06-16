# Shader Architecture

## Context

WebGL1, GLSL ES 1.0. One fragment shader (exported as `FS` string in `webgl.ts`) containing all 14 presets.

## Available Helpers

```glsl
float hash21(vec2 p);           // Pseudo-random hash
float vnoise(vec2 p);           // Value noise
float fbm(vec2 p);              // 5-octave fractal Brownian motion
vec3  grad4(float t);           // Sample 4-stop palette gradient
float metaf(vec2 p, float ar);  // 3 orbiting metaballs
vec2  loopOff();                // Circular noise drift path
```

## Available Uniforms

| Uniform | Type | Source |
|---------|------|--------|
| `u_res` | `vec2` | Canvas resolution |
| `u_phase` | `float` | Loop phase 0→2π |
| `u_seed` | `float` | Deterministic seed |
| `u_mode` | `int` | Preset selector |
| `u_speed` | `float` | Speed slider |
| `u_scale` | `float` | Scale slider |
| `u_density` | `float` | Density slider |
| `u_distort` | `float` | Distortion slider |
| `u_detail` | `float` | Detail slider |
| `u_grain` | `float` | Grain slider |
| `u_c0–u_c3` | `vec3` | 4 palette colors |
| `u_texture` | `sampler2D` | Upload texture |
| `u_mix` | `float` | Texture mix amount |
| `u_pixel` | `float` | Pixelation amount |

## Constraints (GLSL ES 1.0)

- No dynamic loop bounds — `for (int i = 0; i < N; i++)` is an error
- No implicit int↔float conversion — `0.5 * 2` fails, write `0.5 * 2.0`
- Must declare `precision highp float;`
- No bitwise operators
- Output is `gl_FragColor`
- `discard` unsupported on some implementations

## Post-Process Pipeline

The scene renders to an offscreen framebuffer, then a post-process pass outputs to screen:

1. **Scene pass** — all preset logic, film grain, vignette → FBO texture
2. **Post-process pass** — samples FBO texture with per-channel UV offsets for chromatic aberration

The post-process shader (`POST_FS` in `webgl.ts`) applies:
- Chromatic aberration: R and B channels offset radially from center based on `u_aberration`

## Shader Hot-Swap

The live shader editor in the sidebar calls `compileNewFS(newSrc)` from `webgl.ts` to hot-swap the scene fragment shader at runtime. The post-process program is separate and unaffected by hot-swaps.

## Related

- [[Studio Architecture]] — where the shader lives
- [[Seamless Loop Invariant]] — phase rules
- [[Adding a Preset]] — adding new modes
