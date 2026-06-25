// ─────────────────────────────────────────────────────────
//  Keyboard shortcuts
// ─────────────────────────────────────────────────────────

import { togglePause } from '../render';
import { exportPNG, startWebmExport, exportGIF } from './export';
import { toggleTextTool, textToolActive } from './text';
import { togglePanel, toggleTerm, toggleMaximize } from './sidebar';
import { toggleCmdPalette } from './command_palette';
import { undo, redo } from './history';
import { isTerminalFocused } from './terminal';

const $ = (id: string) => document.getElementById(id)!;

export function initKeyboard(randomize: () => void): void {
  window.addEventListener('keydown', e => {
    const inInput    = e.target instanceof HTMLInputElement;
    const inTextarea = e.target instanceof HTMLTextAreaElement;

    // ── Cmd+K — Command Palette ──
    if (e.key === 'k' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault(); toggleCmdPalette(); return;
    }
    // ── Cmd/Ctrl+Shift+P or F1 — Command Palette ──
    if ((e.key === 'P' && (e.ctrlKey || e.metaKey) && e.shiftKey) || e.key === 'F1') {
      e.preventDefault(); toggleCmdPalette(); return;
    }
    // ── Cmd/Ctrl+` — Terminal ──
    if (e.key === '`' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); if (e.shiftKey) toggleMaximize(); else toggleTerm(); return;
    }
    // ── Cmd/Ctrl+Z — Undo / Redo ──
    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !isTerminalFocused()) {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
      return;
    }
    // ── Cmd/Ctrl+B — Panel ──
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); togglePanel(); return; }
    // ── Cmd/Ctrl+E — Export Video ──
    if (e.key === 'e' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      startWebmExport($('btnPause') as HTMLButtonElement);
      return;
    }
    // ── Cmd/Ctrl+G — Export GIF ──
    if (e.key === 'g' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      exportGIF();
      return;
    }
    // ── Cmd/Ctrl+Shift+S — Save project ──
    if (e.key === 'S' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('lumen:saveProject'));
      return;
    }
    // ── Escape — close command palette if open ──
    if (e.key === 'Escape') {
      const palette = document.getElementById('cmdPalette');
      if (palette && !palette.classList.contains('hidden')) {
        e.preventDefault();
        palette.classList.add('hidden');
        return;
      }
    }

    if (e.key === 'Escape' && textToolActive) { toggleTextTool(); return; }

    if (inInput || inTextarea) return;

    if (e.code === 'Space') { e.preventDefault(); togglePause($('btnPause') as HTMLButtonElement); }
    if (e.key === 'r') randomize();
    if (e.key === 's') exportPNG();
    if (e.key === 't') toggleTextTool();
    if (e.key === 'f') {
      const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
      if (fsEl) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
      } else {
        const target = $('canvas-wrap');
        const req = target.requestFullscreen || (target as any).webkitRequestFullscreen;
        if (req) req.call(target).catch((err: Error) => console.warn('fullscreen:', err.message));
      }
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
