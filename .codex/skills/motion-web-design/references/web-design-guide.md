# Web Design Patterns & Guide

> Practical patterns for building modern, "sexy" web experiences.

---

## 1. Page Architecture

### Dark Mode Landing Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Motion</title>
  <style>
    :root {
      --bg: #08080a;
      --panel: #0e0e12;
      --border: #1c1c22;
      --text: #b8b8c0;
      --text-bright: #f4f4f6;
      --text-dim: #55555e;
      --accent: #e03a3a;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Hero */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0 24px;
      position: relative;
    }

    .hero canvas {
      position: absolute;
      inset: 0;
      z-index: -1;
    }

    .hero h1 {
      font-size: clamp(36px, 6vw, 64px);
      font-weight: 600;
      color: var(--text-bright);
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .hero p {
      font-size: 18px;
      color: var(--text-dim);
      max-width: 500px;
      margin-top: 16px;
    }

    /* CTA Button */
    .cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 32px;
      padding: 12px 24px;
      border: 1px solid var(--accent);
      background: transparent;
      color: var(--accent);
      font-family: inherit;
      font-size: 14px;
      letter-spacing: 0.08em;
      text-transform: lowercase;
      cursor: pointer;
      transition: background 150ms ease-out, color 150ms ease-out;
    }
    .cta:hover {
      background: var(--accent);
      color: var(--bg);
    }

    /* Sections */
    section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 96px 24px;
    }

    section h2 {
      font-size: 28px;
      font-weight: 600;
      color: var(--text-bright);
      letter-spacing: -0.01em;
    }

    /* Feature Grid */
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
      margin-top: 48px;
    }

    .feature {
      padding: 24px;
      border: 1px solid var(--border);
    }

    .feature h3 {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-bright);
      text-transform: lowercase;
      letter-spacing: 0.08em;
    }

    .feature p {
      font-size: 14px;
      color: var(--text-dim);
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <section class="hero">
    <canvas id="bg"></canvas>
    <h1>generative motion graphics</h1>
    <p>WebGL shaders, seamless loops, zero install.</p>
    <button class="cta">open studio</button>
  </section>

  <section>
    <h2>features</h2>
    <div class="features">
      <div class="feature">
        <h3>16 shader presets</h3>
        <p>Procedural, deterministic, customizable.</p>
      </div>
      <div class="feature">
        <h3>seamless loops</h3>
        <p>Every export loops perfectly. Always.</p>
      </div>
      <div class="feature">
        <h3>zero dependencies</h3>
        <p>Runs in any browser. No install required.</p>
      </div>
    </div>
  </section>

  <script>
    // WebGL background shader goes here
    const canvas = document.getElementById('bg');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    // ... init WebGL, RAF loop
  </script>
</body>
</html>
```

---

## 2. Component Patterns

### Outlined Button (Primary CTA)

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: lowercase;
  cursor: pointer;
  transition: background 150ms ease-out, color 150ms ease-out;
}
.btn-primary:hover {
  background: var(--accent);
  color: var(--bg);
}
```

### Ghost Button (Secondary)

```css
.btn-ghost {
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-family: inherit;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: lowercase;
  cursor: pointer;
  transition: border-color 150ms ease-out, color 150ms ease-out;
}
.btn-ghost:hover {
  border-color: var(--text);
  color: var(--text-bright);
}
```

### Panel / Card

```css
.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  padding: 24px;
}

.panel-header {
  font-size: 9px;
  font-weight: 400;
  text-transform: lowercase;
  letter-spacing: 0.20em;
  color: var(--text-dim);
  margin-bottom: 16px;
}
```

### Scroll Reveal

```css
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

### Stagger Children

```css
.stagger > * {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}
.stagger.visible > *:nth-child(1) { transition-delay: 0ms; }
.stagger.visible > *:nth-child(2) { transition-delay: 60ms; }
.stagger.visible > *:nth-child(3) { transition-delay: 120ms; }
.stagger.visible > *:nth-child(4) { transition-delay: 180ms; }
.stagger.visible > * {
  opacity: 1;
  transform: translateY(0);
}
```

### Ambient Drift (CSS)

```css
@keyframes drift {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(8px, -4px) rotate(0.5deg); }
  50% { transform: translate(-4px, 8px) rotate(-0.5deg); }
  75% { transform: translate(-8px, -8px) rotate(0.3deg); }
}

.ambient { animation: drift 20s ease-in-out infinite; }
```

---

## 3. WebGL Integration

### Minimal Shader Canvas

```javascript
function initShaderBackground(canvasId) {
  const canvas = document.getElementById(canvasId);
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) return;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // Vertex shader
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, `
    attribute vec2 a;
    void main() { gl_Position = vec4(a, 0.0, 1.0); }
  `);
  gl.compileShader(vs);

  // Fragment shader — your design goes here
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_res;
    uniform vec2 u_mouse;

    float hash21(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    float vnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash21(i), hash21(i + vec2(1,0)), f.x),
        mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
      for (int i = 0; i < 5; i++) {
        v += a * vnoise(p);
        p = r * p * 2.1 + vec2(1.7, 9.2);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float n = fbm(uv * 2.0 + u_time * 0.1);
      vec3 col = mix(
        vec3(0.031, 0.031, 0.039),
        vec3(0.055, 0.055, 0.071),
        n
      );
      gl_FragColor = vec4(col, 1.0);
    }
  `);
  gl.compileShader(fs);

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Fullscreen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  let mouseX = 0.5, mouseY = 0.5;

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
  });

  function loop(t) {
    gl.uniform1f(uTime, t * 0.001);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
```

---

## 4. Spacing Reference

| Token | Value | Use |
|-------|-------|-----|
| `--sp-1` | 4px | Hairline gaps, icon padding |
| `--sp-2` | 8px | Compact spacing, inline elements |
| `--sp-3` | 12px | Standard gap, form fields |
| `--sp-4` | 16px | Paragraph spacing, card padding |
| `--sp-6` | 24px | Section gaps, sidebar padding |
| `--sp-8` | 32px | Component spacing |
| `--sp-12` | 48px | Section breaks |
| `--sp-16` | 64px | Major whitespace |
| `--sp-24` | 96px | Hero sections |
| `--sp-32` | 128px | Page-level breathing |

---

## 5. Easing Reference

| Name | CSS | Use |
|------|-----|-----|
| Decelerate | `ease-out` | Elements entering |
| Accelerate | `ease-in` | Elements leaving |
| Smooth | `ease-in-out` | Panels sliding |
| Bounce | `cubic-bezier(0.16, 1, 0.3, 1)` | Playful enters |
| Professional | `cubic-bezier(0.33, 0, 0.2, 1)` | Refined feel |
| Linear | `linear` | Scroll-linked, progress |

---

## 6. Duration Scale

| Duration | Feeling | Use |
|----------|---------|-----|
| 100–150ms | Instant | Button press, toggle |
| 200–300ms | Quick | Panel open/close |
| 400–500ms | Moderate | Page transition |
| 600–800ms | Slow | Hero entrance |
| 1–3s | Ambient | Background drift |
| 10–30s | Meditation | Loop backgrounds |
