// ─────────────────────────────────────────────────────────
//  Keyboard shortcuts
// ─────────────────────────────────────────────────────────

import { togglePause } from '../render';
import { exportPNG } from './export';
import { toggleTextTool, textToolActive } from './text';
import { togglePanel, toggleTerm, toggleMaximize } from './sidebar';
import { toggleCmdPalette } from './command_palette';

const $ = (id: string) => document.getElementById(id)!;

export function initKeyboard(randomize: () => void): void {
  window.addEventListener('keydown', e => {
    const inInput    = e.target instanceof HTMLInputElement;
    const inTextarea = e.target instanceof HTMLTextAreaElement;

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

    if (e.key === 'Escape' && textToolActive) { toggleTextTool(); return; }

    if (inInput || inTextarea) return;

    if (e.code === 'Space') { e.preventDefault(); togglePause($('btnPause') as HTMLButtonElement); }
    if (e.key === 'r') randomize();
    if (e.key === 's') exportPNG();
    if (e.key === 't') toggleTextTool();
    if (e.key === 'f') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    }
    if (e.key === 'g') {
      const open = document.body.classList.contains('text-open');
      const active = $('btnGenTab')?.classList.contains('active');
      if (open && active) {
        document.body.classList.remove('text-open');
        $('btnGenTab')?.classList.remove('active');
      } else {
        window.dispatchEvent(new CustomEvent('lumen:selectTab', { detail: 'generator' }));
      }
    }
  });
}
