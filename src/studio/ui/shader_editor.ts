// ─────────────────────────────────────────────────────────
//  Shader editor — Monaco + tab switching + live compile
// ─────────────────────────────────────────────────────────

import { FS, compileNewFS } from '../webgl';
import { scheduleFitTerminal, focusTerminal, setShellBarVisible } from './terminal';
import type { BottomTab } from './settings';

const $ = (id: string) => document.getElementById(id)!;

interface MonacoEditor {
  getValue(): string;
  setValue(v: string): void;
  focus(): void;
  layout(): void;
  onDidChangeModelContent(cb: () => void): { dispose(): void };
  getModel(): { getLineCount(): number } | null;
  setPosition(pos: { lineNumber: number; column: number }): void;
  revealLineInCenter(line: number): void;
  setSelection(sel: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }): void;
  getAction(id: string): { run(): void } | null;
}

declare global {
  interface Window {
    require: {
      config(opts: { paths: Record<string, string> }): void;
      (deps: string[], cb: () => void): void;
    };
    monaco: {
      editor: {
        create(el: HTMLElement, opts: object): MonacoEditor;
        setTheme(name: string): void;
        defineTheme(name: string, opts: object): void;
      };
    };
    goToShaderLine: (line: number) => void;
    lumenBottomTab?: BottomTab;
    getShaderSource?: () => string;
  }
}

let monacoEditor: MonacoEditor | null = null;
let compileTimeout: ReturnType<typeof setTimeout> | null = null;
let currentTab: BottomTab = 'term';

function showProblems(errorStr: string | null): void {
  const list = $('problemsList'), badge = $('probCount');
  const tabProblems = $('tabProblems');
  if (!errorStr) {
    list.innerHTML = '<div style="opacity:0.65">No problems have been detected in the workspace.</div>';
    badge.classList.add('hidden'); badge.textContent = '0';
    (tabProblems as HTMLElement).style.color = '';
  } else {
    const lines = errorStr.split('\n').filter(l => l.trim().length > 0);
    let html = '';
    lines.forEach(line => {
      const match = line.match(/ERROR:\s+\d+:(\d+):(.*)/);
      if (match) {
        const lineNum = match[1], msg = match[2].trim();
        html += `<div class="prob-item" style="color:var(--term-accent, var(--accent));cursor:pointer;margin-bottom:6px" onclick="window.goToShaderLine(${lineNum})">
          <span style="font-weight:bold">✗ Line ${lineNum}:</span> ${msg}
        </div>`;
      } else {
        html += `<div style="color:var(--term-accent, var(--accent));margin-bottom:6px">${line}</div>`;
      }
    });
    list.innerHTML = html;
    badge.classList.remove('hidden'); badge.textContent = String(lines.length);
    (tabProblems as HTMLElement).style.color = 'var(--term-accent, var(--accent))';
  }
}

export function getShaderSource(): string {
  return monacoEditor?.getValue() ?? FS.trim();
}

function compileCurrentShader(): void {
  const src = getShaderSource();
  const err = compileNewFS(src);
  showProblems(err);
  if (!err) window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'shader compiled successfully', cls: 'ok' } }));
}

function selectTab(tab: BottomTab): void {
  currentTab = tab;
  window.lumenBottomTab = tab;
  window.dispatchEvent(new CustomEvent('lumen:bottomTabChanged'));

  const tabTerm     = $('tabTerm'),   tabShader   = $('tabShader'),  tabProblems = $('tabProblems'), tabHotkeys = $('tabHotkeys');
  const termXterm   = $('term-xterm'), termEditor = $('term-editor'), termProblems = $('term-problems'), termHotkeys = $('term-hotkeys');
  const btnCompile  = $('btnCompileShader');

  [tabTerm, tabShader, tabProblems, tabHotkeys].forEach(t => t.classList.remove('active'));
  [$('term-xterm'), $('term-editor'), $('term-problems'), $('term-hotkeys')].forEach(c => (c as HTMLElement).style.display = 'none');
  (btnCompile as HTMLElement).style.display = 'none';

  if (tab === 'term') {
    tabTerm.classList.add('active');
    (termXterm as HTMLElement).style.display = 'flex';
    setShellBarVisible(true);
    scheduleFitTerminal();
    requestAnimationFrame(() => focusTerminal());
  } else if (tab === 'shader') {
    setShellBarVisible(false);
    tabShader.classList.add('active');
    (termEditor as HTMLElement).style.display = 'flex';
    (btnCompile as HTMLElement).style.display = 'grid';
    requestAnimationFrame(() => {
      monacoEditor?.layout();
      monacoEditor?.focus();
    });
  } else if (tab === 'hotkeys') {
    setShellBarVisible(false);
    tabHotkeys.classList.add('active');
    (termHotkeys as HTMLElement).style.display = 'block';
  } else {
    setShellBarVisible(false);
    tabProblems.classList.add('active');
    (termProblems as HTMLElement).style.display = 'block';
  }
}

function populateHotkeys(): void {
  const rows: [string, string][] = [
    ['Space',        'Pause / play animation'],
    ['R',            'Randomize all parameters'],
    ['S',            'Save PNG image'],
    ['T',            'Toggle text tool (click canvas to place)'],
    ['Escape',       'Deactivate text tool / close command palette'],
    ['G',            'Open generator tab'],
    ['F',            'Toggle fullscreen'],
    ['⌘Z',           'Undo'],
    ['⌘⇧Z',          'Redo'],
    ['⌘B',           'Toggle right panel'],
    ['⌘`',           'Toggle terminal'],
    ['⌘⇧`',          'Maximize terminal'],
    ['⌘K',           'Command palette'],
    ['⌘⇧P / F1',     'Command palette'],
    ['⌘S',           'Compile shader (in shader editor)'],
    ['⌘⇧S',          'Save project (.lumen)'],
    ['⌘E',           'Export WebM video'],
    ['⌘G',           'Export GIF'],
  ];
  const el = $('hotkeysList');
  el.innerHTML = rows.map(([key, desc]) =>
    `<div style="display:flex;gap:12px;align-items:baseline;margin-bottom:4px">` +
    `<span style="color:var(--term-text);min-width:170px;flex:none;font-weight:500">${key}</span>` +
    `<span style="opacity:0.65">${desc}</span></div>`
  ).join('');
}

function initMonaco(): void {
  const host = $('shader-monaco');
  window.require.config({
    paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' },
  });

  window.require(['vs/editor/editor.main'], () => {
    window.monaco.editor.defineTheme('lumen-glsl', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '55555e', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'e03a3a' },
        { token: 'number', foreground: '88c0d0' },
        { token: 'type', foreground: 'a3be8c' },
      ],
      colors: {
        'editor.background': '#060608',
        'editor.foreground': '#b8b8c0',
        'editorLineNumber.foreground': '#55555e',
        'editor.selectionBackground': '#e03a3a44',
        'editor.lineHighlightBackground': '#1c1c2222',
      },
    });
    window.monaco.editor.setTheme('lumen-glsl');

    monacoEditor = window.monaco.editor.create(host, {
      value: FS.trim(),
      language: 'glsl',
      theme: 'lumen-glsl',
      fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace",
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: false,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'off',
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      padding: { top: 8, bottom: 8 },
    });

    monacoEditor.onDidChangeModelContent(() => {
      if (compileTimeout) clearTimeout(compileTimeout);
      compileTimeout = setTimeout(compileCurrentShader, 1000);
    });

    const ro = new ResizeObserver(() => {
      if (currentTab === 'shader') monacoEditor?.layout();
    });
    ro.observe($('term-editor'));
    ro.observe(host);
  });
}

export function initShaderEditor(): void {
  $('tabTerm').onclick     = () => selectTab('term');
  $('tabShader').onclick   = () => selectTab('shader');
  $('tabProblems').onclick = () => selectTab('problems');
  $('tabHotkeys').onclick  = () => selectTab('hotkeys');
  $('btnCompileShader').onclick = compileCurrentShader;
  populateHotkeys();
  initMonaco();

  window.getShaderSource = getShaderSource;

  window.addEventListener('lumen:applyBottomTab', e => {
    selectTab((e as CustomEvent<BottomTab>).detail);
  });

  window.goToShaderLine = (lineNum: number) => {
    selectTab('shader');
    if (!monacoEditor) return;
    const line = Math.max(1, Math.min(lineNum, monacoEditor.getModel()?.getLineCount() ?? lineNum));
    monacoEditor.revealLineInCenter(line);
    monacoEditor.setPosition({ lineNumber: line, column: 1 });
    monacoEditor.focus();
    monacoEditor.setSelection({
      startLineNumber: line,
      startColumn: 1,
      endLineNumber: line,
      endColumn: 1,
    });
  };

  setShellBarVisible(true);

  window.addEventListener('keydown', e => {
    if (currentTab !== 'shader' || !monacoEditor) return;
    if (e.key === 's' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      compileCurrentShader();
    }
    if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      monacoEditor.getAction('actions.find')?.run();
    }
  });
}