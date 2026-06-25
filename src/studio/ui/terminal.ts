// ─────────────────────────────────────────────────────────
//  Terminal — multi-tab xterm.js + WebSocket PTY sessions
// ─────────────────────────────────────────────────────────

import { THEMES } from '../state';

declare global {
  interface Window {
    Terminal: new (opts: object) => XTerm;
    FitAddon: { FitAddon: new () => FitAddonInstance };
    WebLinksAddon?: { WebLinksAddon: new () => object };
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
  dispose(): void;
  onData(cb: (data: string) => void): Disposable;
  onResize(cb: (size: { cols: number; rows: number }) => void): Disposable;
  options: { theme: object };
  readonly cols: number;
  readonly rows: number;
  readonly element: HTMLElement;
}
interface FitAddonInstance { fit(): void; }
interface Disposable { dispose(): void; }

interface TermSession {
  id: string;
  title: string;
  term: XTerm;
  fitAddon: FitAddonInstance;
  pane: HTMLElement;
  tabEl: HTMLElement;
  ws: WebSocket | null;
  resizeListener: Disposable | null;
  dataListener: Disposable | null;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  lastCols: number;
  lastRows: number;
  wsRetries: number;
  connected: boolean;
}

const $ = (id: string) => document.getElementById(id)!;

const TERM_HEIGHT_KEY = 'lumen-term-height';
const DEFAULT_TERM_HEIGHT = 320;
const MIN_TERM_HEIGHT = 80;
const HEADER_HEIGHT = 40;
const STATUS_HEIGHT = 24;
const MIN_STAGE_HEIGHT = 120;
const MAX_WS_RETRIES = 8;

let sessions: TermSession[] = [];
let activeSessionId: string | null = null;
let sessionCounter = 0;
let termRetries = 0;
let fitRaf = 0;
let fitDelayTimer: ReturnType<typeof setTimeout> | null = null;
let dragFitRaf = 0;
let termPanelHeight = DEFAULT_TERM_HEIGHT;
let heightBeforeMaximize: number | null = null;
let ptyOffline = false;
let libsReady = false;

function readStoredHeight(): number {
  const raw = localStorage.getItem(TERM_HEIGHT_KEY);
  const h = raw ? parseInt(raw, 10) : DEFAULT_TERM_HEIGHT;
  return Number.isFinite(h) ? h : DEFAULT_TERM_HEIGHT;
}

function maxTermHeight(): number {
  return Math.max(
    MIN_TERM_HEIGHT,
    window.innerHeight - HEADER_HEIGHT - STATUS_HEIGHT - MIN_STAGE_HEIGHT,
  );
}

function clampTermHeight(h: number): number {
  return Math.max(MIN_TERM_HEIGHT, Math.min(maxTermHeight(), Math.round(h)));
}

export function getTermPanelHeight(): number {
  return termPanelHeight;
}

export function setTermPanelHeight(h: number, persist = true): void {
  termPanelHeight = clampTermHeight(h);
  if (persist) localStorage.setItem(TERM_HEIGHT_KEY, String(termPanelHeight));
  applyTermPanelHeight();
}

export function applyTermPanelHeight(): void {
  const root = document.documentElement;
  if (document.body.classList.contains('term-closed')
    || document.body.classList.contains('term-maximized')) {
    root.style.removeProperty('--bottom-h');
    return;
  }
  root.style.setProperty('--bottom-h', termPanelHeight + 'px');
}

export function saveHeightBeforeMaximize(): void {
  if (!document.body.classList.contains('term-maximized')) {
    heightBeforeMaximize = termPanelHeight;
  }
}

export function restoreHeightAfterMaximize(): void {
  if (heightBeforeMaximize !== null) {
    setTermPanelHeight(heightBeforeMaximize, false);
    heightBeforeMaximize = null;
  } else {
    applyTermPanelHeight();
  }
}

function activeSession(): TermSession | null {
  return sessions.find(s => s.id === activeSessionId) ?? null;
}

function termVisible(): boolean {
  const bottom = $('bottom');
  return !bottom.classList.contains('hidden')
    && !document.body.classList.contains('term-closed')
    && ($('term-xterm') as HTMLElement).style.display !== 'none';
}

function updateTermReadyFlag(): void {
  window.termReady = sessions.some(s => s.connected);
}

function setPtyOffline(offline: boolean): void {
  ptyOffline = offline;
  const banner = $('termOffline');
  banner.classList.toggle('hidden', !offline);
  sessions.forEach(s => s.tabEl.classList.toggle('disconnected', !s.connected));
}

function syncPtySize(session: TermSession): void {
  if (!session.ws || session.ws.readyState !== WebSocket.OPEN) return;
  const { cols, rows } = session.term;
  if (cols === session.lastCols && rows === session.lastRows) return;
  session.lastCols = cols;
  session.lastRows = rows;
  session.ws.send(JSON.stringify({ type: 'resize', cols, rows }));
}

export function fitTerminal(): void {
  const s = activeSession();
  if (!s || !termVisible()) return;
  const pane = s.pane;
  if (pane.clientWidth < 1 || pane.clientHeight < 1) return;
  try {
    s.fitAddon.fit();
    syncPtySize(s);
  } catch { /* ignore */ }
}

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
  }, 260);
}

function fitTerminalDuringDrag(): void {
  if (dragFitRaf) cancelAnimationFrame(dragFitRaf);
  dragFitRaf = requestAnimationFrame(() => {
    dragFitRaf = 0;
    fitTerminal();
  });
}

export function focusTerminal(): void {
  const s = activeSession();
  if (!s || !termVisible()) return;
  s.term.focus();
}

export function isTerminalFocused(): boolean {
  const active = document.activeElement;
  return !!active?.closest('#termPanes .term-pane.active .xterm');
}

export function logToTerminal(msg: string, cls?: string): void {
  const s = activeSession();
  if (!s) return;
  const c = ({ info: '36', ok: '32', warn: '33', err: '31', cmd: '37' } as Record<string, string>)[cls ?? ''] ?? '36';
  s.term.write('\r\n\x1b[' + c + 'm▸ ' + msg + '\x1b[0m');
}

function wsUrl(): string {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/terminal`;
}

function defaultShellTitle(index: number): string {
  const base = (typeof navigator !== 'undefined' && navigator.platform.includes('Win')) ? 'powershell' : 'shell';
  return index === 1 ? base : `${base} (${index})`;
}

function createXTerm(): { term: XTerm; fitAddon: FitAddonInstance } {
  const term = new window.Terminal({
    cursorBlink: true,
    cursorStyle: 'bar',
    fontSize: 13,
    lineHeight: 1.2,
    fontFamily: "'JetBrains Mono', monospace",
    scrollback: 10000,
    macOptionIsMeta: true,
    drawBoldTextInBrightColors: true,
    fastScrollModifier: 'alt',
    smoothScrollDuration: 0,
    theme: {
      background: '#060608', foreground: '#b8b8c0', cursor: '#e03a3a',
      selectionBackground: '#e03a3a44', black: '#1c1c22', red: '#e03a3a',
      green: '#a3be8c', yellow: '#d08770', blue: '#5e81ac', magenta: '#b48ead',
      cyan: '#88c0d0', white: '#f4f4f6',
    },
  });
  const fitAddon = new window.FitAddon.FitAddon();
  term.loadAddon(fitAddon);
  if (window.WebLinksAddon?.WebLinksAddon) {
    term.loadAddon(new window.WebLinksAddon.WebLinksAddon());
  }
  return { term, fitAddon };
}

function connectSession(session: TermSession, manual = false): void {
  if (manual) session.wsRetries = 0;
  if (session.reconnectTimer) {
    clearTimeout(session.reconnectTimer);
    session.reconnectTimer = null;
  }
  session.resizeListener?.dispose();
  session.resizeListener = null;
  session.dataListener?.dispose();
  session.dataListener = null;

  if (session.ws) {
    session.ws.onclose = null;
    session.ws.onerror = null;
    session.ws.onopen = null;
    session.ws.onmessage = null;
    try { session.ws.close(); } catch { /* ignore */ }
    session.ws = null;
  }

  try {
    const ws = new WebSocket(wsUrl());
    session.ws = ws;

    ws.onopen = () => {
      session.wsRetries = 0;
      session.connected = true;
      session.lastCols = 0;
      session.lastRows = 0;
      setPtyOffline(false);
      updateTermReadyFlag();
      session.tabEl.classList.remove('disconnected');
      scheduleFitTerminal();
      if (activeSessionId === session.id && termVisible()) session.term.focus();

      session.resizeListener = session.term.onResize(({ cols, rows }) => {
        session.lastCols = cols;
        session.lastRows = rows;
        if (session.ws?.readyState === WebSocket.OPEN) {
          session.ws.send(JSON.stringify({ type: 'resize', cols, rows }));
        }
      });

      session.dataListener = session.term.onData(data => {
        if (session.ws?.readyState === WebSocket.OPEN) session.ws.send(data);
      });
    };

    ws.onmessage = e => {
      try { session.term.write(e.data as string); } catch { /* ignore */ }
    };

    ws.onclose = () => {
      session.connected = false;
      updateTermReadyFlag();
      session.tabEl.classList.add('disconnected');
      session.resizeListener?.dispose();
      session.resizeListener = null;
      session.dataListener?.dispose();
      session.dataListener = null;
      session.ws = null;

      if (session.wsRetries < MAX_WS_RETRIES) {
        session.wsRetries++;
        session.reconnectTimer = setTimeout(
          () => connectSession(session),
          Math.min(1000 * session.wsRetries, 8000),
        );
      } else if (activeSessionId === session.id) {
        setPtyOffline(true);
      }
    };

    ws.onerror = () => { /* handled by onclose */ };
  } catch (e) {
    console.error('[term] WS error:', e);
    if (activeSessionId === session.id) setPtyOffline(true);
  }
}

function renderShellTabs(): void {
  const tabs = $('shellTabs');
  tabs.innerHTML = '';
  sessions.forEach(s => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'shell-tab' + (s.id === activeSessionId ? ' active' : '') + (s.connected ? '' : ' disconnected');
    tab.dataset.sessionId = s.id;
    tab.title = s.title;

    const label = document.createElement('span');
    label.className = 'shell-tab-label';
    label.textContent = s.title;

    const close = document.createElement('span');
    close.className = 'shell-tab-close';
    close.textContent = '×';
    close.title = 'kill terminal';
    close.addEventListener('click', e => {
      e.stopPropagation();
      killSession(s.id);
    });

    tab.append(label, close);
    tab.addEventListener('click', () => switchSession(s.id));
    tabs.appendChild(tab);
    s.tabEl = tab;
  });
}

function switchSession(id: string): void {
  if (!sessions.some(s => s.id === id)) return;
  activeSessionId = id;
  sessions.forEach(s => {
    const on = s.id === id;
    s.pane.classList.toggle('active', on);
    s.tabEl?.classList.toggle('active', on);
  });
  if (ptyOffline && !sessions.find(s => s.id === id)?.connected) {
    setPtyOffline(true);
  } else if (sessions.find(s => s.id === id)?.connected) {
    setPtyOffline(false);
  }
  scheduleFitTerminal();
  if (termVisible()) sessions.find(s => s.id === id)?.term.focus();
}

export function createSession(): TermSession {
  const index = ++sessionCounter;
  const id = `shell-${index}`;
  const title = defaultShellTitle(index);

  const pane = document.createElement('div');
  pane.className = 'term-pane';
  pane.dataset.sessionId = id;
  $('termPanes').appendChild(pane);

  const { term, fitAddon } = createXTerm();
  term.open(pane);
  pane.addEventListener('mousedown', () => {
    activeSessionId = id;
    requestAnimationFrame(() => term.focus());
  });

  if (window.currentThemeKey) {
    const vars = THEMES[window.currentThemeKey]?.variables;
    if (vars) applyTermThemeTo(term, vars);
  }

  const session: TermSession = {
    id,
    title,
    term,
    fitAddon,
    pane,
    tabEl: document.createElement('span'),
    ws: null,
    resizeListener: null,
    dataListener: null,
    reconnectTimer: null,
    lastCols: 0,
    lastRows: 0,
    wsRetries: 0,
    connected: false,
  };

  sessions.push(session);
  renderShellTabs();
  switchSession(id);
  connectSession(session);
  return session;
}

function killSession(id: string): void {
  const idx = sessions.findIndex(s => s.id === id);
  if (idx === -1) return;

  const session = sessions[idx];
  if (session.reconnectTimer) clearTimeout(session.reconnectTimer);
  session.resizeListener?.dispose();
  session.dataListener?.dispose();
  if (session.ws) {
    try { session.ws.close(); } catch { /* ignore */ }
  }
  session.term.dispose();
  session.pane.remove();
  sessions.splice(idx, 1);

  if (sessions.length === 0) {
    createSession();
    return;
  }

  if (activeSessionId === id) {
    const next = sessions[Math.min(idx, sessions.length - 1)];
    switchSession(next.id);
  }
  renderShellTabs();
  updateTermReadyFlag();
}

export function reconnectTerminal(): void {
  setPtyOffline(false);
  if (sessions.length === 0) {
    createSession();
    return;
  }
  sessions.forEach(s => connectSession(s, true));
  scheduleFitTerminal();
  focusTerminal();
  window.dispatchEvent(new CustomEvent('lumen:log', {
    detail: { msg: 'reconnecting terminal sessions…', cls: 'info' },
  }));
}

export function setShellBarVisible(visible: boolean): void {
  ($('termShellBar') as HTMLElement).style.display = visible ? 'flex' : 'none';
}

function applyTermThemeTo(term: XTerm, themeVars: Record<string, string>): void {
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

export function updateTermTheme(themeVars: Record<string, string>): void {
  sessions.forEach(s => applyTermThemeTo(s.term, themeVars));
}

function wireGlobalListeners(): void {
  scheduleFitTerminal();
  window.addEventListener('resize', () => {
    termPanelHeight = clampTermHeight(termPanelHeight);
    applyTermPanelHeight();
    scheduleFitTerminal();
  });

  const ro = new ResizeObserver(() => scheduleFitTerminal());
  ro.observe($('bottom'));
  ro.observe($('termPanes'));

  new MutationObserver(() => {
    applyTermPanelHeight();
    scheduleFitTerminal();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  document.body.addEventListener('transitionend', e => {
    if (e.target === document.body
      && (e.propertyName === 'grid-template-rows' || e.propertyName === 'grid-template-columns')) {
      scheduleFitTerminal();
    }
  });

  new MutationObserver(() => {
    if (!$('bottom').classList.contains('hidden') && termVisible()) {
      scheduleFitTerminal();
      const s = activeSession();
      if (s && !s.connected && !s.ws) connectSession(s, true);
    }
  }).observe($('bottom'), { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('lumen:log', e => {
    const { msg, cls } = (e as CustomEvent<{ msg: string; cls?: string }>).detail;
    logToTerminal(msg, cls);
  });

  $('shellNew').addEventListener('click', () => createSession());
  $('termReconnect').addEventListener('click', () => reconnectTerminal());
}

export function initTerminal(_themeKey: string): void {
  try {
    if (typeof window.Terminal === 'undefined') {
      if (termRetries++ < 20) {
        setTimeout(() => initTerminal(_themeKey), 250);
        return;
      }
      console.error('[term] Terminal not available after 20 retries');
      return;
    }
    if (typeof window.FitAddon === 'undefined' || !window.FitAddon.FitAddon) {
      if (termRetries++ < 20) {
        setTimeout(() => initTerminal(_themeKey), 250);
        return;
      }
      console.error('[term] FitAddon not available after 20 retries');
      return;
    }
    if (libsReady) return;
    libsReady = true;

    termPanelHeight = clampTermHeight(readStoredHeight());
    applyTermPanelHeight();
    createSession();
    wireGlobalListeners();
  } catch (e) {
    console.error('[term] initTerminal error:', e);
  }
}

export function initResizeDragHandle(): void {
  const handle = $('term-resize-handle') as HTMLElement;
  let startY = 0;
  let startH = 0;

  function currentHeight(): number {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--bottom-h');
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : termPanelHeight;
  }

  function onMove(e: MouseEvent): void {
    const delta = e.clientY - startY;
    setTermPanelHeight(startH - delta);
    fitTerminalDuringDrag();
  }

  function onUp(): void {
    document.body.classList.remove('dragging-term');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    fitTerminal();
  }

  handle.addEventListener('mousedown', e => {
    if (document.body.classList.contains('term-maximized')) return;
    e.preventDefault();
    startY = e.clientY;
    startH = currentHeight();
    document.body.classList.add('dragging-term');
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  handle.addEventListener('dblclick', e => {
    if (document.body.classList.contains('term-maximized')) return;
    e.preventDefault();
    setTermPanelHeight(DEFAULT_TERM_HEIGHT);
    scheduleFitTerminal();
  });
}