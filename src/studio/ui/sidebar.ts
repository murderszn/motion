// ─────────────────────────────────────────────────────────
//  Sidebar — left-bar tab toggle, panel/term/left toggles,
//            theme switcher, responsive chrome
// ─────────────────────────────────────────────────────────

import { THEMES } from '../state';
import { fitTerminal, updateTermTheme, logToTerminal } from './terminal';
import { renderTextOverlay, texts, addText } from './text';

const $ = (id: string) => document.getElementById(id)!;

function isCompact(): boolean {
  return window.matchMedia('(max-width: 980px)').matches;
}

// ── Left sidebar tabs ────────────────────────────────────

export function selectLeftTab(tab: 'generator' | 'text'): void {
  const sbTabGen   = $('sbTabGen'), sbTabTxt = $('sbTabTxt');
  const sbGen      = $('sb-generator'), sbTxt = $('sb-text');
  const btnGenTab  = $('btnGenTab'), btnTextTab = $('btnTextTab');

  if (tab === 'generator') {
    if (isCompact()) document.body.classList.add('right-closed');
    sbTabGen.classList.add('active');
    (sbTabGen as HTMLElement).style.borderBottomColor = 'var(--accent)';
    (sbTabGen as HTMLElement).style.color = 'var(--white)';
    sbTabTxt.classList.remove('active');
    (sbTabTxt as HTMLElement).style.borderBottomColor = 'transparent';
    (sbTabTxt as HTMLElement).style.color = 'var(--dim)';
    (sbGen as HTMLElement).style.display = 'block';
    (sbTxt as HTMLElement).style.display = 'none';
    btnGenTab.classList.add('active');
    btnTextTab.classList.remove('active');
    document.body.classList.add('text-open');
  } else {
    if (isCompact()) document.body.classList.add('right-closed');
    sbTabTxt.classList.add('active');
    (sbTabTxt as HTMLElement).style.borderBottomColor = 'var(--accent)';
    (sbTabTxt as HTMLElement).style.color = 'var(--white)';
    sbTabGen.classList.remove('active');
    (sbTabGen as HTMLElement).style.borderBottomColor = 'transparent';
    (sbTabGen as HTMLElement).style.color = 'var(--dim)';
    (sbGen as HTMLElement).style.display = 'none';
    (sbTxt as HTMLElement).style.display = 'block';
    btnTextTab.classList.add('active');
    btnGenTab.classList.remove('active');
    document.body.classList.add('text-open');
  }
  setTimeout(renderTextOverlay, 10);
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
}

export function toggleLeft(): void {
  document.body.classList.toggle('left-closed');
  const open = !document.body.classList.contains('left-closed');
  $('sLeft').textContent = open ? '◀' : '▶';
}

export function toggleTerm(): void {
  document.body.classList.toggle('term-closed');
  const open = !document.body.classList.contains('term-closed');
  $('togTerm').classList.toggle('active', open);
  $('sTerm').textContent = open ? '▤ term' : '▤';
  $('bottom').classList.toggle('hidden', !open);
}

export function toggleMaximize(): void {
  document.body.classList.toggle('term-maximized');
  setTimeout(fitTerminal, 0);
}

// ── Theme ────────────────────────────────────────────────

export function applyTheme(key: string): void {
  const theme = THEMES[key] ?? THEMES['lumen-dark'];
  Object.entries(theme.variables).forEach(([name, val]) =>
    document.documentElement.style.setProperty(name, val));
  $('sTheme').textContent = '◆ ' + theme.name;
  updateTermTheme(theme.variables);
  localStorage.setItem('lumen-theme', key);
  window.currentThemeKey = key;
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
    const open = document.body.classList.contains('text-open');
    if (open && $('btnTextTab').classList.contains('active')) {
      document.body.classList.remove('text-open');
      $('btnTextTab').classList.remove('active');
    } else { selectLeftTab('text'); if (!texts.length) addText(); }
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

  // Theme
  const themeKeys = Object.keys(THEMES);
  $('sTheme').onclick = () => {
    const cur = themeKeys.indexOf(window.currentThemeKey || 'lumen-dark');
    const next = (cur + 1) % themeKeys.length;
    applyTheme(themeKeys[next]);
    logToTerminal('theme → ' + THEMES[themeKeys[next]].name, 'info');
  };

  const savedTheme = localStorage.getItem('lumen-theme') ?? 'lumen-dark';
  applyTheme(savedTheme);

  window.addEventListener('resize', applyResponsiveChrome);
  applyResponsiveChrome();
  selectLeftTab('generator');
}
