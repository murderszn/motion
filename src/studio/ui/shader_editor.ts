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
    list.innerHTML = '<div style="color:var(--dim)">No problems have been detected in the workspace.</div>';
    badge.classList.add('hidden'); badge.textContent = '0';
    (tabProblems as HTMLElement).style.color = '';
  } else {
    const lines = errorStr.split('\n').filter(l => l.trim().length > 0);
    let html = '';
    lines.forEach(line => {
      const match = line.match(/ERROR:\s+\d+:(\d+):(.*)/);
      if (match) {
        const lineNum = match[1], msg = match[2].trim();
        html += `<div class="prob-item" style="color:var(--accent);cursor:pointer;margin-bottom:6px" onclick="window.goToShaderLine(${lineNum})">
          <span style="font-weight:bold">✗ Line ${lineNum}:</span> ${msg}
        </div>`;
      } else {
        html += `<div style="color:var(--accent);margin-bottom:6px">${line}</div>`;
      }
    });
    list.innerHTML = html;
    badge.classList.remove('hidden'); badge.textContent = String(lines.length);
    (tabProblems as HTMLElement).style.color = 'var(--accent)';
  }
}

function selectTab(tab: 'term' | 'shader' | 'problems'): void {
  const tabTerm     = $('tabTerm'),   tabShader   = $('tabShader'),  tabProblems = $('tabProblems');
  const termXterm   = $('term-xterm'), termEditor = $('term-editor'), termProblems = $('term-problems');
  const btnCompile  = $('btnCompileShader');

  [tabTerm, tabShader, tabProblems].forEach(t => t.classList.remove('active'));
  [$('term-xterm'), $('term-editor'), $('term-problems')].forEach(c => (c as HTMLElement).style.display = 'none');
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

export function initShaderEditor(): void {
  $('tabTerm').onclick     = () => selectTab('term');
  $('tabShader').onclick   = () => selectTab('shader');
  $('tabProblems').onclick = () => selectTab('problems');
  $('btnCompileShader').onclick = compileCurrentShader;

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

  // Maximize shortcut
  $('termMaximize').onclick = toggleMaximize;
}
