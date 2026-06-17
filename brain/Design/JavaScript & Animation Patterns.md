# JavaScript & Animation Patterns

> Modern JS techniques for motion, interactivity, and smooth web experiences.

---

## Animation on the Web

Motion is not decoration — it's **communication**. Animation tells the user what changed, where to look, and how things relate.

### The Animation Hierarchy

```
GPU-accelerated (best)     → transform, opacity
Compositor-friendly        → clip-path, filter
Paint-triggering           → box-shadow, border-radius
Layout-triggering (worst)  → width, height, top, left, margin
```

Only animate `transform` and `opacity` for 60fps. Everything else causes layout recalculation.

### requestAnimationFrame

The heartbeat of web animation:

```javascript
function loop(time) {
    // update state
    // render
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

- Always use RAF, never `setTimeout` or `setInterval`
- RAF pauses when the tab is hidden — free performance
- Pass the timestamp for frame-rate-independent animation: `delta = time - lastTime`

### CSS Transitions for UI

For UI elements (buttons, panels, toggles), CSS transitions beat JS animation:

```css
.panel {
    transform: translateX(0);
    transition: transform 200ms ease-out;
}
.panel.hidden {
    transform: translateX(-290px);
}
```

- `200ms` is the sweet spot for UI transitions
- `ease-out` for elements entering, `ease-in` for elements leaving
- `will-change: transform` on animated elements (sparingly)

### CSS @keyframes for Ambient Motion

For decorative, continuous animation that doesn't depend on user input:

```css
@keyframes drift {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(10px, -5px) rotate(1deg); }
    50% { transform: translate(-5px, 10px) rotate(-1deg); }
    75% { transform: translate(-10px, -10px) rotate(0.5deg); }
}
.ambient-element {
    animation: drift 20s ease-in-out infinite;
}
```

Long durations (10–30s) for ambient effects. Short durations (0.15–0.3s) for responsive UI.

---

## Scroll-Driven Effects

### IntersectionObserver — Reveal on Scroll

The modern way to animate elements into view:

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

```css
.reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.revealed {
    opacity: 1;
    transform: translateY(0);
}
```

### Scroll-Linked Animations (CSS)

The modern CSS way — no JS needed:

```css
@keyframes parallax {
    from { transform: translateY(0); }
    to { transform: translateY(-100px); }
}

.parallax-element {
    animation: parallax linear;
    animation-timeline: scroll();
    animation-range: 0% 100%;
}
```

`animation-timeline: scroll()` links the animation progress to scroll position. Supported in Chrome 115+, Firefox behind flag.

### Scroll-Linked Animations (JS Fallback)

For cross-browser compatibility:

```javascript
function onScroll() {
    const scrolled = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = scrolled / maxScroll; // 0 → 1

    // Drive shader or element properties
    gl.uniform1f(u_scroll, progress);
}
window.addEventListener('scroll', onScroll, { passive: true });
```

`passive: true` prevents scroll jank — the browser knows you won't call `preventDefault()`.

---

## Pointer & Touch Events

### Unified Pointer Events

Modern web uses Pointer Events for mouse + touch + pen:

```javascript
canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // flip Y for GLSL
    gl.uniform2f(u_mouse, x, y);
});
```

### Pointer Capture for Drag

```javascript
slider.addEventListener('pointerdown', (e) => {
    slider.setPointerCapture(e.pointerId);
});
slider.addEventListener('pointermove', (e) => {
    if (e.buttons === 0) return; // not dragging
    // update value
});
```

### Touch Gestures

For mobile WebGL interaction:

```javascript
let lastTouch = null;
canvas.addEventListener('touchstart', (e) => {
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
canvas.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].clientX - lastTouch.x;
    const dy = e.touches[0].clientY - lastTouch.y;
    // respond to gesture
    lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
```

---

## Motion Principles

### Easing Functions

| Ease | Curve | Use Case |
|------|-------|----------|
| `ease-out` | decelerate | Elements entering, modals opening |
| `ease-in` | accelerate | Elements leaving, menus closing |
| `ease-in-out` | both | Panels sliding, content morphing |
| `linear` | constant | Progress bars, scroll-linked animation |
| `cubic-bezier(0.16, 1, 0.3, 1)` | overshoot | Playful enters, bouncy effects |
| `cubic-bezier(0.33, 0, 0.2, 1)` | smooth decel | Refined, professional feel |

### Duration Scale

| Duration | Feeling | Use |
|----------|---------|-----|
| 100–150ms | Instant | Button press, toggle, tooltip |
| 200–300ms | Quick | Panel open/close, tab switch |
| 400–500ms | Moderate | Page transition, modal reveal |
| 600–800ms | Slow | Hero entrance, large content reveal |
| 1–3s | Ambient | Background drift, continuous motion |
| 10–30s | Meditation | Loop backgrounds, decorative drift |

### Stagger Animations

When revealing multiple elements, stagger their entrance:

```javascript
elements.forEach((el, i) => {
    el.style.transitionDelay = `${i * 60}ms`;
    el.classList.add('revealed');
});
```

60ms stagger per element. Never more than 80ms — it starts to feel like a loading sequence.

### Never Animate These

- **Layout properties** (width, height, margin) — causes reflow
- **Font size** — jarring, never looks good
- **`display: none`** — use opacity + visibility instead
- **Everything at once** — hierarchy matters; animate primary element first

---

## WebGL Integration Patterns

### Shader as Background

The most common web design use of WebGL:

```javascript
// Full-viewport canvas behind content
const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;z-index:-1;';
document.body.prepend(canvas);

// Render loop
function loop(time) {
    gl.uniform1f(u_time, time * 0.001);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(loop);
}
```

### Content-Aware Shader

Shader responds to page state:

```javascript
// Track scroll, mouse, active section
const state = { scroll: 0, mouseX: 0.5, mouseY: 0.5 };

window.addEventListener('scroll', () => {
    state.scroll = window.scrollY / maxScroll;
}, { passive: true });

window.addEventListener('pointermove', (e) => {
    state.mouseX = e.clientX / window.innerWidth;
    state.mouseY = 1.0 - e.clientY / window.innerHeight;
});
```

### Lazy WebGL Initialization

Don't block page load with WebGL:

```javascript
// Load WebGL after first paint
requestIdleCallback(() => {
    initWebGL();
    requestAnimationFrame(loop);
});
```

### WebGL Fallback

Always provide a fallback for browsers without WebGL:

```javascript
if (!canvas.getContext('webgl')) {
    canvas.style.background = 'linear-gradient(135deg, #08080a, #1a1a2e)';
    return;
}
```

---

## Web Audio for Motion

### Audio-Reactive Shaders

```javascript
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;

function getAudioLevel() {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    return data.reduce((a, b) => a + b) / data.length / 255;
}

// Feed to shader
gl.uniform1f(u_audio, getAudioLevel());
```

### Ambient Sound Design

For immersive web experiences:

```javascript
// Subtle ambient tone
const osc = audioContext.createOscillator();
osc.type = 'sine';
osc.frequency.value = 60; // low drone
const gain = audioContext.createGain();
gain.gain.value = 0.02; // barely audible
```

Never auto-play audio. Always user-initiated with a visible control.

---

## Performance Patterns

### Throttle & Debounce

```javascript
// Throttle: at most once per N ms
function throttle(fn, ms) {
    let last = 0;
    return (...args) => {
        const now = Date.now();
        if (now - last >= ms) { last = now; fn(...args); }
    };
}

// Debounce: only after N ms of inactivity
function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
```

- **Throttle** scroll handlers, pointermove, resize
- **Debounce** search input, shader recompilation, API calls

### Passive Event Listeners

Always add `{ passive: true }` to scroll and touch listeners:

```javascript
window.addEventListener('scroll', handler, { passive: true });
element.addEventListener('touchmove', handler, { passive: true });
```

This tells the browser you won't prevent scrolling, so it can optimize.

### will-change

Reserve `will-change` for elements that will animate:

```css
.animated-panel {
    will-change: transform;
}
```

Don't put it on everything — it consumes GPU memory.

---

## Related

- [[Modern Web Design]] — the aesthetic these patterns serve
- [[WebGL Techniques]] — shader-specific implementation
- [[Design Principles]] — lumen·local's generative design rules
