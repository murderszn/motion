// ─────────────────────────────────────────────────────────
//  Undo / redo — snapshot params + text layers
// ─────────────────────────────────────────────────────────

import { P, normalizeMode } from '../state';
import type { Params, TextElem } from '../types';
import { texts, renderTextOverlay, selectedText, selectText } from './text';
import { applyPresetUI } from './presets';
import { setSeed } from './seed';
import { setPalette } from './palette';
import { setSlider } from './sliders';
import { applySizeUI } from './sizes';
import { setStatusSeed } from './statusbar';
import type { SliderKey } from '../types';

const MAX_HISTORY = 50;

interface Snapshot {
  params: Params;
  texts: TextElem[];
  selectedText: number | null;
}

let undoStack: Snapshot[] = [];
let redoStack: Snapshot[] = [];
let applying = false;

function cloneParams(): Params {
  return { ...P, colors: [...P.colors] as Params['colors'] };
}

function takeSnapshot(): Snapshot {
  return {
    params: cloneParams(),
    texts: texts.map(t => ({ ...t })),
    selectedText,
  };
}

function syncUIFromSnapshot(s: Snapshot): void {
  Object.assign(P, s.params);
  P.colors = [...s.params.colors] as Params['colors'];
  P.mode = normalizeMode(P.mode);
  texts.splice(0, texts.length, ...s.texts.map(t => ({ ...t })));
  selectText(s.selectedText);

  setSeed(P.seed, setStatusSeed);
  setPalette(P.colors);
  (['speed', 'scale', 'density', 'distort', 'detail', 'grain'] as SliderKey[]).forEach(id => {
    if (P[id] !== undefined) setSlider(id, P[id]);
  });
  applyPresetUI();
  applySizeUI();

  const loopEl = document.getElementById('loop') as HTMLInputElement | null;
  if (loopEl) {
    loopEl.value = String(P.loop);
    const loopVal = document.getElementById('loopVal');
    if (loopVal) loopVal.textContent = P.loop.toFixed(1) + 's';
  }

  const mixRng = document.getElementById('mixRng') as HTMLInputElement | null;
  if (mixRng) {
    mixRng.value = String(Math.round(P.mix * 100));
    const mixVal = document.getElementById('mixVal');
    if (mixVal) mixVal.textContent = Math.round(P.mix * 100) + '%';
  }

  const pixelRng = document.getElementById('pixelRng') as HTMLInputElement | null;
  if (pixelRng) {
    pixelRng.value = String(Math.round(P.pixel * 100));
    const pixelVal = document.getElementById('pixelVal');
    if (pixelVal) pixelVal.textContent = Math.round(P.pixel * 100) + '%';
  }

  const btnInvert = document.getElementById('btnInvert');
  if (btnInvert) btnInvert.textContent = 'invert colors: ' + (P.invert ? 'on' : 'off');

  renderTextOverlay();
  window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
}

export function pushHistory(): void {
  if (applying) return;
  undoStack.push(takeSnapshot());
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack = [];
  updateHistoryUI();
}

export function undo(): boolean {
  if (undoStack.length === 0) return false;
  applying = true;
  redoStack.push(takeSnapshot());
  const prev = undoStack.pop()!;
  syncUIFromSnapshot(prev);
  applying = false;
  updateHistoryUI();
  return true;
}

export function redo(): boolean {
  if (redoStack.length === 0) return false;
  applying = true;
  undoStack.push(takeSnapshot());
  const next = redoStack.pop()!;
  syncUIFromSnapshot(next);
  applying = false;
  updateHistoryUI();
  return true;
}

export function canUndo(): boolean { return undoStack.length > 0; }
export function canRedo(): boolean { return redoStack.length > 0; }

function updateHistoryUI(): void {
  const u = document.getElementById('histUndo');
  const r = document.getElementById('histRedo');
  if (u) (u as HTMLButtonElement).disabled = !canUndo();
  if (r) (r as HTMLButtonElement).disabled = !canRedo();
}

export function initHistory(): void {
  pushHistory();

  window.addEventListener('lumen:historyBefore', () => pushHistory());

  document.getElementById('histUndo')?.addEventListener('click', () => undo());
  document.getElementById('histRedo')?.addEventListener('click', () => redo());

  updateHistoryUI();
}