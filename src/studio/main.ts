// ─────────────────────────────────────────────────────────
//  studio/main.ts — entry point, wires everything together
// ─────────────────────────────────────────────────────────

import { P, PALETTES, PRESETS } from './state';
import type { SliderKey } from './types';
import { FS, initWebGL, loadTexture, clearTexture } from './webgl';
import { startRenderLoop, togglePause } from './render';
import { initPresets, applyPresetUI } from './ui/presets';
import { initSeed, setSeed } from './ui/seed';
import { initPalette, setPalette } from './ui/palette';
import { initSliders, setSlider } from './ui/sliders';
import { initSizes, applySizeUI } from './ui/sizes';
import { initTextControls, renderTextOverlay, texts } from './ui/text';
import { initExport, exportPNG } from './ui/export';
import { initTerminal, initResizeDragHandle, logToTerminal } from './ui/terminal';
import { initSidebar } from './ui/sidebar';
import { initStatusBar, setStatusMode, setStatusSeed } from './ui/statusbar';
import { initShaderEditor } from './ui/shader_editor';
import { initKeyboard } from './ui/keyboard';
import { initCommandPalette } from './ui/command_palette';
import { parseUrlParams, copyStateToClipboard, pasteStateFromClipboard, copyShareLink } from './ui/url_api';
import { exportHtmlEmbed } from './ui/export_embed';

const $ = (id: string): HTMLElement => document.getElementById(id)!;

// ── Helpers ──────────────────────────────────────────────

function downloadBlob(blob: Blob, name: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// ── Randomize ────────────────────────────────────────────

function randomize(): void {
  setSeed(Math.floor(Math.random() * 10000), setStatusSeed);
  setPalette(PALETTES[Math.floor(Math.random() * PALETTES.length)]);
  setSlider('speed',   0.25 + Math.random() * 0.6);
  setSlider('scale',   0.20 + Math.random() * 0.7);
  setSlider('density', 0.25 + Math.random() * 0.65);
  setSlider('distort', 0.20 + Math.random() * 0.7);
  setSlider('detail',  0.25 + Math.random() * 0.6);
  setSlider('grain',   Math.random() * 0.5);
  ($('mixRng') as HTMLInputElement).value = '0'; P.mix = 0; $('mixVal').textContent = '0%';
  ($('pixelRng') as HTMLInputElement).value = '0'; P.pixel = 0; $('pixelVal').textContent = '0%';
  logToTerminal('randomized all parameters', 'ok');
}

// ── Project save / load ──────────────────────────────────

function saveProject(): void {
  // FS is imported at the top and reflects the live-edited source if compileNewFS was called
  const project = { version: '1.0.0', params: P, texts: [...texts], shader: FS };
  const blob = new Blob([JSON.stringify(project, null, 4)], { type: 'application/json' });
  const name = 'lumen-project-' + String(P.seed).padStart(4, '0') + '.lumen';
  downloadBlob(blob, name);
  logToTerminal('project saved: ' + name, 'ok');
}

function loadProject(file: File): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const project = JSON.parse((e.target as FileReader).result as string);
      if (!project.params || !project.texts) throw new Error('Invalid project file format');
      Object.assign(P, project.params);
      // Restore texts array in-place
      texts.splice(0, texts.length, ...project.texts);

      setSeed(P.seed, setStatusSeed);
      setPalette(P.colors);
      (['speed', 'scale', 'density', 'distort', 'detail', 'grain'] as SliderKey[]).forEach(id => {
        if (P[id] !== undefined) setSlider(id, P[id]);
      });
      applyPresetUI();
      setStatusMode(PRESETS[P.mode].full);
      applySizeUI();
      ($('loop') as HTMLInputElement).value = String(P.loop);
      $('loopVal').textContent = P.loop.toFixed(1) + 's';
      if (P.mix !== undefined) {
        ($('mixRng') as HTMLInputElement).value = String(Math.round(P.mix * 100));
        $('mixVal').textContent = Math.round(P.mix * 100) + '%';
      }
      if (P.pixel !== undefined) {
        ($('pixelRng') as HTMLInputElement).value = String(Math.round(P.pixel * 100));
        $('pixelVal').textContent = Math.round(P.pixel * 100) + '%';
      }
      renderTextOverlay();
      logToTerminal('project loaded: ' + file.name, 'ok');
    } catch (err) {
      logToTerminal('failed to load project: ' + (err instanceof Error ? err.message : String(err)), 'err');
    }
  };
  reader.readAsText(file);
}

// ── Bootstrap ────────────────────────────────────────────

(function init(): void {
  let lastImgUrl: string | null = null;
  let lastViewerUrl: string | null = null;

  // WebGL
  initWebGL($('c') as HTMLCanvasElement);

  // Parse URL parameters to set up initial state
  parseUrlParams();

  // UI modules
  initPresets(name => setStatusMode(name));
  initSeed(val => setStatusSeed(val));
  initPalette();
  initSliders();
  initSizes(() => renderTextOverlay());
  initTextControls();
  initStatusBar();

  // Sync initial status labels
  setStatusMode(PRESETS[P.mode].full);
  setStatusSeed(String(P.seed).padStart(4, '0'));
  initSidebar();
  initShaderEditor();
  initResizeDragHandle();
  initTerminal(localStorage.getItem('lumen-theme') ?? 'lumen-dark');

  // Pause button
  ($('btnPause') as HTMLButtonElement).onclick = () =>
    togglePause($('btnPause') as HTMLButtonElement);

  // Randomize buttons
  ($('btnRandom') as HTMLButtonElement).onclick = randomize;
  ($('btnRandom2') as HTMLButtonElement).onclick = randomize;
  ($('btnSave') as HTMLButtonElement).onclick = exportPNG;

  // Export
  initExport($('btnPause') as HTMLButtonElement);

  // Image upload
  ($('imgBtn') as HTMLButtonElement).onclick = () => ($('imgFile') as HTMLInputElement).click();
  ($('imgFile') as HTMLInputElement).onchange = function() {
    const file = (this as HTMLInputElement).files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      loadTexture(img);
      ($('imgThumb') as HTMLImageElement).src = img.src;
      $('imgPreview').style.display = 'block';
      $('imgStatus').textContent = img.naturalWidth + '×' + img.naturalHeight;
      logToTerminal('image loaded: ' + img.naturalWidth + '×' + img.naturalHeight, 'ok');
    };
    if (lastImgUrl) URL.revokeObjectURL(lastImgUrl);
    lastImgUrl = URL.createObjectURL(file);
    img.src = lastImgUrl;
  };
  ($('imgRemove') as HTMLButtonElement).onclick = () => {
    clearTexture();
    $('imgPreview').style.display = 'none';
    ($('imgFile') as HTMLInputElement).value = '';
    $('imgStatus').textContent = '';
    ($('mixRng') as HTMLInputElement).value = '0'; P.mix = 0; $('mixVal').textContent = '0%';
    ($('pixelRng') as HTMLInputElement).value = '0'; P.pixel = 0; $('pixelVal').textContent = '0%';
    if (lastImgUrl) {
      URL.revokeObjectURL(lastImgUrl);
      lastImgUrl = null;
    }
    logToTerminal('image removed', 'info');
  };
  ($('mixRng') as HTMLInputElement).addEventListener('input', function() {
    P.mix = parseFloat((this as HTMLInputElement).value) / 100;
    $('mixVal').textContent = Math.round(P.mix * 100) + '%';
  });
  ($('pixelRng') as HTMLInputElement).addEventListener('input', function() {
    P.pixel = parseFloat((this as HTMLInputElement).value) / 100;
    $('pixelVal').textContent = Math.round(P.pixel * 100) + '%';
  });

  // Drag-and-drop image onto stage
  const stageEl = $('stage') as HTMLElement;
  stageEl.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation(); });
  stageEl.addEventListener('drop', e => {
    e.preventDefault(); e.stopPropagation();
    const file = (e as DragEvent).dataTransfer?.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const img = new Image();
    img.onload = () => {
      loadTexture(img);
      ($('imgThumb') as HTMLImageElement).src = img.src;
      $('imgPreview').style.display = 'block';
      $('imgStatus').textContent = img.naturalWidth + '×' + img.naturalHeight;
      logToTerminal('image dropped: ' + img.naturalWidth + '×' + img.naturalHeight, 'ok');
    };
    if (lastImgUrl) URL.revokeObjectURL(lastImgUrl);
    lastImgUrl = URL.createObjectURL(file);
    img.src = lastImgUrl;
  });

  // Loop duration
  ($('loop') as HTMLInputElement).addEventListener('input', e => {
    P.loop = parseFloat((e.target as HTMLInputElement).value);
    $('loopVal').textContent = P.loop.toFixed(1) + 's';
  });

  // Project save / load
  ($('btnSaveProj') as HTMLButtonElement).onclick = saveProject;
  ($('btnLoadProj') as HTMLButtonElement).onclick = () => ($('projFile') as HTMLInputElement).click();
  ($('projFile') as HTMLInputElement).onchange = function() {
    const f = (this as HTMLInputElement).files?.[0];
    if (f) { loadProject(f); (this as HTMLInputElement).value = ''; }
  };
  window.addEventListener('lumen:saveProject', saveProject);

  // JSON State and Shareable Link actions
  ($('btnCopyState') as HTMLButtonElement).onclick = copyStateToClipboard;
  ($('btnPasteState') as HTMLButtonElement).onclick = pasteStateFromClipboard;
  ($('btnCopyLink') as HTMLButtonElement).onclick = copyShareLink;

  // HTML Splash Page Embed Export
  ($('expEmbed') as HTMLButtonElement).onclick = exportHtmlEmbed;

  // Keyboard + Command Palette
  initKeyboard(randomize);
  initCommandPalette(randomize);

  // Viewer
  try {
    const viewerFile = $('viewerFile') as HTMLInputElement | null;
    const viewerStage = $('viewerStage') as HTMLElement | null;
    const viewerVid = $('viewerVid') as HTMLVideoElement | null;
    const viewerImg = $('viewerImg') as HTMLImageElement | null;
    const viewerSection = $('viewerSection') as HTMLElement | null;
    const viewerOpen = $('viewerOpen') as HTMLButtonElement | null;
    const viewerPlay = $('viewerPlay') as HTMLButtonElement | null;
    const viewerPause = $('viewerPause') as HTMLButtonElement | null;
    const viewerLoop = $('viewerLoop') as HTMLButtonElement | null;
    const viewerInvert = $('viewerInvert') as HTMLButtonElement | null;
    const viewerSpeed = $('viewerSpeed') as HTMLInputElement | null;
    const viewerSpeedVal = $('viewerSpeedVal') as HTMLElement | null;

    viewerOpen?.addEventListener('click', () => viewerFile?.click());
    viewerFile?.addEventListener('change', () => {
      const file = viewerFile.files?.[0];
      if (!file || !viewerStage || !viewerSection) return;
      viewerSection.style.display = '';
      if (lastViewerUrl) {
        URL.revokeObjectURL(lastViewerUrl);
      }
      lastViewerUrl = URL.createObjectURL(file);
      if (file.type.startsWith('video/')) {
        if (viewerImg) viewerImg.style.display = 'none';
        if (viewerVid) {
          viewerVid.src = lastViewerUrl;
          viewerVid.style.display = 'block';
          viewerVid.play().catch(() => {});
        }
      } else {
        if (viewerVid) {
          viewerVid.pause();
          viewerVid.style.display = 'none';
        }
        if (viewerImg) {
          viewerImg.src = lastViewerUrl;
          viewerImg.style.display = 'block';
        }
      }
    });
    viewerPlay?.addEventListener('click', () => {
      if (viewerVid && viewerVid.style.display !== 'none') {
        viewerVid.play().catch(() => {});
      }
    });
    viewerPause?.addEventListener('click', () => {
      if (viewerVid && viewerVid.style.display !== 'none') {
        viewerVid.pause();
      }
    });
    viewerLoop?.addEventListener('click', () => {
      if (!viewerVid) return;
      viewerVid.loop = !viewerVid.loop;
      viewerLoop.textContent = viewerVid.loop ? 'loop on' : 'loop off';
    });
    let viewerInverted = false;
    viewerInvert?.addEventListener('click', () => {
      viewerInverted = !viewerInverted;
      if (viewerVid) viewerVid.style.filter = viewerInverted ? 'invert(1)' : '';
      if (viewerImg) viewerImg.style.filter = viewerInverted ? 'invert(1)' : '';
      viewerInvert.textContent = viewerInverted ? 'invert on' : 'invert off';
    });
    viewerSpeed?.addEventListener('input', () => {
      const v = parseFloat(viewerSpeed?.value ?? '1');
      if (viewerVid) viewerVid.playbackRate = v;
      if (viewerSpeedVal) viewerSpeedVal.textContent = v.toFixed(2) + 'x';
    });
  } catch {}


  // Start RAF
  startRenderLoop();
})();
