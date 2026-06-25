// ─────────────────────────────────────────────────────────
//  src/index.ts — splash page script (was inline <script>)
// ─────────────────────────────────────────────────────────

(() => {
  'use strict';

  /* --------------------------------------------------
     KEYBOARD: Enter → studio
  -------------------------------------------------- */
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') window.location.href = 'studio.html';
  });

  /* --------------------------------------------------
     THEME — restore saved preference (no toggle UI on this page)
  -------------------------------------------------- */
  const themes = ['motion-dark', 'motion-dim', 'motion-contrast', 'motion-light'];
  const savedTheme = localStorage.getItem('motion-theme') ?? 'motion-dark';
  if (themes.includes(savedTheme) && savedTheme !== 'motion-dark') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  /* --------------------------------------------------
     ROSTER: cycle the "live" highlight
  -------------------------------------------------- */
  const rosterEls = document.querySelectorAll<HTMLElement>('#roster span');
  if (rosterEls.length) {
    let liveIdx = 3;
    setInterval(() => {
      rosterEls[liveIdx].classList.remove('live');
      liveIdx = (liveIdx + 1) % rosterEls.length;
      rosterEls[liveIdx].classList.add('live');
    }, 2400);
  }

  /* --------------------------------------------------
     TIMER
  -------------------------------------------------- */
  const timerEl = document.getElementById('timer');
  if (timerEl) {
    const t0 = performance.now();
    let lastSec = -1;
    function tick(): void {
      const s = Math.floor((performance.now() - t0) / 1000);
      if (s !== lastSec) {
        lastSec = s;
        timerEl!.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* --------------------------------------------------
     BACKGROUND — random trio: aurora shader / wave shader / video
  -------------------------------------------------- */
  const video  = document.getElementById('bg-video') as HTMLVideoElement | null;
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null;
  let   activeBg: HTMLElement | null = null;

  function setBg(name: string): void {
    document.body.setAttribute('data-bg', name);
  }

  const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

  // Crimson FBM wave (the original front-door shader)
  const WAVE_FS = `
precision highp float;
uniform float u_time;
uniform vec2  u_res;
float hash21(vec2 p) { p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
float vnoise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i); float b = hash21(i + vec2(1.0, 0.0)); float c = hash21(i + vec2(0.0, 1.0)); float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }
float fbm(vec2 p) { float v = 0.0; float a = 0.5; mat2 r = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 5; i++) { v += a * vnoise(p); p = r * p * 2.1 + vec2(1.7, 9.2); a *= 0.5; } return v; }
vec3 pal(float t) { t = clamp(t, 0.0, 1.0);
    if (t < 0.30) return mix(vec3(0.063, 0.047, 0.086), vec3(0.498, 0.024, 0.086), t / 0.30);
    if (t < 0.62) return mix(vec3(0.498, 0.024, 0.086), vec3(0.875, 0.230, 0.230), (t - 0.30) / 0.32);
                  return mix(vec3(0.875, 0.230, 0.230), vec3(1.000, 0.957, 0.957), (t - 0.62) / 0.38); }
void main() {
    vec2 uv = gl_FragCoord.xy / u_res; uv.y = 1.0 - uv.y;
    float ar = u_res.x / u_res.y;
    float t  = u_time * 0.22;
    vec2 p = vec2(uv.x * ar, uv.y);
    vec2 q = vec2(fbm(p * 1.5 + vec2(t * 0.30, t * 0.05)), fbm(p * 1.5 + vec2(5.2, 1.3) - vec2(t * 0.18, 0.0)));
    float f = fbm(p * 1.4 + q * 2.6 + vec2(t * 0.22, 0.0));
    float swell = uv.y * 1.4 + sin(uv.x * ar * 1.4 + t * 1.1 + q.x * 3.0) * 0.30 + sin(uv.x * ar * 3.1 - t * 1.6 + q.y * 2.0) * 0.14 + f * 1.5;
    float band = 0.5 + 0.5 * sin(swell * 6.2831 * 0.85 - t * 0.6);
    vec3 col = pal(band * 0.96);
    float crest = pow(band, 6.0) * 0.55;
    col += vec3(1.0, 0.96, 0.96) * crest;
    col *= 0.82 + 0.30 * smoothstep(0.0, 0.7, uv.y);
    col += (hash21(gl_FragCoord.xy + vec2(u_time * 60.0)) - 0.5) * 0.04;
    vec2 vig = uv * 2.0 - 1.0; col *= 1.0 - dot(vig, vig) * 0.22;
    gl_FragColor = vec4(col, 1.0);
}`;

  // Aurora bands (ported from the splash page, baked to its "aurora" preset)
  const AURORA_FS = `
precision highp float;
uniform float u_time;
uniform vec2  u_res;
#define TAU 6.28318530718
const float SEED = 3286.0;
const float SPEED = 0.31, SCALE = 0.92, DENSITY = 0.00, DISTORT = 0.52, DETAIL = 0.49, GRAIN = 0.68;
const vec3 C0 = vec3(0.0, 0.0, 0.0);
const vec3 C1 = vec3(0.0, 1.0, 1.0);
const vec3 C2 = vec3(1.0, 1.0, 0.0);
const vec3 C3 = vec3(1.0, 0.0, 1.0);
float hash21(vec2 p){ p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  float a=hash21(i), b=hash21(i+vec2(1.0,0.0)), c=hash21(i+vec2(0.0,1.0)), d=hash21(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
float fbm(vec2 p){ float v=0.0,a=0.5; mat2 r=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<5;i++){ v+=a*vnoise(p); p=r*p*2.1+vec2(1.7,9.2); a*=0.5; } return v; }
vec2 loopOff(float ph){ return vec2(cos(ph), sin(ph)) * (0.10 + 0.55 * SPEED); }
vec3 grad4(float t){ t=clamp(t,0.0,1.0);
  vec3 c=mix(C0,C1,smoothstep(0.00,0.35,t));
  c=mix(c,C2,smoothstep(0.35,0.70,t));
  c=mix(c,C3,smoothstep(0.70,1.00,t)); return c; }
void main(){
  vec2 uv = gl_FragCoord.xy / u_res; uv.y = 1.0 - uv.y;
  float ar = u_res.x / u_res.y;
  float ph = mod(u_time / 4.0 * TAU, TAU);
  vec3 base = vec3(0.06, 0.04, 0.08);
  float light = 0.0; vec3 tint = vec3(0.0);
  for(int i=0;i<3;i++){
    float fi = float(i) + 1.0;
    float xx = uv.x * ar * (1.0 + 0.35 * fi) + SEED * fi * 1.7;
    float wave = fbm(vec2(xx * 0.6, fi * 4.0) + loopOff(ph) * 1.2) - 0.5;
    float cy = 0.42 + 0.12 * fi + wave * 0.38;
    float streak = fbm(vec2(xx * (3.0 + 4.0 * DETAIL), uv.y * (1.0 + 1.5 * SCALE)) + loopOff(ph));
    float dist = uv.y - cy;
    float band = exp(-dist * dist * (8.0 + 34.0 * DENSITY));
    float inten = max(band * (0.25 + 0.95 * streak), 0.0);
    light += inten / fi;
    tint += grad4(clamp(0.1 + (1.0 - uv.y) * 1.35 + wave * 0.25, 0.0, 1.0)) * inten / fi;
  }
  vec3 col = mix(base, tint * (1.3 + 1.0 * DISTORT), light * 0.7);
  col += C3 * pow(clamp(light, 0.0, 1.0), 3.0) * 0.15;
  col = clamp(col, 0.0, 1.0);
  col += (hash21(gl_FragCoord.xy + vec2(ph * 91.3)) - 0.5) * GRAIN * 0.04;
  vec2 v = uv * 2.0 - 1.0; col *= 1.0 - dot(v, v) * 0.08;
  gl_FragColor = vec4(col, 1.0);
}`;

  function startVideo(noFallback = false): void {
    if (!video) { startShader('wave'); return; }
    activeBg = video;
    canvas?.classList.remove('bg-active');
    video.classList.add('bg-active');
    setBg('video');

    let failed = false;
    function fail(): void {
      if (failed || noFallback) return;
      failed = true;
      video!.classList.remove('bg-active');
      startShader(Math.random() < 0.5 ? 'aurora' : 'wave');
    }
    video.addEventListener('error', fail, { once: true });

    if (!video.querySelector('source')) {
      const s = document.createElement('source');
      s.src  = 'motion-halftone-1992.webm';
      s.type = 'video/webm';
      video.appendChild(s);
      video.load();
    }
    video.play().catch(() => {
      // Missing/undecodable file → fall back to a shader; a genuine autoplay
      // block (media is actually present) → show the click-to-enter overlay.
      if (video!.readyState < 2) { fail(); return; }
      const playOverlay = document.createElement('div');
      playOverlay.style.cssText =
        'position:fixed;inset:0;z-index:999;display:grid;place-items:center;' +
        'background:rgba(6,4,10,0.85);cursor:pointer;';
      playOverlay.innerHTML =
        '<span style="font-family:Inter,sans-serif;font-weight:200;' +
        'font-size:1.2rem;letter-spacing:0.3em;color:rgba(255,255,255,0.7);' +
        'border:1px solid rgba(255,255,255,0.2);padding:1.2rem 2.4rem;">' +
        'click to enter</span>';
      playOverlay.addEventListener('click', () => { video!.play(); playOverlay.remove(); });
      document.body.appendChild(playOverlay);
    });
  }

  function initShader(cv: HTMLCanvasElement, fsSrc: string): boolean {
    const gl = (cv.getContext('webgl') ?? cv.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;

    function mkShader(type: number, src: string): WebGLShader | null {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) { gl!.deleteShader(s); return null; }
      return s;
    }

    const vs = mkShader(gl.VERTEX_SHADER, VERT);
    const fs = mkShader(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return false;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;

    const vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos  = gl.getAttribLocation(prog, 'a_pos');
    const uTime = gl.getUniformLocation(prog, 'u_time')!;
    const uRes  = gl.getUniformLocation(prog, 'u_res')!;
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    function resize(): void {
      const dpr = Math.min(devicePixelRatio, 2);
      cv.width  = Math.round(window.innerWidth  * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
      gl!.viewport(0, 0, cv.width, cv.height);
    }
    window.addEventListener('resize', resize);
    resize();

    const t0 = performance.now();
    function frame(now: number): void {
      gl!.useProgram(prog);
      gl!.uniform1f(uTime, (now - t0) / 1000);
      gl!.uniform2f(uRes, cv.width, cv.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return true;
  }

  function startShader(which: 'aurora' | 'wave'): void {
    if (!canvas) { startVideo(true); return; }
    const ok = initShader(canvas, which === 'aurora' ? AURORA_FS : WAVE_FS);
    if (ok) {
      activeBg = canvas;
      canvas.classList.add('bg-active');
      setBg(which);
    } else if (which !== 'aurora' && initShader(canvas, AURORA_FS)) {
      activeBg = canvas;
      canvas.classList.add('bg-active');
      setBg('aurora');
    } else {
      startVideo(true);
    }
  }

  // random trio pick: aurora / wave / video
  const pick = ['aurora', 'wave', 'video'][Math.floor(Math.random() * 3)];
  if (pick === 'video') startVideo();
  else startShader(pick as 'aurora' | 'wave');

  /* --------------------------------------------------
     PARALLAX
  -------------------------------------------------- */
  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!activeBg) return;
    const x = (e.clientX / window.innerWidth  - 0.5) * 6;
    const y = (e.clientY / window.innerHeight - 0.5) * 6;
    activeBg.style.transform = `translate(${x}px, ${y}px) scale(1.03)`;
  });
  document.addEventListener('mouseleave', () => {
    if (activeBg) activeBg.style.transform = 'translate(0,0) scale(1)';
  });

  /* --------------------------------------------------
     INTERSECTION OBSERVER — reveal on scroll
  -------------------------------------------------- */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();
