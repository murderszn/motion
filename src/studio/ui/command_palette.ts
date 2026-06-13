// ─────────────────────────────────────────────────────────
//  VS Code-style Command Palette
// ─────────────────────────────────────────────────────────

import type { Command } from '../types';
import { P, PRESETS, SIZES } from '../state';
import { applyTheme, togglePanel, toggleTerm, toggleMaximize, selectLeftTab } from './sidebar';
import { exportPNG } from './export';
import { addText } from './text';
import { applyPresetUI } from './presets';
import { applySizeUI } from './sizes';
import { togglePause } from '../render';
import { logToTerminal } from './terminal';

const $ = (id: string) => document.getElementById(id)!;

let filteredCmds: Command[] = [];
let selectedCmdIdx = 0;

function buildCommands(randomize: () => void): Command[] {
  return [
    { name: 'Randomize All Parameters', action: randomize, key: 'R' },
    { name: 'Save PNG Image', action: exportPNG, key: 'S' },
    { name: 'Export WebM Video', action: () => ($('expVid') as HTMLButtonElement).click() },
    { name: 'Export GIF',        action: () => ($('expGif') as HTMLButtonElement).click() },
    { name: 'Add Text Element', action: addText, key: 'T' },
    { name: 'Toggle Right Panel', action: togglePanel, key: 'Cmd+B' },
    { name: 'Toggle Bottom Terminal', action: toggleTerm, key: 'Ctrl+`' },
    { name: 'Toggle Maximized Terminal', action: toggleMaximize, key: 'Ctrl+Shift+`' },
    { name: 'Pause / Play Animation', action: () => togglePause($('btnPause') as HTMLButtonElement), key: 'Space' },
    { name: 'Theme: Lumen Dark',     action: () => applyTheme('lumen-dark') },
    { name: 'Theme: Lumen Dim',      action: () => applyTheme('lumen-dim') },
    { name: 'Theme: Lumen Contrast', action: () => applyTheme('lumen-contrast') },
    { name: 'Theme: Lumen Light',    action: () => applyTheme('lumen-light') },
    ...PRESETS.map((p, i) => ({
      name: `Preset: ${p.full.charAt(0).toUpperCase() + p.full.slice(1)}`,
      action: () => { P.mode = i; applyPresetUI(); logToTerminal('preset: ' + p.full, 'info'); },
    })),
    ...SIZES.map((s, i) => ({
      name: `Size: ${s.label}`,
      action: () => { P.sizeIdx = i; applySizeUI(); logToTerminal('canvas size → ' + s.label, 'info'); },
    })),
    { name: 'Save Project (.lumen)', action: () => window.dispatchEvent(new CustomEvent('lumen:saveProject')) },
    { name: 'Load Project (.lumen)', action: () => ($('projFile') as HTMLInputElement).click() },
  ];
}

let COMMANDS: Command[] = [];

function updateCmdListUI(): void {
  const cmdList = $('cmdList');
  cmdList.innerHTML = '';
  filteredCmds.forEach((cmd, idx) => {
    const item = document.createElement('div');
    item.className = 'cmd-item' + (idx === selectedCmdIdx ? ' selected' : '');
    item.innerHTML = `<span>${cmd.name}</span>` + (cmd.key ? `<span class="cmd-key">${cmd.key}</span>` : '');
    item.onclick = () => { cmd.action(); $('cmdPalette').classList.add('hidden'); };
    cmdList.appendChild(item);
  });
}

function renderCmdList(list: Command[]): void {
  filteredCmds = list; selectedCmdIdx = 0; updateCmdListUI();
}

export function toggleCmdPalette(): void {
  const isHidden = $('cmdPalette').classList.toggle('hidden');
  if (!isHidden) {
    ($('cmdInput') as HTMLInputElement).value = '';
    renderCmdList(COMMANDS);
    ($('cmdInput') as HTMLInputElement).focus();
  }
}

export function initCommandPalette(randomize: () => void): void {
  COMMANDS = buildCommands(randomize);
  const cmdPalette = $('cmdPalette');
  const cmdInput = $('cmdInput') as HTMLInputElement;
  const cmdList  = $('cmdList');

  cmdInput.addEventListener('input', () => {
    const q = cmdInput.value.toLowerCase().trim();
    renderCmdList(q ? COMMANDS.filter(c => c.name.toLowerCase().includes(q)) : COMMANDS);
  });

  cmdInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedCmdIdx = (selectedCmdIdx + 1) % filteredCmds.length;
      updateCmdListUI();
      (cmdList.children[selectedCmdIdx] as Element)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedCmdIdx = (selectedCmdIdx - 1 + filteredCmds.length) % filteredCmds.length;
      updateCmdListUI();
      (cmdList.children[selectedCmdIdx] as Element)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filteredCmds[selectedCmdIdx]?.action();
      cmdPalette.classList.add('hidden');
    } else if (e.key === 'Escape') {
      e.preventDefault(); cmdPalette.classList.add('hidden');
    }
  });

  cmdPalette.addEventListener('mousedown', e => {
    if (e.target === cmdPalette) cmdPalette.classList.add('hidden');
  });
}
