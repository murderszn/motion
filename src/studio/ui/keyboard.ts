// ─────────────────────────────────────────────────────────
//  Keyboard shortcuts
// ─────────────────────────────────────────────────────────

import { togglePause } from '../render';
import { exportPNG } from './export';
import { addText } from './text';
import { togglePanel, toggleTerm, toggleMaximize } from './sidebar';
import { toggleCmdPalette } from './command_palette';

const $ = (id: string) => document.getElementById(id)!;

export function initKeyboard(randomize: () => void): void {
  window.addEventListener('keydown', e => {
    const inInput    = e.target instanceof HTMLInputElement && e.target.type === 'text' && e.target.id !== 'cmdInput';
    const inTextarea = e.target instanceof HTMLTextAreaElement && e.target.id !== 'shaderCode';

    // Command Palette
    if ((e.key === 'P' && (e.ctrlKey || e.metaKey) && e.shiftKey) || e.key === 'F1') {
      e.preventDefault(); toggleCmdPalette(); return;
    }
    // Terminal
    if (e.key === '`' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); if (e.shiftKey) toggleMaximize(); else toggleTerm(); return;
    }
    // Panel
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); togglePanel(); return; }

    if (inInput || inTextarea) return;

    if (e.code === 'Space') { e.preventDefault(); togglePause($('btnPause') as HTMLButtonElement); }
    if (e.key === 'r') randomize();
    if (e.key === 's') exportPNG();
    if (e.key === 't') addText();
  });
}
