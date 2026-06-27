// ─────────────────────────────────────────────────────────
//  Sidebar — left-bar tab toggle, panel/term/left toggles,
//            theme switcher, responsive chrome
// ─────────────────────────────────────────────────────────

import { THEMES } from '../state';
import { expandThemeVariables } from '../theme_tokens';
import {
  scheduleFitTerminal, updateTermTheme, logToTerminal,
  applyTermPanelHeight, focusTerminal,
  saveHeightBeforeMaximize, restoreHeightAfterMaximize,
} from './terminal';
import type { LeftTab } from './settings';
import { renderTextOverlay, toggleTextTool, textToolActive } from './text';

const $ = (id: string) => document.getElementById(id)!;

function isCompact(): boolean {
  return window.matchMedia('(max-width: 980px)').matches;
}

// ── Left sidebar tabs ────────────────────────────────────

function emitLayout(): void {
  window.dispatchEvent(new CustomEvent('lumen:layoutChanged'));
}

export function selectLeftTab(tab: LeftTab): void {
  window.lumenLeftTab = tab;
  window.dispatchEvent(new CustomEvent('lumen:leftTabChanged'));
  const sbTabGen   = $('sbTabGen'), sbTabTxt = $('sbTabTxt');
  const sbGen      = $('sb-generator'), sbTxt = $('sb-text');
  const btnGenTab  = $('btnGenTab'), btnTextTab = $('btnTextTab');

  if (tab === 'generator') {
    if (isCompact()) document.body.classList.add('right-closed');
    sbTabGen.classList.add('active');
    sbTabTxt.classList.remove('active');
    (sbGen as HTMLElement).style.display = 'block';
    (sbTxt as HTMLElement).style.display = 'none';
    btnGenTab.classList.add('active');
    btnTextTab.classList.remove('active');
    document.body.classList.add('text-open');
  } else {
    if (isCompact()) document.body.classList.add('right-closed');
    sbTabTxt.classList.add('active');
    sbTabGen.classList.remove('active');
    (sbGen as HTMLElement).style.display = 'none';
    (sbTxt as HTMLElement).style.display = 'block';
    btnTextTab.classList.add('active');
    btnGenTab.classList.remove('active');
    document.body.classList.add('text-open');
  }
  setTimeout(renderTextOverlay, 10);
  scheduleFitTerminal();
  emitLayout();
}

// ── Toggles ──────────────────────────────────────────────

export function togglePanel(): void {
  document.body.classList.toggle('right-closed');
  const open = !document.body.classList.contains('right-closed');
  if (open && isCompact()) {
    document.body.classList.remove('text-open');
    $('btnGenTab').classList.remove('active');
    $('btnTextTab').classList.remove('active');
  }
  $('togPanel').classList.toggle('active', open);
  $('sRight').textContent = open ? '☰ panel' : '☰';
  scheduleFitTerminal();
  emitLayout();
}

export function toggleLeft(): void {
  document.body.classList.toggle('left-closed');
  const open = !document.body.classList.contains('left-closed');
  $('sLeft').textContent = open ? '◀' : '▶';
  scheduleFitTerminal();
  emitLayout();
}

export function toggleTerm(): void {
  document.body.classList.toggle('term-closed');
  const open = !document.body.classList.contains('term-closed');
  $('togTerm').classList.toggle('active', open);
  $('sTerm').textContent = open ? '▤ term' : '▤';
  $('bottom').classList.toggle('hidden', !open);
  applyTermPanelHeight();
  if (open) {
    scheduleFitTerminal();
    requestAnimationFrame(() => focusTerminal());
  }
  emitLayout();
}

function updateMaximizeIcon(): void {
  const btn = $('termMaximize');
  const icon = btn.querySelector('.icon-max');
  const maximized = document.body.classList.contains('term-maximized');
  if (icon) icon.textContent = maximized ? '⤢' : '⛶';
  btn.setAttribute('title', maximized ? 'restore panel size (⌘⇧`)' : 'maximize panel (⌘⇧`)');
}

export function toggleMaximize(): void {
  const willMaximize = !document.body.classList.contains('term-maximized');
  if (willMaximize) saveHeightBeforeMaximize();
  document.body.classList.toggle('term-maximized');
  if (!willMaximize) restoreHeightAfterMaximize();
  else applyTermPanelHeight();
  updateMaximizeIcon();
  scheduleFitTerminal();
  if (!document.body.classList.contains('term-closed')) {
    requestAnimationFrame(() => focusTerminal());
  }
  emitLayout();
}

// ── Theme ────────────────────────────────────────────────

export function applyTheme(key: string): void {
  const theme = THEMES[key] ?? THEMES['lumen-dark'];
  const vars = expandThemeVariables(theme.variables);
  Object.entries(vars).forEach(([name, val]) =>
    document.documentElement.style.setProperty(name, val));
  $('sTheme').textContent = '◆ ' + theme.name;
  updateTermTheme(vars);
  localStorage.setItem('lumen-theme', key);
  window.currentThemeKey = key;
  window.dispatchEvent(new CustomEvent('lumen:themeChanged'));
}

// ── Responsive chrome ────────────────────────────────────

let wasCompact: boolean | null = null;

function applyResponsiveChrome(): void {
  const compact = isCompact();
  if (!compact) { wasCompact = false; return; }
  if (wasCompact === true) return;
  wasCompact = true;
  document.body.classList.add('right-closed', 'term-closed');
  document.body.classList.remove('text-open');
  $('bottom').classList.add('hidden');
  $('togPanel').classList.remove('active');
  $('togTerm').classList.remove('active');
  $('btnGenTab').classList.remove('active');
  $('btnTextTab').classList.remove('active');
  $('sRight').textContent = '☰';
  $('sTerm').textContent = '▤';
}

// ── Init ─────────────────────────────────────────────────

export function initSidebar(): void {
  // Left tab clicks
  $('sbTabGen').onclick = () => selectLeftTab('generator');
  $('sbTabTxt').onclick = () => selectLeftTab('text');

  $('btnGenTab').onclick = () => {
    const open = document.body.classList.contains('text-open');
    if (open && $('btnGenTab').classList.contains('active')) {
      document.body.classList.remove('text-open');
      $('btnGenTab').classList.remove('active');
    } else selectLeftTab('generator');
  };
  $('btnTextTab').onclick = () => {
    toggleTextTool();
    if (textToolActive) selectLeftTab('text');
  };

  // Listen for cross-module selectTab events (from text.ts)
  window.addEventListener('lumen:selectTab', e => {
    const tab = (e as CustomEvent<string>).detail;
    if (tab === 'text' || tab === 'generator') selectLeftTab(tab);
  });

  // Toggles
  $('togPanel').onclick = togglePanel;
  $('sRight').onclick   = togglePanel;
  $('sLeft').onclick    = toggleLeft;
  $('togTerm').onclick  = toggleTerm;
  $('sTerm').onclick    = toggleTerm;
  $('termClose').onclick = toggleTerm;
  $('termMaximize').onclick = toggleMaximize;
  updateMaximizeIcon();

  // Theme
  const themeKeys = Object.keys(THEMES);
  $('sTheme').onclick = () => {
    const cur = themeKeys.indexOf(window.currentThemeKey || 'lumen-dark');
    const next = (cur + 1) % themeKeys.length;
    applyTheme(themeKeys[next]);
    logToTerminal('theme → ' + THEMES[themeKeys[next]].name, 'info');
  };

  window.addEventListener('resize', applyResponsiveChrome);
  applyResponsiveChrome();
  selectLeftTab('generator');

  window.addEventListener('lumen:applyLeftTab', e => {
    selectLeftTab((e as CustomEvent<LeftTab>).detail);
  });
  window.addEventListener('lumen:applyTheme', e => {
    applyTheme((e as CustomEvent<string>).detail);
  });

  // WebGL context-loss banner
  const banner = document.getElementById('contextBanner');
  window.addEventListener('lumen:contextLost', () => {
    if (banner) banner.style.display = 'block';
    logToTerminal('WebGL context lost — pausing animation', 'err');
  });
  window.addEventListener('lumen:contextRestored', () => {
    if (banner) banner.style.display = 'none';
    logToTerminal('WebGL context restored', 'ok');
  });
}
