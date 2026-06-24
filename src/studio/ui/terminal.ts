// ─────────────────────────────────────────────────────────
//  Terminal — xterm.js + WebSocket PTY + resize drag handle
// ─────────────────────────────────────────────────────────

// xterm.js is loaded via CDN <script> tags in studio.html.
// We access them through the global window object.

import { THEMES } from '../state';

declare global {
  interface Window {
    Terminal: new (opts: object) => XTerm;
    FitAddon: { FitAddon: new () => FitAddonInstance };
    termReady: boolean;
    currentThemeKey: string;
    goToShaderLine: (line: number) => void;
  }
}

interface XTerm {
  open(el: HTMLElement): void;
  loadAddon(addon: object): void;
  write(data: string): void;
  focus(): void;
  onData(cb: (data: string) => void): Disposable;
  onResize(cb: (size: { cols: number; rows: number }) => void): Disposable;
  options: { theme: object };
  readonly cols: number;
  readonly rows: number;
}
interface FitAddonInstance { fit(): void; }
interface Disposable { dispose(): void; }

const $ = (id: string) => document.getElementById(id)!;

let term: XTerm | null = null;
let ws: WebSocket | null = null;
let termRetries = 0;
let termFitAddon: FitAddonInstance | null = null;
let resizeListener: Disposable | null = null;
let dataListener:   Disposable | null = null;
let lastCols = 0;
let lastRows = 0;
let fitRaf = 0;
let fitDelayTimer: ReturnType<typeof setTimeout> | null = null;

function termVisible(): boolean {
  const bottom = $('bottom');
  return !bottom.classList.contains('hidden')
    && !document.body.classList.contains('term-closed')
    && ($('term-xterm') as HTMLElement).style.display !== 'none';
}

function syncPtySize(): void {
  if (!term || !ws || ws.readyState !== WebSocket.OPEN) return;
  const { cols, rows } = term;
  if (cols === lastCols && rows === lastRows) return;
  lastCols = cols;
  lastRows = rows;
  ws.send(JSON.stringify({ type: 'resize', cols, rows }));
}

export function fitTerminal(): void {
  if (!termFitAddon || !term || !termVisible()) return;
  const container = $('term-xterm');
  if (container.clientWidth < 1 || container.clientHeight < 1) return;
  try {
    termFitAddon.fit();
    syncPtySize();
  } catch { /* ignore */ }
}

/** Debounced fit — waits for layout + CSS grid transitions before syncing PTY size. */
export function scheduleFitTerminal(): void {
  if (fitRaf) cancelAnimationFrame(fitRaf);
  fitRaf = requestAnimationFrame(() => {
    fitRaf = requestAnimationFrame(() => {
      fitRaf = 0;
      fitTerminal();
    });
  });
  if (fitDelayTimer) clearTimeout(fitDelayTimer);
  fitDelayTimer = setTimeout(() => {
    fitDelayTimer = null;
    fitTerminal();
  }, 300);
}

export function logToTerminal(msg: string, cls?: string): void {
  if (!term) return;
  const c = ({ info: '36', ok: '32', warn: '33', err: '31', cmd: '37' } as Record<string,string>)[cls ?? ''] ?? '36';
  term.write('\r\n\x1b[' + c + 'm▸ ' + msg + '\x1b[0m');
}

export function initTerminal(themeKey: string, termRef: XTerm | null = null): void {
  try {
    if (typeof window.Terminal === 'undefined') {
      if (termRetries++ < 20) {
        setTimeout(() => initTerminal(themeKey), 250);
        return;
      }
      console.error('[term] Terminal not available after 20 retries');
      return;
    }
    if (typeof window.FitAddon === 'undefined' || !window.FitAddon.FitAddon) {
      if (termRetries++ < 20) {
        setTimeout(() => initTerminal(themeKey), 250);
        return;
      }
      console.error('[term] FitAddon not available after 20 retries');
      return;
    }
    if (termRef !== null) {
      term = termRef;
    } else {
      term = new window.Terminal({
        cursorBlink: true, cursorStyle: 'bar', fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
        theme: {
          background: '#060608', foreground: '#b8b8c0', cursor: '#e03a3a',
          selectionBackground: '#e03a3a44', black: '#1c1c22', red: '#e03a3a',
          green: '#a3be8c', yellow: '#d08770', blue: '#5e81ac', magenta: '#b48ead',
          cyan: '#88c0d0', white: '#f4f4f6',
        },
      });
      const fitAddon = new window.FitAddon.FitAddon();
      termFitAddon = fitAddon;
      term.loadAddon(fitAddon);
      term.open($('term-xterm'));
    }

    if (window.currentThemeKey) {
      const vars = THEMES[window.currentThemeKey]?.variables;
      if (vars) applyTermTheme(vars);
    }
    scheduleFitTerminal();
    window.addEventListener('resize', scheduleFitTerminal);

    const ro = new ResizeObserver(() => scheduleFitTerminal());
    ro.observe($('bottom'));
    ro.observe($('term-xterm'));

    new MutationObserver(() => scheduleFitTerminal()).observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    document.body.addEventListener('transitionend', e => {
      if (e.target === document.body
        && (e.propertyName === 'grid-template-rows' || e.propertyName === 'grid-template-columns')) {
        scheduleFitTerminal();
      }
    });

    let wsRetries = 0;
    function connect(): void {
      try {
        resizeListener?.dispose(); resizeListener = null;
        dataListener?.dispose();   dataListener = null;
        ws = new WebSocket(`ws://${location.host}/terminal`);
        ws.onopen = () => {
          wsRetries = 0;
          lastCols = 0;
          lastRows = 0;
          scheduleFitTerminal();
          term!.focus();
          window.termReady = true;
          resizeListener = term!.onResize(({ cols, rows }) => {
            lastCols = cols;
            lastRows = rows;
            if (ws && ws.readyState === WebSocket.OPEN)
              ws.send(JSON.stringify({ type: 'resize', cols, rows }));
          });
        };
        ws.onmessage = e => { try { term!.write(e.data as string); } catch { /* ignore */ } };
        ws.onclose = () => {
          window.termReady = false;
          if (wsRetries < 10) { wsRetries++; setTimeout(connect, 1000 * wsRetries); }
        };
        ws.onerror = () => { /* swallow */ };
        dataListener = term!.onData(data => {
          if (ws && ws.readyState === WebSocket.OPEN) ws.send(data);
        });
      } catch (e) { console.error('[term] WS error:', e); }
    }
    connect();

    new MutationObserver(() => {
      if (!$('bottom').classList.contains('hidden')) {
        scheduleFitTerminal();
        if (!ws || ws.readyState !== WebSocket.OPEN) connect();
      }
    }).observe($('bottom'), { attributes: true, attributeFilter: ['class'] });

    // Listen for lumen:log custom events dispatched from other modules
    window.addEventListener('lumen:log', e => {
      const { msg, cls } = (e as CustomEvent<{ msg: string; cls?: string }>).detail;
      logToTerminal(msg, cls);
    });
  } catch (e) { console.error('[term] initTerminal error:', e); }
}

function applyTermTheme(themeVars: Record<string,string>): void {
  if (!term) return;
  const isLightTerm = themeVars['--term-bg'] === '#f4f4f6';
  term.options.theme = {
    background: themeVars['--term-bg'],
    foreground: themeVars['--term-text'] || themeVars['--text'],
    cursor: themeVars['--accent'],
    selectionBackground: (themeVars['--accent'] ?? '') + '44',
    black: isLightTerm ? '#f4f4f6' : '#1c1c22',
    red: themeVars['--term-accent'] || themeVars['--accent'],
    green: '#a3be8c', yellow: '#d08770', blue: '#5e81ac', magenta: '#b48ead',
    cyan: themeVars['--term-text'] || themeVars['--text'],
    white: isLightTerm ? '#1c1c1e' : '#ffffff',
  };
}

export function updateTermTheme(themeVars: Record<string,string>): void {
  applyTermTheme(themeVars);
}

// ── Resize drag handle ───────────────────────────────────

export function initResizeDragHandle(): void {
  const handle = $('term-resize-handle') as HTMLElement;
  let startY = 0, startH = 0;

  function onMove(e: MouseEvent): void {
    const delta = e.clientY - startY;
    const h = Math.max(60, Math.min(window.innerHeight * 0.7, startH - delta));
    document.body.style.setProperty('--bottom-h', h + 'px');
    fitTerminal();
  }
  function onUp(): void {
    document.body.classList.remove('dragging-term');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    scheduleFitTerminal();
  }
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    startY = e.clientY;
    startH = parseInt(getComputedStyle(document.body).getPropertyValue('--bottom-h'));
    document.body.classList.add('dragging-term');
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}
