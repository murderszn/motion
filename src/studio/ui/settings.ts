// ─────────────────────────────────────────────────────────
//  Settings — persist studio chrome + creative state
// ─────────────────────────────────────────────────────────

import { P, migrateLegacyMode, migrateTrilatRemoval } from '../state';
import type { Params, TextElem } from '../types';
import { texts } from './text';
import { setTermPanelHeight } from './terminal';

const STORAGE_KEY = 'lumen-studio-settings';
const SAVE_DEBOUNCE_MS = 400;

export type BottomTab = 'term' | 'shader' | 'problems' | 'hotkeys';
export type ExportFormat = 'png' | 'webm' | 'gif';
export type LeftTab = 'generator' | 'text';

export interface StudioSettings {
  version: number;
  theme: string;
  termHeight: number;
  leftClosed: boolean;
  rightClosed: boolean;
  textOpen: boolean;
  leftTab: LeftTab;
  termClosed: boolean;
  termMaximized: boolean;
  bottomTab: BottomTab;
  exportFormat: ExportFormat;
  params: Params;
  texts: TextElem[];
}

const SETTINGS_VERSION = 3;

const DEFAULTS: StudioSettings = {
  version: SETTINGS_VERSION,
  theme: 'lumen-dark',
  termHeight: 320,
  leftClosed: false,
  rightClosed: false,
  textOpen: true,
  leftTab: 'generator',
  termClosed: false,
  termMaximized: false,
  bottomTab: 'term',
  exportFormat: 'webm',
  params: { ...P, colors: [...P.colors] as Params['colors'] },
  texts: [],
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let urlHasParams = false;

function cloneParams(): Params {
  return { ...P, colors: [...P.colors] as Params['colors'] };
}

function cloneTexts(): TextElem[] {
  return texts.map(t => ({ ...t }));
}

export function hasUrlOverrides(): boolean {
  return urlHasParams;
}

export function markUrlOverrides(): void {
  const q = window.location.search;
  urlHasParams = q.length > 1 && (
    q.includes('preset=') || q.includes('seed=') || q.includes('palette=')
    || q.includes('speed=') || q.includes('scale=')
  );
}

export function loadSettings(): StudioSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudioSettings;
    if (!parsed || !parsed.params) return null;
    if (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== SETTINGS_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Apply saved creative state before UI init (skipped when URL params present). */
export function applySavedParams(saved: StudioSettings): void {
  Object.assign(P, saved.params);
  P.colors = [...saved.params.colors] as Params['colors'];
  P.exportTargetId = saved.params.exportTargetId ?? 'custom';
  P.imageFormat = saved.params.imageFormat ?? 'png';
  P.exportCaption = saved.params.exportCaption ?? '';
  const rawMode = saved.version < 2
    ? migrateLegacyMode(saved.params.mode)
    : saved.params.mode;
  P.mode = migrateTrilatRemoval(rawMode);
  texts.splice(0, texts.length, ...saved.texts.map(t => ({ ...t })));
}

export function getSavedChrome(): StudioSettings | null {
  return loadSettings();
}

/** Apply chrome/layout settings after DOM modules are wired. */
export function applyChromeSettings(saved: StudioSettings): void {
  const body = document.body;
  const $ = (id: string) => document.getElementById(id)!;

  body.classList.toggle('left-closed', saved.leftClosed);
  body.classList.toggle('right-closed', saved.rightClosed);
  body.classList.toggle('text-open', saved.textOpen);
  body.classList.toggle('term-closed', saved.termClosed);
  body.classList.toggle('term-maximized', saved.termMaximized);

  $('bottom').classList.toggle('hidden', saved.termClosed);

  const leftOpen = !saved.leftClosed;
  $('sLeft').textContent = leftOpen ? '◀' : '▶';

  const rightOpen = !saved.rightClosed;
  $('togPanel').classList.toggle('active', rightOpen);
  $('sRight').textContent = rightOpen ? '☰ panel' : '☰';

  const termOpen = !saved.termClosed;
  $('togTerm').classList.toggle('active', termOpen);
  $('sTerm').textContent = termOpen ? '▤ term' : '▤';

  setTermPanelHeight(saved.termHeight, false);

  window.dispatchEvent(new CustomEvent('lumen:applyBottomTab', { detail: saved.bottomTab }));
  window.dispatchEvent(new CustomEvent('lumen:applyLeftTab', { detail: saved.leftTab }));
  window.dispatchEvent(new CustomEvent('lumen:applyTheme', { detail: saved.theme }));
  window.dispatchEvent(new CustomEvent('lumen:applyExportFormat', { detail: saved.exportFormat }));
}

export function collectSettings(): StudioSettings {
  const body = document.body;
  return {
    version: SETTINGS_VERSION,
    theme: window.currentThemeKey || 'lumen-dark',
    termHeight: parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--bottom-h') || '320',
      10,
    ) || 320,
    leftClosed: body.classList.contains('left-closed'),
    rightClosed: body.classList.contains('right-closed'),
    textOpen: body.classList.contains('text-open'),
    leftTab: (window as Window & { lumenLeftTab?: LeftTab }).lumenLeftTab ?? 'generator',
    termClosed: body.classList.contains('term-closed'),
    termMaximized: body.classList.contains('term-maximized'),
    bottomTab: (window as Window & { lumenBottomTab?: BottomTab }).lumenBottomTab ?? 'term',
    exportFormat: (window as Window & { lumenExportFormat?: ExportFormat }).lumenExportFormat ?? 'webm',
    params: cloneParams(),
    texts: cloneTexts(),
  };
}

export function saveSettingsNow(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collectSettings()));
  } catch { /* quota */ }
}

export function scheduleSaveSettings(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveSettingsNow();
  }, SAVE_DEBOUNCE_MS);
}

export function initSettingsPersistence(): void {
  markUrlOverrides();

  const events = [
    'input', 'change', 'lumen:presetChanged', 'lumen:textChanged',
    'lumen:bottomTabChanged', 'lumen:leftTabChanged', 'lumen:themeChanged',
    'lumen:exportFormatChanged', 'lumen:exportSettingsChanged', 'lumen:layoutChanged',
  ];
  events.forEach(ev => window.addEventListener(ev, scheduleSaveSettings));
  window.addEventListener('beforeunload', saveSettingsNow);
}

declare global {
  interface Window {
    currentThemeKey: string;
    lumenLeftTab?: LeftTab;
    lumenBottomTab?: BottomTab;
    lumenExportFormat?: ExportFormat;
  }
}