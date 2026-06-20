# WebGL Techniques

> Patterns, techniques, and best practices for WebGL in modern web design — from shader backgrounds to post-processing.

---

## WebGL as Design Tool

WebGL is not just for games. In web design, it creates:

- **Animated backgrounds** — generative visuals that run continuously
- **Image distortion** — warping, ripple, liquid effects on photos
- **Data visualization** — GPU-accelerated particle systems, force graphs
- **Interactive art** — mouse/touch-reactive shader canvases
- **Post-processing** — bloom, blur, film grain applied to page content
- **Text effects** — shader-driven text rendering, particle text

---

## Core Concepts

### The Fullscreen Quad

The most common pattern in web design WebGL: render a full-screen fragment shader.

```glsl
// Vertex shader — covers the entire canvas
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}

// Fragment shader — the design happens here
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    // your design
    gl_FragColor = vec4(col, 1.0);
}
```

Two triangles covering the viewport. Every pixel computed in parallel on the GPU. This is how lumen·local works — and it's the foundation of all shader-based web design.

### Uniforms as Design Parameters

| Uniform | Type | Purpose |
|---------|------|---------|
| `u_time` | float | Continuous time for animation |
| `u_resolution` | vec2 | Canvas size for aspect-correct rendering |
| `u_mouse` | vec2 | Cursor position for interactivity |
| `u_scroll` | float | Scroll position for scroll-linked effects |
| `u_phase` | float | Loop phase for seamless loops |
| `u_seed` | float | Deterministic randomness |

### Texture Loading

For image distortion and overlay effects:

```glsl
uniform sampler2D u_image;
// ...
vec4 tex = texture2D(u_image, uv + distortion);
```

Use `CLAMP_TO_EDGE` wrapping, `LINEAR` filtering, and power-of-two dimensions for best compatibility.

---

## Design Patterns

### 1. Animated Gradient Background

The simplest impactful WebGL effect — a drifting color field:

```glsl
float f = fbm(uv * 2.0 + u_time * 0.1);
vec3 col = mix(color1, color2, f);
```

Use FBM noise for organic drift. Keep colors muted — the content sits on top.

### 2. Noise-Driven Texture

Layer noise functions for organic backgrounds:

```glsl
float n = fbm(uv * scale + offset);
float ridged = 1.0 - abs(n * 2.0 - 1.0); // ridged noise
float cells = abs(sin(uv.x * freq) * sin(uv.y * freq)); // cell pattern
```

Combine 2–3 noise types for complexity without chaos.

### 3. Mouse-Reactive Distortion

Make the shader respond to cursor position:

```glsl
vec2 mouse = u_mouse / u_resolution;
float dist = length(uv - mouse);
float influence = smoothstep(0.3, 0.0, dist);
vec2 warped = uv + normalize(uv - mouse) * influence * 0.05;
```

This creates a "magnetic" or "liquid" feel. Subtlety is key — `0.03–0.07` influence range.

### 4. Scroll-Linked Animation

Bind shader time to scroll position:

```glsl
// JavaScript sends scroll as a uniform
gl.uniform1f(u_scroll, window.scrollY / document.body.scrollHeight);

// GLSL uses it
float phase = u_scroll * 6.28318; // full rotation over page
```

Creates the feeling that the background evolves as you explore the page.

### 5. Post-Processing Pipeline

Apply effects after rendering to a texture:

```
Render scene → FBO texture → Post-process shader → Screen
```

Common post-processing effects:
- **Vignette:** `color *= 1.0 - dot(uv - 0.5, uv - 0.5) * strength`
- **Film grain:** `color += (hash(fragCoord + time) - 0.5) * amount`
- **Chromatic aberration:** Sample RGB at slightly different UVs
- **Bloom:** Blur bright pixels, composite additively
- **Scanlines:** `color *= 0.95 + 0.05 * sin(uv.y * resolution.y)`

### 6. Smooth Seamless Loops

The lumen·local technique — circular phase:

```glsl
vec2 offset = vec2(cos(phase), sin(phase)) * radius;
float n = fbm(uv * scale + offset);
// phase goes 0→2π, offset traces a circle, noise is seamless
```

Any animation driven by `cos(phase)` and `sin(phase)` with integer multiples will loop perfectly.

---

## Performance Guidelines

| Rule | Why |
|------|-----|
| Keep fragment shaders under 100 instructions | Mobile GPUs are limited |
| Use `precision mediump float` on mobile | `highp` may not be available |
| Minimize texture reads | Each sample is expensive |
| Use `requestAnimationFrame`, not `setInterval` | RAF syncs to display refresh |
| Resize canvas to `devicePixelRatio` then render at 1× | Avoid oversampling on Retina |
| Use `preserveDrawingBuffer: true` only when needed | It disables compositing optimizations |
| Pool textures and programs | Don't create/destroy per frame |
| Profile on mobile early | Desktop GPU is 10× faster than phone |

### Resolution Scaling

```javascript
const dpr = Math.min(window.devicePixelRatio, 2); // cap at 2×
canvas.width = canvas.clientWidth * dpr;
canvas.height = canvas.clientHeight * dpr;
```

Cap at 2× to balance sharpness with performance. lumen·local already does this.

---

## WebGL1 vs WebGL2 vs WebGPU

| Feature | WebGL1 | WebGL2 | WebGPU |
|---------|--------|--------|--------|
| Shader language | GLSL ES 1.0 | GLSL ES 3.0 | WGSL |
| Instancing | Extension | Built-in | Built-in |
| Multiple render targets | No | Yes | Yes |
| Compute shaders | No | No | Yes |
| Texture formats | Limited | Rich | Full |
| Browser support | Universal | ~95% | ~80% (growing) |
| Best for | Maximum compat | Good perf + compat | Future-proof |

lumen·local uses WebGL1 for maximum compatibility. The design language and techniques work identically in all three — just the shader syntax changes.

---

## Shader Art Techniques for Web Design

### Domain Warping

Feed FBM output back into FBM input for organic, fluid shapes:

```glsl
vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
vec2 r = vec2(fbm(p + q * 2.0), fbm(p + q * 2.0 + vec2(1.7, 9.2)));
float f = fbm(p + r * 1.5);
```

This is the foundation of the "flow" preset and one of the most powerful generative techniques.

### Signed Distance Functions (SDFs)

Mathematical shapes with smooth edges — perfect for UI elements rendered in shaders:

```glsl
float circle = length(p) - radius;
float box = max(abs(p.x) - size.x, abs(p.y) - size.y);
float shape = smoothstep(0.0, 0.01, distance);
```

### Color Palettes via Smoothstep

The lumen·local palette technique — map a scalar to a 4-stop gradient:

```glsl
vec3 palette(float t) {
    vec3 c = mix(color0, color1, smoothstep(0.0, 0.35, t));
    c = mix(c, color2, smoothstep(0.35, 0.70, t));
    c = mix(c, color3, smoothstep(0.70, 1.0, t));
    return c;
}
```

Smoothstep creates perceptually smooth color transitions without banding.

---

## Common Pitfalls

1. **Precision errors** — `highp` is required for large coordinate systems; `mediump` causes banding on big canvases
2. **Texture coordinates flipped** — WebGL's origin is bottom-left, CSS is top-left; always flip Y
3. **Forgetting `preserveDrawingBuffer`** — screenshot/export will be blank without it
4. **No fallback** — always check for WebGL support and show a static image fallback
5. **Shader recompile on every keystroke** — the live editor should debounce compilation
6. **Mobile touch events** — `touchstart`/`touchmove` for mouse position, not just `mousemove`

---

## Related

- [[Design Principles]] — generative design tenets
- [[Shader Architecture]] — lumen·local's shader system
- [[Modern Web Design]] — broader web aesthetic context
- [[JavaScript & Animation Patterns]] — motion and interaction
- [[Fractal & Pattern Vocabulary]] — mathematical patterns for shaders

---

## Three.js Integration

### ShaderMaterial Pattern
```js
const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uTime; varying vec2 vUv; void main(){ ... }`,
});
// Update in render loop: mat.uniforms.uTime.value = clock.getElapsedTime();
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

### Performance (Three.js)
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

---

## Interactive Effects

### Mouse-Reactive Distortion
```glsl
vec2 mouseDelta = uv - uMouse;
float dist = length(mouseDelta);
float influence = smoothstep(0.3, 0.0, dist) * uStrength;
uv += normalize(mouseDelta) * influence * 0.05;
```

### Cursor-Reactive Gradient
```glsl
float dist = distance(uv, uMouse);
vec3 glow = vec3(0.2, 0.5, 1.0) * smoothstep(0.4, 0.0, dist);
```

### Text + WebGL
Render text to offscreen Canvas2D, use as WebGL texture. Reveal via `step(uv.x, uReveal)`. Glitch: displace UVs per scanline + RGB split.

### Particle Systems
Use instanced rendering for thousands of particles. Store positions in Float32Array, update in JS or via transform feedback for GPU-only updates.

---

## Page Transitions
Shader-based transitions between two textures using `uProgress` (0..1):
```glsl
float radius = uProgress * 1.5;
float edge = smoothstep(radius - 0.1, radius, distance(uv, vec2(0.5)));
gl_FragColor = mix(to, from, edge);
```
Keep transitions under 800ms with ease-in-out curves.

---

## Mobile WebGL

### Performance Budget
- Frame budget: 10ms (60fps), 16ms safe target
- Reduce particles (500-1000 vs 5000+ on desktop)
- Disable post-processing on low-end GPUs
- Touch: normalize touch coords same as mouse

### Fallback Strategy
```javascript
function getShaderQuality() {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return 'none';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    if (/SwiftShader|llvmpipe|Software/i.test(renderer)) return 'low';
    return 'high';
}
```
- **High:** Full particles, post-processing, 60fps
- **Low:** Static noise, no particles, 30fps, simplified shaders
- **None:** CSS fallback (gradients, `backdrop-filter: blur()`)
