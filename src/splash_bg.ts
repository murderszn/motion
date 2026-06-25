// ─────────────────────────────────────────────────────────
//  splash.html — background wave shader + live hex tint
// ─────────────────────────────────────────────────────────

function randomTintHex(): string {
  const hue = Math.floor(Math.random() * 360);
  const sat = 58 + Math.random() * 32;
  const lit = 44 + Math.random() * 16;
  const c = (1 - Math.abs(2 * lit / 100 - 1)) * sat / 100;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = lit / 100 - c / 2;
  let r = 0, g = 0, b = 0;
  if (hue < 60)       { r = c; g = x; }
  else if (hue < 120) { r = x; g = c; }
  else if (hue < 180) { g = c; b = x; }
  else if (hue < 240) { g = x; b = c; }
  else if (hue < 300) { r = x; b = c; }
  else                { r = c; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const WAVE_FS = `
precision highp float;
uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_tint;
uniform float u_tintAmt;
float hash21(vec2 p){ p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
  float a=hash21(i), b=hash21(i+vec2(1.0,0.0)), c=hash21(i+vec2(0.0,1.0)), d=hash21(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
float fbm(vec2 p){ float v=0.0; float a=0.5; mat2 r=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<5;i++){ v+=a*vnoise(p); p=r*p*2.1+vec2(1.7,9.2); a*=0.5; } return v; }
vec3 pal(float t){ t=clamp(t,0.0,1.0);
  if(t<0.30) return mix(vec3(0.063,0.047,0.086), vec3(0.498,0.024,0.086), t/0.30);
  if(t<0.62) return mix(vec3(0.498,0.024,0.086), vec3(0.875,0.230,0.230), (t-0.30)/0.32);
             return mix(vec3(0.875,0.230,0.230), vec3(1.000,0.957,0.957), (t-0.62)/0.38); }
void main(){
  vec2 uv = gl_FragCoord.xy / u_res; uv.y = 1.0 - uv.y;
  float ar = u_res.x / u_res.y;
  float t  = u_time * 0.22;
  vec2 p = vec2(uv.x * ar, uv.y);
  vec2 q = vec2(fbm(p*1.5 + vec2(t*0.30, t*0.05)), fbm(p*1.5 + vec2(5.2,1.3) - vec2(t*0.18, 0.0)));
  float f = fbm(p*1.4 + q*2.6 + vec2(t*0.22, 0.0));
  float swell = uv.y*1.4 + sin(uv.x*ar*1.4 + t*1.1 + q.x*3.0)*0.30 + sin(uv.x*ar*3.1 - t*1.6 + q.y*2.0)*0.14 + f*1.5;
  float band = 0.5 + 0.5*sin(swell*6.2831*0.85 - t*0.6);
  vec3 col = pal(band*0.96);
  float crest = pow(band,6.0)*0.55;
  col += vec3(1.0,0.96,0.96)*crest;
  col *= 0.82 + 0.30*smoothstep(0.0,0.7,uv.y);
  col += (hash21(gl_FragCoord.xy) - 0.5)*0.02;
  vec2 vig = uv*2.0 - 1.0; col *= 1.0 - dot(vig,vig)*0.22;
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 tinted = u_tint * lum * 2.8;
  col = mix(col, tinted, u_tintAmt);
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';

interface Engine {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  program: WebGLProgram;
  uTime: WebGLUniformLocation;
  uRes: WebGLUniformLocation;
  uTint: WebGLUniformLocation;
  uTintAmt: WebGLUniformLocation;
  t0: number;
  raf: number;
}

let engine: Engine | null = null;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h.slice(0, 6), 16);
  return [
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  ];
}

function setTint(hex: string, amt = 0.82): void {
  if (!engine) return;
  const [r, g, b] = hexToRgb(hex);
  engine.gl.useProgram(engine.program);
  engine.gl.uniform3f(engine.uTint, r, g, b);
  engine.gl.uniform1f(engine.uTintAmt, amt);
  const swatch = document.getElementById('tint-swatch');
  if (swatch) swatch.style.background = hex;
}

function startEngine(canvas: HTMLCanvasElement): boolean {
  const gl = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
  if (!gl) return false;

  const vs = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vs, VERT);
  gl.compileShader(vs);
  const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fs, WAVE_FS);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) return false;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;

  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time')!;
  const uRes = gl.getUniformLocation(prog, 'u_res')!;
  const uTint = gl.getUniformLocation(prog, 'u_tint')!;
  const uTintAmt = gl.getUniformLocation(prog, 'u_tintAmt')!;

  const resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  window.addEventListener('resize', resize);
  resize();

  const t0 = performance.now();
  const draw = (now: number): void => {
    if (!engine) return;
    engine.gl.useProgram(engine.program);
    engine.gl.uniform1f(engine.uTime, (now - engine.t0) / 1000);
    engine.gl.uniform2f(engine.uRes, engine.canvas.width, engine.canvas.height);
    engine.gl.drawArrays(engine.gl.TRIANGLE_STRIP, 0, 4);
    engine.raf = requestAnimationFrame(draw);
  };

  engine = { gl, canvas, program: prog, uTime, uRes, uTint, uTintAmt, t0, raf: requestAnimationFrame(draw) };
  return true;
}

function initParallax(canvas: HTMLCanvasElement): void {
  let task: number | null = null;
  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (task) cancelAnimationFrame(task);
    task = requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      canvas.style.transform = `translate(${x}px, ${y}px) scale(1.03)`;
    });
  });
  document.addEventListener('mouseleave', () => {
    canvas.style.transform = 'translate(0,0) scale(1)';
  });
}

function initTintPicker(): void {
  const picker = document.getElementById('tint-picker') as HTMLInputElement | null;
  if (!picker) return;

  const hex = randomTintHex();
  picker.value = hex;
  setTint(hex);

  picker.addEventListener('input', () => setTint(picker.value));
}

function boot(): void {
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null;
  if (!canvas || !startEngine(canvas)) return;
  initParallax(canvas);
  initTintPicker();
}

if (document.readyState === 'loading') {
  window.addEventListener('load', boot);
} else {
  boot();
}