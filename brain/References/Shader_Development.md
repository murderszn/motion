---
name: shader-development
description: Math formulas, procedural shapes, colors, transforms, noise algorithms, and blurs for writing GLSL fragment shaders.
---

# GLSL Shader Development Guide

This guide compiles standard GLSL fragment shader recipes, math formulas, shaping functions, and algorithms extrapolated from *The Book of Shaders* and standard graphics programming practices. Use these patterns to create procedural textures, animations, and image processing filters.

---

## 1. Normalized Coordinate Space

In 2D fragment shaders, coordinates are normalized to the `[0.0, 1.0]` range.

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution; // Canvas size (width, height)
uniform float u_time;      // Time in seconds
uniform vec2 u_mouse;      // Mouse coordinates

void main() {
    // Normalizing screen coordinates to [0, 1] range
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Correcting aspect ratio (makes coordinates square relative to Y)
    vec2 uv = st;
    uv.x *= u_resolution.x / u_resolution.y;

    gl_FragColor = vec4(uv.x, uv.y, 0.0, 1.0);
}
```

---

## 2. Core Shaping Functions

Shaping functions map input variables to output gradients between `0.0` and `1.0`.

*   **`step(edge, x)`**: Returns `0.0` if `x < edge`, else `1.0`. Used for sharp transitions.
*   **`smoothstep(edge0, edge1, x)`**: Interpolates smoothly between `0.0` and `1.0` in the interval `[edge0, edge1]`. Used for anti-aliased edges and blurs.
*   **`fract(x)`**: Returns the fractional part of `x` (`x - floor(x)`). Used for tiling.
*   **`mod(x, y)`**: Returns the modulo of `x / y`.
*   **`clamp(x, minVal, maxVal)`**: Constrains `x` between `minVal` and `maxVal`.

---

## 3. Colors and Color Space Conversions

### RGB to HSB (Hue, Saturation, Brightness)
```glsl
vec3 rgb2hsb(in vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
```

### HSB to RGB
```glsl
vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb); // Cubic smoothing
    return c.z * mix(vec3(1.0), rgb, c.y);
}
```

---

## 4. Procedural Shapes (Distance Fields)

Instead of traditional geometry, shapes are defined using Signed Distance Fields (SDFs).

### Rectangle (Box)
```glsl
float drawBox(vec2 st, vec2 size, float smoothEdge) {
    vec2 d = abs(st - vec2(0.5)) - (size * 0.5);
    float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    return 1.0 - smoothstep(0.0, smoothEdge, dist);
}
```

### Circle
```glsl
float drawCircle(vec2 st, float radius, float smoothEdge) {
    float dist = length(st - vec2(0.5));
    return 1.0 - smoothstep(radius - smoothEdge, radius + smoothEdge, dist);
}
```

### Ring (Stroke)
```glsl
float drawRing(vec2 st, float radius, float thickness, float smoothEdge) {
    float dist = length(st - vec2(0.5));
    float halfThickness = thickness * 0.5;
    return smoothstep(radius - halfThickness - smoothEdge, radius - halfThickness, dist) *
           (1.0 - smoothstep(radius + halfThickness, radius + halfThickness + smoothEdge, dist));
}
```

---

## 5. Matrix Transformations

Transformations modify the coordinate grid (`st`) rather than the shapes themselves. **Always perform transformations in reverse order.**

```glsl
// Rotate around coordinate origin (0, 0)
mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle),
                sin(angle), cos(angle));
}

// Scale coordinate origin (0, 0)
mat2 scale2d(vec2 value) {
    return mat2(value.x, 0.0,
                0.0, value.y);
}

// Usage Example (Rotated scaling around center 0.5)
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st -= vec2(0.5);                // 1. Move origin to center
    st = rotate2d(u_time) * st;     // 2. Rotate grid
    st = scale2d(vec2(1.5)) * st;   // 3. Scale grid
    st += vec2(0.5);                // 4. Move origin back
    
    float box = drawBox(st, vec2(0.4), 0.005);
    gl_FragColor = vec4(vec3(box), 1.0);
}
```

---

## 6. Patterns and Tiling

To tile space, scale the coordinates and take the fractional part using `fract()`.

```glsl
// Creates tiled grid of st coordinates
vec2 tileGrid(vec2 st, float zoom) {
    st *= zoom;
    return fract(st);
}

// Gives an integer index for each tile
vec2 getTileID(vec2 st, float zoom) {
    return floor(st * zoom);
}
```

---

## 7. Randomness, Noise, and fBm

True randomness is generated on-the-fly using hash functions. Noise interpolates between random grid values.

### Pseudo-Random Generator
```glsl
float rand2d(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
```

### 2D Value Noise (Bilinear Interpolation)
```glsl
float valueNoise2d(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners of a grid tile
    float a = rand2d(i);
    float b = rand2d(i + vec2(1.0, 0.0));
    float c = rand2d(i + vec2(0.0, 1.0));
    float d = rand2d(i + vec2(1.0, 1.0));

    // Smoothstep interpolation curve (Cubic Hermite)
    vec2 u = f * f * (3.0 - 2.0 * f);

    // Mix 4 corners
    return mix(a, b, u.x) +
            (c - a) * u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}
```

### Fractal Brownian Motion (fBm)
Combines multiple octaves of noise at increasing frequencies and decreasing amplitudes. Used for clouds, terrain, and steam.
```glsl
#define OCTAVES 6
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    // Rotate to reduce axis-aligned artifacts
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * valueNoise2d(st);
        st = rot * st * 2.0 + vec2(100.0);
        amplitude *= 0.5;
    }
    return value;
}
```

### Cellular / Voronoi Noise
Uses distance to nearest grid cells to create organic cell structures.
```glsl
float voronoi2d(vec2 st) {
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);
    float min_dist = 1.0;  // Minimum distance to cell center

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = vec2(rand2d(i_st + neighbor));
            
            // Animate points
            point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);
            
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);
            min_dist = min(min_dist, dist);
        }
    }
    return min_dist;
}
```

---

## 8. Convolution Kernels (Blurs & Filters)

Convolution filters process an input texture (`u_texture`) by sampling a grid of pixels.

### Horizontal & Vertical Separable Gaussian Blur
Instead of a single slow 2D pass, run two consecutive 1D passes using these offsets.

**Horizontal Pass Fragment Shader:**
```glsl
uniform sampler2D u_texture;
uniform vec2 u_resolution;

vec4 horizontalBlur(sampler2D tex, vec2 uv, float blurAmount) {
    float texelSize = 1.0 / u_resolution.x;
    vec4 sum = vec4(0.0);
    
    // Gaussian weights for kernel radius 4
    float weights[9];
    weights[0] = 0.05; weights[1] = 0.09; weights[2] = 0.12; weights[3] = 0.15;
    weights[4] = 0.16; // Center pixel weight
    weights[5] = 0.15; weights[6] = 0.12; weights[7] = 0.09; weights[8] = 0.05;
    
    for (int i = -4; i <= 4; i++) {
        vec2 offset = vec2(float(i) * texelSize * blurAmount, 0.0);
        sum += texture2D(tex, uv + offset) * weights[i + 4];
    }
    return sum;
}
```

**Vertical Pass Fragment Shader:**
```glsl
vec4 verticalBlur(sampler2D tex, vec2 uv, float blurAmount) {
    float texelSize = 1.0 / u_resolution.y;
    vec4 sum = vec4(0.0);
    
    float weights[9];
    weights[0] = 0.05; weights[1] = 0.09; weights[2] = 0.12; weights[3] = 0.15;
    weights[4] = 0.16;
    weights[5] = 0.15; weights[6] = 0.12; weights[7] = 0.09; weights[8] = 0.05;
    
    for (int i = -4; i <= 4; i++) {
        vec2 offset = vec2(0.0, float(i) * texelSize * blurAmount);
        sum += texture2D(tex, uv + offset) * weights[i + 4];
    }
    return sum;
}
```

### Sobel Edge Detection Filter
```glsl
uniform sampler2D u_texture;
uniform vec2 u_resolution;

float luma(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

vec4 sobelFilter(vec2 uv) {
    vec2 texel = vec2(1.0) / u_resolution;
    
    // Samples around the center pixel
    float tleft  = luma(texture2D(u_texture, uv + vec2(-texel.x, texel.y)).rgb);
    float left   = luma(texture2D(u_texture, uv + vec2(-texel.x, 0.0)).rgb);
    float bleft  = luma(texture2D(u_texture, uv + vec2(-texel.x, -texel.y)).rgb);
    float top    = luma(texture2D(u_texture, uv + vec2(0.0, texel.y)).rgb);
    float bottom = luma(texture2D(u_texture, uv + vec2(0.0, -texel.y)).rgb);
    float tright = luma(texture2D(u_texture, uv + vec2(texel.x, texel.y)).rgb);
    float right  = luma(texture2D(u_texture, uv + vec2(texel.x, 0.0)).rgb);
    float bright = luma(texture2D(u_texture, uv + vec2(texel.x, -texel.y)).rgb);
    
    // Sobel kernels
    // x kernel:
    // [ -1, 0, 1 ]
    // [ -2, 0, 2 ]
    // [ -1, 0, 1 ]
    float gx = -1.0 * tleft - 2.0 * left - 1.0 * bleft + 1.0 * tright + 2.0 * right + 1.0 * bright;
    
    // y kernel:
    // [  1,  2,  1 ]
    // [  0,  0,  0 ]
    // [ -1, -2, -1 ]
    float gy = 1.0 * tleft + 2.0 * top + 1.0 * tright - 1.0 * bleft - 2.0 * bottom - 1.0 * bright;
    
    float g = sqrt(gx * gx + gy * gy);
    return vec4(vec3(g), 1.0);
}
```

---

## 9. Fractal Iteration

### Mandelbrot / Julia Set
```glsl
vec2 z = vec2(0.0); // Mandelbrot: z starts at 0, c = pixel coord
// vec2 z = pixel;    // Julia: z = pixel, c = constant
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

### Apollonian Gasket
```glsl
for (int i = 0; i < 10; i++) {
    p = 2.0 * fract(p * 0.5) - 1.0;
    float r2 = dot(p, p);
    float k = max(1.0 / r2, 1.0);
    p *= k; scale *= k;
}
```

---

## 10. fBM Variants

### Turbulence
```glsl
value += amplitude * abs(noise(p * frequency)); // sharp valleys, flame-like
```

### Ridged fBM
```glsl
n = abs(n);         // create creases
n = offset - n;     // invert so creases are at top
n = n * n;          // sharpen creases
```

### Domain Warping
```glsl
// Double warp — organic flow
vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
vec2 r = vec2(fbm(p + q*2.0 + vec2(1.7, 9.2)),
              fbm(p + q*2.0 + vec2(8.3, 2.8)));
float f = fbm(p + r);

// Triple warp — Inigo Quilez's technique
float f = fbm(p + fbm(p + fbm(p)));
```

---

## 11. SDF Operations

### Boolean Operations
```glsl
float opUnion(float a, float b) { return min(a,b); }
float opSubtraction(float a, float b) { return max(-a,b); }
float opIntersection(float a, float b) { return max(a,b); }
```

### Smooth Blend
```glsl
float opSmoothUnion(float a, float b, float k) {
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0-h);
}
```

### Round & Onion
```glsl
float rounded = sdf(p) - radius;        // round any shape
float ring = abs(sdf(p)) - thickness;   // annular/onion
```

### Domain Repetition
```glsl
vec2 opRep(vec2 p, vec2 spacing) {
    return mod(p, spacing) - spacing * 0.5;
}
```

---

## 12. Organic Pattern Recipes

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
Domain-warped fBM with soft threshold: `smoothstep(0.1, 0.8, f)`.

### Fire
Turbulence + vertical gradient + time: `fbm(vec2(x*3, y*5 - t*2)) * (1-y)`.

---

## 13. Geometric Patterns

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

### Moiré Patterns
```glsl
return 0.5 + 0.5 * sin(r1*80.0) * sin(r2*80.0);
```

---

## 14. Color Palettes

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

### 4-Stop Gradient Ramp
```glsl
vec3 grad4(float t) {
    vec3 c = mix(color0, color1, smoothstep(0.0, 0.35, t));
    c = mix(c, color2, smoothstep(0.35, 0.70, t));
    c = mix(c, color3, smoothstep(0.70, 1.0, t));
    return c;
}
```

---

## 15. Performance Tips

| Technique | Why |
|-----------|-----|
| `dot(p,p)` vs `length(p)` | Avoid sqrt when only comparing distances |
| `fract()+floor()` vs `mod()` | Slightly cheaper for simple cases |
| Unroll small loops (3-5) | GLSL may not auto-unroll |
| Cache `sin/cos` | `float cs=cos(a); float sn=sin(a);` |
| `mediump` on mobile | 2x cheaper than `highp` |
| Avoid `if` in loops | Use `mix()`, `step()`, `smoothstep()` |
| Precompute constants | Move invariant expressions outside loops |

---

## 16. References & Advanced Topics
*   For advanced calculations including separable bilinear blurs, Circle of Confusion depth-of-field filters, motion blur vector calculations, and Stefan Gustavson's textureless 2D Classic Perlin noise implementation, view the workspace reference: [nvidia_gpu_gems.md](file:///Users/jahflyx/motion/.agents/skills/shader-development/references/nvidia_gpu_gems.md).

