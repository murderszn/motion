// ─────────────────────────────────────────────────────────
//  splash.html — dark/light mode background shaders
// ─────────────────────────────────────────────────────────

const VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';

const NOISE_GLSL = `
float hash21(vec2 p){ p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
  float a=hash21(i), b=hash21(i+vec2(1,0)), c=hash21(i+vec2(0,1)), d=hash21(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; mat2 r=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<5;i++){ v+=a*vnoise(p); p=r*p*2.1+vec2(1.7,9.2); a*=0.5; } return v; }`;

// Dark mode — mostly black with white accent waves
const DARK_FS = `
precision highp float;
uniform float u_time;
uniform vec2  u_res;
${NOISE_GLSL}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res; uv.y = 1.0 - uv.y;
  float ar = u_res.x / u_res.y;
  float t  = u_time * 0.22;
  vec2 p = vec2(uv.x * ar, uv.y);
  vec2 q = vec2(fbm(p*1.5 + vec2(t*0.30, t*0.05)), fbm(p*1.5 + vec2(5.2,1.3) - vec2(t*0.18, 0.0)));
  float f = fbm(p*1.4 + q*2.6 + vec2(t*0.22, 0.0));
  float swell = uv.y*1.4 + sin(uv.x*ar*1.4 + t*1.1 + q.x*3.0)*0.30 + sin(uv.x*ar*3.1 - t*1.6 + q.y*2.0)*0.14 + f*1.5;
  float band = 0.5 + 0.5*sin(swell*6.2831*0.85 - t*0.6);
  // Sharp contrast: mostly black, white crests only
  float wave = smoothstep(0.55, 0.75, band);
  float crest = pow(band, 12.0) * 0.7;
  vec3 col = vec3(0.0);
  col += vec3(0.12) * wave * 0.3;
  col += vec3(1.0) * crest;
  vec2 vig = uv*2.0 - 1.0; col *= 1.0 - dot(vig,vig)*0.25;
  gl_FragColor = vec4(col, 1.0);
}`;

// Light mode — mostly white with dark accent waves
const LIGHT_FS = `
precision highp float;
uniform float u_time;
uniform vec2  u_res;
${NOISE_GLSL}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res; uv.y = 1.0 - uv.y;
  float ar = u_res.x / u_res.y;
  float t  = u_time * 0.22;
  vec2 p = vec2(uv.x * ar, uv.y);
  vec2 q = vec2(fbm(p*1.5 + vec2(t*0.30, t*0.05)), fbm(p*1.5 + vec2(5.2,1.3) - vec2(t*0.18, 0.0)));
  float f = fbm(p*1.4 + q*2.6 + vec2(t*0.22, 0.0));
  float swell = uv.y*1.4 + sin(uv.x*ar*1.4 + t*1.1 + q.x*3.0)*0.30 + sin(uv.x*ar*3.1 - t*1.6 + q.y*2.0)*0.14 + f*1.5;
  float band = 0.5 + 0.5*sin(swell*6.2831*0.85 - t*0.6);
  // Sharp contrast: mostly white, dark crests only
  float wave = smoothstep(0.55, 0.75, band);
  float crest = pow(band, 12.0) * 0.7;
  vec3 col = vec3(1.0);
  col -= vec3(0.08) * wave * 0.4;
  col -= vec3(1.0) * crest;
  vec2 vig = uv*2.0 - 1.0; col *= 1.0 - dot(vig,vig)*0.10;
  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, 1.0);
}`;

const SHADERS: Record<string, string> = { dark: DARK_FS, light: LIGHT_FS };
let currentMode: 'dark' | 'light' = 'dark';

interface Engine {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  program: WebGLProgram;
  uTime: WebGLUniformLocation;
  uRes: WebGLUniformLocation;
  t0: number;
  raf: number;
}

let engine: Engine | null = null;
let drawLoop: ((now: number) => void) | null = null;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
  return s;
}

function buildProgram(gl: WebGLRenderingContext, fsSrc: string): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  return prog;
}

function startEngine(canvas: HTMLCanvasElement): boolean {
  const gl = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
  if (!gl) return false;

  const prog = buildProgram(gl, DARK_FS);
  if (!prog) return false;

  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time')!;
  const uRes = gl.getUniformLocation(prog, 'u_res')!;

  const resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  window.addEventListener('resize', resize);
  resize();

  drawLoop = (now: number): void => {
    if (!engine) return;
    engine.gl.useProgram(engine.program);
    engine.gl.uniform1f(engine.uTime, (now - engine.t0) / 1000);
    engine.gl.uniform2f(engine.uRes, engine.canvas.width, engine.canvas.height);
    engine.gl.drawArrays(engine.gl.TRIANGLE_STRIP, 0, 4);
    engine.raf = requestAnimationFrame(drawLoop!);
  };

  engine = { gl, canvas, program: prog, uTime, uRes, t0: performance.now(), raf: 0 };
  return true;
}

function setShaderMode(mode: 'dark' | 'light'): void {
  if (!engine || mode === currentMode) return;
  currentMode = mode;
  const gl = engine.gl;
  const newProg = buildProgram(gl, SHADERS[mode]);
  if (!newProg) return;
  gl.deleteProgram(engine.program);
  engine.program = newProg;
  gl.useProgram(newProg);
  engine.uTime = gl.getUniformLocation(newProg, 'u_time')!;
  engine.uRes = gl.getUniformLocation(newProg, 'u_res')!;
  engine.t0 = performance.now();
  document.body.setAttribute('data-shader-mode', mode);
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

function boot(): void {
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null;
  if (!canvas || !startEngine(canvas)) return;
  initParallax(canvas);

  canvas.style.background = 'transparent';
  engine!.t0 = performance.now();
  engine!.raf = requestAnimationFrame(drawLoop!);
  document.body.setAttribute('data-shader', 'on');
  document.body.setAttribute('data-shader-mode', 'dark');

  (window as any).setShaderMode = setShaderMode;
}

if (document.readyState === 'loading') {
  window.addEventListener('load', boot);
} else {
  boot();
}
