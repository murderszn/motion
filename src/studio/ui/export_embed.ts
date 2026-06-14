// ─────────────────────────────────────────────────────────
//  Export Embed — Generates a self-contained fullscreen HTML splash page
// ─────────────────────────────────────────────────────────

import { P, PRESETS } from '../state';
import { FS, texLoaded, texObj } from '../webgl';
import { texts } from './text';
import { logToTerminal } from './terminal';
import { setStatusMsg } from './statusbar';

export function exportHtmlEmbed(): void {
  // Convert uploaded image to Base64 if loaded
  let base64Tex = '';
  if (texLoaded && texObj) {
    const thumb = document.getElementById('imgThumb') as HTMLImageElement | null;
    if (thumb && thumb.src) {
      try {
        const tempCv = document.createElement('canvas');
        tempCv.width = thumb.naturalWidth || thumb.width || 512;
        tempCv.height = thumb.naturalHeight || thumb.height || 512;
        const tempCtx = tempCv.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(thumb, 0, 0);
          base64Tex = tempCv.toDataURL('image/png');
        }
      } catch (e) {
        console.error('Failed to convert texture to Base64:', e);
      }
    }
  }

  // Generate HTML for text overlays
  const textsHtml = texts.map(t => {
    let style = `left: ${t.x * 100}%; top: ${t.y * 100}%; font-family: ${t.fontFamily}; color: ${t.color}; font-weight: ${t.bold ? 'bold' : '400'}; font-style: ${t.italic ? 'italic' : 'normal'}; opacity: ${t.opacity}; letter-spacing: ${t.tracking}em;`;
    
    if (t.align === 'left')       style += ' transform: translate(0%, -50%);';
    else if (t.align === 'right') style += ' transform: translate(-100%, -50%);';
    else                          style += ' transform: translate(-50%, -50%);';
    style += ` text-align: ${t.align};`;

    switch (t.effect) {
      case 'shadow':  style += ' text-shadow: 0 4px 15px rgba(0,0,0,0.6);'; break;
      case 'neon':    style += ` text-shadow: 0 0 10px ${t.color}, 0 0 20px ${t.color};`; break;
      case 'outline': style += ' -webkit-text-stroke: 1.5px #000000;'; break;
      case 'badge':
        style += ` background: ${t.bgColor}; padding: 4px 10px; border-radius: 4px;`; break;
      case 'glass':
        style += ' background: rgba(0,0,0,0.55); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);'; break;
    }

    return `<div class="text-elem" data-font-size="${t.fontSize}" style="${style}">${t.content || ''}</div>`;
  }).join('\n    ');

  // Build the self-contained HTML page
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lumen Splash Page — ${PRESETS[P.mode].full}</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    #bg-canvas {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
      will-change: transform;
      display: block;
    }
    #text-overlay {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      overflow: hidden;
    }
    .text-elem {
      position: absolute;
      pointer-events: auto;
      user-select: none;
      line-height: 1.2;
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;700;900&family=Outfit:wght@200;400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Fira+Code:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
  <canvas id="bg-canvas"></canvas>
  <div id="text-overlay">
    ${textsHtml}
  </div>

  <script>
    // WebGL setup
    const canvas = document.getElementById('bg-canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      document.body.innerHTML = '<p style="padding:40px;color:#fff;font-family:sans-serif">WebGL not supported.</p>';
    }

    // Shaders
    const VS = \`attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }\`;
    const FS = \`${FS.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;

    function compileShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = compileShader(gl.VERTEX_SHADER, VS);
    const fs = compileShader(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) {
      console.error('Shader compilation failed.');
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program linking failed: ' + gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    // Quad geometry
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms cache
    const U = {};
    const uniforms = [
      'u_res', 'u_phase', 'u_seed', 'u_mode',
      'u_speed', 'u_scale', 'u_density', 'u_distort', 'u_detail', 'u_grain',
      'u_c0', 'u_c1', 'u_c2', 'u_c3', 'u_texture', 'u_mix', 'u_pixel', 'u_invert'
    ];
    uniforms.forEach(n => { U[n] = gl.getUniformLocation(prog, n); });

    // Embedded Parameters
    const P = ${JSON.stringify(P, null, 2)};

    // Helper: Hex to RGB
    function hex2rgb(h) {
      return [
        parseInt(h.slice(1, 3), 16) / 255,
        parseInt(h.slice(3, 5), 16) / 255,
        parseInt(h.slice(5, 7), 16) / 255,
      ];
    }

    // Optional texture loading
    let texLoaded = false;
    let texObj = null;
    const base64Tex = "${base64Tex}";
    if (base64Tex) {
      const img = new Image();
      img.onload = () => {
        texObj = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texObj);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        texLoaded = true;
      };
      img.src = base64Tex;
    }

    // Resize
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      const overlay = document.getElementById('text-overlay');
      const h = overlay.offsetHeight || window.innerHeight;
      document.querySelectorAll('.text-elem').forEach(el => {
        const fs = parseFloat(el.dataset.fontSize);
        el.style.fontSize = (fs * h) + 'px';
      });
    }
    window.addEventListener('resize', resize);
    resize(); // Call synchronously to initialize sizing immediately

    // Loop
    const t0 = performance.now();
    function render(now) {
      const time = (now - t0) / 1000;
      const phase = (time / P.loop * Math.PI * 2) % (Math.PI * 2);

      gl.uniform2f(U.u_res, canvas.width, canvas.height);
      gl.uniform1f(U.u_phase, phase);
      gl.uniform1f(U.u_seed, (P.seed % 10000) * 0.6180339887 % 12.566);
      gl.uniform1i(U.u_mode, P.mode);
      gl.uniform1f(U.u_speed, P.speed);
      gl.uniform1f(U.u_scale, P.scale);
      gl.uniform1f(U.u_density, P.density);
      gl.uniform1f(U.u_distort, P.distort);
      gl.uniform1f(U.u_detail, P.detail);
      gl.uniform1f(U.u_grain, P.grain);
      gl.uniform1f(U.u_mix, P.mix);
      gl.uniform1f(U.u_pixel, P.pixel);
      gl.uniform1f(U.u_invert, P.invert || 0);
      gl.uniform3fv(U.u_c0, hex2rgb(P.colors[0]));
      gl.uniform3fv(U.u_c1, hex2rgb(P.colors[1]));
      gl.uniform3fv(U.u_c2, hex2rgb(P.colors[2]));
      gl.uniform3fv(U.u_c3, hex2rgb(P.colors[3]));

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texLoaded ? texObj : null);
      gl.uniform1i(U.u_texture, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  </script>
</body>
</html>`;

  // Trigger download of self-contained HTML file
  const blob = new Blob([html], { type: 'text/html' });
  const filename = 'lumen-splash-' + PRESETS[P.mode].id + '.html';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);

  logToTerminal('exported html splash page: ' + filename, 'ok');
  setStatusMsg('html saved');
}
