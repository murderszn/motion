// ─────────────────────────────────────────────────────────
//  Kinetic Typography Studio & Movie Reel Producer
// ─────────────────────────────────────────────────────────

import {
  drawImplode, drawShake, drawSkewReveal, drawBands,
  drawCurtain, drawSpinReveal, drawBackSlam
} from '../kinetic_animations';

interface KineticScene {
  id: string;
  preset: string;
  text: string;
  font: string;
  speed: number;
  scale: number;
  fontSize: number;
  duration: number;
  color1: string;
  color2: string;
  bgColor: string;
  transparentBg: boolean;
  videoBlob: Blob;
  videoUrl: string;
}

const $ = (id: string) => document.getElementById(id)!;

let scenes: KineticScene[] = [];
let selectedPreset: string | null = null;
let previewAnimId: number | null = null;
let previewCanvas: HTMLCanvasElement | null = null;
let previewCtx: CanvasRenderingContext2D | null = null;
let isRecording = false;

// Current editing state
const currentParams = {
  text: 'MOTION',
  font: 'Syne',
  speed: 1.0,
  scale: 1.0,
  fontSize: 64,
  duration: 3.0,
  color1: '#ffffff',
  color2: '#e03a3a',
  bgColor: '#0a0808',
  transparentBg: true,
};

export function initKineticStudio(): void {
  // 1. Inject studio panel and movie reel HTML if they don't exist
  injectHTML();

  // 2. Select preview canvas
  previewCanvas = $('kt-preview-canvas') as HTMLCanvasElement;
  if (previewCanvas) {
    previewCtx = previewCanvas.getContext('2d');
  }

  // 3. Bind listeners to all kinetic tiles in the page
  bindTileListeners();

  // 4. Bind panel control listeners
  bindControlListeners();

  // 5. Bind Movie Reel action listeners
  bindReelActionListeners();
}

function injectHTML(): void {
  const ktPage = $('mode-kinetic');
  if (!ktPage) return;

  // Pop-out Studio Panel
  if (!$('kt-studio-panel')) {
    const panel = document.createElement('div');
    panel.id = 'kt-studio-panel';
    panel.className = 'glass';
    panel.innerHTML = `
      <div class="kts-header">
        <span class="kts-title">kinetic studio</span>
        <span id="kts-badge" class="kts-preset-badge">slide</span>
        <button id="kts-close-btn" class="kts-close" title="Close Panel">✕</button>
      </div>
      <div class="kts-preview-wrap">
        <canvas id="kt-preview-canvas" width="600" height="400"></canvas>
      </div>
      <div class="kts-controls">
        <div class="kts-control-group">
          <label for="kt-input-text">Text Content</label>
          <input type="text" id="kt-input-text" value="MOTION" spellcheck="false" autocomplete="off">
        </div>
        
        <div class="kts-control-group">
          <label for="kt-select-font">Font Family</label>
          <select id="kt-select-font">
            <option value="Syne">Syne (Bold Display)</option>
            <option value="Anton">Anton (Punchy Sans)</option>
            <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
            <option value="Bebas Neue">Bebas Neue (Condensed Sans)</option>
            <option value="Inter">Inter (Clean UI)</option>
            <option value="JetBrains Mono">JetBrains Mono (Coding Mono)</option>
            <option value="Pacifico">Pacifico (Retro Script)</option>
          </select>
        </div>

        <div class="kts-control-group">
          <label>Colors</label>
          <div class="kts-color-pickers">
            <div class="kts-color-picker-item">
              <input type="color" id="kt-color1" value="#ffffff">
              <span>Primary</span>
            </div>
            <div class="kts-color-picker-item">
              <input type="color" id="kt-color2" value="#e03a3a">
              <span>Accent</span>
            </div>
          </div>
          <div class="kts-checkbox-group">
            <input type="checkbox" id="kt-trans-bg" checked>
            <label for="kt-trans-bg">Transparent Background</label>
          </div>
          <div class="kts-color-picker-item" id="kt-bg-color-wrap" style="display:none; margin-top: 6px;">
            <input type="color" id="kt-color-bg" value="#0a0808">
            <span>Background</span>
          </div>
        </div>

        <div class="kts-slider-item">
          <div class="kts-slider-header">
            <span>Font Size</span>
            <span id="kt-font-size-val" class="kts-slider-val">64px</span>
          </div>
          <input type="range" id="kt-font-size" min="24" max="120" step="1" value="64">
        </div>

        <div class="kts-slider-item">
          <div class="kts-slider-header">
            <span>Motion Speed</span>
            <span id="kt-speed-val" class="kts-slider-val">1.0x</span>
          </div>
          <input type="range" id="kt-speed" min="0.2" max="2.5" step="0.1" value="1.0">
        </div>

        <div class="kts-slider-item">
          <div class="kts-slider-header">
            <span>Motion Scale</span>
            <span id="kt-scale-val" class="kts-slider-val">1.0x</span>
          </div>
          <input type="range" id="kt-scale" min="0.1" max="2.5" step="0.1" value="1.0">
        </div>

        <div class="kts-slider-item">
          <div class="kts-slider-header">
            <span>Duration (Seconds)</span>
            <span id="kt-duration-val" class="kts-slider-val">3.0s</span>
          </div>
          <input type="range" id="kt-duration" min="1.0" max="6.0" step="0.5" value="3.0">
        </div>
      </div>
      <div class="kts-footer">
        <button id="kt-record-btn" class="primary">
          <span class="btn-icon">🎬</span>
          <span class="btn-text">Record & Add to Reel</span>
        </button>
      </div>
    `;
    ktPage.appendChild(panel);
  }

  // Movie Reel Bottom Bar
  if (!$('kt-movie-reel')) {
    const reel = document.createElement('div');
    reel.id = 'kt-movie-reel';
    reel.className = 'glass';
    reel.innerHTML = `
      <div class="ktr-info">
        <div class="ktr-title">
          <span>🎬</span>
          <span>Movie Reel</span>
        </div>
        <div id="ktr-meta" class="ktr-meta">0 scenes · 0.0s</div>
      </div>
      <div id="ktr-timeline" class="ktr-timeline">
        <div class="ktr-empty">Timeline empty. Select a motion treatment above to record a scene.</div>
      </div>
      <div class="ktr-actions">
        <button id="kt-play-reel-btn" disabled>
          <span>▶</span> Play Movie
        </button>
        <button id="kt-export-reel-btn" class="primary" disabled>
          <span>📥</span> Export Movie
        </button>
        <button id="kt-clear-reel-btn" disabled style="color: var(--accent);">
          <span>✕</span> Clear Reel
        </button>
      </div>
    `;
    ktPage.appendChild(reel);
  }

  // Player Modal for Movie playback
  if (!$('kt-player-modal')) {
    const modal = document.createElement('div');
    modal.id = 'kt-player-modal';
    modal.innerHTML = `
      <div class="kt-player-box">
        <div class="kt-player-header">
          <span class="kts-title">Movie Preview</span>
          <button id="kt-player-close" class="kts-close">✕</button>
        </div>
        <div class="kt-player-screen">
          <video id="kt-player-video" autoplay loop muted controls></video>
        </div>
        <div class="kt-player-footer">
          <button id="kt-player-ok" class="kts-close" style="padding: 6px 16px; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--bg);">Done</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Compiling Overlay
  if (!$('kt-compiler-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'kt-compiler-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:9999;color:#fff;font-family:\'JetBrains Mono\',monospace;';
    overlay.innerHTML = `
      <div style="text-align:center;padding:24px;background:var(--bg-alt);border:1px solid var(--line);border-radius:var(--r-lg);max-width:320px;width:90%;">
        <div style="font-size:13px;font-weight:700;margin-bottom:12px;letter-spacing:0.12em;text-transform:uppercase;">Compiling Movie...</div>
        <div id="kt-compile-progress-bar" style="width:100%;height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:8px;">
          <div id="kt-compile-progress-fill" style="width:0%;height:100%;background:var(--accent);transition:width 0.1s linear;"></div>
        </div>
        <div id="kt-compile-status" style="font-size:10px;color:var(--dim)">Rendering frame 0 / 0</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
}

function bindTileListeners(): void {
  const tiles = document.querySelectorAll('.kt-tile');
  tiles.forEach(tile => {
    // Add selectable styling
    tile.classList.add('selectable');

    tile.addEventListener('click', () => {
      // De-select previous
      document.querySelectorAll('.kt-tile').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');

      // Extract preset name
      const preset = tile.getAttribute('data-preset');
      if (preset) {
        openStudio(preset);
      }
    });
  });
}

function openStudio(preset: string): void {
  selectedPreset = preset;

  // Set header badge
  const badge = $('kts-badge');
  if (badge) badge.textContent = preset.replace('-', ' ');

  // Read current display values from settings/HTML
  const label = preset.replace('-', ' ');
  let defaultText = 'MOTION';
  
  // Custom defaults based on category
  if (['slide', 'punch', 'stagger', 'reveal', 'weight', 'figma', 'liquid', 'glitch', 'morph', 'refract', 'strobe', 'finale', 'aura', 'neon', 'typewriter', 'scanner', 'spring', 'implode', 'shake', 'skewReveal', 'bands', 'curtain', 'spinReveal', 'backSlam'].includes(preset)) {
    // Check if the tile has text in it
    const tile = document.querySelector(`.kt-tile[data-preset="${preset}"]`);
    if (tile) {
      const demoText = tile.querySelector('.kt-demo')?.textContent?.trim();
      if (demoText && demoText.length < 20) {
        defaultText = demoText;
      }
    }
  } else if (preset === 'bars') {
    defaultText = 'GROWTH';
  } else if (preset === 'counter') {
    defaultText = 'COUNT';
  } else if (preset === 'line') {
    defaultText = 'TREND';
  } else if (preset === 'donut') {
    defaultText = 'DONUT';
  }

  currentParams.text = defaultText;
  ($('kt-input-text') as HTMLInputElement).value = defaultText;

  // Open sidebar panel
  $('kt-studio-panel').classList.add('active');
  $('mode-kinetic').classList.add('panel-active');

  // Trigger animation loop
  startPreviewLoop();
}

function closeStudio(): void {
  $('kt-studio-panel').classList.remove('active');
  $('mode-kinetic').classList.remove('panel-active');
  document.querySelectorAll('.kt-tile').forEach(t => t.classList.remove('selected'));
  selectedPreset = null;
  stopPreviewLoop();
}

function bindControlListeners(): void {
  $('kts-close-btn').onclick = closeStudio;

  // Text input
  const textInput = $('kt-input-text') as HTMLInputElement;
  textInput.oninput = () => {
    currentParams.text = textInput.value || ' ';
  };

  // Font family
  const fontSelect = $('kt-select-font') as HTMLSelectElement;
  fontSelect.onchange = () => {
    currentParams.font = fontSelect.value;
  };

  // Colors
  const color1 = $('kt-color1') as HTMLInputElement;
  color1.oninput = () => { currentParams.color1 = color1.value; };

  const color2 = $('kt-color2') as HTMLInputElement;
  color2.oninput = () => { currentParams.color2 = color2.value; };

  const transBg = $('kt-trans-bg') as HTMLInputElement;
  transBg.onchange = () => {
    currentParams.transparentBg = transBg.checked;
    $('kt-bg-color-wrap').style.display = transBg.checked ? 'none' : 'flex';
  };

  const bgColor = $('kt-color-bg') as HTMLInputElement;
  bgColor.oninput = () => { currentParams.bgColor = bgColor.value; };

  // Font size slider
  const fontSizeSlider = $('kt-font-size') as HTMLInputElement;
  fontSizeSlider.oninput = () => {
    const val = parseInt(fontSizeSlider.value);
    currentParams.fontSize = val;
    $('kt-font-size-val').textContent = val + 'px';
  };

  // Speed slider
  const speedSlider = $('kt-speed') as HTMLInputElement;
  speedSlider.oninput = () => {
    const val = parseFloat(speedSlider.value);
    currentParams.speed = val;
    $('kt-speed-val').textContent = val.toFixed(1) + 'x';
  };

  // Scale slider
  const scaleSlider = $('kt-scale') as HTMLInputElement;
  scaleSlider.oninput = () => {
    const val = parseFloat(scaleSlider.value);
    currentParams.scale = val;
    $('kt-scale-val').textContent = val.toFixed(1) + 'x';
  };

  // Duration slider
  const durationSlider = $('kt-duration') as HTMLInputElement;
  durationSlider.oninput = () => {
    const val = parseFloat(durationSlider.value);
    currentParams.duration = val;
    $('kt-duration-val').textContent = val.toFixed(1) + 's';
  };

  // Record Button
  $('kt-record-btn').onclick = recordCurrentScene;
}

function startPreviewLoop(): void {
  stopPreviewLoop();

  let startTime = performance.now();

  function tick(now: number): void {
    if (!previewCtx || !previewCanvas) return;
    const elapsed = (now - startTime) / 1000;
    
    // Draw frame
    drawSceneOnCanvas(previewCtx, previewCanvas.width, previewCanvas.height, elapsed, selectedPreset || 'slide', currentParams);

    previewAnimId = requestAnimationFrame(tick);
  }

  previewAnimId = requestAnimationFrame(tick);
}

function stopPreviewLoop(): void {
  if (previewAnimId !== null) {
    cancelAnimationFrame(previewAnimId);
    previewAnimId = null;
  }
}

// ─────────────────────────────────────────────────────────
//  Canvas Presets Renderers
// ─────────────────────────────────────────────────────────

function drawSceneOnCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  preset: string,
  params: typeof currentParams
): void {
  // Clear / Background
  ctx.save();
  if (params.transparentBg) {
    ctx.clearRect(0, 0, w, h);
  } else {
    ctx.fillStyle = params.bgColor;
    ctx.fillRect(0, 0, w, h);
  }

  const cx = w / 2;
  const cy = h / 2;
  const text = params.text;
  const size = params.fontSize;
  const speed = params.speed;
  const scale = params.scale;

  // Set text font and alignment
  ctx.font = `800 ${size}px "${params.font}", sans-serif`;
  if (params.font === 'Playfair Display') {
    ctx.font = `italic 700 ${size}px "${params.font}", serif`;
  } else if (params.font === 'Pacifico') {
    ctx.font = `400 ${size}px "${params.font}", cursive`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const phase = t * speed * 2; // phase multiplier

  switch (preset) {
    case 'slide': {
      // Split text into characters and slide them vertically with offset delay
      const chars = text.split('');
      const charWidths = chars.map(c => ctx.measureText(c).width);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0);
      let curX = cx - totalWidth / 2;
      
      chars.forEach((c, idx) => {
        ctx.save();
        const p = (phase - idx * 0.15) % (Math.PI * 2);
        // Slide down, stay, slide up
        let yOffset = 0;
        let opacity = 1;
        const norm = (p < 0 ? p + Math.PI * 2 : p) / (Math.PI * 2); // 0 to 1
        
        if (norm < 0.1) {
          // Slide in from bottom
          const progress = norm / 0.1;
          yOffset = (1 - progress) * size * 0.8;
          opacity = progress;
        } else if (norm > 0.8) {
          // Slide out to top
          const progress = (norm - 0.8) / 0.2;
          yOffset = -progress * size * 0.8;
          opacity = 1 - progress;
        }
        
        ctx.fillStyle = params.color1;
        ctx.globalAlpha = opacity;
        ctx.fillText(c, curX + charWidths[idx] / 2, cy + yOffset * scale);
        ctx.restore();
        curX += charWidths[idx];
      });
      break;
    }

    case 'punch': {
      // Zoom scale quickly, bounce slightly, pause, fade out/scale down
      ctx.save();
      const p = phase % (Math.PI * 2);
      const norm = (p < 0 ? p + Math.PI * 2 : p) / (Math.PI * 2);
      let s = 0.2;
      let opacity = 0;

      if (norm < 0.15) {
        // Fast scale up with overshoot
        const progress = norm / 0.15;
        s = 0.2 + progress * 0.98; // overshoots to 1.18
        opacity = progress;
      } else if (norm < 0.25) {
        // Settle down to 1.0
        const progress = (norm - 0.15) / 0.10;
        s = 1.18 - progress * 0.18;
        opacity = 1;
      } else if (norm < 0.75) {
        // Hold
        s = 1.0;
        opacity = 1;
      } else {
        // Shrink and fade
        const progress = (norm - 0.75) / 0.25;
        s = 1.0 - progress * 0.8;
        opacity = 1 - progress;
      }

      ctx.translate(cx, cy);
      ctx.scale(s * scale, s * scale);
      ctx.fillStyle = params.color2;
      ctx.globalAlpha = opacity;
      ctx.fillText(text, 0, 0);
      ctx.restore();
      break;
    }

    case 'stagger': {
      // Letters fade in/out with poetic staggering
      const chars = text.split('');
      const charWidths = chars.map(c => ctx.measureText(c).width);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0);
      let curX = cx - totalWidth / 2;

      chars.forEach((c, idx) => {
        ctx.save();
        const p = (t * speed - idx * 0.25);
        const opacity = 0.15 + 0.85 * (Math.sin(p) * 0.5 + 0.5);
        
        ctx.fillStyle = params.color1;
        ctx.globalAlpha = opacity;
        ctx.fillText(c, curX + charWidths[idx] / 2, cy);
        ctx.restore();
        curX += charWidths[idx];
      });
      break;
    }

    case 'reveal': {
      // Text rises from a mask/box boundary
      ctx.save();
      const p = phase % (Math.PI * 2);
      const norm = (p < 0 ? p + Math.PI * 2 : p) / (Math.PI * 2);
      let yOffset = size * 1.2;

      if (norm < 0.2) {
        const progress = norm / 0.2;
        yOffset = (1 - progress) * size * 1.2;
      } else if (norm < 0.7) {
        yOffset = 0;
      } else if (norm < 0.9) {
        const progress = (norm - 0.7) / 0.2;
        yOffset = -progress * size * 1.2;
      } else {
        yOffset = -size * 1.2;
      }

      // Clip bounds
      ctx.beginPath();
      ctx.rect(cx - w/2, cy - size/1.5, w, size * 1.3);
      ctx.clip();

      ctx.fillStyle = params.color2;
      ctx.fillText(text, cx, cy + yOffset * scale);
      ctx.restore();
      break;
    }

    case 'weight': {
      // Smooth scaleX stretching to represent weight shifts
      ctx.save();
      const sX = 0.82 + 0.3 * (Math.sin(phase) * 0.5 + 0.5);
      const opacity = 0.7 + 0.3 * (Math.sin(phase) * 0.5 + 0.5);

      ctx.translate(cx, cy);
      ctx.scale(sX * scale, 1);
      ctx.fillStyle = params.color1;
      ctx.globalAlpha = opacity;
      ctx.fillText(text, 0, 0);
      ctx.restore();
      break;
    }

    case 'path': {
      // Waves letters vertically along a sine curve
      const chars = text.split('');
      const charWidths = chars.map(c => ctx.measureText(c).width);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0);
      let curX = cx - totalWidth / 2;

      // Draw path line underneath
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = params.color2;
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 2;
      for (let x = cx - totalWidth/2 - 20; x <= cx + totalWidth/2 + 20; x += 5) {
        const offsetIdx = (x - cx) / totalWidth;
        const y = cy + Math.sin(t * speed * 3.5 + offsetIdx * Math.PI) * scale * 24;
        if (x === cx - totalWidth/2 - 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      chars.forEach((c, idx) => {
        ctx.save();
        const letterX = curX + charWidths[idx] / 2;
        const offsetIdx = (letterX - cx) / totalWidth;
        const waveOffset = Math.sin(t * speed * 3.5 + offsetIdx * Math.PI) * scale * 24;
        const rot = Math.cos(t * speed * 3.5 + offsetIdx * Math.PI) * scale * 0.25;

        ctx.translate(letterX, cy + waveOffset);
        ctx.rotate(rot);
        ctx.fillStyle = params.color1;
        ctx.fillText(c, 0, 0);
        ctx.restore();
        curX += charWidths[idx];
      });
      break;
    }

    case 'figma': {
      // Blur and slide horizontally
      ctx.save();
      const p = phase % (Math.PI * 2);
      const norm = (p < 0 ? p + Math.PI * 2 : p) / (Math.PI * 2);
      let xOffset = -50;
      let opacity = 0;
      let blur = 8;

      if (norm < 0.3) {
        const progress = norm / 0.3;
        xOffset = -50 + progress * 50;
        opacity = progress;
        blur = 8 * (1 - progress);
      } else if (norm < 0.7) {
        xOffset = 0;
        opacity = 1;
        blur = 0;
      } else if (norm < 1.0) {
        const progress = (norm - 0.7) / 0.3;
        xOffset = progress * 50;
        opacity = 1 - progress;
        blur = 8 * progress;
      }

      ctx.fillStyle = params.color1;
      ctx.globalAlpha = opacity;
      if (blur > 0.5) {
        ctx.filter = `blur(${blur}px)`;
      }
      ctx.fillText(text, cx + xOffset * scale, cy);
      ctx.restore();
      break;
    }

    case 'liquid': {
      // Fluid letters wave vertically
      const chars = text.split('');
      const charWidths = chars.map(c => ctx.measureText(c).width);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0);
      let curX = cx - totalWidth / 2;

      chars.forEach((c, idx) => {
        ctx.save();
        const p = t * speed * 4.0 + idx * 0.45;
        const wave = Math.sin(p) * scale * 15;
        
        ctx.fillStyle = params.color2;
        ctx.fillText(c, curX + charWidths[idx] / 2, cy + wave);
        ctx.restore();
        curX += charWidths[idx];
      });
      break;
    }

    case 'glitch': {
      // Chromatic horizontal split glitches
      ctx.save();
      const glitchActive = (Math.sin(t * 12.0) > 0.75);
      const offset = glitchActive ? scale * 8 * Math.random() : 0;
      
      // Draw red cyan glitch channels
      ctx.save();
      ctx.fillStyle = params.color2; // Accent color
      ctx.fillText(text, cx - offset, cy + (glitchActive ? (Math.random() - 0.5)*4 : 0));
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#00ffff';
      ctx.globalCompositeOperation = 'screen';
      ctx.fillText(text, cx + offset, cy + (glitchActive ? (Math.random() - 0.5)*4 : 0));
      ctx.restore();

      ctx.save();
      ctx.fillStyle = params.color1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillText(text, cx, cy);
      ctx.restore();

      // Draw horizontal strip glitch slices
      if (glitchActive && Math.random() > 0.3) {
        const sliceY = Math.random() * h;
        const sliceH = 10 + Math.random() * 25;
        const sliceShift = (Math.random() - 0.5) * 40 * scale;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, sliceY, w, sliceH);
        ctx.clip();
        ctx.fillStyle = params.bgColor;
        ctx.fillRect(0, sliceY, w, sliceH);
        ctx.fillStyle = params.color1;
        ctx.fillText(text, cx + sliceShift, cy);
        ctx.restore();
      }

      ctx.restore();
      break;
    }

    case 'morph': {
      // Blur and track tracking-out
      ctx.save();
      const wave = Math.sin(t * speed * 2.0) * 0.5 + 0.5; // 0 to 1
      const tracking = wave * scale * 0.35; // tracking em units
      const blur = wave * 6;

      const chars = text.split('');
      const charWidths = chars.map(c => ctx.measureText(c).width);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * tracking * size;
      let curX = cx - totalWidth / 2;

      if (blur > 0.5) {
        ctx.filter = `blur(${blur}px)`;
      }

      chars.forEach((c, idx) => {
        ctx.fillStyle = params.color1;
        ctx.fillText(c, curX + charWidths[idx] / 2, cy);
        curX += charWidths[idx] + tracking * size;
      });
      ctx.restore();
      break;
    }

    case 'refract': {
      // Skew/transform text
      ctx.save();
      const p = Math.sin(t * speed * 2.5);
      const skew = p * scale * 0.25;
      const s = 1.0 + Math.abs(p) * scale * 0.08;

      ctx.translate(cx, cy);
      ctx.transform(1, 0, skew, 1, 0, 0);
      ctx.scale(s, s);
      ctx.fillStyle = params.color2;
      ctx.fillText(text, 0, 0);
      ctx.restore();
      break;
    }

    case 'strobe': {
      // Alternating visibility strobe
      ctx.save();
      const strobeOn = (Math.floor(t * speed * 8) % 2 === 0);
      
      ctx.fillStyle = params.color2;
      ctx.globalAlpha = strobeOn ? 1.0 : 0.12;
      ctx.fillText(text, cx, cy);
      ctx.restore();
      break;
    }

    case 'wipe': {
      // Sliding gradient wipe across text fill
      ctx.save();
      const gradX = (t * speed * 0.5) % 2 - 1.0; // -1 to 1
      const g = ctx.createLinearGradient(cx - w/3, 0, cx + w/3, 0);
      g.addColorStop(0, params.color1);
      g.addColorStop(Math.max(0, Math.min(1, gradX + 0.3)), params.color1);
      g.addColorStop(Math.max(0, Math.min(1, gradX + 0.5)), params.color2);
      g.addColorStop(Math.max(0, Math.min(1, gradX + 0.7)), params.color1);
      g.addColorStop(1, params.color1);

      ctx.fillStyle = g;
      ctx.fillText(text, cx, cy);
      ctx.restore();
      break;
    }

    case 'finale': {
      // Scale down and disperse letters
      ctx.save();
      const p = phase % (Math.PI * 2);
      const norm = (p < 0 ? p + Math.PI * 2 : p) / (Math.PI * 2);
      let s = 1.6;
      let tracking = 0.4;
      let opacity = 0;

      if (norm < 0.35) {
        // Shrink down and gather
        const progress = norm / 0.35;
        s = 1.6 - progress * 0.6;
        tracking = 0.4 * (1 - progress);
        opacity = progress;
      } else if (norm < 0.75) {
        s = 1.0;
        tracking = 0;
        opacity = 1;
      } else {
        // Zoom smaller and disperse
        const progress = (norm - 0.75) / 0.25;
        s = 1.0 - progress * 0.15;
        tracking = progress * 0.2;
        opacity = 1 - progress;
      }

      const chars = text.split('');
      const charWidths = chars.map(c => ctx.measureText(c).width);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * tracking * size * scale;
      let curX = cx - totalWidth / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(s, s);
      ctx.translate(-cx, -cy);
      
      chars.forEach((c, idx) => {
        ctx.fillStyle = params.color2;
        ctx.globalAlpha = opacity;
        ctx.fillText(c, curX + charWidths[idx] / 2, cy);
        curX += charWidths[idx] + tracking * size * scale;
      });
      ctx.restore();
      
      ctx.restore();
      break;
    }

    case 'aura': {
      // Slow pulsing letter spacing expansion and soft glow
      ctx.save();
      const wave = Math.sin(t * speed * 1.5) * 0.5 + 0.5; // 0 to 1
      const tracking = (0.05 + wave * 0.32) * scale;
      
      const chars = text.split('');
      const charWidths = chars.map(c => ctx.measureText(c).width);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * tracking * size;
      let curX = cx - totalWidth / 2;

      ctx.shadowColor = params.color2;
      ctx.shadowBlur = wave * 18 * scale;
      ctx.fillStyle = params.color1;
      ctx.globalAlpha = 0.55 + wave * 0.45;

      chars.forEach((c, idx) => {
        ctx.fillText(c, curX + charWidths[idx] / 2, cy);
        curX += charWidths[idx] + tracking * size;
      });
      ctx.restore();
      break;
    }

    case 'neon': {
      // Glow and flicker
      ctx.save();
      const rand = Math.random();
      const flicker = (rand > 0.98 || (rand > 0.7 && rand < 0.72));
      const opacity = flicker ? 0.25 : 1.0;
      const glowAmt = flicker ? 3 : 20 * scale;

      ctx.shadowColor = params.color2;
      ctx.shadowBlur = glowAmt;
      ctx.fillStyle = params.color1;
      ctx.globalAlpha = opacity;
      ctx.fillText(text, cx, cy);
      
      // Secondary highlight
      ctx.globalAlpha = opacity * 0.6;
      ctx.fillStyle = params.color2;
      ctx.fillText(text, cx, cy);

      ctx.restore();
      break;
    }

    case 'typewriter': {
      // Show letters typing one by one
      ctx.save();
      const totalChars = text.length;
      const charsPerSec = 5.0 * speed;
      const typedCount = Math.floor(t * charsPerSec) % (totalChars + 6); // Pause at end
      const visibleCount = Math.min(totalChars, typedCount);
      const typedText = text.substring(0, visibleCount);

      // Blinking cursor
      const cursorOn = Math.floor(t * 3) % 2 === 0;
      const displayText = typedText + (cursorOn && typedCount < totalChars + 3 ? '|' : '');

      ctx.fillStyle = params.color1;
      ctx.fillText(displayText, cx, cy);
      ctx.restore();
      break;
    }

    case 'scanner': {
      // Glow scanner line that sweeps vertically and highlights text
      ctx.save();
      const scanY = (t * speed * 0.4) % 1.0; // 0 to 1
      const py = scanY * h;

      // Draw normal text
      ctx.fillStyle = params.color1;
      ctx.globalAlpha = 0.35;
      ctx.fillText(text, cx, cy);

      // Draw bright scanner highlight inside a clip
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, py - 30 * scale, w, 60 * scale);
      ctx.clip();
      ctx.fillStyle = params.color2;
      ctx.globalAlpha = 1.0;
      ctx.shadowColor = params.color2;
      ctx.shadowBlur = 18 * scale;
      ctx.fillText(text, cx, cy);
      ctx.restore();

      // Scanline laser bar
      ctx.beginPath();
      const scanGrad = ctx.createLinearGradient(0, py - 2, 0, py + 2);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(0.5, params.color2);
      scanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, py - 2, w, 4);
      
      ctx.restore();
      break;
    }

    case 'spring': {
      // Bounce text using a spring formula
      ctx.save();
      const bounce = Math.abs(Math.sin(t * speed * 3.0));
      const springH = 1 + bounce * 0.28 * scale;
      const springW = 1 - bounce * 0.12 * scale;
      const bounceY = bounce * -40 * scale;

      ctx.translate(cx, cy + size / 2); // Rotate/scale from bottom center
      ctx.scale(springW, springH);
      ctx.translate(-cx, -cy - size / 2 + bounceY);

      ctx.fillStyle = params.color1;
      ctx.fillText(text, cx, cy);
      ctx.restore();
      break;
    }

    // DATA VISUALIZATIONS
    case 'bars': {
      ctx.save();
      const barCount = 5;
      const barW = 32 * scale;
      const gap = 16 * scale;
      const totalW = barCount * barW + (barCount - 1) * gap;
      let startX = cx - totalW / 2;

      for (let i = 0; i < barCount; i++) {
        const p = t * speed * 2.5 + i * 0.6;
        const bounce = Math.sin(p) * 0.45 + 0.55; // 0.1 to 1.0
        const barH = 140 * bounce * scale;

        const g = ctx.createLinearGradient(0, cy + 70 * scale, 0, cy + 70 * scale - barH);
        g.addColorStop(0, params.color2);
        g.addColorStop(1, params.color1);

        ctx.fillStyle = g;
        // Rounded bar top
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(startX, cy + 70 * scale - barH, barW, barH, [6, 6, 0, 0]);
        } else {
          ctx.rect(startX, cy + 70 * scale - barH, barW, barH);
        }
        ctx.fill();
        startX += barW + gap;
      }
      ctx.restore();
      break;
    }

    case 'counter': {
      ctx.save();
      const p = (t * speed * 0.25) % 1.0;
      const count = Math.floor(p * 100);
      
      ctx.font = `800 ${size * 1.3}px "${params.font}", sans-serif`;
      ctx.fillStyle = params.color1;
      ctx.fillText(`${count}%`, cx, cy);
      
      // Label text
      ctx.font = `600 12px "JetBrains Mono", monospace`;
      ctx.fillStyle = params.color2;
      ctx.fillText(text, cx, cy + size * 0.8);
      ctx.restore();
      break;
    }

    case 'line': {
      ctx.save();
      const padding = 60 * scale;
      const graphW = w - padding * 2;
      const graphH = h / 2.5;
      const points = 6;
      const step = graphW / (points - 1);
      
      const drawProgress = Math.min(1.0, (t * speed * 0.35) % 1.2); // sweep draw
      
      // Create node values based on index
      const getVal = (i: number) => {
        const freq = 0.5 + i * 0.4;
        return cy + Math.sin(freq + t * speed) * graphH * 0.4;
      };

      // Draw gridlines
      ctx.strokeStyle = params.color1;
      ctx.globalAlpha = 0.08;
      ctx.lineWidth = 1;
      for (let y = cy - graphH/2; y <= cy + graphH/2; y += 30 * scale) {
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding, y);
        ctx.stroke();
      }

      // Draw trend line
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.strokeStyle = params.color2;
      ctx.lineWidth = 4 * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let lastX = padding;
      let lastY = getVal(0);
      ctx.moveTo(lastX, lastY);

      for (let i = 1; i < points; i++) {
        const curX = padding + i * step;
        const curY = getVal(i);
        const segmentEnd = (i / (points - 1));

        if (drawProgress >= segmentEnd) {
          ctx.lineTo(curX, curY);
        } else {
          // Interpolate last segment drawing
          const prevSegment = ((i - 1) / (points - 1));
          const localProg = (drawProgress - prevSegment) / (segmentEnd - prevSegment);
          if (localProg > 0) {
            const ix = lastX + (curX - lastX) * localProg;
            const iy = lastY + (curY - lastY) * localProg;
            ctx.lineTo(ix, iy);
          }
          break;
        }
        lastX = curX;
        lastY = curY;
      }
      ctx.stroke();

      // Draw circles at completed nodes
      for (let i = 0; i < points; i++) {
        const curX = padding + i * step;
        const curY = getVal(i);
        if (drawProgress >= (i / (points - 1))) {
          ctx.beginPath();
          ctx.arc(curX, curY, 6 * scale, 0, Math.PI * 2);
          ctx.fillStyle = params.color1;
          ctx.fill();
          ctx.strokeStyle = params.color2;
          ctx.lineWidth = 2 * scale;
          ctx.stroke();
        }
      }
      
      // Label text
      ctx.font = `700 13px "JetBrains Mono", monospace`;
      ctx.fillStyle = params.color1;
      ctx.fillText(text, cx, cy - graphH/2 - 20);

      ctx.restore();
      break;
    }

    case 'donut': {
      ctx.save();
      const r = 60 * scale;
      const progress = Math.min(1.0, (t * speed * 0.3) % 1.25);

      // Track circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = params.color1;
      ctx.globalAlpha = 0.08;
      ctx.lineWidth = 14 * scale;
      ctx.stroke();

      // Completion fill
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + progress * Math.PI * 2);
      ctx.strokeStyle = params.color2;
      ctx.lineWidth = 14 * scale;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Percentage label inside
      ctx.font = `800 ${size * 0.8}px "${params.font}", sans-serif`;
      ctx.fillStyle = params.color1;
      ctx.fillText(`${Math.floor(progress * 100)}`, cx, cy - 4 * scale);

      ctx.font = `600 9px "JetBrains Mono", monospace`;
      ctx.fillStyle = params.color2;
      ctx.fillText(text, cx, cy + size * 0.4);

      ctx.restore();
      break;
    }

    case 'implode':
      drawImplode(ctx, w, h, t, params);
      break;
    case 'shake':
      drawShake(ctx, w, h, t, params);
      break;
    case 'skewReveal':
      drawSkewReveal(ctx, w, h, t, params);
      break;
    case 'bands':
      drawBands(ctx, w, h, t, params);
      break;
    case 'curtain':
      drawCurtain(ctx, w, h, t, params);
      break;
    case 'spinReveal':
      drawSpinReveal(ctx, w, h, t, params);
      break;
    case 'backSlam':
      drawBackSlam(ctx, w, h, t, params);
      break;
    default: {
      ctx.fillStyle = params.color1;
      ctx.fillText(text, cx, cy);
      break;
    }
  }

  ctx.restore();
}

// ─────────────────────────────────────────────────────────
//  Media Recording Scene Logic
// ─────────────────────────────────────────────────────────

async function recordCurrentScene(): Promise<void> {
  if (isRecording || !selectedPreset) return;
  isRecording = true;

  const recordBtn = $('kt-record-btn') as HTMLButtonElement;
  recordBtn.disabled = true;
  recordBtn.querySelector('.btn-text')!.textContent = 'Recording Scene...';
  
  // Set up offscreen capture canvas
  const canvasW = 600;
  const canvasH = 400;
  const captureCanvas = document.createElement('canvas');
  captureCanvas.width = canvasW;
  captureCanvas.height = canvasH;
  const ctx = captureCanvas.getContext('2d')!;

  // Detect mime type
  const mimes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  let supportedMime = 'video/webm';
  for (const m of mimes) {
    if (MediaRecorder.isTypeSupported(m)) { supportedMime = m; break; }
  }

  const stream = captureCanvas.captureStream(30);
  const chunks: Blob[] = [];
  const rec = new MediaRecorder(stream, { mimeType: supportedMime, videoBitsPerSecond: 5000000 });
  
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  
  const totalDuration = currentParams.duration;
  const fps = 30;
  const totalFrames = totalDuration * fps;
  let currentFrame = 0;

  return new Promise<void>((resolve) => {
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: supportedMime.split(';')[0] });
      const videoUrl = URL.createObjectURL(blob);
      
      const newScene: KineticScene = {
        id: Math.random().toString(36).substring(2, 9),
        preset: selectedPreset!,
        text: currentParams.text,
        font: currentParams.font,
        speed: currentParams.speed,
        scale: currentParams.scale,
        fontSize: currentParams.fontSize,
        duration: currentParams.duration,
        color1: currentParams.color1,
        color2: currentParams.color2,
        bgColor: currentParams.bgColor,
        transparentBg: currentParams.transparentBg,
        videoBlob: blob,
        videoUrl: videoUrl,
      };

      scenes.push(newScene);
      renderTimeline();
      
      // Restore record button state
      recordBtn.disabled = false;
      recordBtn.querySelector('.btn-text')!.textContent = 'Record & Add to Reel';
      isRecording = false;

      // Close studio popout
      closeStudio();
      resolve();
    };

    rec.start();

    // Loop drawing frame-by-frame
    function drawNextFrame(): void {
      if (currentFrame >= totalFrames) {
        rec.stop();
        return;
      }
      
      const t = currentFrame / fps;
      drawSceneOnCanvas(ctx, canvasW, canvasH, t, selectedPreset!, currentParams);
      
      currentFrame++;
      // Wait for next frame tick
      setTimeout(drawNextFrame, 1000 / fps);
    }

    drawNextFrame();
  });
}

// ─────────────────────────────────────────────────────────
//  Timeline rendering & management
// ─────────────────────────────────────────────────────────

function renderTimeline(): void {
  const container = $('ktr-timeline');
  if (!container) return;

  if (scenes.length === 0) {
    container.innerHTML = `<div class="ktr-empty">Timeline empty. Select a motion treatment above to record a scene.</div>`;
    // Update labels and disable actions
    $('ktr-meta').textContent = '0 scenes · 0.0s';
    ($('kt-play-reel-btn') as HTMLButtonElement).disabled = true;
    ($('kt-export-reel-btn') as HTMLButtonElement).disabled = true;
    ($('kt-clear-reel-btn') as HTMLButtonElement).disabled = true;
    return;
  }

  // Calculate stats
  const totalDuration = scenes.reduce((a, s) => a + s.duration, 0);
  $('ktr-meta').textContent = `${scenes.length} scene${scenes.length > 1 ? 's' : ''} · ${totalDuration.toFixed(1)}s`;
  
  // Enable buttons
  ($('kt-play-reel-btn') as HTMLButtonElement).disabled = false;
  ($('kt-export-reel-btn') as HTMLButtonElement).disabled = false;
  ($('kt-clear-reel-btn') as HTMLButtonElement).disabled = false;

  container.innerHTML = '';
  scenes.forEach((scene, index) => {
    const card = document.createElement('div');
    card.className = 'ktr-card';
    card.innerHTML = `
      <div class="ktr-card-num">#${index + 1}</div>
      <div class="ktr-card-preview">
        <video src="${scene.videoUrl}" autoplay loop muted playsinline></video>
      </div>
      <div class="ktr-card-info">
        <div class="ktr-card-title">${scene.preset.replace('-', ' ')}</div>
        <div class="ktr-card-sub">"${scene.text}" · ${scene.duration.toFixed(1)}s</div>
      </div>
      <div class="ktr-card-actions">
        <button class="ktr-card-action-btn move-up" title="Move Up" ${index === 0 ? 'disabled' : ''}>▲</button>
        <button class="ktr-card-action-btn move-down" title="Move Down" ${index === scenes.length - 1 ? 'disabled' : ''}>▼</button>
        <button class="ktr-card-action-btn delete-card" title="Delete Scene" style="color:var(--accent);">✕</button>
      </div>
    `;

    // Bind action events inside timeline
    const deleteBtn = card.querySelector('.delete-card') as HTMLButtonElement;
    if (deleteBtn) {
      deleteBtn.onclick = (e: MouseEvent) => {
        e.stopPropagation();
        deleteScene(index);
      };
    }

    const upBtn = card.querySelector('.move-up') as HTMLButtonElement;
    if (upBtn && index > 0) {
      upBtn.onclick = (e: MouseEvent) => {
        e.stopPropagation();
        swapScenes(index, index - 1);
      };
    }

    const downBtn = card.querySelector('.move-down') as HTMLButtonElement;
    if (downBtn && index < scenes.length - 1) {
      downBtn.onclick = (e: MouseEvent) => {
        e.stopPropagation();
        swapScenes(index, index + 1);
      };
    }

    container.appendChild(card);
  });
}

function deleteScene(index: number): void {
  const sc = scenes[index];
  if (sc.videoUrl) {
    URL.revokeObjectURL(sc.videoUrl);
  }
  scenes.splice(index, 1);
  renderTimeline();
}

function swapScenes(idxA: number, idxB: number): void {
  const temp = scenes[idxA];
  scenes[idxA] = scenes[idxB];
  scenes[idxB] = temp;
  renderTimeline();
}

function clearReel(): void {
  scenes.forEach(sc => {
    if (sc.videoUrl) URL.revokeObjectURL(sc.videoUrl);
  });
  scenes = [];
  renderTimeline();
}

// ─────────────────────────────────────────────────────────
//  Movie Player & Final Video Exporter
// ─────────────────────────────────────────────────────────

function bindReelActionListeners(): void {
  $('kt-clear-reel-btn').onclick = clearReel;

  // Play Movie
  $('kt-play-reel-btn').onclick = playFullMovie;
  $('kt-player-close').onclick = closePlayer;
  $('kt-player-ok').onclick = closePlayer;

  // Export Movie
  $('kt-export-reel-btn').onclick = exportFullMovie;
}

async function playFullMovie(): Promise<void> {
  if (scenes.length === 0) return;

  const modal = $('kt-player-modal');
  const video = $('kt-player-video') as HTMLVideoElement;

  // Since merging Blobs directly is complex in pure browser without loading extra tools,
  // we compile them programmatically via Canvas into a single Blob,
  // then set it as the video source. This guarantees sequential playback!
  modal.classList.add('active');

  const compiledBlob = await compileReelToBlob();
  if (compiledBlob) {
    const playUrl = URL.createObjectURL(compiledBlob);
    video.src = playUrl;
    video.play();

    // Free resources when closed
    modal.addEventListener('close-player-cleanup', () => {
      URL.revokeObjectURL(playUrl);
      video.src = '';
    }, { once: true });
  } else {
    closePlayer();
  }
}

function closePlayer(): void {
  const modal = $('kt-player-modal');
  modal.classList.remove('active');
  modal.dispatchEvent(new CustomEvent('close-player-cleanup'));
}

async function compileReelToBlob(): Promise<Blob | null> {
  if (scenes.length === 0) return null;

  // Render specifications
  const W = 1080;
  const H = 1080; // Let's make it a high quality 1:1 square video
  const compileCanvas = document.createElement('canvas');
  compileCanvas.width = W;
  compileCanvas.height = H;
  const ctx = compileCanvas.getContext('2d')!;

  const mimes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  let supportedMime = 'video/webm';
  for (const m of mimes) {
    if (MediaRecorder.isTypeSupported(m)) { supportedMime = m; break; }
  }

  const stream = compileCanvas.captureStream(30);
  const chunks: Blob[] = [];
  const rec = new MediaRecorder(stream, { mimeType: supportedMime, videoBitsPerSecond: 8000000 });

  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

  // Calculate total compiled frames
  const fps = 30;
  const sequence: Array<{ scene: KineticScene; frameCount: number }> = scenes.map(s => ({
    scene: s,
    frameCount: Math.round(s.duration * fps),
  }));

  const totalFrames = sequence.reduce((sum, s) => sum + s.frameCount, 0);
  let globalFrame = 0;

  // Show compiler overlay
  const overlay = $('kt-compiler-overlay');
  const progressFill = $('kt-compile-progress-fill');
  const statusLabel = $('kt-compile-status');

  overlay.style.display = 'flex';

  return new Promise<Blob | null>((resolve) => {
    rec.onstop = () => {
      overlay.style.display = 'none';
      if (chunks.length) {
        resolve(new Blob(chunks, { type: supportedMime.split(';')[0] }));
      } else {
        resolve(null);
      }
    };

    rec.start();

    function renderStep(): void {
      if (globalFrame >= totalFrames) {
        rec.stop();
        return;
      }

      // Find current scene inside sequence
      let accumulated = 0;
      let targetSeq = sequence[0];
      for (const item of sequence) {
        if (globalFrame < accumulated + item.frameCount) {
          targetSeq = item;
          break;
        }
        accumulated += item.frameCount;
      }

      // Calculate local scene time
      const localFrame = globalFrame - accumulated;
      const t = localFrame / fps;

      // Draw local scene on compileCanvas
      // Construct a currentParams matching this scene's config
      const sceneParams = {
        text: targetSeq.scene.text,
        font: targetSeq.scene.font,
        speed: targetSeq.scene.speed,
        scale: targetSeq.scene.scale,
        fontSize: targetSeq.scene.fontSize * (W / 600), // Scale font size to compile resolution
        duration: targetSeq.scene.duration,
        color1: targetSeq.scene.color1,
        color2: targetSeq.scene.color2,
        bgColor: targetSeq.scene.bgColor,
        transparentBg: targetSeq.scene.transparentBg,
      };

      drawSceneOnCanvas(ctx, W, H, t, targetSeq.scene.preset, sceneParams);

      // Update progress UI
      const percent = (globalFrame / totalFrames) * 100;
      progressFill.style.width = `${percent}%`;
      statusLabel.textContent = `Rendering frame ${globalFrame + 1} / ${totalFrames}`;

      globalFrame++;
      // Wait for next tick
      setTimeout(renderStep, 1000 / fps);
    }

    renderStep();
  });
}

async function exportFullMovie(): Promise<void> {
  const blob = await compileReelToBlob();
  if (!blob) return;

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `motion-movie-${Math.floor(Date.now() / 1000)}.webm`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
