// ─────────────────────────────────────────────────────────
//  Canvas size selector buttons
// ─────────────────────────────────────────────────────────

import { SIZES, P } from '../state';
import { canvas, gl } from '../webgl';
import { refreshExportSpec } from './export_targets_ui';

const $ = (id: string) => document.getElementById(id)!;

export let sizesEl: HTMLElement;

let onSizeChange: (() => void) | null = null;

export function applySize(): void {
  const s = SIZES[P.sizeIdx];
  canvas.width = s.w;
  canvas.height = s.h;
  canvas.style.aspectRatio = `${s.w}/${s.h}`;
  gl.viewport(0, 0, s.w, s.h);
  $('stRes').textContent = `${s.w}×${s.h}`;
  refreshExportSpec();
  setTimeout(() => onSizeChange?.(), 0);
}

export function initSizes(onChange?: () => void): void {
  onSizeChange = onChange ?? null;
  sizesEl = $('sizes');
  SIZES.forEach((s, i) => {
    const b = document.createElement('button');
    b.textContent = s.label;
    if (i === P.sizeIdx) b.classList.add('active');
    b.onclick = () => {
      window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
      P.sizeIdx = i;
      sizesEl.querySelectorAll('button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      applySize();
    };
    sizesEl.appendChild(b);
  });
  applySize();
}

export function applySizeUI(): void {
  sizesEl.querySelectorAll('button').forEach((x, idx) =>
    x.classList.toggle('active', idx === P.sizeIdx));
  applySize();
}
