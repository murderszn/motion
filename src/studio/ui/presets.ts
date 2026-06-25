// ─────────────────────────────────────────────────────────
//  Preset grid with live thumbnails
// ─────────────────────────────────────────────────────────

import { PRESETS, P } from '../state';
import { getPresetThumbnail, invalidatePresetThumbnails } from '../webgl';

const $ = (id: string) => document.getElementById(id)!;

export let presetsEl: HTMLElement;

function loadThumb(img: HTMLImageElement, mode: number): void {
  const url = getPresetThumbnail(mode);
  if (url) img.src = url;
}

let thumbRefreshPending = false;

export function refreshPresetThumbnails(): void {
  if (!presetsEl) return;
  if (thumbRefreshPending) return;
  thumbRefreshPending = true;
  requestAnimationFrame(() => {
    thumbRefreshPending = false;
    invalidatePresetThumbnails();
    for (let i = 0; i < PRESETS.length; i++) {
      const img = presetsEl.querySelector(`[data-preset-thumb="${i}"]`) as HTMLImageElement | null;
      if (img) loadThumb(img, i);
    }
  });
}

function renderThumbBatch(start: number): void {
  const end = Math.min(start + 4, PRESETS.length);
  for (let i = start; i < end; i++) {
    const img = presetsEl.querySelector(`[data-preset-thumb="${i}"]`) as HTMLImageElement | null;
    if (img && !img.src) loadThumb(img, i);
  }
  if (end < PRESETS.length) {
    requestAnimationFrame(() => renderThumbBatch(end));
  }
}

export function initPresets(onSelect?: (modeName: string) => void): void {
  presetsEl = $('presets');
  PRESETS.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'preset-btn';
    b.setAttribute('data-tooltip', p.full);
    if (i === P.mode) b.classList.add('active');

    const img = document.createElement('img');
    img.className = 'preset-thumb';
    img.alt = p.full;
    img.setAttribute('data-preset-thumb', String(i));
    img.width = 88;
    img.height = 50;

    const label = document.createElement('span');
    label.className = 'preset-label';
    label.textContent = p.icon;

    b.append(img, label);

    b.onclick = () => {
      window.dispatchEvent(new CustomEvent('lumen:historyBefore'));
      P.mode = i;
      presetsEl.querySelectorAll('.preset-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      onSelect?.(p.full);
      window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
    };
    presetsEl.appendChild(b);
  });

  presetsEl.addEventListener('click', e => {
    const btn = (e.target as Element).closest('.preset-btn');
    if (btn) {
      const pName = btn.getAttribute('data-tooltip') || '';
      window.dispatchEvent(new CustomEvent('lumen:log', { detail: { msg: 'preset: ' + pName, cls: 'info' } }));
    }
  });

  requestAnimationFrame(() => renderThumbBatch(0));
}

export function applyPresetUI(): void {
  presetsEl.querySelectorAll('.preset-btn').forEach((x, idx) =>
    x.classList.toggle('active', idx === P.mode));
  window.dispatchEvent(new CustomEvent('lumen:presetChanged'));
}