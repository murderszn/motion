// ─────────────────────────────────────────────────────────
//  Shader editor — tab switching + live compile + problems
// ─────────────────────────────────────────────────────────

import { FS, compileNewFS } from '../webgl';
import { fitTerminal } from './terminal';
import { toggleMaximize } from './sidebar';

const $ = (id: string) => document.getElementById(id)!;

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

function selectTab(tab: 'term' | 'shader' | 'problems' | 'hotkeys'): void {
  const tabTerm     = $('tabTerm'),   tabShader   = $('tabShader'),  tabProblems = $('tabProblems'), tabHotkeys = $('tabHotkeys');
  const termXterm   = $('term-xterm'), termEditor = $('term-editor'), termProblems = $('term-problems'), termHotkeys = $('term-hotkeys');
  const btnCompile  = $('btnCompileShader');

  [tabTerm, tabShader, tabProblems, tabHotkeys].forEach(t => t.classList.remove('active'));
  [$('term-xterm'), $('term-editor'), $('term-problems'), $('term-hotkeys')].forEach(c => (c as HTMLElement).style.display = 'none');
  (btnCompile as HTMLElement).style.display = 'none';

  if (tab === 'term') {
    tabTerm.classList.add('active');
    (termXterm as HTMLElement).style.display = 'block';
    fitTerminal();
  } else if (tab === 'shader') {
    tabShader.classList.add('active');
    (termEditor as HTMLElement).style.display = 'flex';
    (btnCompile as HTMLElement).style.display = 'grid';
    ($('shaderCode') as HTMLTextAreaElement).focus();
  } else if (tab === 'hotkeys') {
    tabHotkeys.classList.add('active');
    (termHotkeys as HTMLElement).style.display = 'block';
  } else {
    tabProblems.classList.add('active');
    (termProblems as HTMLElement).style.display = 'block';
  }
}

function compileCurrentShader(): void {
  const src = ($('shaderCode') as HTMLTextAreaElement).value;
  const err = compileNewFS(src);
  showProblems(err);
  if (!err) window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'shader compiled successfully', cls: 'ok' } }));
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

export function initShaderEditor(): void {
  $('tabTerm').onclick     = () => selectTab('term');
  $('tabShader').onclick   = () => selectTab('shader');
  $('tabProblems').onclick = () => selectTab('problems');
  $('tabHotkeys').onclick  = () => selectTab('hotkeys');
  $('btnCompileShader').onclick = compileCurrentShader;
  populateHotkeys();

  // Pre-populate with current source
  ($('shaderCode') as HTMLTextAreaElement).value = FS.trim();

  const shaderCode = $('shaderCode') as HTMLTextAreaElement;
  shaderCode.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = shaderCode.selectionStart, end = shaderCode.selectionEnd;
      shaderCode.value = shaderCode.value.substring(0, start) + '    ' + shaderCode.value.substring(end);
      shaderCode.selectionStart = shaderCode.selectionEnd = start + 4;
    }
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); compileCurrentShader(); }
  });

  let compileTimeout: ReturnType<typeof setTimeout> | null = null;
  shaderCode.addEventListener('input', () => {
    if (compileTimeout) clearTimeout(compileTimeout);
    compileTimeout = setTimeout(compileCurrentShader, 1000);
  });

  // Global helper for click-to-jump in Problems panel
  window.goToShaderLine = (lineNum: number) => {
    selectTab('shader');
    const text = shaderCode.value;
    const lines = text.split('\n');
    if (lineNum > lines.length) return;
    let charIdx = 0;
    for (let i = 0; i < lineNum - 1; i++) charIdx += lines[i].length + 1;
    shaderCode.focus();
    shaderCode.setSelectionRange(charIdx, charIdx + lines[lineNum - 1].length);
    shaderCode.scrollTop = (lineNum - 5) * 16.5;
  };
}
