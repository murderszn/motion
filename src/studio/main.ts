// ─────────────────────────────────────────────────────────
//  studio/main.ts — entry point, wires everything together
// ─────────────────────────────────────────────────────────

import { P, PALETTES, PRESETS, normalizeMode, migrateTrilatRemoval, presetAt } from './state';
import type { SliderKey } from './types';
import { FS, initWebGL, loadTexture, clearTexture } from './webgl';
import { startRenderLoop, togglePause } from './render';
import { initPresets, applyPresetUI } from './ui/presets';
import { initSeed, setSeed } from './ui/seed';
import { initPalette, setPalette, getRandomPalette } from './ui/palette';
import { initSliders, setSlider } from './ui/sliders';
import { initSizes, applySizeUI } from './ui/sizes';
import { initTextControls, renderTextOverlay, texts } from './ui/text';
import { initExport, exportPNG } from './ui/export';
import { initExportTargets, syncExportUIFromParams } from './ui/export_targets_ui';
import { initTerminal, initResizeDragHandle, logToTerminal } from './ui/terminal';
import { initSidebar, applyTheme } from './ui/sidebar';
import {
  loadSettings, applySavedParams, applyChromeSettings,
  hasUrlOverrides, initSettingsPersistence,
} from './ui/settings';
import { initHistory } from './ui/history';
import { getShaderSource } from './ui/shader_editor';
import { initStatusBar, setStatusMode, setStatusSeed } from './ui/statusbar';
import { initAI } from './ui/ai';
import { initShaderEditor } from './ui/shader_editor';
import { initKeyboard } from './ui/keyboard';
import { initCommandPalette } from './ui/command_palette';
import { parseUrlParams, copyStateToClipboard, pasteStateFromClipboard, copyShareLink } from './ui/url_api';
import { exportHtmlEmbed } from './ui/export_embed';
import { initKineticStudio } from './ui/kinetic_studio';
import { initAudioVisualizer } from './ui/audio_visualizer';
import { initMenuBar } from './ui/menu_bar';

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
  window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
  setSeed(Math.floor(Math.random() * 10000), setStatusSeed);
  setPalette(getRandomPalette());
  setSlider('speed',   0.25 + Math.random() * 0.6);
  setSlider('scale',   0.20 + Math.random() * 0.7);
  setSlider('density', 0.25 + Math.random() * 0.65);
  setSlider('distort', 0.20 + Math.random() * 0.7);
  setSlider('warp',    0.20 + Math.random() * 0.7);
  setSlider('detail',  0.25 + Math.random() * 0.6);
  setSlider('grain',   Math.random() * 0.5);
  P.mix = 0;
  P.pixel = 0;
  logToTerminal('randomized all parameters', 'ok');
}

// ── Project save / load ──────────────────────────────────

function saveProject(): void {
  // FS is imported at the top and reflects the live-edited source if compileNewFS was called
  const project = { version: '1.0.0', params: P, texts: [...texts], shader: getShaderSource() };
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
      (['speed', 'scale', 'density', 'distort', 'warp', 'detail', 'grain'] as SliderKey[]).forEach(id => {
        if (P[id] !== undefined) setSlider(id, P[id]);
      });
      P.mode = migrateTrilatRemoval(P.mode);
      applyPresetUI();
      setStatusMode(presetAt(P.mode).full);
      applySizeUI();
      ($('loop') as HTMLInputElement).value = String(P.loop);
      $('loopVal').textContent = P.loop.toFixed(1) + 's';
      P.pixel = 0;
      $('btnInvert').textContent = 'invert colors: ' + (P.invert ? 'on' : 'off');
      syncExportUIFromParams();
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

  // WebGL
  initWebGL($('c') as HTMLCanvasElement);

  const savedSettings = loadSettings();
  if (savedSettings && !hasUrlOverrides()) {
    applySavedParams(savedSettings);
  }

  // Parse URL parameters to set up initial state (overrides saved params when present)
  parseUrlParams();
  P.mode = normalizeMode(P.mode);

  // UI modules
  initPresets(name => setStatusMode(name));
  initSeed(val => setStatusSeed(val));
  initPalette();
  initSliders();
  initSizes(() => renderTextOverlay());
  initTextControls();
  initStatusBar();
  initAI();

  // Sync initial status labels
  setStatusMode(presetAt(P.mode).full);
  setStatusSeed(String(P.seed).padStart(4, '0'));
  initSidebar();
  initShaderEditor();
  if (savedSettings && !hasUrlOverrides()) {
    applyChromeSettings(savedSettings);
  } else {
    applyTheme(localStorage.getItem('lumen-theme') ?? 'lumen-dark');
  }
  initResizeDragHandle();
  initTerminal(window.currentThemeKey ?? 'lumen-dark');
  initSettingsPersistence();

  // Pause button
  ($('btnPause') as HTMLButtonElement).onclick = () =>
    togglePause($('btnPause') as HTMLButtonElement);

  // Randomize buttons (header randomize removed; left-nav ↻ + 'r' key remain)
  ($('btnRandom2') as HTMLButtonElement).onclick = randomize;
  ($('btnSave') as HTMLButtonElement).onclick = exportPNG;

  // Export
  initExportTargets();
  initExport($('btnPause') as HTMLButtonElement);

  // Image upload
  ($('imgBtn') as HTMLButtonElement).onclick = () => ($('imgFile') as HTMLInputElement).click();
  ($('imgFile') as HTMLInputElement).onchange = function() {
    const file = (this as HTMLInputElement).files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      loadTexture(img);
      P.mix = 1;
      P.pixel = 0;
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
    P.mix = 0;
    P.pixel = 0;
    $('imgPreview').style.display = 'none';
    ($('imgFile') as HTMLInputElement).value = '';
    $('imgStatus').textContent = '';
    if (lastImgUrl) {
      URL.revokeObjectURL(lastImgUrl);
      lastImgUrl = null;
    }
    logToTerminal('image removed', 'info');
  };

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
      P.mix = 1;
      P.pixel = 0;
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
  const loopEl = $('loop') as HTMLInputElement;
  loopEl.addEventListener('pointerdown', () => {
    window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
  });
  loopEl.addEventListener('input', e => {
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

  // Start RAF
  startRenderLoop();

  initHistory();
  initKineticStudio();
  initAudioVisualizer();
  initMenuBar();

  // Expose P for Playwright tests
  if (typeof window !== 'undefined') {
    (window as any).P = P;
  }
})();
