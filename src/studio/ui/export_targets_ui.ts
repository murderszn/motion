// ─────────────────────────────────────────────────────────
//  Export target picker + image format + spec line
// ─────────────────────────────────────────────────────────

import { P, SIZES } from '../state';
import type { StillImageFormat } from '../types';
import { canvas } from '../webgl';
import {
  EXPORT_GROUPS, exportSpecNote, resolveExportTarget,
} from '../export_targets';

const $ = (id: string) => document.getElementById(id)!;

let webpSupported = false;

export function detectWebpSupport(): boolean {
  try {
    const c = document.createElement('canvas');
    return c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

export function refreshExportSpec(): void {
  const el = $('exportSpec');
  if (!el) return;
  const s = SIZES[P.sizeIdx];
  const target = resolveExportTarget(P.exportTargetId, canvas.width || s.w, canvas.height || s.h);
  el.textContent = exportSpecNote(target, P.imageFormat, canvas.width || s.w, canvas.height || s.h);
}

/** Sync export target / format / caption controls from `P` after load or paste. */
export function syncExportUIFromParams(): void {
  document.querySelectorAll('.img-fmt').forEach(btn => {
    const fmt = btn.getAttribute('data-imgfmt');
    const disabled = fmt === 'webp' && !webpSupported;
    btn.classList.toggle('disabled', disabled);
    btn.classList.toggle('active', fmt === P.imageFormat && !disabled);
  });
  document.querySelectorAll('.export-target').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-target') === P.exportTargetId);
  });
  const caption = $('exportCaption') as HTMLInputElement | null;
  if (caption) caption.value = P.exportCaption;
  refreshExportSpec();
}

function setImageFormat(fmt: StillImageFormat): void {
  if (fmt === 'webp' && !webpSupported) return;
  P.imageFormat = fmt;
  document.querySelectorAll('.img-fmt').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-imgfmt') === fmt);
  });
  refreshExportSpec();
  window.dispatchEvent(new CustomEvent('lumen:exportSettingsChanged'));
}

function setExportTarget(id: string): void {
  P.exportTargetId = id;
  document.querySelectorAll('.export-target').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-target') === id);
  });
  refreshExportSpec();
  window.dispatchEvent(new CustomEvent('lumen:exportSettingsChanged'));
}

export function initExportTargets(): void {
  webpSupported = detectWebpSupport();
  const grid = $('exportTargets');
  if (!grid) return;

  EXPORT_GROUPS.forEach(g => {
    const label = document.createElement('div');
    label.className = 'export-group-label';
    label.textContent = g.group;
    grid.appendChild(label);

    const row = document.createElement('div');
    row.className = 'export-target-row';
    g.items.forEach(it => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'export-target' + (P.exportTargetId === it.id ? ' active' : '');
      b.setAttribute('data-target', it.id);
      b.textContent = it.label;
      b.onclick = () => setExportTarget(it.id);
      row.appendChild(b);
    });
    grid.appendChild(row);
  });

  document.querySelectorAll('.img-fmt').forEach(btn => {
    btn.addEventListener('click', () => {
      const fmt = btn.getAttribute('data-imgfmt') as StillImageFormat;
      if (fmt) setImageFormat(fmt);
    });
  });

  if (!webpSupported) {
    document.querySelector('.img-fmt[data-imgfmt="webp"]')?.classList.add('disabled');
  }

  const caption = $('exportCaption') as HTMLInputElement | null;
  if (caption) {
    caption.value = P.exportCaption;
    caption.addEventListener('input', () => {
      P.exportCaption = caption.value;
      window.dispatchEvent(new CustomEvent('lumen:exportSettingsChanged'));
    });
  }

  setImageFormat(P.imageFormat);
  refreshExportSpec();

  window.addEventListener('lumen:presetChanged', refreshExportSpec);
  window.addEventListener('lumen:textChanged', refreshExportSpec);
}