# Shader, WebGL & Web Design Research Reference

Comprehensive reference compiled from The Book of Shaders, Inigo Quilez, Three.js docs, Codrops, LYGIA, and ShaderToy patterns.

---

## 1. GLSL Fragment Shader Fundamentals

### Coordinate System
```glsl
vec2 uv = gl_FragCoord.xy / u_resolution;
uv.x *= u_resolution.x / u_resolution.y; // aspect correction
```

### Core Shaping Functions
| Function | Purpose | Use Case |
|----------|---------|----------|
| `step(edge, x)` | Binary 0/1 threshold | Sharp transitions |
| `smoothstep(e0, e1, x)` | Hermite interpolation | Anti-aliased edges |
| `fract(x)` | Fractional part | Tiling, repeating |
| `mod(x, y)` | Modulo | Grids, wrap-around |
| `clamp(x, min, max)` | Constrain range | Safety clamping |
| `mix(a, b, t)` | Linear blend | Color/position interpolation |
| `pow(x, y)` | Power | Curve shaping |
| `abs(x)` | Absolute value | Reflection, ridged noise |
| `length(p)` | Vector magnitude | Distance fields |
| `dot(a, b)` | Dot product | Projection, fast length |

### Color Conversions
```glsl
// RGB to HSB
vec3 rgb2hsb(vec3 c) {
    vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// HSB to RGB
vec3 hsb2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}
```

### Matrix Transforms
```glsl
mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}
mat2 scale2d(vec2 s) {
    return mat2(s.x, 0.0, 0.0, s.y);
}
// Usage: st = rotate2d(angle) * (st - center) + center;
```

---

## 2. Noise Algorithms

### Hash Function
```glsl
float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
}
```

### Value Noise
```glsl
float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // smoothstep
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
```

### Gradient Noise (Perlin)
Uses random gradient vectors at grid points instead of values. Produces more natural, less blocky results than value noise.

### Simplex Noise
Uses triangular grid instead of square grid. O(N^2) vs O(2^N) for N dimensions. No directional artifacts.

### Cellular / Worley Noise (Voronoi)
```glsl
float voronoi(vec2 p) {
    vec2 i_st = floor(p), f_st = fract(p);
    float m = 10.0;
    for (int y = -1; y <= 1; y++)
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 pt = random2(i_st + neighbor);
            pt = 0.5 + 0.5 * sin(u_time + 6.2831 * pt);
            float d = length(neighbor + pt - f_st);
            m = min(m, d);
        }
    return m;
}
// Cell color: store closest point position (m_point)
// Cell borders: return second_closest - closest
```

### Curl Noise
Divergence-free field from scalar noise derivatives:
```glsl
float eps = 0.01;
vec2 curl = vec2(
    noise(p + vec2(0, eps)) - noise(p - vec2(0, eps)),
    noise(p - vec2(eps, 0)) - noise(p + vec2(eps, 0))
) / (2.0 * eps);
```
Visual: swirling fluids, smoke tendrils.

---

## 3. Fractal Brownian Motion (fBM)

### Standard fBM
```glsl
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
        v += a * vnoise(p);
        p *= 2.1;        // lacunarity
        a *= 0.5;        // gain
    }
    return v;
}
```

### fBM Variants

| Variant | Modification | Visual |
|---------|-------------|--------|
| **Turbulence** | `abs(noise(p))` | Flame, smoke, sharp valleys |
| **Ridged** | `offset - abs(n); n = n*n` | Mountain ridges, veins |
| **Multifractal** | Multiply octaves, weight by prior | Eroded terrain |

### Domain Warping
```glsl
// Double warp (organic flow)
vec2 q = vec2(fbm(p + loopOff()), fbm(p + vec2(5.2, 1.3) - loopOff()));
vec2 r = vec2(fbm(p + q*2.0 + vec2(1.7, 9.2)),
              fbm(p + q*2.0 + vec2(8.3, 2.8)));
float f = fbm(p + r);

// Triple warp (Inigo Quilez)
float f = fbm(p + fbm(p + fbm(p)));
```
Visual: marble veins, wood grain, clouds, organic swirling textures.

---

## 4. 2D SDF Primitives (Inigo Quilez)

All return signed distance (negative = inside, positive = outside).

### Core Shapes
```glsl
float sdCircle(vec2 p, float r) { return length(p) - r; }

float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p-a, ba = b-a;
    float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
    return length(pa - ba*h);
}

float sdHexagon(vec2 p, float r) {
    const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
    return length(p)*sign(p.y);
}

float sdEquilateralTriangle(vec2 p, float r) {
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r/k;
    if(p.x+k*p.y>0.0) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
    p.x -= clamp(p.x, -2.0*r, 0.0);
    return -length(p)*sign(p.y);
}

float sdStar(vec2 p, float r, int n, float m) {
    float an = 3.141593/float(n);
    float en = 3.141593/m;
    vec2 acs = vec2(cos(an),sin(an));
    vec2 ecs = vec2(cos(en),sin(en));
    float bn = mod(atan(p.x,p.y),2.0*an) - an;
    p = length(p)*vec2(cos(bn),abs(sin(bn)));
    p -= r*acs;
    p += ecs*clamp(-dot(p,ecs), 0.0, r*acs.y/ecs.y);
    return length(p)*sign(p.x);
}
```

### SDF Operations
```glsl
// Boolean: union, subtraction, intersection
float opUnion(float a, float b) { return min(a,b); }
float opSubtraction(float a, float b) { return max(-a,b); }
float opIntersection(float a, float b) { return max(a,b); }

// Smooth blend (k = blend radius)
float opSmoothUnion(float a, float b, float k) {
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0-h);
}

// Round: sdf(p) - radius
// Onion/ring: abs(sdf(p)) - thickness
```

### Domain Repetition
```glsl
vec2 opRep(vec2 p, vec2 spacing) {
    return mod(p, spacing) - spacing * 0.5;
}
```

---

## 5. Fractal Patterns

### Mandelbrot / Julia Set
```glsl
vec2 z = vec2(0.0); // Mandelbrot: z starts at 0, c = pixel coord
// vec2 z = pixel; // Julia: z = pixel, c = constant
for (int i = 0; i < MAX_ITER; i++) {
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
    if (dot(z,z) > 4.0) break;
}
// Smooth coloring: float(i) - log2(log2(dot(z,z)))
```

### Burning Ship
```glsl
z = vec2(z.x*z.x - z.y*z.y, 2.0*abs(z.x*z.y)) + c;
```

### Sierpinski / Koch
Iterative fold-and-scale operations on coordinates using `abs()` and `mod()`.

### Apollonian Gasket
```glsl
for (int i = 0; i < 10; i++) {
    p = 2.0 * fract(p * 0.5) - 1.0;
    float r2 = dot(p, p);
    float k = max(1.0 / r2, 1.0);
    p *= k; scale *= k;
}
```

### Menger Sponge
3D fold operations: `abs` + `mod` to fold space, then compute distance. Cross-sections produce intricate 2D patterns.

---

## 6. Organic Pattern Recipes

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
float c = 0.0;
for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 uv = p*(2.0+fi*0.5) + vec2(sin(t+fi), cos(t*0.7+fi));
    c += 1.0 / (1.0 + 60.0*length(fract(uv) - 0.5));
}
return c * 0.33;
```

### Clouds / Smoke
Domain-warped fBM with soft threshold: `smoothstep(0.1, 0.8, f)`

### Fire
Turbulence + vertical gradient + time offset: `fbm(vec2(x*3, y*5 - t*2)) * (1-y)`

---

## 7. Geometric & Mathematical Patterns

### Rose Curve
```glsl
float r = cos(k * theta); // k = petal count
```

### Lissajous Curves
```glsl
vec2 lissajous(float t, float A, float B, float a, float b, float d) {
    return vec2(A * sin(a*t + d), B * sin(b*t));
}
```

### Golden Ratio Spiral
```glsl
float phi = 1.618033988749895;
return sin(log(r) / log(phi) - theta);
```

### Flower of Life
Hexagonal tiling of SDF circles with centers at 60-degree intervals.

### Moiré Patterns
```glsl
return 0.5 + 0.5 * sin(r1*80.0) * sin(r2*80.0);
```

---

## 8. Seamless Loop Animation

### Phase-Based (Studio Pattern)
All motion returns to origin when `u_phase` wraps 0→2PI:
```glsl
// Safe: integer multiples of u_phase
sin(x + 2.0 * u_phase)
cos(a * arms - r * twist + u_phase)
vec2(cos(u_phase), sin(u_phase)) * radius  // circular drift

// Unsafe: fractional multiples
sin(x + 1.5 * u_phase)  // SEAM!
```

### Cosine Seamless Loop
```glsl
float seamless(float t, float period) {
    return 0.5 - 0.5 * cos(6.28318 * t / period);
}
```

---

## 9. Post-Processing Effects

### Chromatic Aberration
```glsl
float offset = 0.01;
color.r = texture2D(u_tex, uv + vec2(offset, 0.0)).r;
color.b = texture2D(u_tex, uv - vec2(offset, 0.0)).b;
```

### Vignette
```glsl
float vig = smoothstep(1.6, 0.4, length(uv - 0.5));
color *= vig;
```

### Film Grain
```glsl
float grain = fract(sin(dot(uv * u_time, vec2(12.9898, 78.233))) * 43758.5453);
color += (grain - 0.5) * 0.1;
```

### CRT Effect
```glsl
// Barrel distortion
uv = 0.5 + (uv - 0.5) / (1.0 + dot(uv-0.5, uv-0.5) * distortion);
// Scanlines
float scanline = sin(uv.y * resolution.y * 3.14159) * 0.04;
```

### Bloom (Simplified)
Downsample bright areas, blur, add back: `color += bloom * intensity;`

---

## 10. Color Techniques

### IQ Cosine Palette
```glsl
vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.00, 0.10, 0.20);
    return a + b * cos(6.28318 * (c * t + d));
}
```

### Gradient Ramp (4-stop)
```glsl
vec3 grad4(float t) {
    vec3 c = mix(u_c0, u_c1, smoothstep(0.0, 0.35, t));
    c = mix(c, u_c2, smoothstep(0.35, 0.70, t));
    c = mix(c, u_c3, smoothstep(0.70, 1.0, t));
    return c;
}
```

---

## 11. Three.js for Web Design

### Core Setup
```js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
```

### ShaderMaterial
```js
const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uTime; varying vec2 vUv; void main(){ ... }`,
});
// Update: mat.uniforms.uTime.value = clock.getElapsedTime();
```

### Post-Processing (Three.js)
```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(resolution, strength, radius, threshold));
composer.addPass(new OutputPass()); // always last
// render: composer.render()
```

### Post-Processing (pmndrs — faster, merges passes)
```js
import { EffectComposer, EffectPass, RenderPass, BloomEffect } from 'postprocessing';
const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType });
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new EffectPass(camera, new BloomEffect({ intensity: 1.5 })));
```

### Performance
- Use `InstancedMesh` for thousands of objects in one draw call
- Cap pixel ratio at 2
- Pause RAF on `visibilitychange`
- Merge static geometries with `BufferGeometryUtils.mergeGeometries`
- Use `THREE.Clock` for frame-independent timing

### Integration Patterns
- Fullscreen background: `position:fixed; z-index:-1`
- Scrollytelling: `position:sticky; top:0; height:100vh`
- Responsive: listen to resize, update camera aspect + renderer size
- CSS2D/CSS3D overlays for DOM elements tracking 3D positions

### Libraries
| Library | Purpose |
|---------|---------|
| `postprocessing` | High-perf post-processing |
| `troika-three-text` | SDF text in 3D |
| `three-nebula` | Particle systems |
| `lil-gui` | Debug UI |

---

## 12. Modern Web Design with WebGL

### Background Patterns
- Fullscreen `<canvas>` with `position:fixed; z-index:-1`
- Pass `uScroll`, `uTime`, `uMouse` as uniforms
- Keep background shaders under 10 texture fetches

### Scroll-Driven Effects
```js
window.addEventListener('scroll', () => {
    scrollProgress = scrollY / (docHeight - innerHeight);
}, { passive: true });
// Map to shader uniforms or camera position
```

### Cursor Effects
- Mouse-following gradients via `smoothstep(0.4, 0.0, distance(uv, uMouse))`
- Cursor-reactive distortion: displace UVs by `normalize(mouseDelta) * influence`
- Interactive particles: attract/repel toward mouse

### Text + WebGL
- Render text to offscreen Canvas2D, use as WebGL texture
- Reveal: `step(uv.x, uReveal)` or `smoothstep` for soft edge
- Glitch: displace UVs per scanline with noise + RGB split

### Dark Mode + WebGL
- Dark backgrounds (#0a0a0f to #1a1a2e) make shader effects pop
- Neon glow: additive blending on dark base
- Glassmorphism: blur framebuffer + composite at low alpha

### Mobile Performance
- Frame budget: 10ms (60fps), 16ms safe target
- Reduce particles (500-1000 vs 5000+ on desktop)
- Disable post-processing on low-end GPUs
- Touch: normalize touch coords same as mouse
- Fallback: CSS gradients + `backdrop-filter: blur()`

---

## 13. Performance Tips

| Technique | Impact |
|-----------|--------|
| `dot(p,p)` vs `length(p)` | Avoid sqrt when only comparing distances |
| `fract()+floor()` vs `mod()` | Slightly cheaper for simple cases |
| Unroll small loops (3-5) | GLSL may not auto-unroll |
| Cache `sin/cos` | `float cs=cos(a); float sn=sin(a);` |
| `mediump` on mobile | 2x cheaper than `highp` |
| Avoid `if` in loops | Use `mix()`, `step()`, `smoothstep()` |
| Precompute constants | Move invariant expressions outside loops |
| Avoid `discard` | Breaks early-Z optimization |

---

## 14. LYGIA Shader Library

Reusable GLSL functions available at `lygia.xyz/generative`:
- `cnoise` — classic noise
- `gnoise` — gradient noise
- `snoise` — simplex noise
- `fbm` — fractal brownian motion
- `voronoi` / `voronoise` — cellular noise
- `curl` — curl noise
- `worley` — worley noise
- `random` / `srandom` — random generators
- `pnoise` — periodic noise
- `psrdnoise` — periodic simplex rotationally symmetric
- `noised` — noise with derivatives
- `gerstnerWave` — ocean waves
- `wavelet` — wavelet noise

Import via: `#include "lygia/generative/fbm"`

---

## 15. Key Reference URLs

| Source | URL | Content |
|--------|-----|---------|
| The Book of Shaders | thebookofshaders.com | Ch.5 shaping, Ch.7 shapes, Ch.8 matrices, Ch.9 patterns, Ch.10 random, Ch.11 noise, Ch.12 cellular, Ch.13 fBM, Ch.15 textures |
| Inigo Quilez | iquilezles.org/articles | SDF 2D/3D, noise, domain warping, smooth minimum |
| LYGIA | lygia.xyz/generative | Reusable GLSL generative functions |
| Three.js | threejs.org/docs | Core API, materials, postprocessing |
| pmndrs/postprocessing | github.com/pmndrs/postprocessing | High-perf post-processing |
| Codrops | tympanus.net/codrops | WebGL tutorials and demos |
| web.dev | web.dev/rendering-performance | Frame budget, compositor optimization |
